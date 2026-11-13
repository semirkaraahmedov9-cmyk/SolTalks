# Progress log

Short notes at the end of each work session: what was done, what is next, open problems.

---

### Session 1 — Phase 0 (project setup)
- Done: Vite + React + TypeScript project; five pages with `HashRouter`; header (logo, navigation with mobile "Меню" button, larger-text and high-contrast toggles), footer (privacy line, EU emblem, project text, disclaimer); design tokens; `bg.ts`, `config.ts`, `voices.json`; Vitest with a first test; licence, README, docs; GitHub Pages workflow.
- Checked: `npm run build` and `npm run test` pass; layout checked at 320 px, 375 px and 1280 px, with larger text and high contrast.
- Next: Semir creates the GitHub repo `SolTalks`, pushes the code, turns on Pages; then Phase 1 (Bulgarian voice test in the browser).
- Open: Bulgarian EU emblem still needed (check "Funded" vs "Co-funded" in the grant agreement); a larger version of the МРВ logo would look sharper.

### Session 2 — Phase 1 (voice test)
- Done: Phase 0 deployed and live. Researched browser TTS options; built our own small engine (onnxruntime-web + piper-wasm + Piper 1.5 phoneme logic) in a Web Worker; temporary test page `#/test` with sliders for the voice settings and measurements.
- Checked: Dimitar speaks in the browser on PC; 4.5× faster than real time; numbers read correctly. 13 tests pass, build passes.
- Next: deploy, Semir tests on phone and reports the numbers; then Phase 2 (engine clean-up, voices.json, text normalisation, sentence splitting).
- Open: Dimitar sounds a bit choppy to Semir; try the sliders. Abbreviations („ул.“) need expanding (Phase 2).

### Session 2 (continued) — Phase 2 (speech engine)
- Done: Phase 1 confirmed on PC and phone. Added the "everything is free" rule to CLAUDE.md. Built `engine.ts`, the new worker, `voices.json`, text normalisation and sentence splitting (51 tests), progress, cancel, delete downloaded voices, Screen Wake Lock. Test page upgraded.
- Checked: 3-page text → one 5-minute WAV in 75 s with a smooth progress bar; page never froze; cancel works.
- Then: MP3 export added with `@breezystack/lamejs` (approved): 5 minutes = 2.4 MB. Made 5 voice samples with different settings for Semir to compare. Checked that our Bulgarian eSpeak rules are identical to the ones Dimitar was trained with.
- Next: Semir picks the best-sounding settings (they become the defaults), tests the page, then the Phase 2 commit.
- Open: big books take hours in the browser; handled chapter by chapter (Phase 4) and with PC pre-generation for the library (Phase 5). Parallel workers to propose in Phase 4.
- Semir's feedback: all tests work. Voice samples: no clear favourite; the real problems are **wrong word stress** and **too-short pauses at commas**. Defaults stay at Dimitar's own settings (version A).
- Research done: eSpeak's Bulgarian stress is often wrong (книгите, знанието, учебниците, новините, зрение, четат…). A combining grave accent (U+0300) after the vowel makes eSpeak stress it correctly (the acute U+0301 is ignored; precomposed ѝ breaks the word). A stress list built from Wiktionary (kaikki.org, CC BY-SA 4.0) has 183,499 forms in 0.56 MB and covered 69 of 101 words in a test text. Dimitar has no alignment output, so comma pauses must be added by us.
- Proposed to Semir: a stress + comma-pause step before Phase 3. Approved.

### Session 3 — Phase 2b (better pronunciation)
- Done: stress list from Wiktionary (183,020 forms), stress marks before eSpeak, guessing of unknown forms, hand-written fixes file with a typo test, comma pauses, test-page controls and preview. 72 tests pass, build passes.
- Measured: eSpeak alone 35% right on random dictionary words; with our marks it follows them 100%. Sample text: 89 of 112 words marked.
- Semir's choices: comma pause 150 ms; confirmed дислѐксия and гласа̀ and added гласъ̀т himself.
- Next: Phase 3 (the real "Преобразувай" page).
- Note: run Vitest from PowerShell; Git Bash's lowercase "c:" path breaks it.
