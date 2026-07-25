# Handover: implement child-playtest feedback

## Assignment

Implement the five findings recorded in
`docs/player-feedback-2026-07-25.md`. The earlier “documentation only” scope
applied to the originating task; the user has now explicitly authorised Terra
to implement the improvements.

Work in the existing Terra worktree. Read `AGENTS.md`, `docs/CODEBASE.md`,
`DESIGN.md` and `README.md` before changing behaviour. Preserve all unrelated
changes that were already present when the worktree was created.

## Required outcomes

### 1. Discoverable back navigation

Make the back control within a level easy for a child to find and understand.
It should communicate that it returns to the star map, remain reachable around
phone safe areas and have a touch target of at least 48 × 48 CSS pixels. Any new
visible or spoken wording belongs in `src/i18n/sv.ts`.

### 2. Reliable Android/Brave taps

Investigate why enabled controls can appear to ignore taps. Cover all important
DOM controls: navigation, answer choices, food, pandas, read-aloud and check
buttons. An enabled tap should cause one immediate visible response; controls
intentionally locked during animations should visibly communicate that state
and must not accept duplicate input.

Do not claim physical-device verification unless it was actually performed.
Add proportionate automated touch/pointer coverage, and document a concise
manual Brave-on-Android check for anything automation cannot establish.

### 3. Readable completion screen

Keep the falling-star celebration, but ensure the result heading, praise, animal
reward and return action remain clearly readable throughout the moving effect,
including on a narrow phone screen and with reduced motion enabled.

### 4. Intrinsically integrated subtraction

Improve the “How many are left?” mechanic so the child must notice the starting
quantity, the quantity taken away and the remainder. The removed food must stay
perceptually represented or otherwise remain part of the visible mathematical
relationship. A wrong answer should provide visible help that links all three
quantities, rather than reducing the task to counting a static final set.

Keep sentences very short and make every visible instruction/help message
available through the existing Swedish read-aloud flow.

### 5. Clear panda sharing

Make it self-evident that tapping a panda gives it one item, that all food must
be distributed, and that both pandas need equal amounts. Preserve tap-only,
one-handed interaction and the visible seesaw imbalance. The child must be able
to undo an accidental distribution without dragging.

## Design constraints

- The maths must be the mechanic, never a quiz beside the game.
- No timer, death, dexterity requirement or drag interaction.
- Wrong answers get a gentle second chance with visible mathematical help.
- All player-facing text lives only in `src/i18n/sv.ts` and must be readable via
  the speaker button.
- Do not add dependencies. If a dependency genuinely becomes necessary, stop
  and request explicit approval after presenting the available options.
- Do not touch `_to_delete/`, `dist/` or `dist-single/`.
- Keep the DOM fallback and non-canvas maths fully functional.

## Likely code areas

- `src/components/LevelScreen.tsx`: level header, feedback, eating and feeding.
- `src/components/scenes.tsx`: panda-sharing interaction.
- `src/components/ResultScreen.tsx`: completion content.
- `src/components/SpaceBackdrop.tsx`: falling-star effect if adjustment is
  needed, while keeping it decorative and pointer-transparent.
- `src/styles.css`: touch affordances, safe areas, layout and contrast.
- `src/i18n/sv.ts`: every new child-facing Swedish string.
- `tests/planets.spec.ts`, `tests/visual.spec.ts` and shared test helpers:
  behavioural, touch and visual regression coverage.

These are pointers, not a required implementation. Diagnose current behaviour
before choosing the smallest coherent change.

## Verification

Before handing back:

1. Run `npx tsc --noEmit` or `npm run build`.
2. Stress-test affected generators with many random draws, including distinct
   choice and range invariants.
3. Run the focused Playwright tests, then the full suite if practical.
4. Play through the affected planets in a phone-sized browser while watching
   the console.
5. Exercise touch/pointer input rather than mouse clicks alone.
6. Inspect the completion screen while stars are moving, not only as a still
   screenshot.
7. Report physical Android/Brave verification as pending unless a real device
   was used.
8. Update `DESIGN.md` and `README.md` to describe the shipped behaviour, as
   required by `AGENTS.md`.

## Definition of done

All five findings have implemented, evidence-backed improvements; relevant
tests pass; no unrelated working-tree changes are overwritten; documentation
matches the shipped behaviour; and remaining device-specific uncertainty is
called out explicitly.
