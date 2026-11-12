// Port of Piper 1.5 (piper1-gpl) phoneme handling, so our browser output
// matches what the voice was trained on. See src/piper/phoneme_ids.py and
// src/piper/phonemize_espeak.py in https://github.com/OHF-Voice/piper1-gpl.

const PAD = '_';
const BOS = '^';
const EOS = '$';

/**
 * Joins adjacent phonemes that the voice treats as one (e.g. "a" + "ɪ" → "aɪ").
 * Longest match wins, like Piper's _merge_known_vowel_clusters.
 */
export function mergeVowelClusters(phonemes: string[], clusters: string[][] = []): string[] {
  if (clusters.length === 0) return phonemes;

  const known = new Set(clusters.map((c) => c.join('\u0000')));
  const maxLen = Math.max(...clusters.map((c) => c.length));
  const out: string[] = [];
  let i = 0;

  while (i < phonemes.length) {
    let matched = 0;
    for (let n = Math.min(maxLen, phonemes.length - i); n > 1; n--) {
      if (known.has(phonemes.slice(i, i + n).join('\u0000'))) {
        matched = n;
        break;
      }
    }
    if (matched > 0) {
      out.push(phonemes.slice(i, i + matched).join(''));
      i += matched;
    } else {
      out.push(phonemes[i]);
      i += 1;
    }
  }
  return out;
}

export interface PhonemeIdResult {
  ids: number[];
  /** Phonemes the voice does not know; skipped, reported for debugging. */
  missing: string[];
}

/** BOS, PAD, then each phoneme followed by PAD, then EOS (Piper's layout). */
export function phonemesToIds(
  phonemes: string[],
  idMap: Record<string, number[]>,
): PhonemeIdResult {
  const ids: number[] = [...idMap[BOS], ...idMap[PAD]];
  const missing: string[] = [];

  for (const phoneme of phonemes) {
    const phonemeIds = idMap[phoneme];
    if (!phonemeIds) {
      missing.push(phoneme);
      continue;
    }
    ids.push(...phonemeIds, ...idMap[PAD]);
  }

  ids.push(...idMap[EOS]);
  return { ids, missing };
}
