// Bulgarian word stress. eSpeak often puts the stress on the wrong vowel
// (книгѝте instead of кнѝгите), but it follows a combining grave accent
// (U+0300) written right after a vowel. So before phonemizing, each word is
// looked up and the mark is added. Sources, in order:
//   1. the hand-written fixes file (pronunciation/bg-stress-fixes.txt),
//   2. the Wiktionary stress list (pronunciation/bg-stress-list.txt.gz),
//   3. a guess from similar words in the list (хора → хората).
// If none of them knows the word, it is left to eSpeak.

/** The mark eSpeak understands. (It ignores the acute accent U+0301.) */
export const STRESS_MARK = '̀';
const ACUTE = '́';
const VOWELS = 'аеиоуъюя';
const BULGARIAN_WORD = /^[а-ъьюя]+$/;

/** Cyrillic letters plus any stress marks the writer already put in. */
const WORD = /[\p{Script=Cyrillic}̀́]+/gu;

export interface StressList {
  /** Sorted word forms (lower case). */
  words: string[];
  /** Stressed vowel of each word (0 = first vowel); -1 = more than one possible stress. */
  stress: Int8Array;
}

export interface StressLexicon {
  list: StressList;
  /** Hand-written fixes: always win over the list. */
  fixes: Map<string, number>;
}

const isVowel = (ch: string) => VOWELS.includes(ch.toLowerCase());

export function countVowels(word: string): number {
  let count = 0;
  for (const ch of word) if (isVowel(ch)) count++;
  return count;
}

/**
 * Text normalisation (NFC) turns и/е + grave into the single letters ѝ/ѐ,
 * which eSpeak does not read as part of a word. Split them back.
 */
export function splitGraveLetters(text: string): string {
  return text
    .replace(/ѝ/g, 'и' + STRESS_MARK)
    .replace(/Ѝ/g, 'И' + STRESS_MARK)
    .replace(/ѐ/g, 'е' + STRESS_MARK)
    .replace(/Ѐ/g, 'Е' + STRESS_MARK);
}

/** Reads the list format written by tools/build-stress-list.mjs. */
export function parseStressList(text: string): StressList {
  const words: string[] = [];
  const stress: number[] = [];
  for (const line of text.split('\n')) {
    if (!line) continue;
    const space = line.indexOf(' ');
    if (space < 0) {
      words.push(line);
      stress.push(-1);
    } else {
      words.push(line.slice(0, space));
      stress.push(Number(line.slice(space + 1)));
    }
  }
  return { words, stress: Int8Array.from(stress) };
}

export interface StressFixes {
  fixes: Map<string, number>;
  /** Lines that could not be understood, with the reason. */
  problems: string[];
}

/**
 * Reads the hand-written fixes file. One word per line, lower case, with the
 * stressed vowel as a capital letter ("зарАди"). A stress mark after the
 * vowel (` ' or an accent) also works. "#" starts a comment.
 */
export function parseStressFixes(text: string): StressFixes {
  const fixes = new Map<string, number>();
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((rawLine, lineIndex) => {
    const line = rawLine.replace(/#.*/, '').trim();
    for (const token of line.split(/[\s,;]+/).filter(Boolean)) {
      const result = readMarkedWord(token);
      if (typeof result === 'string') problems.push(`Line ${lineIndex + 1}, "${token}": ${result}`);
      else fixes.set(result.word, result.index);
    }
  });
  return { fixes, problems };
}

const MARKS = new Set([STRESS_MARK, ACUTE, '`', "'", '´', '’']);

/** Returns the plain word and its stressed vowel, or a reason why not. */
function readMarkedWord(token: string): { word: string; index: number } | string {
  const letters = splitGraveLetters(token.normalize('NFC'));
  let word = '';
  let vowels = 0;
  let marked = -1;
  let previousWasVowel = false;
  const capitalVowels: number[] = [];

  for (const ch of letters) {
    if (MARKS.has(ch)) {
      if (!previousWasVowel) return 'the stress mark must come right after the stressed vowel';
      marked = vowels - 1;
      previousWasVowel = false;
      continue;
    }
    previousWasVowel = isVowel(ch);
    if (previousWasVowel) {
      if (ch !== ch.toLowerCase()) capitalVowels.push(vowels);
      vowels++;
    }
    word += ch.toLowerCase();
  }

  if (!BULGARIAN_WORD.test(word)) return 'only Bulgarian letters are allowed';
  if (vowels < 2) return 'a word with one vowel needs no stress fix';
  if (marked >= 0) return { word, index: marked };

  // A capital first letter (a name such as "ИвАн") is not a stress mark.
  if (capitalVowels.length > 1 && capitalVowels[0] === 0 && letters[0] !== letters[0].toLowerCase()) {
    capitalVowels.shift();
  }
  if (capitalVowels.length !== 1) {
    return 'write the word in small letters with only the stressed vowel as a capital, e.g. зарАди';
  }
  return { word, index: capitalVowels[0] };
}

/** Position where `word` is, or would be, in the sorted list. */
function lowerBound(words: string[], word: string): number {
  let low = 0;
  let high = words.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (words[middle] < word) low = middle + 1;
    else high = middle;
  }
  return low;
}

