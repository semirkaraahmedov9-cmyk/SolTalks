# Build plan — Solidarity Speaks!

Work **one phase at a time**. At the end of each phase: run `npm run build` and `npm run test`, give Semir a "How to test this yourself" checklist, wait for his OK, then commit. Tick boxes as you go.

---

## Phase 0 — Set up the project

Goal: an empty but working website that runs on Semir's PC and deploys to GitHub Pages.

- [x] Check that Node.js (LTS) and Git are installed (`node -v`, `git --version`). If not, explain to Semir how to install them on Windows and wait.
- [x] Create a Vite + React + TypeScript project in this folder (keep the existing `CLAUDE.md` and `docs/`).
- [x] Add `react-router-dom` with `HashRouter` and five empty pages: Начало (`/`), Преобразувай (`/convert`), Библиотека (`/library`), Стани глас (`/volunteer`), За проекта (`/about`).
- [x] Create `src/styles/tokens.css` with the colours, fonts and spacing from `docs/DESIGN.md`, and a basic layout: header with logo and navigation, main area, footer.
- [x] Create `src/i18n/bg.ts` and use it for all text.
- [x] Create `src/config.ts` (with `LIBRARY_BASE_URL`, placeholder value) and `public/voices.json` (empty list for now).
- [x] Add Vitest with one sample test, and the scripts `dev`, `build`, `preview`, `test`.
- [x] Add `.gitignore`, `LICENSE` (MIT, copyright МРВ), a `README.md` in English with a short Bulgarian summary, `docs/DECISIONS.md`, `docs/PROGRESS.md`, `docs/CREDITS.md`.
- [x] Add the GitHub Actions workflow that builds and deploys to GitHub Pages, and set Vite `base` to the repo name.
- [x] Explain to Semir step by step how to create the GitHub repo (public), push the code, and turn on Pages (Settings → Pages → Source: GitHub Actions).

**Done when:** `npm run dev` shows the site with working navigation on PC and phone width, and the site is live on GitHub Pages.

---

## Phase 1 — Prove Bulgarian speech works in the browser (technical test)

Goal: choose the browser TTS library and confirm the Bulgarian voice really works before building the UI around it.

- [ ] Look up the current options for running Piper voices in the browser (for example `sherpa-onnx` WebAssembly TTS, `piper-tts-web` / `piper-wasm`, `vits-web`). Check: is it maintained, does it support Bulgarian phonemisation (espeak-ng `bg`), does it work **without** SharedArrayBuffer, its licence, and its download size.
- [ ] Find the Bulgarian "Dimitar" voice in `rhasspy/piper-voices` on Hugging Face (`bg` folder; read `voices.json` there for exact file names and quality levels). Note its licence in `docs/CREDITS.md`.
- [ ] Build a tiny test page (temporary route `/test`) that loads the voice, speaks one Bulgarian sentence, and plays it.
- [ ] Test the sentence: „Здравейте! Аз съм гласът на проекта „Солидарността говори!“ от село Чепинци. Днес е 12 ноември 2026 г.“ Check pronunciation, especially numbers and the date.
- [ ] Measure: model download size, time to first sound, speed (seconds of audio per second) on PC. Ask Semir to open the deployed `/test` page on his phone and report how long it takes.
- [ ] Write the choice and the measurements into `docs/DECISIONS.md`.

**Done when:** Semir hears a clear Bulgarian sentence on both his PC and his phone, from the live GitHub Pages site.

---

## Phase 2 — The speech engine (no UI polish yet)

Goal: a clean, reusable module that turns text into audio without freezing the page.

- [ ] `src/tts/worker.ts` — Web Worker that loads a voice and generates audio.
- [ ] `src/tts/engine.ts` — simple API for the rest of the app: `loadVoice(id, onProgress)`, `synthesize(text, { onProgress, signal })` returning audio, and cancelling.
- [ ] `public/voices.json` — list of voices: id, Bulgarian display name, gender, model URL, config URL, size in MB, licence, credit. Add Dimitar.
- [ ] Voice download with progress percentage and caching (Cache API), plus a "Изтрий изтеглените гласове" (delete downloaded voices) option.
- [ ] `src/text/normalize.ts` — Bulgarian text clean-up before speaking: remove extra whitespace and line breaks inside sentences, fix hyphenated line breaks from PDFs, expand common abbreviations (г., ул., т.е., напр., др., бул., гр., с.), and numbers/dates only if Phase 1 showed they are read badly. With tests.
- [ ] `src/text/split.ts` — split long text into sentences/chunks of safe length, synthesise chunk by chunk, join the audio. With tests.
- [ ] Audio export: WAV (always) and MP3 (choose a small browser MP3 encoder and ask Semir before adding it). Run MP3 encoding in the worker too.
- [ ] Use the Screen Wake Lock API while generating (when supported) so phones don't sleep mid-chapter, and warn that leaving the tab may pause generation.

**Done when:** tests pass, and a 3-page text generates as one audio file with a working progress bar and cancel, without the page freezing.

---

## Phase 3 — "Преобразувай": paste text → audio

