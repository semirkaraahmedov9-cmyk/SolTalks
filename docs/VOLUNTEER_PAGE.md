# "Стани глас" — volunteer page specification

Purpose: give a volunteer **everything they need** to record their voice at home and send it to МРВ, so we can later train a new Bulgarian voice for the website. No recording happens on the site itself; this page is instructions, materials and contact.

All texts on the page are in Bulgarian. Below, the structure and content Claude Code should build. Semir will review the wording.

## 1. Intro

Heading: **„Подарете гласа си“**

Short text (draft):
> Всеки нов глас прави „Солидарността говори!“ по-богат. Когато запишете гласа си, ние можем да обучим нов изкуствен глас, който ще чете книги и учебници за хора, които не могат да четат сами. Нужни са Ви само тихо място, телефон или компютър с микрофон и малко търпение.

Small box: who can volunteer — anyone who speaks clear Bulgarian. Under 18: parent/guardian signs the consent form.

## 2. What it takes (quick facts)

- Time: about 2–3 hours of reading in total, split into several sessions of 20–30 minutes.
- Goal: about 1 hour of clean recorded speech (more is better).
- You read numbered short sentences, one sentence per file.

## 3. How to record — guidelines

Checklist with icons:
1. **Quiet room:** close windows, turn off fans, TV, fridge if possible. Soft furniture (curtains, carpet, sofa) reduces echo. A wardrobe full of clothes works great.
2. **Same place, same microphone, same distance** for every session (about 20–30 cm from the mouth; slightly to the side to avoid "п" and "б" pops).
3. **Natural, calm voice** — like reading to a friend. Not too fast, not acting. Same energy every session.
4. **One sentence per recording.** Leave about half a second of silence before and after. If you make a mistake, record the sentence again.
5. **Drink water**, rest your voice between sessions. Don't record when you have a cold.
6. **Format:** WAV, mono, 44.1 kHz or 48 kHz (22.05 kHz minimum), 16-bit. No music, no effects, no noise reduction.
7. **File names:** the sentence number, e.g. `0001.wav`, `0002.wav` …

Recommended free apps:
- PC: **Audacity** (Windows/Mac/Linux) — short "how to set mono + WAV" instructions.
- Android: an app that records WAV (e.g. "Hi-Q MP3 Voice Recorder" or similar; Claude Code: suggest only free apps that are currently available and record WAV).
- iPhone: an app that exports WAV (Voice Memos exports M4A; give one free WAV-capable alternative).

## 4. The sentences to read

- A numbered list of Bulgarian sentences in sections of 100 (Част 1, Част 2, …), shown on the page and downloadable as TXT and PDF (`public/volunteer/sentences-bg.txt`).
- **Source of sentences** (Claude Code: decide with Semir and record in `docs/DECISIONS.md`):
  - Option A: the Bulgarian prompt set from **Piper Recording Studio** (it was used to record the "Dimitar" voice). **Check its licence before copying it.**
  - Option B: sentences taken from **public-domain Bulgarian literature** (e.g. Иван Вазов, Елин Пелин, Йордан Йовков — authors who died more than 70 years ago), cleaned up into short sentences of 5–20 words, covering all Bulgarian letters and many sound combinations, plus some questions, exclamations, numbers and dates.
- Target: about 1,000–1,200 sentences.

## 5. Consent form („Декларация за съгласие“)

Downloadable PDF and DOCX. Must cover (Semir to check with the coach / a lawyer for GDPR):
- Name, contact, date, signature (and parent/guardian for under 18).
- I voluntarily donate my voice recordings to Сдружение „МРВ“ for training a free, open-source text-to-speech voice.
- I agree that the recordings and the trained voice model may be published under an open licence (proposed: **CC BY 4.0** for the voice model and **CC0 or CC BY 4.0** for the dataset; Semir to decide) and used by anyone, including for commercial purposes, according to that licence.
- Whether I want to be credited by name or remain anonymous.
- What happens to the recordings, how long they are kept, and that I can withdraw consent for recordings not yet used for training/published (and what withdrawal cannot undo once a model is published).
- Contact person at МРВ for data questions.

## 6. How to send the recordings

- Put all WAV files + the signed consent form into one ZIP named `ime-familiya.zip`.
- Send through: **[LINK TO GOOGLE FORM OR SHARED UPLOAD FOLDER — Semir fills in]** or by email to **[МРВ EMAIL — Semir fills in]** (for large files: a WeTransfer/Google Drive link).
- Claude Code: keep these two values in `src/config.ts` (`VOLUNTEER_UPLOAD_URL`, `VOLUNTEER_EMAIL`) so Semir can change them in one place.

## 7. FAQ

- Колко време отнема? / How long does it take?
- Трябва ли ми специален микрофон? (No — a modern phone in a quiet room is fine; a headset mic is better than a laptop mic.)
- Ще чуя ли гласа си на сайта? (Yes, if the recordings are good enough — we'll tell you when.)
- Мога ли да остана анонимен?
- Какво ако сгреша? (Just record that sentence again.)

## 8. Thank-you section

List of voice donors (only those who agreed to be named), filled from `public/volunteer/donors.json`.
