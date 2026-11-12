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
