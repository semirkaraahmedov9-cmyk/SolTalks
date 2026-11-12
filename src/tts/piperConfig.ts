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

/** Settings that change how the voice sounds (Piper's "scales"). */
export interface SynthesisSettings {
  /** Voice variation; lower = flatter but steadier. */
  noiseScale: number;
  /** Duration; above 1 = slower speech, below 1 = faster. */
  lengthScale: number;
  /** Rhythm variation between phonemes. */
  noiseW: number;
}

export function defaultSettings(config: PiperVoiceConfig): SynthesisSettings {
  return {
    noiseScale: config.inference.noise_scale,
    lengthScale: config.inference.length_scale,
    noiseW: config.inference.noise_w,
  };
}
