# START HERE — for Semir

This folder is the starting point of the project. Claude Code reads these files and builds the website step by step.

## What's in here

| File | What it is |
|---|---|
| `CLAUDE.md` | Rules for Claude Code: how to work with you, the technical decisions, quality rules. It reads this automatically. |
| `docs/BRIEF.md` | What the project is and what the website must do. |
| `docs/PLAN.md` | The build plan in 8 phases (0–7), with checkboxes. |
| `docs/DESIGN.md` | Colours, fonts and look, based on МРВ's Instagram/Facebook style. |
| `docs/VOLUNTEER_PAGE.md` | Content for the "Стани глас" (volunteer voices) page. |

## One-time setup on your Windows PC

1. Install **Node.js LTS**: https://nodejs.org (accept the defaults).
2. Install **Git**: https://git-scm.com/download/win (accept the defaults).
3. Create a free **GitHub** account if you don't have one (or use МРВ's).
4. In **VS Code**, install the **Claude Code** extension and sign in.
5. Unzip this folder somewhere simple, e.g. `C:\Projects\solidarity-speaks`.
6. In VS Code: **File → Open Folder…** → choose that folder.
7. Restart VS Code once after installing Node and Git, so it finds them.

## Before you start, prepare

- The МРВ dove logo (PNG or SVG, as large as possible) → save it as `public/brand/logo-dove.png` (create the folders), or give it to Claude Code when it asks.
- The EU emblem "Съфинансирано от Европейския съюз" in Bulgarian → from the EU's official visual-identity download page; save it as `public/brand/eu-cofunded-bg.png`.
- An email address and/or upload link for volunteers (you can add these later).

## Your first message to Claude Code

Open the Claude Code panel in VS Code and paste:

```
Hi! Please read CLAUDE.md and everything in the docs folder.
Then give me a short summary of the project in your own words,
tell me anything that is unclear, and start Phase 0 of docs/PLAN.md.
Remember I'm a beginner on Windows, so explain each step.
```

## How to work after that

- Claude Code does **one phase**, then stops and gives you a test checklist. Test it, then reply "Works, commit and start the next phase", or describe what's wrong.
- Starting a new session on another day? Say: `Read CLAUDE.md and docs/PROGRESS.md, then continue with the next unchecked item in docs/PLAN.md.`
- If a conversation gets very long or Claude seems confused, start a new session with the line above. All the progress is saved in the files.
- Want to change something in the plan? Just say so. Claude Code updates `docs/PLAN.md` first, then builds.

## Phase overview

0. Set up the project and publish an empty site on GitHub Pages
1. Technical test: Bulgarian voice speaking in the browser (PC + phone)
2. The speech engine
3. Paste text → listen → download MP3
4. Upload PDF/DOCX/EPUB → chapters → audiobook
5. Audiobook library
6. Volunteer page + About page + user guide
7. Accessibility audit, polish, launch
