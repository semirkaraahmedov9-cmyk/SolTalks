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
