// Bulgarian abbreviations expanded before speaking, because eSpeak reads them
// letter by letter or as nonsense words ("ул." → "ул").

interface Abbreviation {
  /** Regex source for the abbreviation; spaces inside like "т. е." are allowed. */
  pattern: string;
  full: string;
  /** If the abbreviation can be the last word of a sentence, keep a full stop. */
  canEndSentence?: boolean;
}

const ABBREVIATIONS: Abbreviation[] = [
  { pattern: 'т\\.\\s?е\\.', full: 'тоест' },
  { pattern: 'т\\.\\s?н\\.', full: 'така нататък', canEndSentence: true },
  { pattern: 'напр\\.', full: 'например' },
  { pattern: 'др\\.', full: 'други', canEndSentence: true },
  { pattern: 'бул\\.', full: 'булевард' },
  { pattern: 'ул\\.', full: 'улица' },
  { pattern: 'гр\\.', full: 'град' },
  { pattern: 'стр\\.', full: 'страница' },
  { pattern: 'вкл\\.', full: 'включително', canEndSentence: true },
  { pattern: 'вж\\.', full: 'виж' },
  { pattern: 'проф\\.', full: 'професор' },
  { pattern: 'д-р', full: 'доктор' },
  { pattern: 'г-н', full: 'господин' },
  { pattern: 'г-жа', full: 'госпожа' },
  { pattern: 'г-ца', full: 'госпожица' },
  { pattern: 'лв\\.', full: 'лева', canEndSentence: true },
  { pattern: 'хил\\.', full: 'хиляди', canEndSentence: true },
  { pattern: 'млн\\.', full: 'милиона', canEndSentence: true },
  { pattern: 'млрд\\.', full: 'милиарда', canEndSentence: true },
];

// \b does not work for Cyrillic in JavaScript, so we check neighbours by hand.
const NOT_AFTER_LETTER = '(?<![\\p{L}\\p{N}])';
const NOT_BEFORE_LETTER = '(?![\\p{L}\\p{N}])';

// What follows the abbreviation when its dot also ends the sentence:
// end of text, a line break, or a space and then a capital letter.
const SENTENCE_END_AFTER = /^(\s*$|\s*\n|\s+[„"«(–—-]?\s*\p{Lu})/u;

function matchCase(original: string, replacement: string): string {
  const first = original[0];
  return first === first.toUpperCase() && first !== first.toLowerCase()
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;
}

export function expandAbbreviations(text: string): string {
  let result = text;

  for (const abbr of ABBREVIATIONS) {
    const regex = new RegExp(`${NOT_AFTER_LETTER}${abbr.pattern}${NOT_BEFORE_LETTER}`, 'giu');
    result = result.replace(regex, (match: string, offset: number, whole: string) => {
      const rest = whole.slice(offset + match.length);
      const keepStop = abbr.canEndSentence && SENTENCE_END_AFTER.test(rest);
      return matchCase(match, abbr.full) + (keepStop ? '.' : '');
    });
  }

  // "г." after a number means "година" (year); "гг." means "години".
  result = result.replace(/(\d)\s*гг\.(?![\p{L}\p{N}])/gu, (_m, digit: string, offset: number, whole: string) =>
    `${digit} години${SENTENCE_END_AFTER.test(whole.slice(offset + _m.length)) ? '.' : ''}`,
  );
  result = result.replace(/(\d)\s*г\.(?![\p{L}\p{N}])/gu, (_m, digit: string, offset: number, whole: string) =>
    `${digit} година${SENTENCE_END_AFTER.test(whole.slice(offset + _m.length)) ? '.' : ''}`,
  );

  // "с." before a name is "село" (village); before a number it is "страница" (page).
  result = result.replace(/(?<![\p{L}\p{N}])([сС])\.\s*(?=\p{Lu})/gu, (m: string) => `${matchCase(m, 'село')} `);
  result = result.replace(/(?<![\p{L}\p{N}])([сС])\.\s*(?=\d)/gu, (m: string) => `${matchCase(m, 'страница')} `);

  return result;
}
