/// <reference lib="webworker" />
// Speech generation runs here, off the main thread, so the page never freezes.
import * as ort from 'onnxruntime-web/wasm';
import ortWasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';
import { downloadWithCache } from './download';
import type { Timings, WorkerRequest, WorkerResponse } from './messages';
import { initPhonemizer, phonemizeSentences } from './phonemizer';
import { mergeVowelClusters, phonemesToIds } from './phonemeIds';
import { defaultSettings, type PiperVoiceConfig, type SynthesisSettings } from './piperConfig';
import { TEST_VOICE } from './testVoice';
import { concatAudio, encodeWav, normalizePeak } from './wav';

declare const self: DedicatedWorkerGlobalScope;

// GitHub Pages cannot send the headers needed for multi-threaded WebAssembly,
// so we always use one thread. The engine's .wasm file is served from our site.
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = { wasm: ortWasmUrl };

interface LoadedVoice {
  session: ort.InferenceSession;
  config: PiperVoiceConfig;
  voiceBytes: number;
  fromCache: boolean;
  downloadMs: number;
  loadMs: number;
}

let voicePromise: Promise<LoadedVoice> | undefined;

function post(message: WorkerResponse, transfer: Transferable[] = []) {
  self.postMessage(message, transfer);
}

async function loadVoice(): Promise<LoadedVoice> {
  const downloadStart = performance.now();
  const [model, configResponse] = await Promise.all([
    downloadWithCache(TEST_VOICE.modelUrl, TEST_VOICE.modelBytes, ({ loaded, total }) =>
      post({ type: 'progress', stage: 'download', loaded, total }),
    ),
    fetch(TEST_VOICE.configUrl),
  ]);
  const config = (await configResponse.json()) as PiperVoiceConfig;
  const downloadMs = model.fromCache ? 0 : performance.now() - downloadStart;

  post({ type: 'progress', stage: 'load' });
  const loadStart = performance.now();
  const [session] = await Promise.all([
    ort.InferenceSession.create(new Uint8Array(model.data), { executionProviders: ['wasm'] }),
    initPhonemizer(),
  ]);

  return {
    session,
    config,
    voiceBytes: model.data.byteLength,
    fromCache: model.fromCache,
    downloadMs,
    loadMs: performance.now() - loadStart,
  };
}

// Temporary simple sentence split for the Phase 1 test (proper one in Phase 2).
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function synthesize(voice: LoadedVoice, text: string, settings: SynthesisSettings) {
  const { session, config } = voice;
  const sentences = splitSentences(text);
  const phonemized = await phonemizeSentences(sentences, config.espeak.voice);

  const parts: Float32Array[] = [];
  const allPhonemes: string[] = [];
  const missing = new Set<string>();

  for (const raw of phonemized) {
    const phonemes = mergeVowelClusters(raw, config.vowel_clusters);
    const { ids, missing: miss } = phonemesToIds(phonemes, config.phoneme_id_map);
    miss.forEach((m) => missing.add(m));
    allPhonemes.push(phonemes.join(''));

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
    const audio = output[session.outputNames[0]].data as Float32Array;
    parts.push(normalizePeak(audio));
  }

  return { audio: concatAudio(parts), phonemes: allPhonemes, missing: [...missing] };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'synthesize') return;

  try {
    voicePromise ??= loadVoice();
    const voice = await voicePromise;
    const settings = request.settings ?? defaultSettings(voice.config);

    post({ type: 'progress', stage: 'synthesize' });
    const synthStart = performance.now();
    const { audio, phonemes, missing } = await synthesize(voice, request.text, settings);
    const synthMs = performance.now() - synthStart;

    const sampleRate = voice.config.audio.sample_rate;
    const wav = encodeWav(audio, sampleRate);
    const timings: Timings = { downloadMs: voice.downloadMs, loadMs: voice.loadMs, synthMs };
    // Download and load times only count for the first request.
    voice.downloadMs = 0;
    voice.loadMs = 0;

    post(
      {
        type: 'result',
        wav,
        audioSeconds: audio.length / sampleRate,
        timings,
        voiceBytes: voice.voiceBytes,
        voiceFromCache: voice.fromCache,
        defaults: defaultSettings(voice.config),
        phonemes,
        missingPhonemes: missing,
      },
      [wav],
    );
  } catch (error) {
    voicePromise = undefined; // allow a retry, e.g. after a network error
    post({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
};
