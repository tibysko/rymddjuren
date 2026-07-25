# Handover: get the Playwright tests running (Rymddjuren / matte-spel)

**Status: the test setup is written but has NEVER been run.** It was authored in
a cloud sandbox that could not execute it against the real project, and the
session ended before it could be verified. Treat every file below as a first
draft that compiles in someone's head only. The first job of this handover is to
run it and fix whatever falls over — expect a handful of small breakages.

## Why this exists

Rymddjuren is a math game for a 7-year-old starting Swedish grade 1 (React +
Vite + TypeScript, no game engine). Ola asked for something that can test the
game for him instead of him clicking through ten planets by hand after every
change. Three handovers remain in `docs/` (speech → second-chance-help →
ugglis), and the last one touches several screens at once, so a regression guard
is worth having in place before it runs.

## What was added (all already on disk, none of it committed)

- `playwright.config.ts` — builds the production version, serves it on :4173 via
  the `webServer` option, runs everything in parallel, phone-sized viewport
  (430×900), HTML report, trace on retry.
- `tests/game.ts` — a `game` fixture: `start(progress, seed)` seeds
  `localStorage['rymddjuren-progress']` and replaces `Math.random` with a seeded
  generator so reruns produce identical questions; `station()`, `planet(id)` and
  `play()` drive the game. `play()` taps answers at random — right or wrong does
  not matter, the point is that every question gets exercised and the level
  always reaches the result screen.
- `tests/station.spec.ts` — the space-station rules (see below).
- `tests/planets.spec.ts` — one test per planet, played start to finish, plus a
  test that finishing a planet moves an animal into the station.
- `tests/visual.spec.ts` — `toHaveScreenshot` for the star map, three station
  states and the first question of each planet. The Pixi canvases are hidden
  before each shot, otherwise the moving starfield fails every run.
- `package.json` — added `@playwright/test` and the scripts `test`, `test:ui`,
  `test:report`, `test:update`.
- `.gitignore` — added `test-results`, `playwright-report`, `blob-report`.

`playwright` (the library) was already a devDependency before this work;
`@playwright/test` is new — Ola approved adding it ("installera vad du behöver").

## First run

```bash
cd ~/code/matte-spel
npm install                    # picks up @playwright/test
npx playwright install chromium
npm test
```

Then `npm run test:report` for the HTML report, or `npm run test:ui` to watch the
bot play step by step with a timeline — that UI is the fastest way to see why
something failed.

The visual tests will fail on the first run with "snapshot written" because no
baseline pictures exist yet. That is expected: look at the pictures in
`tests/visual.spec.ts-snapshots/`, and if they look right, `npm run test:update`
and commit them. They are platform-specific (macOS baselines will be named
`...-chromium-darwin.png`).

## Known risks in this untested code

1. **`webServer` command.** It runs `npm run build && npm run preview -- --port
   4173 --strictPort`. If `vite preview` does not accept those flags in this Vite
   version, or the build is slower than the 180 s timeout, this is the first
   thing that breaks.
2. **The random-tapping bot.** In an earlier cloud experiment planet 1 ran out of
   its click budget on a "feed the rabbit with 6 carrots" question: random taps
   toggle carrots on and off and rarely land on the right count. It was fixed by
   making the bot press the "Klart!" confirm button ~60 % of the time when one is
   present (`checkIndex` in `tests/game.ts`). This is the least trustworthy part
   of the whole setup — if a planet times out, raise the `budget` argument or
   teach the bot that question type specifically. Planets 2 and 3 finished in
   45–75 s each before the fix; with parallel workers the whole suite should land
   in a couple of minutes.
3. **Type checking.** `tsconfig.json` has `"include": ["src", "vite.config.ts"]`,
   so `tests/` and `playwright.config.ts` are NOT type-checked by `npm run build`.
   Consider adding them to `include` once the tests pass — it would catch typos
   in test code, but `noUnusedLocals`/`noUnusedParameters` are strict, so it may
   need small fixes first.
4. **Selectors are CSS classes.** Playwright's own best-practice guide prefers
   user-facing locators (`getByRole`, `getByText`) over CSS, because classes are
   implementation detail. The tests use classes (`.station-animal.home`,
   `.choice-btn`) since this codebase has no test ids and the game is mostly
   emoji with little accessible text. Worth revisiting if the tests turn out to
   be brittle; do NOT add test ids to the game just to please the tests without
   asking Ola first.
5. **`.station-animal.next` on a full station.** `tests/station.spec.ts` expects
   zero silhouettes when all ten animals are home. Verify that is actually what
   `Station.tsx` renders (it should be — `next` is `undefined` then).

## What the tests assert today

Station: six animals home / one silhouette / three secret at half progress; the
counter text; six lit hull modules; hidden animals never leak their emoji; the
silhouette carries a riddle; tapping an animal adds and then drops the `cheering`
class; the empty and full states; a 🔊 button exists; no console errors; and
nothing animates under `prefers-reduced-motion`.

Planets: each of the ten shows a prompt and a 🔊 button, plays through to the
result screen, and logs no browser errors.

## Do NOT let the tests drive the game's design

The project rules stand above the tests: no timers, no death, no speed
requirements, one-hand play, very short simple Swedish for the player (all of it
in `src/i18n/sv.ts`, never hardcoded), big touch targets, everything readable
aloud, `prefers-reduced-motion` respected, no new dependencies without asking,
and never touch `_to_delete/`, `dist/` or `dist-single/`. If a test is awkward to
write, change the test, not the game.

## Done

This handover has been carried out: `npm test` is green (33 tests, about five
minutes), the baselines are committed, and README.md has a `## Tests` section.
What actually broke, and what had to change, is in the commit message for
"Test the game automatically with Playwright, and fix a Pixi teardown crash".

Two things the suite found were deliberately NOT fixed, because both are Ola's
call: see **`docs/handover-jump-canvas-and-first-burst.md`** (the Monkey Planet
scrolls sideways on a phone; the first star burst stalls the browser for about a
second). Neither one fails the suite.

## When done

- `npm test` green, baselines committed.
- Add a short line to README.md's plan describing the test setup.
- The three remaining handovers (`handover-speech.md`,
  `handover-second-chance-help.md`, `handover-ugglis.md`) should each end with
  `npm test` passing, and are a good excuse to extend the suite: the speech
  handover in particular should add assertions that the star map and result
  screen have a 🔊 button, which they do not today.
