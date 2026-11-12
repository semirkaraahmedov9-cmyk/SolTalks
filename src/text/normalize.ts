// Cleans up Bulgarian text before it is spoken. Pasted and PDF text is full
// of line breaks, broken words and invisible characters that would otherwise
// cause odd pauses or mispronunciations.
import { expandAbbreviations } from './abbreviations';

export function normalizeText(input: string): string {
  let text = input.normalize('NFC').replace(/\r\n?/g, '\n');

  // A soft hyphen at a line end joins the word halves: "раз­\nказ" → "разказ".
  text = text.replace(/­[ \t]*\n[ \t]*/g, '');
  // Invisible characters: soft hyphen, zero-width spaces/joiners, byte order mark.
  text = text.replace(/[­​-‍⁠﻿]/g, '');
  // Unusual spaces (tab, no-break space, thin space…) → normal space.
  text = text.replace(/[\t  -   　]/g, ' ');

  // A word broken across lines in a PDF: "раз-\nказ" → "разказ".
  // Only when the next line starts lowercase, so real dashes stay.
  text = text.replace(/(\p{L})[-‐¬][ ]*\n[ ]*(?=\p{Ll})/gu, '$1');

  text = text.replace(/[ ]*\n[ ]*/g, '\n');
  // Blank line(s) = paragraph break.
  text = text.replace(/\n{2,}/g, '\n\n');
  // A single line break after the end of a sentence also starts a new paragraph…
  text = text.replace(/([.!?…:»“"])\n(?!\n)/g, '$1\n\n');
  // …any other single line break is just a wrapped line.
  text = text.replace(/(?<!\n)\n(?!\n)/g, ' ');

  text = text.replace(/ {2,}/g, ' ');
  text = expandAbbreviations(text);

  return text
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n\n');
}
