// Collects generated audio piece by piece and turns it into a file.
// The MP3 sink compresses each piece immediately, so a long chapter never
// has to be held in memory as uncompressed audio.
import { Mp3Encoder } from '@breezystack/lamejs';
import { encodeWav } from './wav';

export type AudioFormat = 'mp3' | 'wav';

export const MIME_TYPES: Record<AudioFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

/** 64 kbit/s mono is plenty for speech at 22 kHz (about 0.5 MB per minute). */
const MP3_KBPS = 64;

export interface AudioSink {
  add(samples: Int16Array): void;
  /** Number of samples added so far. */
  readonly sampleCount: number;
  finish(): ArrayBuffer;
}

class WavSink implements AudioSink {
  private parts: Int16Array[] = [];
  sampleCount = 0;

  constructor(private sampleRate: number) {}

  add(samples: Int16Array) {
    this.parts.push(samples);
    this.sampleCount += samples.length;
  }

  finish() {
    return encodeWav(this.parts, this.sampleRate);
  }
}

class Mp3Sink implements AudioSink {
  private encoder: Mp3Encoder;
  private frames: Uint8Array[] = [];
  sampleCount = 0;

  constructor(sampleRate: number) {
    this.encoder = new Mp3Encoder(1, sampleRate, MP3_KBPS);
  }

  add(samples: Int16Array) {
    this.sampleCount += samples.length;
    const encoded = this.encoder.encodeBuffer(samples);
    if (encoded.length > 0) this.frames.push(encoded.slice());
  }

  finish() {
    const last = this.encoder.flush();
    if (last.length > 0) this.frames.push(last.slice());
    const size = this.frames.reduce((sum, f) => sum + f.length, 0);
    const out = new Uint8Array(size);
    let offset = 0;
    for (const frame of this.frames) {
      out.set(frame, offset);
      offset += frame.length;
    }
    return out.buffer;
  }
}

export function createAudioSink(format: AudioFormat, sampleRate: number): AudioSink {
  return format === 'mp3' ? new Mp3Sink(sampleRate) : new WavSink(sampleRate);
}