Goal: the first real feature, polished and accessible.

- [ ] Convert page with two tabs: „Текст“ and „Файл“ (file tab can say "скоро" for now).
- [ ] Large text box with character counter, voice picker, speed control (0.75×–1.5×), "Чуй" (listen) and "Изтегли MP3" (download MP3) buttons.
- [ ] First-time notice explaining the one-time voice download (show size) and that **the text never leaves the device**.
- [ ] Progress in an `aria-live` region; clear error messages in Bulgarian.
- [ ] Simple audio player with large controls (play/pause, back 15 s, forward 15 s, speed).
- [ ] Full keyboard and screen reader check (NVDA if available). Check 200% zoom and 375 px width.

**Done when:** Semir can paste a news article on his phone, listen to it, and download the MP3.

---

## Phase 4 — "Преобразувай → Файл": books into audiobooks

Goal: upload PDF/DOCX/EPUB → chapters → audio per chapter.

- [ ] Read files in the browser only: PDF (`pdfjs-dist`), DOCX (`mammoth`), EPUB (unzip with `jszip` and read the spine/table of contents). Ask before adding each package.
- [ ] `src/text/chapters.ts` — chapter detection, with tests:
  - EPUB: use the table of contents.
  - DOCX: use Heading styles.
  - PDF: detect lines like „Глава първа“, „ГЛАВА 1“, „Част II“, Roman numerals, or short ALL-CAPS lines; remove repeated page headers/footers and page numbers.
  - Fallback: split into parts of about 10 minutes of speech (≈ 9,000 characters), at paragraph boundaries.
- [ ] Chapter list screen: title, length, estimated time; the user can rename, merge with next, or untick chapters.
- [ ] Generate selected chapters one by one with overall progress; each finished chapter can be played/downloaded immediately. "Изтегли всички (ZIP)" when done. File names like `01 - Глава първа.mp3`.
- [ ] Handle scanned PDFs (no text layer): show a friendly message that the file is an image and cannot be read.
- [ ] Test with a short real Bulgarian book in each format.

**Done when:** a public-domain Bulgarian book in EPUB, DOCX and PDF becomes a set of chapter MP3s on PC, and at least one chapter works on phone.

---

## Phase 5 — "Библиотека": ready-made audiobooks

Goal: a page listing ~10 audiobooks, with storage that can be changed later.

- [ ] Define `public/library/library.json` format: id, title, author, year, short description, cover image (optional), licence/source, and a list of chapters (title, file name, duration).
- [ ] Library page: searchable list, book page with chapter list, player that remembers the position per book (localStorage, wrapped in try/catch), download per chapter.
- [ ] Audio URLs = `LIBRARY_BASE_URL` + file name. Write in `docs/DECISIONS.md` the storage options (Hugging Face dataset, Internet Archive) so Semir can decide.
- [ ] Add 1 short sample book (a few minutes) created with the site itself, to test the flow.
- [ ] Optional, ask first: a small Python script `tools/build_library.py` that uses the `piper-tts` package on Semir's PC to batch-generate a whole book into chapter MP3s plus its `library.json` entry (faster than doing whole books in the browser).

**Done when:** the sample book plays chapter by chapter on phone and PC, and position is remembered.

---

## Phase 6 — "Стани глас" volunteer page and "За проекта"

- [ ] Build the volunteer page exactly from `docs/VOLUNTEER_PAGE.md`.
- [ ] The recording sentences are a downloadable list (TXT and PDF) and also shown on the page in numbered sections.
- [ ] Downloadable consent form (PDF/DOCX) — text from `docs/VOLUNTEER_PAGE.md`.
- [ ] "За проекта" page: mission, team, how it works (in-browser, private), open-source link, credits (voices, libraries), EU funding acknowledgement and disclaimer (see `docs/DESIGN.md`).
- [ ] "Как да използваме" (user guide) section or page: step-by-step with screenshots placeholders, written very simply.

**Done when:** Semir reviews all Bulgarian texts and approves them.

---

## Phase 7 — Polish, accessibility audit and launch

- [ ] Accessibility audit of every page: keyboard, NVDA, TalkBack/VoiceOver, 200% zoom, contrast, Lighthouse accessibility score ≥ 95.
- [ ] Performance: Lighthouse performance check on mobile; lazy-load the TTS engine and file readers only when needed.
- [ ] Make it installable (PWA manifest + offline cache of the app shell) so it works offline after first visit. Ask first.
- [ ] Favicon, social share image (Open Graph) in the МРВ style, page titles in Bulgarian.
- [ ] Optional custom domain (e.g. `glas.mrvchp.net`) — explain the DNS steps to Semir.
- [ ] Final README: what it is, how to use it, how to add a new voice, how to add a library book, how to contribute, credits.

**Done when:** the live site passes the audit and Semir has tested it with at least one real user from the target group.

---

## Later (not now)

- Volunteer voices: fine-tune Piper on the recordings (separate guide `docs/VOICE_TRAINING.md`), then add each voice with one line in `voices.json`.
- English UI and English voice.
- Downloadable app version.
