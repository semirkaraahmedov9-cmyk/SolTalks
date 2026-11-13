import { describe, expect, it } from 'vitest';
import fixesFile from '../../pronunciation/bg-stress-fixes.txt?raw';
import {
  addStressMarks,
  findStress,
  guessStress,
  parseStressFixes,
  parseStressList,
  splitGraveLetters,
  STRESS_MARK as M,
  type StressLexicon,
} from './stress';

// A tiny sorted list in the same format as pronunciation/bg-stress-list.txt.gz.
// (The two "балкон…" lines are made up, to test disagreeing words.)
const list = parseStressList(
  ['балкона 1', 'балконът 0', 'вратата 1', 'заради 2', 'книгата 0', 'пара', 'хора 0', 'хорото 2'].join('\n'),
);
const lexicon = (fixes = new Map<string, number>()): StressLexicon => ({ list, fixes });

describe('parseStressList', () => {
  it('reads words, positions and ambiguous words', () => {
    expect(list.words[2]).toBe('вратата');
    expect(list.stress[2]).toBe(1);
    expect(list.stress[list.words.indexOf('пара')]).toBe(-1);
  });
});

describe('parseStressFixes', () => {
  it('reads the capital-letter notation', () => {
    const { fixes, problems } = parseStressFixes('зарАди\nсолидАрността');
    expect(problems).toEqual([]);
    expect(fixes.get('заради')).toBe(1);
    expect(fixes.get('солидарността')).toBe(2);
  });

  it('reads stress marks after the vowel', () => {
    const { fixes } = parseStressFixes(`зара̀ди\nкни́гите\nкни'га`);
    expect(fixes.get('заради')).toBe(1);
    expect(fixes.get('книгите')).toBe(0);
    expect(fixes.get('книга')).toBe(0);
  });

  it('ignores comments, empty lines and a capital first letter', () => {
    const { fixes, problems } = parseStressFixes('# бележка\n\nИвАн  # име\n');
    expect(problems).toEqual([]);
    expect([...fixes]).toEqual([['иван', 1]]);
  });

  it('reports lines it cannot understand', () => {
    const { problems } = parseStressFixes('заради\nЗАРАДИ\nkniga\nдом');
    expect(problems).toHaveLength(4);
    expect(problems[0]).toContain('Line 1');
  });

  it('the real fixes file has no mistakes', () => {
    expect(parseStressFixes(fixesFile).problems).toEqual([]);
  });
});

describe('findStress', () => {
  it('uses the list, and the fixes first', () => {
    expect(findStress('заради', lexicon())).toBe(2);
    expect(findStress('заради', lexicon(new Map([['заради', 1]])))).toBe(1);
  });

  it('leaves words with two possible stresses alone', () => {
    expect(findStress('пара', lexicon())).toBeUndefined();
  });
});

describe('guessStress', () => {
  it('guesses an unknown form from words with the same beginning', () => {
    expect(guessStress('хората', list)).toBe(0); // хора, хорото: stress in "хор"
  });

  it('does not guess when similar words disagree or nothing is similar', () => {
    expect(guessStress('балконе', list)).toBeUndefined(); // балкона 1 vs балконът 0
    expect(guessStress('слънце', list)).toBeUndefined();
  });
});

describe('addStressMarks', () => {
  it('marks known words and keeps capitals and punctuation', () => {
    expect(addStressMarks('Вратата, заради книгата.', lexicon())).toBe(
      `Врата${M}та, заради${M} кни${M}гата.`,
    );
  });

  it('skips one-syllable and unknown words', () => {
    expect(addStressMarks('и сто слънца', lexicon())).toBe('и сто слънца');
  });

  it('keeps stress the writer already marked', () => {
    expect(addStressMarks('зара́ди', lexicon())).toBe(`зара${M}ди`);
  });

  it('splits ѝ and ѐ so eSpeak reads them as part of the word', () => {
    expect(splitGraveLetters('ѝ сѐ')).toBe(`и${M} се${M}`);
  });
});
