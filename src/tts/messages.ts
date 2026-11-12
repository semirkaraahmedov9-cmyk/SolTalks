// Messages between the page (engine.ts) and the speech worker (worker.ts).
// Every request has an id so answers can be matched to the right caller.
import type { AudioFormat } from './audioSink';
import type { SynthesisSettings } from './piperConfig';
import type { VoiceInfo } from './voices';

export type WorkerRequest =
  | { type: 'load'; id: number; voice: VoiceInfo }
  | {
      type: 'synthesize';
      id: number;
      voice: VoiceInfo;
      text: string;
      format: AudioFormat;
      settings?: SynthesisSettings;
    }
  | { type: 'cancel'; id: number }
  /** Forget loaded voices (after the user deleted downloaded voices). */
  | { type: 'unload'; id: number };

export interface SynthesisOutput {
  /** The finished audio file (MP3 or WAV). */
  audio: ArrayBuffer;
  mimeType: string;
  durationSeconds: number;
  /** How many pieces the text was split into. */
  chunkCount: number;
  /** Time to turn the text into audio (voice loading not included). */
  synthMs: number;
}

export type WorkerResponse =
  | { type: 'downloadProgress'; id: number; loaded: number; total: number }
  | { type: 'loaded'; id: number; fromCache: boolean }
  | { type: 'synthProgress'; id: number; fraction: number }
  | ({ type: 'done'; id: number } & SynthesisOutput)
  | { type: 'unloaded'; id: number }
  | { type: 'cancelled'; id: number }
  | { type: 'error'; id: number; code: EngineErrorCode; message: string };

/** Lets the page show a clear Bulgarian message for each kind of failure. */
export type EngineErrorCode = 'network' | 'empty-text' | 'unknown';
