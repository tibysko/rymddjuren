# Handover: "Min rymdstation" upgrade (Rymddjuren / matte-spel)

**Run order:** this is one of four isolated handovers (see also
`handover-speech.md`, `handover-second-chance-help.md`, `handover-ugglis.md`).
Run them one at a time. Recommended order: **rymdstation (this one, first)** →
speech → second-chance help → Ugglis polish. Stay inside this handover's
scope — the others cover 🔊 on other screens, wrong-answer help, and Ugglis
styling.

## Project context

Rymddjuren is a math game for a 7-year-old starting Swedish grade 1 (åk 1), built
with React + Vite + TypeScript — no game engine. All 10 planets (levels) are built
and working. The one remaining open item in README.md's plan is:

> `- [ ] Fler djur/animationer i rymdstationen` (more animals/animations in the space station)

**Language rules.** The English refactor is COMPLETE (verified 2026-07-25).
Code, comments and identifiers are English; every string the child sees or
hears lives in `src/i18n/sv.ts` — it exports a `sv` object grouped by screen
(`sv.station.title`, `sv.station.empty`, `sv.station.back` exist today), with
plain strings as constants and parameterized ones as functions, `as const`.
Write new code and comments in **English**; put ALL new player-facing Swedish
text (UI + `speak()` lines) in `sv.ts` under the `station` group, following the
existing pattern — never hardcode Swedish in components. The player is a
7-year-old who reads only very short, simple sentences. File names below are
verified current: `Station.tsx`, `StarMap.tsx`, `App.tsx`, `styles.css`,
`src/game/{speech,fx,levels,types}.ts` all kept their names, and `Level` still
has `id`, `name`, `animal`, `animalName`, `color`, `desc`, `generate`.

## What "Min rymdstation" is today

`src/components/Station.tsx` (~35 lines) is the collection screen: for each
completed planet, that planet's animal "moves in". Today it renders a heading,
an empty state with the mascot Ugglis 🦉, a static grid of emoji cards
(animal + name), and a back button. That's all. It is a placeholder compared
to DESIGN.md, which promises the station is "the big reward" where all animals
are visible **and animated**, and that the station "grows and becomes more alive".

## What was NOT implemented (the gap this task closes)

1. No animations at all — animals are static emoji cards.
2. No 🔊 speech button — violates the project rule that *everything* can be read
   aloud via Swedish TTS (`src/game/speech.ts`).
3. Ugglis only appears in the empty state; no mascot presence or celebration
   once animals have moved in.
4. The station doesn't "grow" — 1 animal and 10 animals look the same apart from
   the number of cards.
5. No reward context: per-planet stars aren't shown, no "X av 10 djur" counter,
   nothing to do with the animals.
6. The Pixi effect layer (`SpaceBackdrop`) stays in `calm` mode — the station
   feels no more festive than the star map.

## Agreed design (approved by Ola — build exactly this)

1. **Animals are alive.** Each animal gets a soft CSS animation — slow bobbing as
   if weightless, with per-animal duration/delay offsets so they don't move in
   sync. Optionally an occasional random wiggle/blink on one animal at a time.
   Everything must be disabled under `prefers-reduced-motion` (the effect layer
   already respects this — match that behavior).

2. **Tap an animal → it celebrates.** Tapping an animal card does three things:
   the animal does a happy bounce (CSS animation), `cheerBurst()` from
   `src/game/fx.ts` fires a star explosion in the effect layer, and
   `speak()` from `src/game/speech.ts` says the animal's name — e.g. "Månkanin!".
   That is the whole interaction: no math here, pure reward / "pet the animals"
   feeling. Cards must keep large touch targets.

3. **Ugglis lives here.** Ugglis 🦉 is always visible (not only in the empty
   state) and says different things depending on how many animals live there:
   e.g. "Här bor dina djur!", "Sju djur! Bara tre kvar!", and when all ten are
   home: "Hela rymden är här! Hurra!". When the station is full, `SpaceBackdrop`
   switches to its `cheer` mode so gold stars rain over the station.
   **Verified caveat:** `cheer` is a continuous loop that spawns rain densely
   (~44 stars/s, tuned for the result screen you leave after a few seconds).
   On a screen the child lingers on, that is likely too much — either thin it
   out, or celebrate briefly and then settle back to `calm` (e.g. rain for a
   few seconds on entering the full station). `SpaceBackdrop` reads its mode
   from a prop/ref each frame, so switching back mid-visit works.

