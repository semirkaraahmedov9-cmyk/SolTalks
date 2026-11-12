import { describe, expect, it } from 'vitest';
import { createAudioSink } from './audioSink';

// One second of a quiet 440 Hz tone at 22,050 Hz.
const tone = Int16Array.from({ length: 22050 }, (_, i) => Math.round(Math.sin((2 * Math.PI * 440 * i) / 22050) * 8000));

describe('WAV sink', () => {
  it('produces a WAV file containing every sample', () => {
    const sink = createAudioSink('wav', 22050);
    sink.add(tone);
    sink.add(tone);
    const file = new Uint8Array(sink.finish());
    expect(sink.sampleCount).toBe(44100);
    expect(String.fromCharCode(...file.slice(0, 4))).toBe('RIFF');
    expect(file.length).toBe(44 + 44100 * 2);
  });
});

describe('MP3 sink', () => {
  it('produces MP3 frames that are much smaller than WAV', () => {
    const sink = createAudioSink('mp3', 22050);
    sink.add(tone);
    sink.add(tone);
    const file = new Uint8Array(sink.finish());
    expect(sink.sampleCount).toBe(44100);
    // Every MP3 frame starts with 11 set bits ("frame sync").
    expect(file[0]).toBe(0xff);
    expect(file[1] & 0xe0).toBe(0xe0);
    // 2 s at 64 kbit/s ≈ 16 KB, versus 88 KB as WAV.
    expect(file.length).toBeGreaterThan(10_000);
    expect(file.length).toBeLessThan(25_000);
  });
});
