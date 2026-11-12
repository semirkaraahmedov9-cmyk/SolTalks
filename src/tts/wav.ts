/** Scales audio so its loudest sample is at full volume (Piper's normalize_audio). */
export function normalizePeak(samples: Float32Array): Float32Array {
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  if (peak < 1e-8) return new Float32Array(samples.length);
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] / peak;
  return out;
}

/**
 * Converts float audio (-1..1) to 16-bit samples. Long books are kept in this
 * form because it needs half the memory of float audio.
 */
export function floatToInt16(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = Math.round(s * 32767);
  }
  return out;
}

export function silence(ms: number, sampleRate: number): Int16Array {
  return new Int16Array(Math.round((ms / 1000) * sampleRate));
}

/** Builds a mono 16-bit PCM WAV file from audio pieces, without joining them first. */
export function encodeWav(parts: Int16Array[], sampleRate: number): ArrayBuffer {
  const sampleCount = parts.reduce((sum, p) => sum + p.length, 0);
  const dataSize = sampleCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const part of parts) {
    new Int16Array(buffer, offset, part.length).set(part);
    offset += part.length * 2;
  }
  return buffer;
}
