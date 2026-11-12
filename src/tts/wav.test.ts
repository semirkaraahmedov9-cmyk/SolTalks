import { describe, expect, it } from 'vitest';
import { concatAudio, encodeWav, normalizePeak } from './wav';

describe('normalizePeak', () => {
  it('scales the loudest sample to 1', () => {
    expect(Array.from(normalizePeak(new Float32Array([0.25, -0.5])))).toEqual([0.5, -1]);
  });

  it('returns silence for silent input instead of dividing by zero', () => {
    expect(Array.from(normalizePeak(new Float32Array([0, 0])))).toEqual([0, 0]);
  });
});

describe('concatAudio', () => {
  it('joins pieces in order', () => {
    const joined = concatAudio([new Float32Array([1]), new Float32Array([2, 3])]);
    expect(Array.from(joined)).toEqual([1, 2, 3]);
  });
});

describe('encodeWav', () => {
  it('writes a valid 16-bit mono WAV header and samples', () => {
    const wav = encodeWav(new Float32Array([0, 1, -1]), 22050);
    const view = new DataView(wav);
    const text = (o: number) => String.fromCharCode(...new Uint8Array(wav, o, 4));

    expect(wav.byteLength).toBe(44 + 3 * 2);
    expect(text(0)).toBe('RIFF');
    expect(text(8)).toBe('WAVE');
    expect(view.getUint32(24, true)).toBe(22050);
    expect(view.getInt16(46, true)).toBe(32767);
    expect(view.getInt16(48, true)).toBe(-32767);
  });
});
