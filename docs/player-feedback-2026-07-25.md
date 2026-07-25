# Player feedback — 25 July 2026

## Status and scope

This document records feedback from a child playtest. It describes observed
problems and the outcomes a future change should achieve. It does not prescribe
an implementation, and no code change is included with this note.

The food was described as carrots in the feedback. In the current game, the
corresponding objects may be sweets or bamboo depending on the planet. The
important observation concerns the mechanic, not the particular food graphic.

## Summary

| Priority | Area | Observation | Why it matters |
|---|---|---|---|
| High | Touch input | Taps are not always registered on Android in Brave. | An apparently ignored tap makes the game feel broken and can prevent the child from showing what they know. |
| High | Subtraction | In “How many are left?”, the child counts the remaining objects but does not attend to objects being taken away. | The task can be solved as a counting exercise, so the intended subtraction idea is not intrinsically integrated. |
| High | Equal sharing | It is unclear how to distribute the food between the pandas. | The child may not discover the interaction, even if they understand equal sharing. |
| Medium | Navigation | The back button during a planet/rocket flow is difficult to find. | Leaving a level should not depend on searching for a small or ambiguous control. |
| Medium | Completion screen | The completion text is difficult to read against the falling stars. | The reward effect competes with the information it is meant to celebrate. |

## Detailed findings

### 1. Back navigation is difficult to find

**Observed behaviour:** The back control in the space/planet flow is not noticed
easily.

**Risk:** The icon, position or visual weight may not communicate clearly that
the child can return to the star map. This can make the child feel stuck.

**Desired outcome:** The child can locate and understand the back control without
adult help. It remains a large, one-tap target and does not compete with the
current maths task.

**Acceptance criteria for a future change:**

- A child can point to the way back immediately when asked.
- The control communicates its destination, not only a direction.
- The visible label can be read aloud.
- The touch target remains at least 48 × 48 CSS pixels and respects phone safe
  areas.

### 2. Some taps are ignored on Android Brave

**Observed behaviour:** Touch input is not registered consistently when the game
is played in Brave on Android.

**Risk:** This is a reliability issue, not merely visual polish. Repeated taps can
also cause accidental double input if the first tap was delayed rather than
lost. A child may interpret an ignored answer as being mathematically wrong.

**Desired outcome:** Every deliberate tap on an enabled control produces one
immediate, visible response. A disabled control must look disabled, so an
intentionally blocked tap is not mistaken for a technical failure.

**Acceptance criteria for a future change:**

- Repeated single taps on every gameplay control produce exactly one response
  per tap.
- Slight finger movement within a large button does not cancel an intended tap.
- Rapid taps cannot submit two answers while an animation or verdict is active.
- Navigation, answer choices, food items, pandas, the read-aloud button and
  confirmation buttons are all covered.
- Verification includes Brave on a physical Android device, both in a normal
  browser tab and from a home-screen installation if that is how the child
  normally plays.
- Browser console errors are checked during the same run.

**Information to capture when reproducing:**

- Phone model and Android version.
- Brave version.
- Whether the game was opened in a tab, full screen or from the home screen.
- Which controls missed taps and whether an animation was running.
- Whether the button showed any pressed-state feedback.

### 3. Falling stars reduce completion-text readability

**Observed behaviour:** After completing something, the falling-star celebration
makes the text harder to see.

**Risk:** Motion, colour and contrast compete with the result, praise and next
action. This is especially problematic for a beginning reader.

**Desired outcome:** The celebration still feels rewarding, while headings,
feedback and the return action remain readable at a glance.

**Acceptance criteria for a future change:**

- Completion text keeps strong contrast throughout the entire star effect.
- No star crosses or visually masks the text or primary action.
- The result remains clear at narrow Android phone sizes.
- The reduced-motion experience remains complete and understandable.
- The final design is checked while the effect is moving, not only in a still
  screenshot.

### 4. “How many are left?” is solved by counting only

**Observed behaviour:** The child counts the objects that remain. They do not
appear to reason about the objects that were removed.

**Educational concern:** Counting the final set gives the correct answer without
connecting the starting amount, the removed amount and the remainder. The maths
therefore becomes adjacent to the animation rather than being the game mechanic.
This conflicts with the project’s intrinsic-integration rule.

**Desired outcome:** To answer, the child should notice and relate all three
quantities:

1. how many there were at the start;
2. how many were taken away;
3. how many remain.

The removal must remain a visible event in the game world, not only a spoken
sentence or a correctness check.

**Acceptance criteria for a future change:**

- The starting quantity remains perceptually available after the removal.
- The removed objects are represented clearly enough to be counted or compared
  with the remainder.
- The child can explain, in their own words or by pointing, what changed.
- A wrong answer produces visible help that connects “there were”, “taken away”
  and “left”.
- The task cannot be reduced to an unexplained static “count these objects”
  prompt.
- The instruction and any help are available through the read-aloud control.

**Playtest prompt:** After the child answers, ask “Vad hände med maten?” and
“Hur vet du hur många som är kvar?” Avoid teaching the intended strategy before
observing their explanation.

### 5. Sharing between the pandas is unclear

**Observed behaviour:** The child is unsure how to give the food to the two
pandas.

**Risk:** This may be an interaction-discovery problem rather than a maths
problem. If the controls are unclear, the game measures interface guessing
instead of understanding equal groups.

**Desired outcome:** Without adult explanation, the child understands that a tap
gives one item to a panda and that the goal is to distribute all items so both
pandas receive the same amount.

**Acceptance criteria for a future change:**

- The source pile, both recipients and the effect of a tap are visually linked.
- The first tap has an immediate and visible consequence.
- Both panda targets clearly look tappable and are large enough for one-handed
  use.
- The child can correct an accidental distribution using tap-only input.
- Unequal groups produce a visible imbalance and gentle second-chance help.
- “Done” cannot be confused with the act of giving an item.
- All visible instructions and corrective help can be read aloud.

**Playtest prompt:** Start a sharing task and wait silently. Record what the child
taps first, whether they alternate between pandas, and when they decide that the
sharing is complete.

## Recommended verification session

Use one short session on the same Android/Brave setup where the issues were
reported:

1. Ask the child to enter a planet and then return to the star map.
2. Let the child complete several questions while recording missed or repeated
   taps by control type.
3. Watch a completion celebration and ask the child to read the result and find
   the next action.
4. Observe at least three “How many are left?” tasks without coaching.
5. Observe at least three panda-sharing tasks without coaching.

Record behaviour and quotes rather than only pass/fail. The subtraction and
sharing findings should be considered resolved only when the child’s actions
show the intended mathematical relationship without adult instruction.
