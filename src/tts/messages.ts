// Messages between the page and the TTS worker.
import type { SynthesisSettings } from './piperConfig';

export type WorkerRequest = {
  type: 'synthesize';
  text: string;
  settings?: SynthesisSettings;
};

export interface Timings {
  /** Time spent downloading the voice (0 when it came from the browser cache). */
  downloadMs: number;
  /** Time to start the engine, eSpeak and the voice model. */
  loadMs: number;
  /** Time to turn this text into audio. */
  synthMs: number;
}

export type WorkerResponse =
  | { type: 'progress'; stage: 'download'; loaded: number; total: number }
  | { type: 'progress'; stage: 'load' | 'synthesize' }
  | {
      type: 'result';
      wav: ArrayBuffer;
      audioSeconds: number;
      timings: Timings;
      voiceBytes: number;
      voiceFromCache: boolean;
      defaults: SynthesisSettings;
      phonemes: string[];
      missingPhonemes: string[];
    }
  | { type: 'error'; message: string };
