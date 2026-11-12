# Design — Solidarity Speaks!

The site should feel like part of the МРВ family (see Instagram/Facebook `@mrvchp`): a **pixel-art white dove on deep royal blue**, night-time navy backgrounds, soft neon-blue glow, a young and digital "level up together" spirit. But **readability always wins**: this site is for blind, low-vision and dyslexic users. Decoration must never get in the way of reading.

## Colours

All pairs below were checked for contrast (WCAG ratio in brackets).

| Token | Hex | Use |
|---|---|---|
| `--navy-900` | `#0A1F5C` | **Main colour.** Header, footer, hero, primary dark surfaces |
| `--blue-700` | `#0145C4` | Logo blue. Primary buttons, links on light backgrounds |
| `--blue-400` | `#4DA3FF` | Glow/accent on dark backgrounds (decorative lines, icons, focus glow) |
| `--sky-100` | `#C9D6F2` | Secondary text on navy |
| `--bg` | `#F5F8FF` | Page background (very light blue-white) |
| `--surface` | `#FFFFFF` | Cards, text areas |
| `--text` | `#0B1530` | Main text on light backgrounds |
| `--text-muted` | `#5A6785` | Secondary text on white |
| `--gold-400` | `#FFD23F` | Focus ring on dark backgrounds, small highlights |
| `--success` | `#11733A` | Success messages (with icon + text, never colour alone) |
| `--error` | `#B42318` | Error messages (with icon + text) |

Checked contrast:
- white on `#0A1F5C` → 15.4:1
- white on `#0145C4` → 7.9:1 (primary button text)
- `#0B1530` on `#F5F8FF` → 17.0:1
- `#4DA3FF` on `#0A1F5C` → 5.9:1
- `#FFD23F` on `#0A1F5C` → 10.7:1
- `#C9D6F2` on `#0A1F5C` → 10.6:1
- `#5A6785` on white → 5.7:1

Add a **high-contrast mode** toggle: pure black text on white, `#0033A0` links, thick 3 px focus outline.

## Typography

- **Body and UI:** a highly legible sans-serif with full Cyrillic support, self-hosted. First choice: **Noto Sans** (or Inter). Body size 18 px minimum, line height 1.6, max line length ~70 characters, left-aligned (never justified).
- **Pixel accent:** a pixel/8-bit font with Cyrillic support **only** for the logo wordmark and maybe the hero title, never for body text, buttons or labels. Verify Cyrillic support before using it; if none is good, skip the pixel font and use pixel-style decorations instead.
- Optional "Шрифт за дислексия" toggle: increases letter and word spacing (`letter-spacing: 0.05em; word-spacing: 0.15em`) and line height 1.8.
- "По-голям текст" toggle: scales the base size to 22 px.

## Visual style

- **Header:** navy `--navy-900`, МРВ dove logo on the left, site name „Солидарността говори!“, navigation on the right (hamburger menu on mobile, with a proper accessible button).
- **Hero (home page):** navy background with a subtle pixel-grid pattern or a few pixel "sound wave" bars in `--blue-400`. Headline, one sentence explaining the site, two big buttons: „Преобразувай текст“ and „Библиотека“.
- **Pixel details:** small pixel-art touches (pixel dove, pixel sound-wave icon, pixel corners on cards), all decorative, `aria-hidden="true"`.
- **Cards:** white, 12 px radius, soft shadow, generous padding.
- **Buttons:** large (min 48 px tall), 10 px radius, bold label. Primary = `--blue-700` with white text; secondary = white with `--blue-700` border and text.
- **Focus:** always visible: 3 px outline (`--blue-700` on light, `--gold-400` on dark) plus 2 px offset.
- **Motion:** minimal. A gentle glow/pulse on the progress bar is fine; disable all animation under `prefers-reduced-motion`.
- **Icons:** simple line icons with text labels next to them. Never icon-only buttons without an accessible label.

## Brand assets (Semir provides)

Put these in `public/brand/` (Claude Code: ask Semir for them in Phase 0 and use placeholders until then):
- `logo-dove.png` or `.svg` — the МРВ pixel dove logo (high resolution, transparent background if possible)
- `eu-cofunded-bg.png` — the official EU emblem "Съфинансирано от Европейския съюз", from the EU visual identity download page

## EU funding visibility (footer of every page + "За проекта")

Show the EU emblem with "Съфинансирано от Европейския съюз" and this disclaimer (Semir must check the exact wording required in his grant agreement):

> Финансирано от Европейския съюз. Изразените възгледи и мнения обаче принадлежат изцяло на автора(ите) и не отразяват непременно възгледите и мненията на Европейския съюз или на Центъра за развитие на човешките ресурси. Нито Европейският съюз, нито предоставящият орган могат да бъдат държани отговорни за тях.

Also mention: „Проект „Солидарността говори!“ по програма „Европейски корпус за солидарност“, изпълняван от Сдружение „Младежи за развитие и вдъхновение – МРВ“, с. Чепинци.“

## Tone of voice (Bulgarian texts)

Warm, simple, direct. Short sentences. Address the user with „Вие“ (polite plural) in instructions. Avoid technical words; where unavoidable, explain them (e.g. "гласът се изтегля веднъж на Вашето устройство").
