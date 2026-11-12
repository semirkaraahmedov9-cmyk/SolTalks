# CLAUDE.md — Solidarity Speaks! (Солидарността говори!)

This file tells Claude Code how to work on this project. Read it fully at the start of every session, then read `docs/PLAN.md` to see which phase is next.

## What we are building

A **free, open-source Bulgarian text-to-speech website** for blind and visually impaired people, people with dyslexia, students and anyone who wants to listen instead of read. It is funded by the European Solidarity Corps (project "Солидарността говори!", run by the youth organisation МРВ – Младежи за развитие и вдъхновение, Chepintsi, Bulgaria).

The key idea: **all speech generation runs inside the user's own browser** (Piper TTS compiled to WebAssembly). There is **no backend server**. The site is static files on GitHub Pages. Nothing the user types or uploads ever leaves their device.

Full background: `docs/BRIEF.md`. Step-by-step build plan: `docs/PLAN.md`. Look and feel: `docs/DESIGN.md`. Volunteer page content: `docs/VOLUNTEER_PAGE.md`.

## Who you are working with

Semir is a **beginner programmer** working on **Windows** in **VS Code**. Therefore:

1. **Explain before you act.** Before each step, say in 1–3 plain sentences what you are about to do and why. No jargon without a short explanation.
2. **One phase at a time.** Only work on the current phase in `docs/PLAN.md`. Do not jump ahead or add features that are not in the plan. If you think something should be added, suggest it and wait.
3. **Stop at the end of every phase.** Give Semir a short "How to test this yourself" checklist (exact commands and what he should see), then wait for him to confirm before starting the next phase.
4. **Terminal commands must work in Windows PowerShell.** When you ask Semir to run something himself, show the exact command in a code block and say what output to expect.
5. **When something fails**, explain what went wrong in simple words before fixing it.
6. **Ask before** installing a new npm package that is not already named in the plan, deleting files, or changing the architecture. Say what the package does and why it is needed.
7. **Keep it simple.** Prefer the simplest solution that works. Fewer dependencies is better.
8. **Talk to Semir in English.** All text visible on the website is in **Bulgarian**.

## Fixed technical decisions (do not change without asking)

- **Framework:** React + Vite + TypeScript.
- **Styling:** plain CSS with CSS custom properties (variables) defined in `src/styles/tokens.css`. No Tailwind, no UI kit.
- **Routing:** `HashRouter` from `react-router-dom` (GitHub Pages has no server-side routing).
- **TTS engine:** Piper voices (ONNX) running in the browser via WebAssembly. Which library is chosen in Phase 1 of the plan; record the decision and reason in `docs/DECISIONS.md`.
- **Speech generation runs in a Web Worker**, never on the main thread, so the page never freezes.
- **Voice models are not committed to the repo.** They are downloaded from Hugging Face on first use and cached in the browser (Cache API). Show the user the download size and progress.
- **No server, no database, no accounts, no analytics, no cookies, no third-party trackers.** Fonts are self-hosted (no Google Fonts requests).
- **Everything is free, always.** No paid services, no paid APIs, no API keys, no subscriptions, no ads, nothing users pay for. Only free hosting (GitHub Pages, Hugging Face) and free, open-source libraries. If a step would ever cost money (e.g. renting a computer for voice training later), say so clearly and offer a free alternative first.
- **Hosting:** GitHub Pages, deployed with a GitHub Actions workflow. Set Vite `base` correctly for the repo name.
- **GitHub Pages cannot set COOP/COEP headers**, so `SharedArrayBuffer` / multithreaded WASM is not available by default. Use a single-threaded WASM build, or `coi-serviceworker` only if really needed (ask first).
- **Language:** Bulgarian only for now. Still, put **every UI string in `src/i18n/bg.ts`** (no hard-coded Bulgarian text inside components) so other languages can be added later.
- **Audiobook library storage is not decided yet.** The library reads a manifest `public/library/library.json`, and audio URLs are built from one setting `LIBRARY_BASE_URL` in `src/config.ts`. Changing storage later must only mean changing that one value.

## Quality rules

- **Accessibility is the whole point of this project.** Target WCAG 2.2 AA at minimum:
  - Everything works with keyboard only; visible focus ring on every interactive element.
  - Works with screen readers (NVDA on Windows, TalkBack on Android, VoiceOver on iPhone): proper labels, headings in order, `aria-live` regions for progress and status messages.
  - Text can be enlarged to 200% without breaking the layout; a "По-голям текст" (larger text) toggle on every page.
  - Never rely on colour alone. Respect `prefers-reduced-motion`.
  - Buttons are large (min 44×44 px touch target).
- **Mobile first.** Must work well on a cheap Android phone in Chrome and on iPhone Safari. Test at 375 px width.
- **Privacy:** never send user text or files anywhere. State this clearly in the UI.
- **Code comments in English**, short and clear, explaining *why* rather than *what*. This is open source and other European volunteers may read it.
- **Small files.** Keep components and modules focused; one job per file.
- **Tests:** use Vitest for pure logic (text splitting, chapter detection, Bulgarian text normalisation). No need for UI test frameworks.
- **Before saying a phase is done:** run `npm run build` and `npm run test` and make sure both pass with no errors.

## Git

- After each finished phase (and after Semir confirms it works), make **one commit** with a clear message, e.g. `Phase 2: paste text and generate audio`. Explain what a commit is the first time.
- Never commit `node_modules`, `.env` files, voice model files (`*.onnx`) or large audio files. Keep `.gitignore` up to date.
- Licence: **MIT** for the code (add `LICENSE` in Phase 0). Voice models and audio keep their own licences; list them in `docs/CREDITS.md`.

## Keeping track

- Tick the checkboxes in `docs/PLAN.md` as items are done.
- Write important technical choices into `docs/DECISIONS.md` (date, decision, reason, alternatives).
- At the end of each session, add 3–5 lines to `docs/PROGRESS.md`: what was done, what is next, any open problems.