4. **🔊 everywhere.** A large speaker button next to the heading reads Ugglis's
   line aloud via `speak()`; tapping an animal reads its name (see point 2).

5. **The station grows.** At the top, a simple station picture built from emoji
   modules: one module lights up per collected animal (e.g. 🛰️ plus a row of
   🔆 modules, with dimmed 🔅 for the ones still missing). Below it a counter:
   "7 av 10 djur bor här". No new artwork needed.

6. **Animal cards show the reward.** Each collected card shows the stars earned
   on that planet (★★☆, same style as the star map, class names `star` /
   `star on`) and uses the planet's `level.color` as a border/frame.

7. **Tease the NEXT animal — keep the rest secret.** (Ola's own request.)
   Uncollected animals must NOT all be revealed — the surprise when a new animal
   moves in is part of the reward. Instead:
   - The **next** animal in line (lowest level id not in `progress.animals`)
     is shown as a dark silhouette: the same emoji with a CSS filter like
     `filter: brightness(0)` (add a faint glow/drop-shadow so the shape is
     visible against the dark background). The child can guess from the shape.
   - Ugglis gives a short spoken riddle hint for it, e.g. for the rabbit:
     "Vem har långa öron och hoppar högt?" — readable via 🔊 / tap on the
     silhouette card. Add one short riddle line per animal (10 total) in
     `src/i18n/sv.ts`, e.g. a `station.riddles` record keyed by level id.
   - All animals **after** the next one are anonymous ❓ cards (no emoji, no
     name) — just enough to show how many remain.

## Where things live (technical reference)

- `src/components/Station.tsx` — the screen to rewrite (~35 → ~120 lines).
  Receives `progress: Progress` and `onBack: () => void`.
- `src/styles.css` — station styles at the bottom (`.station`, `.station-empty`,
  `.station-animals`, `.station-animal`, `.station-animal-emoji`); add the new
  animations and card styles here. Star classes `star` / `star on` already exist.
- `src/App.tsx` — renders `<SpaceBackdrop mode={...} />` globally. One-line
  change needed: pass `cheer` when `screen === 'station'` and all 10 animals
  are collected. (Currently: `cheer` on result screen, `travel` during travel,
  else `calm`.)
- `src/game/speech.ts` — `speak(text: string): void`, Swedish TTS, already
  handles unsupported browsers. Use as-is.
- `src/game/fx.ts` — `cheerBurst(): void`, safe no-op if the effect layer is
  absent (old browser / reduced motion). Use as-is.
- `src/game/types.ts` — `Progress = { stars: Record<number, number>, animals: number[] }`
  (`animals` holds level ids). `Level` has `id`, `name`, `animal` (emoji),
  `animalName`, `color`, `desc`.
- `src/game/levels.ts` — `LEVELS: Level[]`, all 10 levels with colors, e.g.
  id 1 = 🐰 Månkanin `#ff6b6b` … id 10 = 🐘 Månelefant `#ffd32a`.

## Non-negotiable project rules

- No timers, no death, no speed/timing requirements, one-hand/one-button play.
- Very short, simple Swedish sentences for the player; big text; big touch
  targets; more picture than text.
- Everything readable aloud via the 🔊 button.
- No new dependencies without asking first. Keep the code simple.
- Dark space background, red rocket, yellow stars (the player's own wishes).
- Do not touch `_to_delete/`, `dist/`, or `dist-single/`.
- Respect `prefers-reduced-motion` for all new animation.

## When done

- Test with `npm run dev` (note: dev mode unlocks all planets, so you can fill
  the station quickly for testing; also test the empty and partial states —
  localStorage key is `rymddjuren-progress`).
- `npm run build:single` must still produce a working `spela.html`.
- Update README.md: check off the last plan item
  (`Fler djur/animationer i rymdstationen`) with a one-line description of what
  was built, and update DESIGN.md if the station description needs it.
