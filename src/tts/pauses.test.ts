import { describe, expect, it } from 'vitest';
import { splitAtPauses } from './pauses';

const ph = (text: string) => [...text];

describe('splitAtPauses', () => {
  it('splits after commas and adds the pause', () => {
    expect(splitAtPauses(ph('ab, cd.'), 200)).toEqual([
      { phonemes: ph('ab,'), pauseAfterMs: 200 },
      { phonemes: ph('cd.'), pauseAfterMs: 0 },
    ]);
  });

  it('pauses longer after ; and :', () => {
    expect(splitAtPauses(ph('ab; cd'), 200)[0].pauseAfterMs).toBe(300);
  });

  it('keeps the sentence whole when pauses are off', () => {
    expect(splitAtPauses(ph('ab, cd'), 0)).toEqual([{ phonemes: ph('ab, cd'), pauseAfterMs: 0 }]);
  });

  it('makes no part from punctuation alone', () => {
    expect(splitAtPauses(ph('ab, ; cd'), 200)).toEqual([
      { phonemes: ph('ab,'), pauseAfterMs: 300 },
      { phonemes: ph('cd'), pauseAfterMs: 0 },
    ]);
  });

  it('adds no pause after a comma at the very end', () => {
    expect(splitAtPauses(ph('ab,'), 200)).toEqual([{ phonemes: ph('ab,'), pauseAfterMs: 0 }]);
  });
});
