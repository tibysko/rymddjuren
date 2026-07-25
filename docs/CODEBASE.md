# Codebase guide

This guide describes how Rymddjuren is built today. For the game's
educational goals and planet plan, see [DESIGN.md](../DESIGN.md). For commands
and publishing, see [README.md](../README.md).

## Overview

Rymddjuren is a client application in React, TypeScript and Vite. There is
no server and no router. `App` holds a small screen state and switches
between the star map, rocket travel, level, result and space station.

The math is represented by a discriminated union of question types. Each
planet generates ten questions in `src/game/levels.ts`. `LevelScreen` then picks
the right interaction based on the question's `type`. Several of the more
advanced interactions live in their own scenes, but they all report the same two
outcomes: correct answer, or wrong answer with an explanatory text.

```text
main.tsx
  └─ App.tsx                         screen flow + saved progress
      ├─ StarMap.tsx                 planet selection and unlocking
      ├─ LevelScreen.tsx             question loop, score and shared feedback
      │   ├─ JumpScene.tsx           Pixi level + DOM fallback for planet 3
      │   └─ scenes.tsx              special scenes for planets 5–10
      ├─ ResultScreen.tsx            stars and new animal
      └─ Station.tsx                 collected animals

levels.ts ── creates Question[] ──> LevelScreen
types.ts  ── defines Level, Question and Progress
```

## Key folders and files

| Path | Responsibility |
|---|---|
| `src/App.tsx` | The app's screen state, selected planet, results and safe progress loading. |
| `src/game/progress.ts` | Normalises and repairs local progress before the app uses it. |
| `src/game/types.ts` | Contracts for all question types, planets and progress. |
| `src/game/levels.ts` | Random generators, the planet collection and star thresholds. |
| `src/components/LevelScreen.tsx` | Runs ten questions, handles the first attempt, Ugglis feedback and simple scenes. |
| `src/components/scenes.tsx` | Seesaw, double jump, pairs, balance scale, patterns and jumping via ten. |
| `src/components/JumpScene.tsx` | The Monkey Planet's (Apornas planet) canvas scene and the matching DOM fallback. |
| `src/components/SpaceBackdrop.tsx` | Decorative Pixi background for calm, travel and celebration. |
| `src/game/pixi.ts` | Initialises WebGPU/WebGL, tests the renderer and handles the fallback. |
| `src/game/speech.ts` | Swedish read-aloud with the Web Speech API. |
| `src/game/sound.ts` | Simple WebAudio tones and tones tied to pattern colours. |
| `src/game/fx.ts` | Small bridge from game events to the background's star explosion. |
| `src/i18n/sv.ts` | All Swedish text the child reads or hears – the one deliberate exception to the English codebase. |
| `src/styles.css` | All DOM layout, responsive game graphics and animations. |
| `public/` | Manifest, app icons and service worker for offline use. |
| `vite.single.config.ts` | Builds the whole JavaScript/CSS bundle inside a single HTML file. |
| `docs/research-*.md` | Design and technical background for individual mechanics. |

## Game flow and state

`App.tsx` uses the following screens:

1. `map`: shows the planets and the space station.
2. `travel`: shows an automatic rocket trip for 1.7 seconds.
3. `level`: mounts `LevelScreen` for the selected planet.
4. `result`: shows the stars earned and possibly a new animal.
5. `station`: shows all animals from completed planets.

Progress is saved under the key `rymddjuren-progress`:

```ts
interface Progress {
  stars: Record<number, number> // best result, 1–3 stars per planet
  animals: number[]             // planet ids for collected animals
}
```

`parseProgress()` accepts missing or partly valid older saves, removes duplicate
or out-of-range animals, clamps stars to 0–3 and repairs the stored value. A
bad save must always open the star map with a usable empty progress object.

A replay can improve the star count but never lower it. The first
completion adds the planet's animal. If storage is missing, full or
contains broken JSON, the game continues with empty progress.

In development mode all planets are unlocked. In the production build every
planet requires at least one star on the previous planet.

## The question model

`Question` in `src/game/types.ts` is a union where `type` decides both the data
and the view. Every question has a short `prompt` and a fuller `spoken` that the
🔊 button reads aloud.

| Type | Mechanic | Rendering |
|---|---|---|
| `choice` | Pick a number; can show counts, a number line, a mirror or a ten-frame. | `LevelScreen` |
| `feed` | Mark exactly the right number of things and press done. | `LevelScreen` |
| `hop` | The choice is the number of steps on the number line. | `LevelScreen` |
| `jump` | The choice is the jump's actual length across the ravine. | `JumpScene` |
| `stair` | The choice moves the rabbit up or down the comet stairs. | `LevelScreen` |
| `eat` | The parrot eats visibly; the child counts what is left. | `LevelScreen` |
| `share` | Share all the items equally on a seesaw. | `ShareScene` |
| `double` | The trampoline makes the chosen jump double. | `DoubleScene` |
| `pair` | Pick two piles that add up to the wanted number. | `PairScene` |
| `balance` | Put the right value on the scale so the sides become equal. | `BalanceScene` |
| `pattern` | Continue a pattern or find a repeated unit. | `PatternScene` |
| `via10` | Make a two-step jump via the rest stop at 10. | `Via10Scene` |

Scenes in `scenes.tsx` take `q`, `locked`, `onRight` and `onWrong`. They own their
local animation but not the score or navigation. `key={index}` makes a scene
remount and get clean local state for the next question.

