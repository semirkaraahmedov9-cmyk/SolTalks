# Pronunciation data (Bulgarian)

| File | What it is | Edit by hand? |
|---|---|---|
| `bg-stress-fixes.txt` | Words the voice stressed wrongly, with the right stress ("зарАди"). Always wins. | **Yes** — instructions inside |
| `bg-stress-list.txt.gz` | 183,020 Bulgarian word forms and their stressed vowel | No — rebuild with `tools/build-stress-list.mjs` |

**Licence:** both files are under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The stress list is made from [Wiktionary](https://en.wiktionary.org) (via the [kaikki.org](https://kaikki.org/dictionary/Bulgarian/) extraction). You may reuse them if you credit Wiktionary and this project and share changes under the same licence.

List format (one word per line, sorted): `книгите 0` — the first vowel (counting from 0) is stressed: кнѝгите. A word without a number has more than one possible stress and is left to the speech engine.
