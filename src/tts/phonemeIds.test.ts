import { describe, expect, it } from 'vitest';
import { mergeVowelClusters, phonemesToIds } from './phonemeIds';

const ID_MAP: Record<string, number[]> = {
  _: [0],
  '^': [1],
  $: [2],
  ' ': [3],
  a: [14],
  d: [17],
  ɪ: [74],
  aɪ: [161],
};

describe('mergeVowelClusters', () => {
  it('joins known clusters', () => {
    expect(mergeVowelClusters(['d', 'a', 'ɪ'], [['a', 'ɪ']])).toEqual(['d', 'aɪ']);
  });

  it('leaves phonemes alone when there are no clusters', () => {
    expect(mergeVowelClusters(['a', 'ɪ'])).toEqual(['a', 'ɪ']);
  });

  it('prefers the longest cluster', () => {
    const clusters = [['a', 'ɪ'], ['a', 'ɪ', 'ə']];
    expect(mergeVowelClusters(['a', 'ɪ', 'ə'], clusters)).toEqual(['aɪə']);
  });
});

describe('phonemesToIds', () => {
  it('wraps phonemes in BOS/EOS with PAD after each one, like Piper', () => {
    expect(phonemesToIds(['d', 'aɪ'], ID_MAP)).toEqual({
      ids: [1, 0, 17, 0, 161, 0, 2],
      missing: [],
    });
  });

  it('skips and reports unknown phonemes', () => {
    expect(phonemesToIds(['a', 'ʘ'], ID_MAP)).toEqual({
      ids: [1, 0, 14, 0, 2],
      missing: ['ʘ'],
    });
  });
});
