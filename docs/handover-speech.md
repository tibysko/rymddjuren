# Handover: 🔊 speech on every screen (Rymddjuren / matte-spel)

## Scope — isolated task

Add text-to-speech (🔊) to the screens that are missing it. This handover is
deliberately isolated: do NOT touch `Station.tsx` (covered by
`handover-rymdstation.md`), do NOT change `LevelScreen.tsx` question logic
(covered by `handover-second-chance-help.md`), and do NOT restyle Ugglis
(covered by `handover-ugglis.md`).

**Run order:** run handover sessions one at a time. Recommended order:
rymdstation → **speech (this one)** → second-chance help → Ugglis polish.

## Project context

Rymddjuren is a math game for a 7-year-old starting Swedish grade 1, built with
React + Vite + TypeScript — no game engine. A hard project rule from DESIGN.md:
**everything the child sees must be readable aloud via a 🔊 button** (Swedish
TTS). Today that rule only holds inside levels (`LevelScreen.tsx` has a
`.speak-btn` next to the prompt). These screens have NO speech at all:

- **Star map** (`StarMap.tsx`): Ugglis's greeting ("Hej! Jag är Ugglis. Vilken
  planet ska vi flyga till?") and the planet names/descriptions.
- **Result screen** (`ResultScreen.tsx`): "Du klarade {name}!", the
  "{animalName} flyttar in i din rymdstation!" line, and Ugglis's
  "Bra jobbat, rymdhjälte!".

## What to build

1. **Star map:** add a 🔊 button next to Ugglis's greeting that speaks the
   greeting via `speak()` from `src/game/speech.ts`. Reuse the existing
   `.speak-btn` style from `styles.css` (used in `LevelScreen`). Planet tiles
   are themselves buttons that start the level, so they cannot double as
   "tap to hear" — instead, include a natural spoken line from the single 🔊
   if you can keep it short, or leave planet names unspoken; do NOT add extra
   per-planet buttons that clutter the map.
2. **Result screen:** add a 🔊 button that speaks the full result as one short
   Swedish line, e.g. "Du klarade Kaninplaneten! Månkanin flyttar in i din
   rymdstation! Bra jobbat, rymdhjälte!" (omit the animal sentence when
   `newAnimal` is false). Consider also speaking it automatically once when
   the screen appears — celebration is the one place auto-speech feels right —
   but keep the button so it can be replayed.
3. **Travel screen** (in `App.tsx`, the 1.7 s rocket ride): optional — it shows
   "Mot {planet}!". If trivial, speak that line once on entry; skip if it
   races with the level's own audio.

## Technical notes

- `speak(text)` in `src/game/speech.ts`: Swedish TTS (`sv-SE`), cancels any
  ongoing utterance first, safe no-op when the browser lacks speechSynthesis.
  Use as-is; do not modify it.
- `.speak-btn` in `styles.css` is the existing speaker-button style — reuse it
  for visual consistency. Big touch target required (child player).
- Keep new spoken strings SHORT and in very simple Swedish.

## Language rules

The English refactor is COMPLETE (verified 2026-07-25). Code and comments are
English; every player-facing string lives in `src/i18n/sv.ts` (exports `sv`,
grouped by screen, parameterized strings as functions, `as const`). The strings
you need already exist there: `sv.map.greeting`, `sv.result.heading(name)`,
`sv.result.newAnimal(animalName)`, `sv.result.praise`, and
`sv.travel.heading(planet)`. Add any NEW spoken lines (e.g. a combined
`sv.result.spoken(...)` function) to `sv.ts` in the matching group — never
hardcode Swedish in components. `SPEECH_LANG` also lives in `sv.ts` and is
already wired into `speak()`.

## Non-negotiable project rules

- No timers, no speed requirements; one-hand/one-button play; big touch targets.
- Very short, simple Swedish sentences for the player; more picture than text.
- No new dependencies. Keep the code simple.
- Do not touch `_to_delete/`, `dist/`, or `dist-single/`.

## When done

- Test with `npm run dev` (dev mode unlocks all planets). Verify: star map 🔊
  speaks the greeting; finishing a level speaks the result; nothing overlaps
  or repeats annoyingly.
- `npm run build:single` must still produce a working `spela.html`.
- Add a checked line to README.md's plan describing what was added.
