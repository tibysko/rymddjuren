# AGENTS.md — Rymddjuren (the maths game)

A maths game for a 7-year-old starting Year 1 (Swedish school). React + Vite +
TypeScript, no game engine. Read `docs/CODEBASE.md` for architecture,
`DESIGN.md` for the planet plan (1–10, mapped to Lgr22), `README.md` for the
build plan. **Update DESIGN.md and README.md when something ships.**

## The one design rule that matters most

**Intrinsic integration: the maths IS the game mechanic, never a quiz next to
the game.** A wrong answer must produce a visible, understandable result in the
game world (e.g. the rabbit's hop lands short on the number line) — never just
"wrong, try again". The Star Path (planet 2) is the model for all levels.

## Target group — non-negotiable

- No timers, no death, no timing/dexterity demands. One-hand, tap-only input
  (no dragging). The game measures maths, not motor skills.
- Very short simple sentences ("Hur många?"), large text, large touch targets,
  more picture than text.
- Everything the child sees must be readable aloud via the 🔊 button
  (Swedish speech synthesis, `src/game/speech.ts`).
- Wrong answer → a second chance with gentle help; Ugglis 🦉 comforts and cheers.

## Language rules

- Always reply to the repo owner in **Swedish**.
- Code, comments, repo docs, filenames and commit messages: **English**.
- ALL player-facing text: **simple Swedish**, and it lives ONLY in
  `src/i18n/sv.ts` (grouped per screen, parameterized strings as functions).
  Never hardcode player text in components.

## Code map

- `src/game/levels.ts` — question generators. `src/game/types.ts` — types.
- `src/components/` — screens; `scenes.tsx` — scene components (own their
  animation, call `onRight`/`onWrong`, remounted per question via `key={index}`).
- `src/game/pixi.ts` + `fx.ts` — PixiJS v8 renderer pick (WebGPU → WebGL
  fallback) and effects. `src/game/sound.ts` — WebAudio.
- Progress in localStorage. Look: dark space, red rocket, yellow stars.

## Commands

- `npm run dev` — dev server. Note: Vite does NOT type-check in dev; run
  `npx tsc --noEmit` (or `npm run build`) to catch type errors.
- `npm run build:single` — the whole game as one file (`play.html`).
- GitHub Pages deploys on every push to `main` (`.github/workflows/pages.yml`)
  — a broken `main` breaks the public game.

## Hard rules

- No new dependencies without asking first.
- For every new feature, research whether suitable packages already solve the
  problem. Always present the relevant options and ask for explicit approval
  before adding or using a new package.
- Do not touch `_to_delete/`, `dist/`, `dist-single/`.

## Known gotchas

- `makeChoices(answer, min, max)` loops forever if the range holds fewer than
  3 numbers — every generator must guarantee ≥ 3 possible choices.
- Pixi: avoid `generateTexture` (unreliable in some WebGPU environments) —
  draw with Graphics/Text directly. WebGPU can pass init and still crash later;
  `pixi.ts` has a runtime guard that falls back to WebGL (remembered in
  localStorage, override with `?renderer=webgl|webgpu`). Keep the DOM fallback
  working — the maths must always work without a canvas.

## Verifying changes

- Play through the affected planet(s) in the browser and watch the console.
- Stress-test generators against their invariants with many random draws
  (range bounds, correct answer present, ≥ 3 distinct choices).
