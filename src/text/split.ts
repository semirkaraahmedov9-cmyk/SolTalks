// Splits normalised text into pieces the voice can speak one at a time.
// Piper speaks sentence by sentence; very long "sentences" (common in PDFs)
// are cut further so memory use and waiting time per piece stay small.

export interface TextChunk {
  text: string;
  /** Silence to add after this chunk, in milliseconds. */
  pauseAfterMs: number;
}

export const MAX_CHUNK_CHARS = 400;
export const PARAGRAPH_PAUSE_MS = 600;

// Sentence end: . ! ? … (possibly repeated, possibly followed by closing
// quotes/brackets), then whitespace, then something that starts a sentence.
const BOUNDARY = /[.!?…]+[»“”"')\]]*(?=\s+[„"«(–—-]?\s*[\p{Lu}\p{N}])/gu;

// "И. Вазов": a single letter before the dot is an initial, not a sentence end.
const ENDS_WITH_INITIAL = /(?:^|[\s(„"«])\p{L}\.$/u;

export function splitSentences(paragraph: string): string[] {
  const sentences: string[] = [];
  let start = 0;

  for (const match of paragraph.matchAll(BOUNDARY)) {
    const end = match.index + match[0].length;
    const candidate = paragraph.slice(start, end);
    if (match[0] === '.' && ENDS_WITH_INITIAL.test(candidate)) continue;
    sentences.push(candidate.trim());
    start = end;
  }

  const rest = paragraph.slice(start).trim();
  if (rest) sentences.push(rest);
  return sentences.filter(Boolean);
}

/** Cuts an over-long sentence at the best break before the limit. */
export function splitLong(sentence: string, maxChars = MAX_CHUNK_CHARS): string[] {
  if (sentence.length <= maxChars) return [sentence];

  const window = sentence.slice(0, maxChars);
  // Prefer a clause break (, ; : or a spaced dash), then any space.
  const clause = Math.max(
    window.lastIndexOf(', '),
    window.lastIndexOf('; '),
    window.lastIndexOf(': '),
    window.lastIndexOf(' – '),
    window.lastIndexOf(' — '),
  );
  const space = window.lastIndexOf(' ');
  // Ignore breaks very near the start; they would create a tiny chunk.
  const minCut = maxChars / 4;
  const cut = clause > minCut ? clause + 1 : space > minCut ? space : maxChars;

  const head = sentence.slice(0, cut).trim();
  const tail = sentence.slice(cut).trim();
  return [head, ...splitLong(tail, maxChars)];
}

export function splitText(normalizedText: string, maxChars = MAX_CHUNK_CHARS): TextChunk[] {
  const chunks: TextChunk[] = [];

  for (const paragraph of normalizedText.split(/\n{2,}/)) {
    const pieces = splitSentences(paragraph.trim()).flatMap((s) => splitLong(s, maxChars));
    pieces.forEach((text, i) => {
      chunks.push({ text, pauseAfterMs: i === pieces.length - 1 ? PARAGRAPH_PAUSE_MS : 0 });
    });
  }

  // No pause needed after the very last piece.
  if (chunks.length > 0) chunks[chunks.length - 1].pauseAfterMs = 0;
  return chunks;
}
