import { describe, expect, it } from 'vitest';
import { encodeWav, floatToInt16, normalizePeak, silence } from './wav';

describe('normalizePeak', () => {
  it('scales the loudest sample to 1', () => {
    expect(Array.from(normalizePeak(new Float32Array([0.25, -0.5])))).toEqual([0.5, -1]);
  });

  it('returns silence for silent input instead of dividing by zero', () => {
    expect(Array.from(normalizePeak(new Float32Array([0, 0])))).toEqual([0, 0]);
  });
});

describe('floatToInt16', () => {
  it('maps -1..1 to the 16-bit range and clips beyond it', () => {
    expect(Array.from(floatToInt16(new Float32Array([0, 1, -1, 2])))).toEqual([0, 32767, -32767, 32767]);
  });
});

describe('silence', () => {
  it('creates the right number of zero samples', () => {
    expect(silence(500, 22050).length).toBe(11025);
  });
});

describe('encodeWav', () => {
  it('writes a valid header and all pieces in order', () => {
    const wav = encodeWav([new Int16Array([1, 2]), new Int16Array([3])], 22050);
    const view = new DataView(wav);
    const text = (o: number) => String.fromCharCode(...new Uint8Array(wav, o, 4));

    expect(wav.byteLength).toBe(44 + 3 * 2);
    expect(text(0)).toBe('RIFF');
    expect(text(8)).toBe('WAVE');
    expect(view.getUint32(24, true)).toBe(22050);
    expect(view.getUint32(40, true)).toBe(6);
    expect([view.getInt16(44, true), view.getInt16(46, true), view.getInt16(48, true)]).toEqual([1, 2, 3]);
  });
});
