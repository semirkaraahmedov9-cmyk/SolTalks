# Project brief — Solidarity Speaks! (Солидарността говори!)

## The project

- **Programme:** European Solidarity Corps — Solidarity Projects (ESC30-SOL), Call 2025 Round 3
- **Organisation:** Сдружение „Младежи за развитие и вдъхновение – МРВ“, Chepintsi, Smolyan region, Bulgaria (website: mrvchp.net)
- **Duration:** 01.01.2026 – 31.12.2026
- **Coach:** Dr. Muharem Mollov

## The problem

Good text-to-speech for Bulgarian exists, but it is usually **paid** and out of reach for people in small villages, socially vulnerable groups, blind and visually impaired people, and students with dyslexia. Knowledge should be accessible to everyone.

## The solution

A **free, open-source website** that turns Bulgarian text and books into speech and audiobooks. It runs in the browser on the user's own device, so it costs nothing to host, keeps working after the project ends, and never collects anyone's data.

## Who it is for

1. **Blind and visually impaired people** — must be fully usable with a screen reader.
2. **People with dyslexia or reading difficulties** — clear, calm, easy-to-read interface.
3. **Students and teachers** — turn school texts and books into audio.
4. **Libraries, schools and community centres** — use the ready-made audiobook library.
5. **Volunteers** — people who want to donate their voice so we can train new Bulgarian voices.

## What the website must do (version 1)

1. **Paste text → audio:** type or paste Bulgarian text, choose a voice, listen in the page, download as MP3.
2. **Upload a book → audiobook:** upload PDF, DOCX or EPUB; the site splits it into chapters; the user picks chapters and downloads audio per chapter (MP3), or all chapters as a ZIP.
3. **Audiobook library (Библиотека):** about 10 ready-made audiobooks (public-domain or with permission) to listen to or download.
4. **Become a voice (Стани глас):** a page for volunteers with everything they need to record their voice: guidelines, the Bulgarian sentences to read, consent form, and how to send the recordings.
5. **About (За проекта):** the project, the team, the European Solidarity Corps funding acknowledgement, privacy explanation, open-source link.

## What the grant application promises (keep in mind)

- Free, open-source TTS software accessible through an **online platform**
- Code published in a **public GitHub repository**
- **At least 10 pilot audiobooks**, made available online and to schools and libraries
- Several voices (male and female) — **launch with existing voices, add volunteer voices later**
- A user guide ("Как да използваме Солидарността говори!") and video tutorials
- EU funding visibility on the website

## Voices

- **Launch voice:** the existing Piper voice **"Dimitar"** (Bulgarian, male), published in the `rhasspy/piper-voices` repository on Hugging Face under the `bg` folder. Trained on a CC0 dataset by the Open Home Foundation. Check its model card for the exact file name and licence.
- **Later:** voices trained (fine-tuned) from МРВ volunteers' recordings. Training is **not** part of the website build; it is a separate step done later. The website must make adding a new voice easy: one entry in a `voices.json` config file.

## Out of scope for version 1

- English or other languages (but the code is ready for them)
- User accounts, saving history online, any server
- Voice training inside the website
- Native mobile apps
