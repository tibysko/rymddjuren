## Imported Claude Cowork project instructions

# Project: Rymddjuren (matte-spel)

A math game for a 7-year-old starting year 1, built with React + Vite + TypeScript (no game engine). Always reply to the repo owner in Swedish. Code, comments, docs, filenames and commit messages are English; all text the child reads or hears lives in src/i18n/sv.ts and stays Swedish.

## The most important design rule: intrinsic integration
The math must BE the game mechanic, not a quiz alongside it. A wrong answer must produce a visible, understandable result in the game world (e.g. the rabbit jumps too short on the number line) – never just "wrong, try again". The Star Path (Stjärnstigen, planet 2) is the model for all new levels.

## Fitting the target audience (non-negotiable)
- No timer, no death, no fast timing requirements, one-hand/one-button controls – the game should measure math, not motor skills
- Very short, simple sentences ("Hur många?", "Mata apan!"), large text, large tap targets, more pictures than text
- Everything must be readable aloud with the 🔊 button (Swedish speech synthesis, src/game/speech.ts)
- Wrong answer → second chance with gentle help, Ugglis 🦉 comforts and cheers you on

## Content and style
- DESIGN.md is the source for the planet plan (1–10) and the link to Lgr22 year 1; README.md has the build plan – update both when something is finished
- Next step: planet 3, the Monkey Planet (Apornas planet), addition 0–10, as a "track B" prototype: the chosen number = the power/length of the jump (see docs/research-platformer.md)
- Colours: dark space, red rocket, yellow stars (the player's own request)
- Progress is saved in localStorage

## Code and workflow
- Question generators in src/game/levels.ts, types in src/game/types.ts, screens in src/components/, all Swedish game text in src/i18n/sv.ts
- Keep the code simple; no new dependencies without asking first
- Test with `npm run dev`; `npm run build:single` creates play.html (the whole game in one file)
- Don't touch _to_delete/, dist/ or dist-single/
