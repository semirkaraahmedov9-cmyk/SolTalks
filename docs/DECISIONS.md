# Technical decisions

Important choices, why they were made, and what else was considered. Newest at the bottom.

---

### Project set up by hand instead of the Vite starter template
- **Decision:** `package.json`, `vite.config.ts`, `tsconfig.json` and `index.html` were written by hand.
- **Reason:** the folder already contained `CLAUDE.md` and `docs/`; the starter tool refuses or overwrites non-empty folders. Writing the few files ourselves also keeps only what we need.
- **Versions at setup:** React 19, React Router 7, Vite 8, TypeScript 7, Vitest 5, Node.js 26 (LTS).
- **Alternatives:** generate the template in another folder and copy it over (more leftover files to clean up).

### Repository name and Vite `base`
- **Decision:** repository `semirkaraahmedov9-cmyk/SolTalks`; Vite `base` is `/SolTalks/`.
- **Reason:** GitHub Pages serves project sites from `https://<user>.github.io/<repo>/`, so all asset paths need that prefix. If the repo is renamed, change `REPO_NAME` in `vite.config.ts`.

### Font: Noto Sans via `@fontsource/noto-sans`
- **Decision:** self-host Noto Sans (weights 400 and 700) from the `@fontsource/noto-sans` npm package; only the Cyrillic and Latin subsets are imported.
- **Reason:** excellent Cyrillic legibility, open licence (SIL OFL 1.1), and the font files are bundled with the site, so there are no requests to Google. Bulgarian needs only the basic Cyrillic subset; Latin covers digits and punctuation („ “ –).
- **Alternatives:** download font files by hand into `public/` (more manual work, same result); Inter (good, but Noto has wider Cyrillic coverage).

### Pixel font: not used for now
- **Decision:** no pixel/8-bit font yet; the pixel style comes from CSS decorations (pixel sound-wave bars, faint pixel grid in the hero).
- **Reason:** `docs/DESIGN.md` allows skipping it unless a pixel font with good Cyrillic support is found. Can be revisited for the logo wordmark only.

