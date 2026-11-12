/// <reference lib="webworker" />
// Speech generation runs here, off the main thread, so the page never freezes.
import * as ort from 'onnxruntime-web/wasm';
import ortWasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';
import { normalizeText } from '../text/normalize';
import { splitText } from '../text/split';
import { createAudioSink, MIME_TYPES, type AudioFormat } from './audioSink';
import { downloadWithCache, NetworkError } from './download';
import type { EngineErrorCode, WorkerRequest, WorkerResponse } from './messages';
import { initPhonemizer, phonemizeSentences } from './phonemizer';
import { mergeVowelClusters, phonemesToIds } from './phonemeIds';
import { defaultSettings, type PiperVoiceConfig, type SynthesisSettings } from './piperConfig';
import type { VoiceInfo } from './voices';
import { floatToInt16, normalizePeak, silence } from './wav';

declare const self: DedicatedWorkerGlobalScope;

// GitHub Pages cannot send the headers needed for multi-threaded WebAssembly,
// so we always use one thread. The engine's .wasm file is served from our site.
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = { wasm: ortWasmUrl };

/** Sentences phonemized per eSpeak run; each run re-creates eSpeak, so batch them. */
const PHONEMIZE_BATCH = 50;

interface LoadedVoice {
  session: ort.InferenceSession;
  config: PiperVoiceConfig;
  /** True when the model came from the browser cache (no download needed). */
  fromCache: boolean;
}

const voices = new Map<string, Promise<LoadedVoice>>();
const cancelled = new Set<number>();

class CancelledError extends Error {}
class EmptyTextError extends Error {}

function post(message: WorkerResponse, transfer: Transferable[] = []) {
  self.postMessage(message, transfer);
}

async function loadVoice(voice: VoiceInfo, requestId: number): Promise<LoadedVoice> {
  const [model, config] = await Promise.all([
    downloadWithCache(voice.modelUrl, voice.sizeMb * 1e6, ({ loaded, total }) =>
      post({ type: 'downloadProgress', id: requestId, loaded, total }),
    ),
    downloadWithCache(voice.configUrl, 0),
  ]);

  const [session] = await Promise.all([
    ort.InferenceSession.create(new Uint8Array(model.data), { executionProviders: ['wasm'] }),
    initPhonemizer(),
  ]);
  return {
    session,
    config: JSON.parse(new TextDecoder().decode(config.data)) as PiperVoiceConfig,
    fromCache: model.fromCache,
  };
}

function getVoice(voice: VoiceInfo, requestId: number): Promise<LoadedVoice> {
  let loading = voices.get(voice.id);
  if (!loading) {
    loading = loadVoice(voice, requestId);
    voices.set(voice.id, loading);
    loading.catch(() => voices.delete(voice.id)); // allow a retry after a failure
  }
  return loading;
}

// Lets queued messages (such as "cancel") arrive between pieces of work.
const yieldToMessages = () => new Promise((resolve) => setTimeout(resolve, 0));

async function speakPhonemes(voice: LoadedVoice, phonemes: string[], settings: SynthesisSettings) {
  const { session, config } = voice;
  const merged = mergeVowelClusters(phonemes, config.vowel_clusters);
  const { ids } = phonemesToIds(merged, config.phoneme_id_map);

  const feeds: Record<string, ort.Tensor> = {
    input: new ort.Tensor('int64', BigInt64Array.from(ids, (id) => BigInt(id)), [1, ids.length]),
    input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
    scales: new ort.Tensor(
      'float32',
      Float32Array.from([settings.noiseScale, settings.lengthScale, settings.noiseW]),
      [3],
    ),
  };
  if (session.inputNames.includes('sid')) {
    feeds.sid = new ort.Tensor('int64', BigInt64Array.from([0n]), [1]);
  }

  const output = await session.run(feeds);
  return floatToInt16(normalizePeak(output[session.outputNames[0]].data as Float32Array));
}

async function synthesize(
  requestId: number,
  info: VoiceInfo,
  text: string,
  format: AudioFormat,
  settings?: SynthesisSettings,
) {
  const chunks = splitText(normalizeText(text));
  if (chunks.length === 0) throw new EmptyTextError('No text to speak');

  const voice = await getVoice(info, requestId);
  const scales = settings ?? defaultSettings(voice.config);
  const sampleRate = voice.config.audio.sample_rate;
  const totalChars = chunks.reduce((sum, c) => sum + c.text.length, 0);

  const start = performance.now();
  const sink = createAudioSink(format, sampleRate);
  let doneChars = 0;

  for (let b = 0; b < chunks.length; b += PHONEMIZE_BATCH) {
    const batch = chunks.slice(b, b + PHONEMIZE_BATCH);
    const phonemized = await phonemizeSentences(batch.map((c) => c.text), voice.config.espeak.voice);

    for (let i = 0; i < batch.length; i++) {
      await yieldToMessages();
      if (cancelled.has(requestId)) throw new CancelledError();

      if (phonemized[i].length > 0) sink.add(await speakPhonemes(voice, phonemized[i], scales));
      if (batch[i].pauseAfterMs > 0) sink.add(silence(batch[i].pauseAfterMs, sampleRate));

      doneChars += batch[i].text.length;
      post({ type: 'synthProgress', id: requestId, fraction: doneChars / totalChars });
    }
  }

  const audio = sink.finish();
  const synthMs = performance.now() - start;
  post(
    {
      type: 'done',
      id: requestId,
      audio,
      mimeType: MIME_TYPES[format],
      durationSeconds: sink.sampleCount / sampleRate,
      chunkCount: chunks.length,
      synthMs,
    },
    [audio],
  );
}

function errorCode(error: unknown): EngineErrorCode {
  if (error instanceof NetworkError) return 'network';
  if (error instanceof EmptyTextError) return 'empty-text';
  return 'unknown';
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  try {
    switch (request.type) {
      case 'load': {
        const voice = await getVoice(request.voice, request.id);
        post({ type: 'loaded', id: request.id, fromCache: voice.fromCache });
        break;
      }
      case 'synthesize':
        await synthesize(request.id, request.voice, request.text, request.format, request.settings);
        break;
      case 'cancel':
        cancelled.add(request.id);
        break;
      case 'unload':
        for (const loading of voices.values()) {
          loading.then((v) => v.session.release()).catch(() => {});
        }
        voices.clear();
        post({ type: 'unloaded', id: request.id });
        break;
    }
  } catch (error) {
    if (error instanceof CancelledError) {
      post({ type: 'cancelled', id: request.id });
    } else {
      const message = error instanceof Error ? error.message : String(error);
      post({ type: 'error', id: request.id, code: errorCode(error), message });
    }
  } finally {
    if (request.type === 'synthesize') cancelled.delete(request.id);
  }
};
