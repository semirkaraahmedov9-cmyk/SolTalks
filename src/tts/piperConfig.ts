import { DEFAULT_COMMA_PAUSE_MS } from './pauses';

// The parts of a Piper voice config (<voice>.onnx.json) that we use.
export interface PiperVoiceConfig {
  audio: { sample_rate: number };
  espeak: { voice: string };
  inference: { noise_scale: number; length_scale: number; noise_w: number };
  num_speakers: number;
  phoneme_id_map: Record<string, number[]>;
  /** Piper 1.5+: phoneme sequences that the voice treats as one phoneme. */
  vowel_clusters?: string[][];
}

/** Settings that change how the voice sounds. */
export interface SynthesisSettings {
  // Piper's three "scales":
  /** Voice variation; lower = flatter but steadier. */
  noiseScale: number;
  /** Duration; above 1 = slower speech, below 1 = faster. */
  lengthScale: number;
  /** Rhythm variation between phonemes. */
  noiseW: number;
  /** Extra silence after a comma, in ms (0 = only the voice's own tiny pause). */
  commaPauseMs: number;
  /** Mark the stressed vowels from our stress list before eSpeak reads the text. */
  fixStress: boolean;
}

export function defaultSettings(config: PiperVoiceConfig): SynthesisSettings {
  return {
    noiseScale: config.inference.noise_scale,
    lengthScale: config.inference.length_scale,
    noiseW: config.inference.noise_w,
    commaPauseMs: DEFAULT_COMMA_PAUSE_MS,
    fixStress: true,
  };
}
