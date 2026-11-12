# Credits and licences

The source code of this project is under the [MIT licence](../LICENSE). Everything listed here keeps its own licence.

## Voices

| Voice | Made by | Licence | Source |
|---|---|---|---|
| Dimitar (`bg_BG-dimitar-medium`), Bulgarian, male | Open Home Foundation (Piper project) | Dataset CC0; fine-tuned from a CC0 base voice; repository MIT | [rhasspy/piper-voices on Hugging Face](https://huggingface.co/rhasspy/piper-voices/tree/main/bg/bg_BG/dimitar/medium) |

The voice file is not stored in this repository. Visitors' browsers download it from Hugging Face.

## Fonts

| Font | Author | Licence | Source |
|---|---|---|---|
| Noto Sans | Google / Noto project | SIL Open Font License 1.1 | [`@fontsource/noto-sans`](https://fontsource.org/fonts/noto-sans) |

## Software libraries

| Library | Licence | Used for |
|---|---|---|
| [React](https://react.dev) | MIT | User interface |
| [React Router](https://reactrouter.com) | MIT | Page navigation |
| [Vite](https://vite.dev) | MIT | Development server and build |
| [TypeScript](https://www.typescriptlang.org) | Apache 2.0 | Type checking |
| [Vitest](https://vitest.dev) | MIT | Automated tests |
| [Fontsource](https://fontsource.org) | MIT (packaging) | Self-hosted font files |
| [ONNX Runtime Web](https://onnxruntime.ai) | MIT | Runs the voice model in the browser |
| [@diffusionstudio/piper-wasm](https://github.com/diffusion-studio/piper-wasm) | MIT (build) | WebAssembly build of Piper's phonemizer |
| [eSpeak NG](https://github.com/espeak-ng/espeak-ng) (inside piper-wasm, [rhasspy fork](https://github.com/rhasspy/espeak-ng)) | **GPL-3.0** | Turns Bulgarian text into phonemes. Source code: see the links. |
| [Piper](https://github.com/OHF-Voice/piper1-gpl) | GPL-3.0 | Our phoneme handling in `src/tts/phonemeIds.ts` follows Piper 1.5's logic |

## Logos and emblems

- **МРВ dove logo** (`public/brand/logo-dove.jpg`): © Сдружение „Младежи за развитие и вдъхновение – МРВ“. Not covered by the MIT licence; used with permission of МРВ.
- **EU emblem** (`public/brand/eu-funded-en.png`): from the European Commission's visual-identity resources, used according to the EU emblem usage rules for funded projects.
