// Text → phonemes with eSpeak-ng (GPL-3.0), compiled to WebAssembly by the
// @diffusionstudio/piper-wasm package. Runs inside the TTS worker only.
import piperScript from '@diffusionstudio/piper-wasm/build/piper_phonemize.js?raw';
import piperWasmUrl from '@diffusionstudio/piper-wasm/build/piper_phonemize.wasm?url';
import piperDataUrl from '@diffusionstudio/piper-wasm/build/piper_phonemize.data?url';

interface PhonemizeModule {
  callMain(args: string[]): void;
}

type ModuleFactory = (options: Record<string, unknown>) => Promise<PhonemizeModule>;

interface PhonemizeOutputLine {
  phonemes: string[];
}

let factory: ModuleFactory | undefined;
let wasmBinary: ArrayBuffer | undefined;
let dataPackage: ArrayBuffer | undefined;

/** Loads the eSpeak program and its language data (≈18 MB) once. */
export async function initPhonemizer(): Promise<void> {
  if (factory) return;
  // The build is a classic (non-module) script that defines a global factory
  // function; evaluating it this way works inside a module worker.
  factory = new Function(`${piperScript}\nreturn createPiperPhonemize;`)() as ModuleFactory;
  const [wasm, data] = await Promise.all([fetchBytes(piperWasmUrl), fetchBytes(piperDataUrl)]);
  wasmBinary = wasm;
  dataPackage = data;
}

/**
 * Phonemizes each sentence separately. A fresh eSpeak instance is created per
 * call (fast, because the downloaded files are reused from memory), since the
 * program is written to run once and exit.
 */
export async function phonemizeSentences(sentences: string[], espeakVoice: string): Promise<string[][]> {
  if (!factory || !wasmBinary || !dataPackage) throw new Error('Phonemizer not initialised');

  const lines: string[] = [];
  const errors: string[] = [];
  const module = await factory({
    wasmBinary,
    getPreloadedPackage: () => dataPackage,
    locateFile: (file: string) => file,
    print: (line: string) => lines.push(line),
    printErr: (line: string) => errors.push(line),
  });

  module.callMain([
    '-l',
    espeakVoice,
    '--input',
    JSON.stringify(sentences.map((text) => ({ text }))),
    '--espeak_data',
    '/espeak-ng-data',
  ]);

  const results = lines
    .filter((line) => line.trim().startsWith('{'))
    .map((line) => (JSON.parse(line) as PhonemizeOutputLine).phonemes);

  if (results.length !== sentences.length) {
    throw new Error(
      `Phonemizer returned ${results.length} results for ${sentences.length} sentences. ${errors.join(' ')}`,
    );
  }
  return results;
}

async function fetchBytes(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.arrayBuffer();
}
