import { describe, expect, it } from 'vitest';
import { PARAGRAPH_PAUSE_MS, splitLong, splitSentences, splitText } from './split';

describe('splitSentences', () => {
  it('splits at . ! ? and …', () => {
    expect(splitSentences('Здравей! Как си? Добре съм. А ти…')).toEqual([
      'Здравей!',
      'Как си?',
      'Добре съм.',
      'А ти…',
    ]);
  });

  it('keeps closing quotes with their sentence', () => {
    expect(splitSentences('Той каза: „Ела!“ Аз дойдох.')).toEqual(['Той каза: „Ела!“', 'Аз дойдох.']);
  });

  it('does not split after an initial', () => {
    expect(splitSentences('Авторът е И. Вазов. Книгата е стара.')).toEqual([
      'Авторът е И. Вазов.',
      'Книгата е стара.',
    ]);
  });

  it('does not split before a lowercase word', () => {
    expect(splitSentences('Чакай... не сега.')).toEqual(['Чакай... не сега.']);
  });

  it('splits before a sentence that starts with a number', () => {
    expect(splitSentences('Имам книги. 12 са нови.')).toEqual(['Имам книги.', '12 са нови.']);
  });
});

describe('splitLong', () => {
  it('leaves short sentences alone', () => {
    expect(splitLong('Кратко изречение.', 50)).toEqual(['Кратко изречение.']);
  });

  it('prefers to cut after a comma', () => {
    const sentence = 'Първата част е тук, втората част е там и продължава още дълго';
    expect(splitLong(sentence, 40)).toEqual(['Първата част е тук,', 'втората част е там и продължава още', 'дълго']);
  });

  it('never returns a piece longer than the limit', () => {
    const sentence = 'дума '.repeat(300).trim();
    for (const piece of splitLong(sentence, 100)) expect(piece.length).toBeLessThanOrEqual(100);
  });

  it('hard-cuts text without any spaces', () => {
    expect(splitLong('а'.repeat(250), 100).map((p) => p.length)).toEqual([100, 100, 50]);
  });
});

describe('splitText', () => {
  it('adds a pause between paragraphs but not after the last one', () => {
    expect(splitText('Едно. Две.\n\nТри.')).toEqual([
      { text: 'Едно.', pauseAfterMs: 0 },
      { text: 'Две.', pauseAfterMs: PARAGRAPH_PAUSE_MS },
      { text: 'Три.', pauseAfterMs: 0 },
    ]);
  });

  it('returns nothing for empty text', () => {
    expect(splitText('')).toEqual([]);
  });
});
