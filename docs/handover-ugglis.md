# Handover: Ugglis polish (Rymddjuren / matte-spel)

## Scope — isolated task

Make the mascot Ugglis 🦉 live up to the role DESIGN.md gives her. This
handover touches several screens lightly, so it must run **LAST** of the
handover series — after `handover-rymdstation.md`, `handover-speech.md` and
`handover-second-chance-help.md` have all landed — so it decorates their final
state instead of conflicting with them.

**Run order:** run handover sessions one at a time. Recommended order:
rymdstation → speech → second-chance help → **Ugglis polish (this one, last)**.

## Project context

Rymddjuren is a math game for a 7-year-old starting Swedish grade 1
(React + Vite + TypeScript, no game engine). DESIGN.md describes Ugglis as
"en busig liten rymduggla **med hjälm**" who "**ger instruktionerna**", "hejar
på och tröstar" and "**busar** och firar när det går bra". Today Ugglis only
appears as a static 🦉 in the star-map greeting, the feedback line inside
levels, the result screen, and the station's empty state. Cheering/comforting
works; the helmet, the mischief, and "Ugglis presents the instructions" do not
exist.

## What to build

1. **Ugglis gets her helmet.** Render Ugglis as a small composite: the 🦉 emoji
   with a helmet overlaid via CSS (e.g. a positioned 🪖/⛑️ emoji, or a simple
   CSS half-circle "space helmet" with a glass shine). Wrap this in ONE small
   reusable component (e.g. `<Ugglis />`) and use it everywhere `🦉` appears
   today (star map, level feedback, result screen, station empty state), so
   the character is consistent. Pick whichever helmet rendering looks good at
   both small (feedback line) and large (greeting) sizes.

2. **Ugglis presents the instructions.** In `LevelScreen.tsx`, the prompt row
   currently shows the question text + 🔊 with no Ugglis. Put Ugglis next to
   the prompt so the question reads as Ugglis speaking (speech-bubble styling
   on the existing `.prompt` is enough). No logic changes — presentation only.
   Do not shrink the prompt text or the 🔊 button.

3. **Ugglis is mischievous — but never during a question.** Add small idle
   "bus" animations ONLY on calm screens (star map, result screen): e.g. every
   now and then Ugglis tilts, blinks, does a little hop, or briefly peeks in
   from the screen edge and darts back. Randomize the interval so it feels
   alive. Strictly NO mischief inside a level while the child is thinking —
   attention belongs to the math. Everything off under
   `prefers-reduced-motion`.

4. **Bigger celebration on happy feedback.** When the feedback line is happy
   (`.ugglis-feedback.happy` in `LevelScreen`), let Ugglis do a small joy
   animation (wiggle/hop) alongside the existing text — subtle, ~0.5 s, no
   sound changes.

## Technical notes

- Ugglis appearances today are plain `<span className="ugglis">🦉</span>` in
  `StarMap.tsx`, `LevelScreen.tsx`, `ResultScreen.tsx`, `Station.tsx` (the
  station may have been rebuilt by its handover — reuse whatever Ugglis markup
  it ended up with). Styles in `styles.css`.
- Keep animations pure CSS (keyframes + `animation-delay`); randomized timing
  can be a CSS custom property set from React. No new dependencies.
- `prefers-reduced-motion` must disable all new motion — the Pixi effect layer
  already models this behavior.

## Language rules

The English refactor is COMPLETE (verified 2026-07-25). Code and comments are
English; every player-facing string lives in `src/i18n/sv.ts` (exports `sv`,
grouped by screen, parameterized strings as functions, `as const`). Any new
player-facing text in **simple Swedish**, added to `sv.ts` — never hardcoded.
The `<span className="ugglis">🦉</span>` markup and the file names above are
verified current as of the refactor, but the earlier handovers in this series
run before this one and may have changed them (especially `Station.tsx`) —
check the actual code first.

## Non-negotiable project rules

- No timers, no speed requirements; one-hand/one-button play; big touch targets.
- Ugglis comforts and encourages — never scolds, never distracts mid-question.
- No new dependencies. Keep the code simple.
- Do not touch `_to_delete/`, `dist/`, or `dist-single/`.

## When done

- Test with `npm run dev`: helmet visible at all sizes; prompt reads as Ugglis
  speaking; mischief only on star map/result screens; nothing moves with
  `prefers-reduced-motion` enabled.
- `npm run build:single` must still produce a working `spela.html`.
- Add a checked line to README.md's plan; DESIGN.md's Ugglis section now holds.
