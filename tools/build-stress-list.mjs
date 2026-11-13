// Builds pronunciation/bg-stress-list.txt.gz: Bulgarian word forms and the
// position of their stressed vowel, taken from Wiktionary.
//
// Source data: the Bulgarian part of Wiktionary as extracted by kaikki.org
// (wiktextract). Licence: CC BY-SA 4.0, so the list we make is CC BY-SA 4.0 too.
//
// Usage (PowerShell or any terminal):
//   1. Download "kaikki.org-dictionary-Bulgarian.jsonl" from
//      https://kaikki.org/dictionary/Bulgarian/ (about 190 MB, not committed).
//   2. node tools/build-stress-list.mjs path/to/kaikki.org-dictionary-Bulgarian.jsonl
//
// Output lines (sorted):  "word index"  where index is the 0-based number of
// the stressed vowel (книгите 1 = кнѝгите). A word alone on a line has two or
// more possible stresses (пара: па̀ра / пара̀); the site then leaves it to eSpeak.
import fs from 'node:fs';
import readline from 'node:readline';
import zlib from 'node:zlib';

const OUTPUT = new URL('../pronunciation/bg-stress-list.txt.gz', import.meta.url);
const VOWELS = 'аеиоуъюя';
const ACUTE = '́'; // Wiktionary marks the main stress with an acute accent
const GRAVE = '̀'; // secondary stress, or the ѝ / ѐ spelling marks

const input = process.argv[2];
if (!input) {
  console.error('Usage: node tools/build-stress-list.mjs <kaikki Bulgarian .jsonl file>');
  process.exit(1);
}

/** word → set of stressed-vowel positions seen in the dictionary */
const stresses = new Map();

function addForm(stressed) {
  if (typeof stressed !== 'string') return;
  // NFC keeps "й" as one letter (NFD would split it into "и" + a mark and
  // miscount the vowels). Stress marks stay separate: no precomposed Cyrillic
  // letters with an acute exist, and ѝ / ѐ are split by hand.
  const letters = stressed
    .normalize('NFC')
    .toLowerCase()
    .replace(/ѝ/g, 'и' + GRAVE)
    .replace(/ѐ/g, 'е' + GRAVE);
  if (!letters.includes(ACUTE)) return;

  let vowels = 0;
  let index = -1;
  let word = '';
  for (const ch of letters) {
    if (ch === ACUTE) {
      if (index < 0) index = vowels - 1; // the mark follows its vowel
      continue;
    }
    if (ch === GRAVE) continue;
    if (VOWELS.includes(ch)) vowels++;
    word += ch;
  }
  // Only plain Bulgarian words: no endings like "-ите", no phrases, no
  // reconstructed forms ("*…"). One-syllable words need no stress help.
  if (!/^[а-ъьюя]+$/.test(word) || vowels < 2 || index < 0) return;

  if (!stresses.has(word)) stresses.set(word, new Set());
  stresses.get(word).add(index);
}

const lines = readline.createInterface({ input: fs.createReadStream(input), crlfDelay: Infinity });
let entries = 0;
for await (const line of lines) {
  if (!line) continue;
  const entry = JSON.parse(line);
  entries++;
  for (const form of entry.forms ?? []) {
    if (!form.tags?.includes('romanization')) addForm(form.form);
  }
  for (const head of entry.head_templates ?? []) addForm(head.args?.['1']);
}

let ambiguous = 0;
const output = [];
// Plain code-unit order: the site looks words up with the same comparison.
for (const word of [...stresses.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
  const set = stresses.get(word);
  if (set.size > 1) {
    ambiguous++;
    output.push(word);
  } else {
    output.push(`${word} ${[...set][0]}`);
  }
}

const text = output.join('\n') + '\n';
fs.writeFileSync(OUTPUT, zlib.gzipSync(text, { level: 9 }));
console.log(
  `Dictionary entries: ${entries}. Word forms: ${output.length} ` +
    `(${ambiguous} with more than one possible stress). ` +
    `File size: ${(fs.statSync(OUTPUT).size / 1e6).toFixed(2)} MB.`,
);
