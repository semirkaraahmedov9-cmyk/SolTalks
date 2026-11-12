import { describe, expect, it } from 'vitest';
import { normalizeText } from './normalize';

describe('normalizeText: whitespace and line breaks', () => {
  it('joins lines inside a sentence', () => {
    expect(normalizeText('Имало едно\nвреме едно\nмомче')).toBe('Имало едно време едно момче');
  });

  it('keeps blank lines as paragraph breaks', () => {
    expect(normalizeText('Първи абзац\n\n\n\nВтори абзац')).toBe('Първи абзац\n\nВтори абзац');
  });

  it('treats a line break after a sentence end as a paragraph break', () => {
    expect(normalizeText('Край на мисълта.\nНова мисъл.')).toBe('Край на мисълта.\n\nНова мисъл.');
  });

  it('collapses repeated and unusual spaces', () => {
    expect(normalizeText('много   \tинтервали')).toBe('много интервали');
  });

  it('handles Windows line endings', () => {
    expect(normalizeText('ред\r\nред')).toBe('ред ред');
  });
});

describe('normalizeText: words broken across lines (PDFs)', () => {
  it('rejoins a hyphenated word', () => {
    expect(normalizeText('Това е раз-\nказ за село.')).toBe('Това е разказ за село.');
  });

  it('rejoins a word split with a soft hyphen', () => {
    expect(normalizeText('раз­\nказ')).toBe('разказ');
  });

  it('keeps a dash when the next line starts with a capital letter', () => {
    expect(normalizeText('София-\nПловдив')).toBe('София- Пловдив');
  });

  it('removes invisible characters', () => {
    expect(normalizeText('ду​ма﻿')).toBe('дума');
  });
});

describe('normalizeText: abbreviations', () => {
  it.each([
    ['ул. „Иван Вазов“', 'улица „Иван Вазов“'],
    ['бул. „Витоша“', 'булевард „Витоша“'],
    ['гр. Смолян', 'град Смолян'],
    ['с. Чепинци', 'село Чепинци'],
    ['вж. с. 12', 'виж страница 12'],
    ['т.е. сега', 'тоест сега'],
    ['т. е. сега', 'тоест сега'],
    ['напр. ябълки', 'например ябълки'],
    ['стр. 5', 'страница 5'],
    ['д-р Петров и г-жа Иванова', 'доктор Петров и госпожа Иванова'],
    ['10 лв. на ден', '10 лева на ден'],
    ['5 млн. души', '5 милиона души'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });

  it('reads "г." after a number as "година"', () => {
    expect(normalizeText('През 1878 г. започва')).toBe('През 1878 година започва');
  });

  it('keeps the sentence end when an abbreviation is the last word', () => {
    expect(normalizeText('Купихме ябълки, круши и др. После си тръгнахме.')).toBe(
      'Купихме ябълки, круши и други. После си тръгнахме.',
    );
  });

  it('does not add a full stop inside a sentence', () => {
    expect(normalizeText('ябълки и др. плодове')).toBe('ябълки и други плодове');
  });

  it('keeps a capital letter at the start of a sentence', () => {
    expect(normalizeText('Ул. Шипка е тиха.')).toBe('Улица Шипка е тиха.');
  });

  it('does not touch the same letters inside longer words', () => {
    expect(normalizeText('Другар и брат.')).toBe('Другар и брат.');
    expect(normalizeText('Улицата е широка.')).toBe('Улицата е широка.');
  });
});
