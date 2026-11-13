// The voice makes only a tiny pause at a comma, and the model gives no timing
// information we could use to stretch it. So, like Piper's own "phoneme
// silence" option, a sentence is spoken in parts split after , ; : and real
// silence is put between the parts.

/** Default pause after a comma, in milliseconds (0 = the voice's own tiny pause). */
export const DEFAULT_COMMA_PAUSE_MS = 150;

/** ; and : (eSpeak also writes a dash "–" as ";") pause a little longer. */
const LONG_PAUSE_FACTOR = 1.5;

const PAUSE_PHONEMES = new Set([',', ';', ':']);
/** Phonemes that make no sound of their own. */
const SILENT = /^[\s,;:.!?…"„“”«»()–—-]*$/;

export interface PhonemePart {
  phonemes: string[];
  pauseAfterMs: number;
}

const hasSound = (phonemes: string[]) => phonemes.some((p) => !SILENT.test(p));

function trimSpaces(phonemes: string[]): string[] {
  let start = 0;
  let end = phonemes.length;
  while (start < end && phonemes[start].trim() === '') start++;
  while (end > start && phonemes[end - 1].trim() === '') end--;
  return phonemes.slice(start, end);
}

/** Splits one sentence's phonemes after each pause mark. */
export function splitAtPauses(phonemes: string[], commaPauseMs: number): PhonemePart[] {
  if (commaPauseMs <= 0) return [{ phonemes, pauseAfterMs: 0 }];

  const parts: PhonemePart[] = [];
  let current: string[] = [];
  const finish = (pauseAfterMs: number) => {
    if (hasSound(current)) {
      parts.push({ phonemes: trimSpaces(current), pauseAfterMs });
    } else if (parts.length > 0) {
      // Only punctuation (", –"): no extra part, just keep the longer pause.
      const last = parts[parts.length - 1];
      last.pauseAfterMs = Math.max(last.pauseAfterMs, pauseAfterMs);
    }
    current = [];
  };

  for (const phoneme of phonemes) {
    current.push(phoneme);
    if (PAUSE_PHONEMES.has(phoneme)) {
      finish(phoneme === ',' ? commaPauseMs : Math.round(commaPauseMs * LONG_PAUSE_FACTOR));
    }
  }
  finish(0);

  // No pause after the last part: the sentence pause follows instead.
  if (parts.length > 0) parts[parts.length - 1].pauseAfterMs = 0;
  return parts;
}
