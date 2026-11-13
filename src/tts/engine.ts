// The one place the rest of the app talks to for speech. It hides the worker
// and its messages behind a few simple functions.
import type { AudioFormat } from './audioSink';
import { VOICE_CACHE_NAME } from './download';
import type { EngineErrorCode, SynthesisOutput, WorkerRequest, WorkerResponse } from './messages';
import type { SynthesisSettings } from './piperConfig';
import { getVoice } from './voices';
import { allowScreenOff, keepScreenOn } from './wakeLock';

export type { SynthesisOutput } from './messages';
export type { AudioFormat } from './audioSink';

export class EngineError extends Error {
  constructor(
    public code: EngineErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface DownloadProgressInfo {
  loaded: number;
  total: number;
}

export interface SynthesizeOptions {
  voiceId: string;
  /** MP3 (default, about 5× smaller) or WAV (uncompressed). */
  format?: AudioFormat;
  settings?: SynthesisSettings;
  /** 0..1, how much of the text has been spoken. */
  onProgress?: (fraction: number) => void;
  /** Only called if the voice still has to be downloaded. */
  onDownloadProgress?: (p: DownloadProgressInfo) => void;
  /** Abort to cancel; the promise then rejects with an AbortError. */
  signal?: AbortSignal;
}

type Listener = (message: WorkerResponse) => void;

let worker: Worker | undefined;
let nextId = 1;
const listeners = new Map<number, Listener>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => listeners.get(event.data.id)?.(event.data);
  }
  return worker;
}

// Sends one request and calls `onMessage` for every answer until it returns true.
function send(request: WorkerRequest, onMessage: (message: WorkerResponse) => boolean): void {
  listeners.set(request.id, (message) => {
    if (onMessage(message)) listeners.delete(request.id);
  });
  getWorker().postMessage(request);
}

const abortError = () => new DOMException('Cancelled', 'AbortError');

/** Downloads (first time only) and prepares a voice. Resolves true if it came from the cache. */
export async function loadVoice(
  voiceId: string,
  onProgress?: (p: DownloadProgressInfo) => void,
): Promise<boolean> {
  const voice = await getVoice(voiceId);
  return new Promise((resolve, reject) => {
    send({ type: 'load', id: nextId++, voice }, (message) => {
      if (message.type === 'downloadProgress') onProgress?.(message);
      else if (message.type === 'loaded') resolve(message.fromCache);
      else if (message.type === 'error') reject(new EngineError(message.code, message.message));
      else return false;
      return message.type !== 'downloadProgress';
    });
  });
}

/** Turns text into one audio file. Long texts are spoken piece by piece. */
export async function synthesize(text: string, options: SynthesizeOptions): Promise<SynthesisOutput> {
  const { signal } = options;
  if (signal?.aborted) throw abortError();
  const voice = await getVoice(options.voiceId);
  const id = nextId++;

  keepScreenOn();
  try {
    return await new Promise<SynthesisOutput>((resolve, reject) => {
      const onAbort = () => getWorker().postMessage({ type: 'cancel', id } satisfies WorkerRequest);
      signal?.addEventListener('abort', onAbort, { once: true });

      const request: WorkerRequest = {
        type: 'synthesize',
        id,
        voice,
        text,
        format: options.format ?? 'mp3',
        settings: options.settings,
      };
      send(request, (message) => {
        switch (message.type) {
          case 'downloadProgress':
            options.onDownloadProgress?.(message);
            return false;
          case 'synthProgress':
            options.onProgress?.(message.fraction);
            return false;
          case 'done':
            resolve(message);
            break;
          case 'cancelled':
            reject(abortError());
            break;
          case 'error':
            reject(new EngineError(message.code, message.message));
            break;
          default:
            return false;
        }
        signal?.removeEventListener('abort', onAbort);
        return true;
      });
    });
  } finally {
    allowScreenOff();
  }
}

/**
 * The text as the voice will read it: cleaned up, abbreviations written out,
 * and stress marks on the vowels we know. Lets people check pronunciation.
 */
export async function previewSpokenText(text: string, language = 'bg'): Promise<string> {
  return new Promise((resolve, reject) => {
    send({ type: 'preview', id: nextId++, language, text }, (message) => {
      if (message.type === 'previewed') resolve(message.text);
      else if (message.type === 'error') reject(new EngineError(message.code, message.message));
      else return false;
      return true;
    });
  });
}

export async function isVoiceDownloaded(voiceId: string): Promise<boolean> {
  try {
    const voice = await getVoice(voiceId);
    const cache = await caches.open(VOICE_CACHE_NAME);
    return (await cache.match(voice.modelUrl)) !== undefined;
  } catch {
    return false;
  }
}

/** Frees the device storage used by voices; they download again when needed. */
export async function deleteDownloadedVoices(): Promise<void> {
  try {
    await caches.delete(VOICE_CACHE_NAME);
  } catch {
    // Cache API unavailable: nothing was stored.
  }
  if (!worker) return;
  await new Promise<void>((resolve) => {
    send({ type: 'unload', id: nextId++ }, (message) => {
      if (message.type !== 'unloaded') return false;
      resolve();
      return true;
    });
  });
}
