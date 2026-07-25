# Handover: keep the Monkey Planet goal visible on phones

## Assignment

Fix the Monkey Planet camera so the child can see the rabbit, the ravine and
the goal (monkey plus banana) at the same time before choosing a jump length.

This comes directly from a child playtest: the child enjoyed the jumping
mechanic, but could not see where the rabbit was supposed to land. The chosen
solution is an adaptive overview before the answer, followed by the existing
camera-following presentation during the jump.

Read `AGENTS.md`, `docs/CODEBASE.md`, `DESIGN.md` and `README.md` before changing
behaviour. Preserve unrelated working-tree changes.

## Confirmed cause

The target is drawn correctly in `src/components/JumpScene.tsx`, but the Pixi
world is intentionally wider than the viewport:

```ts
const COL_W = 88
```

The idle camera follows the rabbit and clamps at the world edges. It does not
frame the target or perform an introductory overview. On a narrow phone the
goal can therefore be outside the canvas until the rabbit has already started
jumping.

This was reproduced in the development build with a 390 x 844 CSS-pixel
viewport. The canvas was 358 px wide. For the generated question `3 -> 6`:

```text
visible world at idle: 0..358 px
banana centre:         382 px
monkey centre:         416 px
```

Both goal sprites were outside the visible area while the child was expected
to choose the jump length.

Relevant code:

- `src/components/JumpScene.tsx`: `COL_W`, `xOf`, monkey/banana placement,
  animation phases and the camera calculation near the end of the ticker.
- `src/game/levels.ts`: `genJumpQuestion()` and the possible start, target and
  choice ranges.
- `src/styles.css`: `.jump-canvas` phone sizing.
- The DOM fallback in `JumpScene.tsx` currently scales the complete scene into
  its container and must remain functional.

## Required behaviour

### Before the child answers

Show all of these simultaneously inside the canvas:

- the rabbit at its starting number;
- the complete ravine between start and target;
- the monkey and banana at the target number;
- the number positions from start through target.

The target must be visually unambiguous and must not be clipped at either edge.
Keep the banana's existing gentle movement if practical.

### When an answer is selected

Transition smoothly from the overview to the existing action camera. The
camera may zoom in and follow the rabbit during the parabolic jump so the level
keeps its side-scrolling, platform-like feeling.

Respect `prefers-reduced-motion`: when reduced motion is requested, avoid a
decorative camera sweep or animated zoom. The required overview must still be
present, and the mathematical landing result must remain understandable.

### After a wrong answer

Keep the wrong landing and the true target visible together long enough for the
child to understand whether the chosen jump was too short or too long. Do not
turn this into a detached hint or quiz message; the spatial result is the help.
Then reset gently for the second attempt.

### After a correct answer

Preserve the current celebration at the monkey and banana, including the
particles and sound, unless a small adjustment is necessary for the new camera
framing.

## Recommended implementation direction

Use an adaptive overview scale and camera position derived from the bounding
box containing the rabbit, the target sprites and suitable side padding.

Conceptually:

1. Calculate the world-space bounds that must be visible from the rabbit
   through the monkey/banana.
2. Choose a scale no larger than `1` that fits those bounds inside
   `app.screen.width` with safe padding for the emoji extents.
3. Centre that range while the phase is `idle`.
4. When the child answers, interpolate toward an action scale/camera that
   follows the rabbit.
5. For a wrong landing, frame the landing and target together before resetting.

This is a direction, not a required formula. Avoid merely centring the camera
between start and target: the longest five-step span is about 440 px before
sprite padding, so it still cannot fit inside the measured 358 px canvas
without scaling or reducing spacing.

Prefer transforming a dedicated gameplay container consistently rather than
scaling individual sprites independently. Check how scaling interacts with
parallax, camera clamps, particle coordinates and the fixed 320 px scene
height. Numbers and characters must remain comfortably legible on a phone.

Do not replace the adaptive overview with only an arrow, minimap or fixed goal
label. Those may be supplementary, but the accepted design requires the actual
rabbit, ravine and goal to be visible together so the maths remains intrinsic
to the game world.

## Constraints

- No timers, death, dexterity requirement or dragging.
- Input remains one-hand, tap-only.
- The selected number must remain the literal length/power of the jump.
- A wrong choice must visibly land short, fall in the ravine or overshoot as
  appropriate, followed by a gentle second chance.
- Keep answer controls and all accessibility-relevant interaction in the DOM.
- Keep the DOM fallback working when Pixi/WebGPU/WebGL is unavailable.
- Any new player-facing text belongs only in `src/i18n/sv.ts` and must be
  available through the existing read-aloud flow. No new wording should be
  necessary for this camera change.
- Do not add dependencies. If one genuinely becomes necessary, stop and ask
  for explicit approval after presenting the options.
- Do not touch `_to_delete/`, `dist/` or `dist-single/`.

## Verification

Test at least these conditions before handing back:

1. Phone viewports around 320, 360, 390 and 430 CSS pixels wide.
2. Minimum and maximum generated jump lengths, especially a five-step jump.
3. Starts near both the left and right ends of the generated world.
4. Rabbit, complete ravine, monkey and banana are all visible before any answer
   is tapped, with no sprite clipping.
5. Correct, too-short and too-long choices all show the intended landing and
   keep the true target spatially understandable.
6. Camera transitions do not introduce horizontal page scrolling.
7. Resize/orientation changes leave the framing correct.
8. Reduced-motion mode remains clear and stable.
9. Pixi runtime fallback still reaches the DOM scene and the maths remains
   playable.
10. Watch the browser console during a complete Monkey Planet playthrough.

Add focused automated coverage for the framing invariant where practical. A
visual regression at phone width should make it obvious if the goal disappears
again. Stress-test `genJumpQuestion()` with many random draws and preserve the
choice/range invariants.

Run at minimum:

```bash
npx tsc --noEmit
npm test
```

If visual baselines change intentionally, inspect the new images before
updating them. Update `DESIGN.md` and `README.md` when the behaviour ships, as
required by `AGENTS.md`.

## Definition of done

On every supported phone width, the child sees the rabbit, the whole relevant
ravine and the monkey/banana goal before choosing a number. The camera then
preserves the satisfying jump presentation, and correct and incorrect landings
remain visually tied to the target. Relevant tests pass, the DOM fallback still
works and shipped documentation matches the behaviour.
