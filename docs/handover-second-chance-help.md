# Handover: mild help on the second try (Rymddjuren / matte-spel)

## Scope — isolated task

Implement the promised "second chance with mild help" for the plain
multiple-choice questions. This handover is deliberately isolated: do NOT touch
`Station.tsx`, `StarMap.tsx`, `ResultScreen.tsx` (other handovers), and do NOT
modify the scene components in `scenes.tsx` / `JumpScene.tsx` (their mechanics
already show the consequence of a wrong answer in the game world — that IS
their help). Work happens in `LevelScreen.tsx` + `styles.css`.

**Run order:** run handover sessions one at a time. Recommended order:
rymdstation → speech → **second-chance help (this one)** → Ugglis polish.

## Project context

Rymddjuren is a math game for a 7-year-old starting Swedish grade 1
(React + Vite + TypeScript, no game engine). DESIGN.md promises:

> "Fel svar → andra chans med mild hjälp (t.ex. visa prickar att räkna)"

The second chance exists everywhere, and the movement-based questions (hop,
stair, jump, balance, eat…) already show the wrong answer's consequence
visibly. But the plain choice questions handled directly by `LevelScreen.tsx`
(`q.type === 'choice'` — "Hur många?", "Vilket tal fattas?", the ten-frame
bridge, the mirror pond, growing number sequences) give only a "Prova igen!"
text with no extra support. The promised counting help was never built.

## What to build (decided by Ola — build this)

After the FIRST wrong attempt on a question (`attempted === true`):

1. **Countable dots on the answer buttons.** Each numeric choice button gets a
   small row/grid of dots under its numeral — the button for 7 shows 7 dots —
   so a child who can't yet read numerals confidently can count instead.
   Implementation sketch: extend the `.choice-btn` rendering for `choice`
   questions with a dot row when `attempted` is true; dots are pure CSS/spans
   (e.g. `•` or small circles), grouped in fives if that's easy (5 + 2 reads
   better than 7 in a row). Buttons must remain big; dots are a subordinate
   visual, not a new layout.
2. **Auto re-read the question.** When the wrong-answer feedback fires, call
   `speak(q.spoken)` (from `src/game/speech.ts`) after the "Prova igen" line so
   the child hears the task again without needing to find the 🔊 button.
3. Scoring is untouched: `firstTryCorrect` already only counts first-try
   successes; the help appearing on the second try does not affect stars.

Apply the dot help at minimum to `q.type === 'choice'`. The same numeric
buttons are rendered for `hop`, `stair`, and `eat` in `LevelScreen.tsx` — if
the implementation is genuinely shared (one small component for a numeric
choice button), enabling dots there too is welcome but optional; those types
already have world-feedback, so do not add anything beyond the shared buttons.

## Technical notes

- `LevelScreen.tsx` state: `attempted` flags a wrong first try and resets on
  question change — it is exactly the signal for showing help.
- Wrong-answer path for choice questions: `answerChoice()` → `wrongAnswer()`
  (sets `wrongChoice`, feedback "Prova igen", `attempted`). Hook the auto-speech
  there; make sure it composes with `speak()`'s built-in cancel (the cheer/
  feedback isn't spoken today, so there is no collision).
- `speak()` is a safe no-op without browser TTS — dots must therefore carry the
  help on their own.
- Respect `prefers-reduced-motion` if you animate the dots' appearance
  (a simple fade or none at all is fine).

## Language rules

The English refactor is COMPLETE (verified 2026-07-25). Code and comments are
English; every player-facing string lives in `src/i18n/sv.ts` (exports `sv`,
grouped by screen, parameterized strings as functions, `as const`). Any new
player-facing text (this task likely needs none — dots are visual and the
re-read uses the existing `q.spoken`) goes in `sv.ts`, never hardcoded. The
names referenced in this handover are verified current: `attempted`,
`wrongAnswer()`, `answerChoice()` in `LevelScreen.tsx`; `speak()` in
`src/game/speech.ts`; feedback strings are `sv.level.tryAgain`.

## Non-negotiable project rules

- No timers, no speed requirements; one-hand/one-button play; big touch targets.
- Math is measured, not motor skills; the help must never shame — Ugglis
  encourages ("Nästan! Prova igen!"), never scolds.
- No new dependencies. Keep the code simple.
- Do not touch `_to_delete/`, `dist/`, or `dist-single/`.

## When done

- Test with `npm run dev`: answer wrong on planet 1 ("Hur många?") and planet 6
  (ten-frame) — dots must appear on the buttons and the question must be
  re-read aloud; answer right on the first try — no dots ever appear.
- `npm run build:single` must still produce a working `spela.html`.
- Add a checked line to README.md's plan, and DESIGN.md's promise now holds —
  no doc change needed there.