### Display settings: larger text and high contrast from Phase 0
- **Decision:** the "По-голям текст" and "Висок контраст" toggles are in the header of every page from the start. They set `data-text-size` / `data-contrast` on `<html>`, and `tokens.css` redefines variables for those states. Choices are remembered in `localStorage` (this browser only, wrapped in try/catch).
- **Reason:** required on every page by `CLAUDE.md`; building them into the layout early means every later page is tested with them automatically. All sizes use `rem`, so the larger-text setting scales the whole page.
- **Alternatives:** relying only on browser zoom (works, but many users don't know about it).

### Focus management on page change
- **Decision:** after navigating, focus moves to the new page's `<h1>`, and the skip link focuses `<main>` by script.
- **Reason:** single-page apps don't trigger the browser's normal "new page" announcement, so screen-reader users would not notice the page changed. With `HashRouter`, a normal `#main` link would be treated as a route.

### EU emblem: English version as a placeholder
- **Decision:** the footer shows `public/brand/eu-funded-en.png` ("Funded by the European Union") with the Bulgarian alt text „Финансирано от Европейския съюз“.
- **Reason:** the Bulgarian emblem was not available yet. Replace with the official Bulgarian version (from the EU visual-identity download page) and confirm "Funded" vs "Co-funded" wording against the grant agreement.

### Voice: Piper "Dimitar" (bg_BG-dimitar-medium)
- **Decision:** launch with `bg_BG-dimitar-medium` from `rhasspy/piper-voices`, pinned to commit `ae9d8352…`.
- **Facts:** the only Bulgarian Piper voice; one male speaker, "medium" quality, 22,050 Hz, 63.2 MB. Dataset CC0, fine-tuned from a CC0 base voice; the repository is MIT-licensed. Its config uses Piper 1.5 features (`vowel_clusters`), so the model card says "requires Piper 1.5 or higher".
- **Why not cloud voices (Azure, Google, ElevenLabs):** they send the user's text to a company's server (breaks our privacy promise), cost money per character, need a secret API key that a static site cannot hide, and their voices cannot be redistributed.
- **Other open Bulgarian voice found:** `vits-coqui-bg-cv` (sherpa-onnx, 67 MB, trained on crowd-sourced Common Voice data). Not tested yet; can be compared later if Dimitar's quality is not good enough.

### Browser speech engine: our own small pipeline
- **Decision:** no ready-made Piper browser library. Instead:
  - `onnxruntime-web` (Microsoft, MIT) runs the voice model, single-threaded WebAssembly (`numThreads = 1`), so no SharedArrayBuffer / COOP/COEP headers are needed.
  - `@diffusionstudio/piper-wasm` (MIT package; contains eSpeak-ng, GPL-3.0) turns Bulgarian text into phonemes. It includes `bg_dict` and the Bulgarian rules.
  - Our code (`src/tts/`) ports Piper 1.5's phoneme handling: vowel-cluster merging, BOS/PAD/EOS layout, per-sentence synthesis and peak normalisation (see `phonemeIds.ts`, tested).
  - All engine files are served from our own site (Vite copies them); only the voice comes from Hugging Face (CORS allowed).
- **Alternatives rejected:**
  - `sherpa-onnx` npm package: Node.js only; a browser build would require compiling it ourselves with Emscripten.
  - `piper-tts-web` (Poket-Jony): a 46 MB main bundle with unrelated features.
  - `@mintplex-labs/piper-tts-web` and `vits-web`: download parts from three external CDNs, old ONNX Runtime (1.18), their voice list has no Bulgarian voice, and no vowel-cluster support.
  - `phonemizer` (xenova): small, but English only (tested).
- **Licence note:** eSpeak-ng is GPL-3.0. Our own code stays MIT; the published site as a whole includes a GPL component, which is fine for an open-source project. Credited in `docs/CREDITS.md`.

### Phase 1 measurements
First-visit download: voice 63.2 MB + eSpeak data 18.1 MB + engine 14.8 MB (≈3.9 MB compressed over the network) + small files. Afterwards everything comes from the browser cache.

Test text: the default sentence on `#/test` (12.7 s of audio).

| Device | Voice download | Prepare voice | Generate speech | Speed | Click → sound (first / later) |
|---|---|---|---|---|---|
| Semir's PC (Edge, headless) | 6 s | 1.8 s | 2.8 s | 4.5× real time | 10.7 s / 2.7 s |
| Semir's phone | Works on the live site (confirmed by Semir); numbers not recorded yet | | | | |

### Phase 2: engine design
- **Engine API** (`src/tts/engine.ts`): `loadVoice`, `synthesize(text, { voiceId, onProgress, signal })`, `isVoiceDownloaded`, `deleteDownloadedVoices`. Pages never talk to the worker directly.
- **Text pipeline in the worker:** `normalizeText` (whitespace, PDF line breaks, abbreviations) → `splitText` (sentences, max 400 characters per piece, 0.6 s pause between paragraphs) → eSpeak in batches of 50 pieces → voice model piece by piece → one WAV file.
- **Numbers:** left to eSpeak, because Phase 1 showed they are read correctly.
- **Memory:** audio is kept as 16-bit pieces and written into the WAV file without joining first (half the memory of float audio).
- **Cancel:** the worker checks for a cancel request between pieces, so stopping takes at most one piece (well under a second on PC).
- **Screen Wake Lock** while generating; a notice asks the user to keep the page open.

### MP3 encoder: `@breezystack/lamejs`
- **Decision:** `@breezystack/lamejs` (LGPL-3.0), a maintained ES-module fork of `lamejs`, the JavaScript port of the LAME MP3 encoder. Approved by Semir.
- **Settings:** mono, the voice's sample rate (22,050 Hz), 64 kbit/s, about 0.5 MB per minute.
- **How:** in the worker, each spoken piece is compressed immediately (`src/tts/audioSink.ts`), so long chapters never sit in memory as uncompressed audio. MP3 is the default format; WAV stays available.
- **Alternatives:** original `lamejs` (unmaintained, 6.5 MB package, broken as an ES module); `wasm-media-encoders` (WebAssembly LAME, MIT wrapper, older and larger).
- **Result:** the 5-minute test text is 2.44 MB as MP3 versus 13.4 MB as WAV; encoding added about 5 s to 75 s of generation.

### Large books: expectations
A 400-page book is about 720,000 characters, which is about 12 hours of audio. At the measured speed that is about 3 hours on Semir's PC in the browser, and more on a phone. So:
- Books are processed **chapter by chapter** (Phase 4), each chapter saved as its own MP3 as soon as it is ready.
- Library audiobooks are generated in advance on a PC (Phase 5, optional `tools/build_library.py`).
- **Idea to propose in Phase 4:** run 2–4 workers in parallel on devices with several CPU cores (each single-threaded, so no special headers needed) for a 2–4× speed-up; costs extra memory (one voice copy per worker), so fewer on phones.

### Phase 2 measurements (PC, headless Edge)
Long sample text, 5,224 characters (about 3 pages), 66 pieces: 305 s of audio created in 75 s (4.1× real time). The longest main-thread delay during generation was 16 ms (no freezing). Cancel took effect within 0.2 s. "Delete downloaded voices" removed the cache.

Pronunciation notes: numbers are read correctly („дванадесет“, „триста четиридесет и пет“), „№“ → „номер“. Abbreviations are read literally („ул.“ → „ул“) and the full stop of an abbreviation is treated as a sentence end. Both are fixed in Phase 2 (`normalize.ts`, `split.ts`).