## Planets and question mix

Every ordinary planet generates ten questions when `LevelScreen` mounts.

| Planet | Question types | Distribution |
|---|---|---|
| 1 The Rabbit Planet (Kaninplaneten) | `choice`, `feed` | 5 + 5 |
| 2 The Star Path (Stjärnstigen) | `hop`, `choice` | 6 + 4 |
| 3 The Monkey Planet | `jump` | 10 |
| 4 The Comet Party (Kometkalaset) | `stair` down, `eat`, `stair` up | 4 + 3 + 3 |
| 5 The Twin Planet (Tvillingplaneten) | `share`, `double`, mirror `choice` | 4 + 4 + 2 |
| 6 The Friend Planet (Kompisplaneten) | `pair`, ten-frame `choice` | 5 + 5 |
| 7 The Scale Planet (Vågplaneten) | `balance` in two equation formats | 5 + 5 |
| 8 The Pattern Belt (Mönsterbältet) | `pattern` next, number sequence, `pattern` unit | 5 + 3 + 2 |
| 9 The Giant Planet (Jätteplaneten) | `via10`, `hop` | 6 + 4 |
| 10 The Party Planet (Festplaneten) | questions from planets 1–9 | 10 chosen adaptively |

The Party Planet weights each earlier planet by `max(1, 4 - stars)`. A
planet with few stars therefore gets a bigger chance to contribute the next
question.

Answer options are created by `makeChoices`: the correct answer is combined with
nearby numbers within the question's allowed range and shuffled. Stars are only
counted for correct answers on the first attempt: 9–10 gives three stars, 7–8
gives two and any other completed result gives one.

## Errors, help and intrinsic integration

`LevelScreen` keeps track of whether the current question has already been
answered incorrectly. A correct answer after help moves on but does not count as
correct on the first attempt. There is no timer, no losing and no dying.

Errors should first and foremost be shown in the game world: the rabbit lands
too short or too far, the scale tips, the seesaw leans, a wrong pattern breaks
the melody and eaten sweets become visible as pale ghosts. At the same time
Ugglis gives a gentle text. This is the central contract for new question types:
the choice must cause a comprehensible mathematical result, not just be compared
with a number.

## Graphics, sound and robustness

DOM and CSS carry all necessary information and all controls. PixiJS is used
for two bounded parts:

- `SpaceBackdrop` is pure decoration and ignores pointer events.
- `JumpScene` draws planet 3 as a canvas level but has a DOM version with
  the same math if canvas rendering does not work.

`createPixiApp` tries WebGPU first and does a canary render with emoji and
geometry. On failure WebGL is used. A broken WebGPU choice is saved under
`rymddjuren-renderer`, and the renderer can be forced with `?renderer=webgl` or
`?renderer=webgpu`. Decorative effects are turned off when the user prefers
reduced motion.

Speech synthesis and tones use browser APIs and fail silently. The game should
keep working if they are missing.

## Build, offline and publishing

```bash
npm install          # install dependencies
npm run dev          # Vite development server; all planets unlocked
npm run build        # TypeScript check + ordinary Vite build
npm run build:single # builds dist-single and copies the result to play.html
npm run preview      # preview the ordinary production build
```

`play.html` can be opened directly as a file. When published on the web,
`index.html` registers a service worker. It uses the network first and the cache
as a fallback, which gives updates online and playability offline after an
earlier visit.

`.github/workflows/pages.yml` describes the GitHub Pages flow: on push to
`main` it runs `npm ci` and `npm run build:single`, after which the single-file
build, the manifest, the service worker and the icons are published.

## How to add a new mechanic

1. Add a question interface and include it in `Question` in
   `src/game/types.ts`.
2. Create a generator in `src/game/levels.ts`. Make sure every randomised
   answer option can be shown and carried out in the scene.
3. Render the type in `LevelScreen` or create an isolated scene with the
   `onRight`/`onWrong` contract.
4. Make the mathematical effect of the wrong choice visible and give a calm
   second chance.
5. Add short text and Swedish `spoken` text for 🔊.
6. Check large tap targets, a narrow mobile screen and `prefers-reduced-motion`.
7. Update `DESIGN.md` and `README.md` when the planet plan changes or is
   finished.

## Verification and the current test setup

TypeScript runs in strict mode with, among other things, unused variables and
parameters as errors. The smallest technical check after a change is therefore
`npm run build`. For the single-file and offline delivery, `npm run build:single`
should be run as well.

Playwright tests are checked in under `tests/` and run with `npm test`. The suite
builds and serves the production app, plays every planet to completion, checks
space-station rules, watches browser errors and compares screenshots for the map,
station and first question on every planet. The shared fixture seeds progress and
`Math.random` so each run gets the same questions.

Flow tests run with reduced motion, disabled CSS transitions and a 20x browser
clock. This preserves state changes and mathematical outcomes without waiting for
pauses deliberately tuned for a child. Screenshot tests use reduced motion but a
real animation-frame clock, and the station bounce has a focused real-time test.
The accelerated clock exists only in the Playwright page and cannot affect the
production build. The full suite normally takes about one to two minutes locally.

Browser automation does not replace manual play-throughs on a real touch device.
Speech quality, touch comfort, animation feel and renderer fallback should still
be checked manually when related code changes.