function sharedStart(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/** The guess must share at least this many letters with known words… */
export const GUESS_MIN_SHARED = 4;
/** …and differ in at most this many letters at the end (the ending). */
export const GUESS_MAX_ENDING = 4;
/** How far to look along the list for words with the same beginning. */
const GUESS_SCAN_LIMIT = 200;

/**
 * Guesses the stress of an unknown form from known words that start the same
 * way, e.g. хората from хора (хо̀ра). Only words whose stress falls inside the
 * shared beginning count; if they disagree, there is no guess.
 */
export function guessStress(word: string, list: StressList): number | undefined {
  const { words, stress } = list;
  const position = lowerBound(words, word);

  // In a sorted list the words sharing the longest beginning sit right next
  // to where `word` would be. (The word itself is skipped, for testing.)
  let shared = 0;
  for (const j of [position - 1, position, position + 1]) {
    if (j >= 0 && j < words.length && words[j] !== word) shared = Math.max(shared, sharedStart(word, words[j]));
  }
  if (shared < GUESS_MIN_SHARED || word.length - shared > GUESS_MAX_ENDING) return undefined;

  const sharedVowels = countVowels(word.slice(0, shared));
  let guess: number | undefined;
  const consider = (j: number) => {
    if (words[j] === word || stress[j] < 0 || stress[j] >= sharedVowels) return true;
    if (guess === undefined) guess = stress[j];
    return guess === stress[j];
  };

  for (let j = position - 1; j >= 0 && position - j <= GUESS_SCAN_LIMIT; j--) {
    if (sharedStart(word, words[j]) < shared) break;
    if (!consider(j)) return undefined;
  }
  for (let j = position; j < words.length && j - position < GUESS_SCAN_LIMIT; j++) {
    if (sharedStart(word, words[j]) < shared) break;
    if (!consider(j)) return undefined;
  }
  return guess;
}

/** Stressed vowel of a lower-case word, or undefined when unknown. */
export function findStress(word: string, lexicon: StressLexicon): number | undefined {
  const fix = lexicon.fixes.get(word);
  if (fix !== undefined) return fix;

  const { words, stress } = lexicon.list;
  const position = lowerBound(words, word);
  if (words[position] === word) return stress[position] >= 0 ? stress[position] : undefined;
  return guessStress(word, lexicon.list);
}

function insertMark(word: string, vowelIndex: number): string {
  let vowels = 0;
  for (let i = 0; i < word.length; i++) {
    if (isVowel(word[i]) && vowels++ === vowelIndex) {
      return word.slice(0, i + 1) + STRESS_MARK + word.slice(i + 1);
    }
  }
  return word;
}

function markWord(word: string, lexicon: StressLexicon): string {
  // The writer already marked the stress: keep it, in the form eSpeak reads.
  if (word.includes(STRESS_MARK) || word.includes(ACUTE)) return word.replaceAll(ACUTE, STRESS_MARK);

  const lower = word.toLowerCase();
  if (countVowels(lower) < 2 || !BULGARIAN_WORD.test(lower)) return word;
  const index = findStress(lower, lexicon);
  return index === undefined ? word : insertMark(word, index);
}

/** Adds a stress mark after the stressed vowel of every word we know. */
export function addStressMarks(text: string, lexicon: StressLexicon): string {
  return splitGraveLetters(text).replace(WORD, (word) => markWord(word, lexicon));
}
