# Солидарността говори! (Solidarity Speaks!)

A **free, open-source Bulgarian text-to-speech website** for blind and visually impaired people, people with dyslexia, students and anyone who prefers to listen instead of read.

All speech is generated **inside the visitor's own browser** (Piper voices running as WebAssembly). There is no server: nothing the user types or uploads ever leaves their device.

**Live site:** https://semirkaraahmedov9-cmyk.github.io/SolTalks/

> 🇧🇬 **Накратко:** „Солидарността говори!“ е безплатен сайт с отворен код, който превръща български текст и книги в реч и аудиокниги. Всичко се случва на Вашето устройство – текстът Ви не се изпраща никъде. Проектът се изпълнява от Сдружение „Младежи за развитие и вдъхновение – МРВ“, с. Чепинци, по програма „Европейски корпус за солидарност“.

## Status

Under construction. See [docs/PLAN.md](docs/PLAN.md) for the build phases and [docs/PROGRESS.md](docs/PROGRESS.md) for where we are.

## Running it on your computer

You need [Node.js](https://nodejs.org) (LTS version).

```powershell
npm install      # once: downloads the libraries into node_modules
npm run dev      # starts a local site at http://localhost:5173/SolTalks/
npm run test     # runs the automated tests
npm run build    # builds the final site into the dist folder
npm run preview  # serves the built site locally to check it
```

Every push to the `main` branch is built and published to GitHub Pages automatically by [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Project structure

| Path | What it is |
|---|---|
| `src/i18n/bg.ts` | All Bulgarian text on the site (add a sibling file to translate) |
| `src/config.ts` | Settings that may change, e.g. where library audio is stored |
| `src/styles/tokens.css` | Colours, fonts and spacing (design tokens) |
| `src/components/` | Header, footer, navigation and other shared pieces |
| `src/pages/` | One file per page |
| `public/voices.json` | List of available voices |
| `docs/` | Brief, plan, design, decisions, credits |

## Contributing

Contributions are welcome, especially from other European volunteers. Please keep the site accessible (WCAG 2.2 AA), keep all user-facing text in `src/i18n/`, and never add anything that sends user data to a server.

## Licence and credits

Wrong word stress? Add the word to [pronunciation/bg-stress-fixes.txt](pronunciation/bg-stress-fixes.txt) (instructions are at the top of the file).

Code: [MIT](LICENSE). Voices, fonts and other assets keep their own licences, listed in [docs/CREDITS.md](docs/CREDITS.md).

Funded by the European Union through the European Solidarity Corps. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the granting authority.
