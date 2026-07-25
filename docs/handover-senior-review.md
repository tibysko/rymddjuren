# Handover: senior repository review

**Date:** 2026-07-25  
**Reviewed commit:** `84e8198` (`main`)  
**Status:** Review and external research complete. No game code was changed.

## Scope

The repository was reviewed as a production-oriented React, Vite and TypeScript
game for a seven-year-old. The review focused on:

- gameplay state and navigation;
- the intrinsic-integration rule for wrong answers;
- saved progress and recovery from bad data;
- Swedish read-aloud coverage;
- mobile layout and reduced motion;
- sound and speech generation;
- question-generator invariants;
- Playwright coverage and the GitHub Pages deployment path.

At the end of the original review, the only working-tree change was this
untracked handover file. While the handover was later being expanded, a separate
modification appeared in `src/components/LevelScreen.tsx`. It was not made or
reviewed as part of this handover. Neither change is staged or committed.

## Findings

### High: the Monkey Planet causes horizontal scrolling on a phone

`src/styles.css`, around line 1360, gives `.jump-canvas` a height but no width.
Pixi's canvas therefore supplies an intrinsic width of 800 px. In a 430 px
viewport, the page becomes wider than the screen and can be dragged sideways.

This is a real defect for a one-hand phone game. It is already measured in
`docs/handover-jump-canvas-and-first-burst.md`:

```text
document.documentElement.scrollWidth  615
document.documentElement.clientWidth  430
.jump-canvas offsetWidth              800
```

A likely starting point is `width: 100%` on `.jump-canvas`, but the Pixi camera,
banana position and number track must be checked at 430 px before accepting the
change. The planet 3 screenshot baseline will legitimately change.

### High: invalid saved progress can leave the game completely blank

`loadProgress()` in `src/App.tsx` parses local storage and casts the result to
`Progress` without validating its structure:

```ts
if (raw) return JSON.parse(raw) as Progress
```

The review reproduced the failure by storing the JSON value `null` under
`rymddjuren-progress` and reloading. React rendered an empty root and reported:

```text
Cannot read properties of null (reading 'animals')
```

The loader should validate and normalize `stars` and `animals`, including old or
partially valid save formats. Bad data should fall back to an empty save instead
of permanently preventing the game from starting. Add tests for at least `null`,
`{}`, malformed JSON, wrong field types, duplicate animals and out-of-range IDs.

### High: the read-aloud requirement is not met across every screen

The level prompt and part of the station have speech controls, but the following
player-facing content has no equivalent read-aloud path:

- the star map title, greeting, planet names and descriptions;
- the travel screen;
- the result heading, reward message and praise;
- visible Ugglis feedback after answers;
- some station labels and counters.

Relevant components are `src/components/StarMap.tsx`, `src/App.tsx` (the travel
screen), `src/components/ResultScreen.tsx` and `src/components/LevelScreen.tsx`.

The current browser tests mainly assert that a `.speak-btn` exists. They do not
verify which visible text is included in the spoken content. Speech coverage
should be defined per screen and tested against that contract.

### High: generic choice questions do not intrinsically show why an answer is wrong

`answerChoice()` in `src/components/LevelScreen.tsx` sends every wrong generic
choice to `wrongAnswer()`. The result is a grey/shaking answer button and generic
Ugglis feedback. Nothing in the game world demonstrates the mathematical result
of the selected number.

This affects several mechanics, including:

- counting quantities;
- missing numbers;
- mirror doubles;
- missing ten-frame planks;
- growing number sequences.

That conflicts with the repository's main design rule: a wrong answer must create
a visible, understandable result in the world, with the Star Path as the model.
Each affected mechanic needs its own second-chance visualization rather than a
shared quiz-style error state.

### Medium: a pending completion timeout can override the back button

`nextQuestion()` starts a 1.2 second timeout, but `LevelScreen` does not retain or
clear that timeout when it unmounts. The back button remains active during the
celebration.

The review reproduced this sequence:

1. Answer question 10 correctly.
2. Immediately press the back button.
3. The star map appears.
4. After the remaining timeout, the result screen replaces the map.

The measured state was:

```json
{"immediateMap":1,"after":{"map":0,"result":1}}
```

All `LevelScreen` timeouts should be owned and cancelled on unmount, or the quit
path should invalidate pending completion callbacks. Add a regression test for
quitting during the final celebration.

### Medium: reduced motion is only partially respected

`SpaceBackdrop` skips Pixi rendering when reduced motion is requested, and the
CSS block around line 1320 disables station animations. Other motion remains,
including the travel rocket's infinite `rumble` animation and several shakes,
bounces and transitions in levels.

The existing reduced-motion browser test checks station elements only. The game
needs a deliberate policy for essential mathematical movement versus decorative
movement. Decorative infinite motion should stop, while essential mechanics need
a reduced-motion presentation that preserves the mathematical explanation.

### Medium: the public deployment does not run the test suite

`.github/workflows/pages.yml` runs `npm ci`, `npm run build:single`, assembles the
site and deploys it. It never runs `npm test`, even though every push to `main`
updates the public game.

The full suite currently takes about 8.5 minutes locally. If that is too slow for
every deployment, split out a fast non-visual production smoke suite and run it
before publishing. The current screenshot baselines are Darwin-specific, so Linux
CI needs appropriate baselines or a separate visual-test job.

### Low: `docs/CODEBASE.md` describes an obsolete test setup

The verification section says that Playwright has no checked-in tests or `test`
script. The repository now has 33 tests and documented npm commands. Update that
section so future work does not rely on stale verification instructions.

## Verification performed

No source or repository artifact was changed by these checks. The browser suite
was run from a temporary copy under `/tmp`.

```text
npx tsc --noEmit
Result: passed

npm test
Result: 33 passed in 8.5 minutes

Question-generator stress test
Result: 200,000 generated questions validated

npm run generate:speech -- --dry-run
Result: passed; no API call was made
```

The generator stress test checked:

- ten questions per level;
- three distinct choices where applicable;
- the correct answer is present;
- hop, stair, jump and via-ten landings stay inside their drawn ranges;
- feed and share totals are valid;
- every pair question has a valid pair;
- double, balance, eat and via-ten answers match their underlying arithmetic.

## What the green suite does not prove

All existing tests passed while the findings above were still present. In
particular, the suite currently does not assert:

- absence of horizontal page overflow;
- recovery from structurally invalid local storage;
- navigation during a pending correct-answer celebration;
- complete read-aloud coverage for visible text;
- intrinsic wrong-answer behavior for generic choice mechanics;
- reduced motion outside the station;
- that tests run before GitHub Pages deployment.

The separately documented first `cheerBurst()` stall was not promoted to a
confirmed production finding here. It has only been measured in headless Chromium
using software WebGL and should be measured on the actual phone before changing
the effect.

## Suggested order of work

1. Prevent the blank-screen save-data failure and add recovery tests.
2. Fix and visually verify the Monkey Planet's mobile width.
3. Cancel pending level completion when leaving a level.
4. Define complete speech coverage per screen and extend the tests.
5. Replace generic wrong-choice feedback with mechanic-specific world feedback.
6. Define and implement a whole-game reduced-motion policy.
7. Add an appropriate pre-deploy test gate.
8. Refresh `docs/CODEBASE.md`.

After any shipped change, follow the repository rule to update `DESIGN.md` and
`README.md`, then run both the affected focused tests and the full suite.

## Additional architecture review

### Overall assessment

The repository has an appropriate technical foundation for its current size.
React, Vite, TypeScript and PixiJS are reasonable choices, the runtime dependency
set is small, and there is no reason to replace the framework or introduce a
global state library. The game has, however, reached the point where state,
lifecycle and domain responsibilities need to be separated before many more
mechanics are added.

The main structural risks are concentrated in `App.tsx`, `LevelScreen.tsx`,
`components/scenes.tsx`, `game/levels.ts` and the global `styles.css`. The best
next architectural step is a small reducer-based state model and feature-level
extraction, not a rewrite.

### High: application state permits impossible combinations

`src/App.tsx` stores `screen`, `currentLevel`, `lastResult` and station state as
independent values. This permits states such as `screen === 'result'` with no
result, or `screen === 'level'` with no level. Those cases currently fall through
to an empty render.

Use a discriminated union for the application state, for example:

```ts
type AppState =
  | { screen: 'map'; progress: Progress }
  | { screen: 'travel'; progress: Progress; level: Level }
  | { screen: 'level'; progress: Progress; level: Level }
  | { screen: 'result'; progress: Progress; result: LastResult }
  | { screen: 'station'; progress: Progress; party: boolean }
```

Move screen transitions into an `appReducer`. This is consistent with React's
official guidance to avoid contradictory state and to consolidate complex state
transitions in a reducer:

- https://react.dev/learn/choosing-the-state-structure
- https://react.dev/learn/extracting-state-logic-into-a-reducer

### High: level lifecycle ownership is fragmented

`src/components/LevelScreen.tsx` is about 489 lines and owns question position,
first-try scoring, retry state, several mechanic-specific animation states,
feedback, speech, navigation and multiple timers. The reproduced back-button
race is a direct consequence of lifecycle work being spread between event
handlers without a common cancellation boundary.

Extract a `useLevelSession` hook or reducer that owns:

- the current question and attempt state;
- first-try scoring;
- `answer`, `retry`, `advance`, `quit` and `complete` transitions;
- all session-level timers and their cancellation;
- one-shot completion so `onDone` cannot run after quit.

Mechanic-specific animation state should remain in the scene that renders the
mechanic. Navigation and scoring should not.

### High: question generation is coupled to persistence and global randomness

`genLevel10()` in `src/game/levels.ts` reads `localStorage` directly and repeats
the `rymddjuren-progress` storage key. This makes a domain generator depend on a
browser global, bypasses progress validation and makes deterministic tests harder.

Generators should accept the information they require:

```ts
generate({ progress, random })
```

or, for the specific adaptive level, accept the computed star weights. Put all
storage keys, parsing, validation, migrations and fallback behavior in one
`persistence.ts` module. Injecting the random function also removes the need for
tests to monkey-patch global `Math.random`.

### Medium: question rendering is not exhaustive

`LevelScreen.tsx` renders question types through a series of independent
`q.type === ...` expressions. Adding a new member to the `Question` union can
therefore compile while producing no mechanic on screen.

Introduce a `QuestionScene` component with an exhaustive `switch` and an
`assertNever` default. This keeps the discriminated union useful as a compile-time
guard.

### Medium: file ownership is becoming unclear

Current concentration points include:

- `src/components/scenes.tsx`: about 513 lines and six unrelated mechanics;
- `src/game/levels.ts`: about 579 lines and every planet's generation logic;
- `src/styles.css`: about 1,407 lines of global styling;
- `src/components/JumpScene.tsx`: about 470 lines;
- `src/components/LevelScreen.tsx`: about 489 lines.

Split by mechanic or feature while keeping the current technology. Do not add
CSS-in-JS or another state library solely to perform this cleanup. A reasonable
direction is:

```text
src/
  app/
    appReducer.ts
    persistence.ts
  game/
    session/
    questions/
    mechanics/
      number-line/
      sharing/
      balance/
      pattern/
  audio/
    speech.ts
    sound.ts
  i18n/
    sv.ts
```

### Medium: the test pyramid is inverted

The repository has 33 Playwright tests but no fast unit/property layer. The full
browser suite takes about 8.5 minutes and uses one fixed generated question set
per planet. Several helpers inspect CSS classes or internal DOM mutations.

Add fast deterministic tests for:

- every generator invariant and boundary;
- progress validation and migrations;
- unlocking and reward rules;
- app and level reducers;
- scoring, including second attempts;
- exhaustive question rendering.

Keep a smaller set of browser journeys for the child-visible behavior. Prefer
roles, accessible names and visible outcomes over implementation CSS selectors,
following Playwright's official guidance:

- https://playwright.dev/docs/best-practices

No new dependency may be added without owner approval. Evaluate whether the
existing toolchain is sufficient before proposing Vitest or another runner.

### Medium: supported browsers and devices are not defined

The Playwright configuration only exercises Chromium. The product is a tap-first
game for a young child and is likely to run on phones and tablets, where Safari,
WebKit, Web Audio, speech synthesis and canvas behavior can differ.

Document a supported-device matrix and add at least a WebKit smoke path. Perform
real-device checks on the intended iPhone/iPad or Android target before release.
Vite's current default production target is a modern-browser baseline, but that
does not replace a product support policy:

- https://vite.dev/guide/build

### Medium: service-worker cache updates are not guaranteed to finish

`public/sw.js` calls `cache.put(req, fresh.clone())` without awaiting or returning
the promise. The `respondWith` promise can therefore settle before the cache
write finishes, after which the worker may be terminated. The activate handler
also claims clients but never removes older cache versions.

Await the cache write inside the response promise and delete obsolete named
caches during activation. Add an offline browser test covering first load,
refresh without network and a cache-version upgrade.

Primary references:

- https://www.w3.org/TR/service-workers/
- https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching

### Medium: audio and speech need a product-level lifecycle

`src/game/sound.ts` creates an `AudioContext` but does not resume it if autoplay
policy leaves it suspended. Some pattern audio starts from an effect rather than
directly from a gesture. There is also no mute/volume control. The browser speech
code calls `getVoices()` synchronously but does not handle the list initially
being empty and later changing.

Create a small audio service or hook that:

- resumes Web Audio after a user gesture;
- exposes mute and an appropriate volume setting;
- cancels speech and scheduled audio when the screen changes;
- listens for `voiceschanged` and caches the selected Swedish voice;
- reports unsupported or blocked audio without breaking the maths;
- keeps `lang = 'sv-SE'` for Swedish browser speech.

Primary references:

- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event
- https://developer.chrome.com/blog/web-audio-autoplay

The OpenAI speech generator is correctly a development-time script. Never move
`OPENAI_API_KEY` into Vite client code or expose it through a `VITE_` variable.

### Medium: CI should be a release gate, not only a deploy mechanism

The Pages workflow has appropriately narrow permissions but publishes without
type-checking or running tests. Add a pre-deploy gate for TypeScript and a fast
production smoke suite. Consider pinning third-party GitHub Actions to full
commit SHAs because tags can move.

Primary references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/actions/reference/security/secure-use?learn=getting_started&learnProduct=actions
- https://docs.npmjs.com/cli/v11/commands/npm-audit/

## Accessibility review

### Current strengths

The product already makes several strong choices for this audience:

- no timer, death state or dexterity requirement;
- tap-only interaction and generally large controls;
- simple Swedish player text centralized in `src/i18n/sv.ts`;
- visual mathematical models and gentle second chances;
- no required canvas path because DOM fallbacks remain available;
- some reduced-motion handling;
- browser speech on question prompts;
- no drag-only interaction.

These choices align well with WCAG 2.2 target-size and dragging guidance and
with W3C cognitive-accessibility recommendations for short text, clear language,
predictability and error recovery:

- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements
- https://www.w3.org/TR/coga-usable/

### Gaps to address

There is no `aria-live`, `role="status"`, `role="alert"` or progressbar semantic
for dynamic level feedback. Ugglis messages can therefore appear visually
without being announced by assistive technology. Add an appropriate live region
and test repeated messages with a screen reader:

- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html

Focus appearance is not deliberately specified or covered by tests. Native
button outlines may currently help, but keyboard/switch focus should be verified
across supported browsers rather than assumed:

- https://www.w3.org/WAI/WCAG22/Understanding/focus-visible

Reduced motion is incomplete. Decorative travel rumble, shakes, bounces and
other animations continue even when reduced motion is requested. Separate
decorative movement from mathematically essential movement. Disable decoration;
for essential movement, provide a static or stepped presentation that preserves
the explanation:

- https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

## Privacy-oriented architecture review

### Current privacy posture is unusually good

No runtime external-network calls, accounts, advertising, analytics or telemetry
were found in `src/`. Progress and renderer preference remain in the browser, and
the service worker performs same-origin fetches. Preserve this data-minimizing
default unless a clearly justified feature requires otherwise.

`npm audit` reported zero known vulnerabilities for both production dependencies
and the full dependency tree on 2026-07-25. This is a point-in-time result, not a
security guarantee.

### Scope note

This is a private game, so legal and regulatory analysis is intentionally out of
scope for this handover. The recommendation to avoid accounts, telemetry and
unnecessary network calls is a product and maintenance choice, not a compliance
finding. Local progress should still be validated, versioned and recoverable for
technical robustness.

## Educational review

### Curriculum positioning

The current Lgr22 edition has applied since 1 August 2025. The national
mathematics curriculum groups central content for Years 1-3 rather than defining
a separate complete national Year 1 list.

The game covers a coherent early subset:

- natural numbers and representations;
- number-line movement;
- addition and subtraction within 20;
- number bonds, doubling and via-ten strategies;
- equality and missing values;
- simple numerical patterns;
- early sharing and grouping representations.

The Years 1-3 curriculum also includes other arithmetic, fractions, geometry,
measurement, statistics, probability, reasoning, methods and mathematical
communication. Therefore describe the product as practice informed by Lgr22,
not as complete Lgr22 coverage. Do not infer curriculum mastery from collected
stars or first-try accuracy.

Primary references:

- https://www.skolverket.se/sok-publikationer/publikationsserier/styrdokument/2025/laroplan-for-grundskolan-forskoleklassen-och-fritidshemmet---lgr22?id=13296
- https://www.skolverket.se/undervisning/grundskolan/laroplan-lgr22-for-grundskolan-samt-for-forskoleklassen-och-fritidshemmet/curriculums/LGR22/GRGRMAT01?hasSubjects=true&schoolType=GR&tosHeading=Kursplaner&v=5

### Intrinsic integration is the correct pedagogical anchor

The repository's central rule—that the maths must be the game mechanic rather
than a quiz placed next to the game—is well supported by the educational-game
research used in this review. Habgood and Ainsworth reported learning and
motivation benefits for intrinsically integrated mathematics gameplay compared
with less integrated forms for children aged 7-11:

- https://eric.ed.gov/?id=EJ922627

This makes the generic `choice` behavior more than a visual polish issue. If a
wrong number merely greys or shakes a button, the game loses the visible
cause-and-effect that explains the mathematics. Each such mechanic should show
what the selected value does in the world before offering the supported second
attempt.

The product already offers visual representation, Swedish speech and tap input.
Further user testing should include children with different language, attention,
motor and sensory needs. Multiple representations are helpful, but they should
not be assumed to prove usability without observing the intended audience:

- https://udlguidelines.cast.org/representation/language-symbols/multiple-media/

## Consolidated recommended order of work

1. Validate and migrate saved progress so corrupt data cannot blank the app.
2. Own and cancel all level-session timers; add the final-celebration quit test.
3. Fix and visually verify Monkey Planet width on a 430 px phone.
4. Make the service worker await cache writes and clean old cache versions.
5. Introduce discriminated app/level reducers and exhaustive question rendering.
6. Remove `localStorage` and global-random coupling from question generators.
7. Define complete visible-text speech coverage and a robust audio lifecycle.
8. Add live-region semantics, deliberate focus handling and whole-game reduced
   motion behavior.
9. Give generic choice mechanics intrinsic wrong-answer consequences.
10. Add fast domain tests, WebKit smoke coverage and a pre-deploy CI gate.
11. Split the largest files by mechanic after behavior is protected by tests.
12. Update `docs/CODEBASE.md`; update `DESIGN.md` and `README.md` only when the
    corresponding behavior actually ships.

## Final handover state

- The review itself did not modify application source, configuration or tests.
- A separate uncommitted one-character modification appeared afterward in
  `src/components/LevelScreen.tsx` around line 86: `/    setTimeout(() => {`.
  This is syntactically invalid TypeScript. It was not made or corrected by this
  review and must be resolved with the repository owner before further work.
- No dependencies were installed or changed.
- No API calls were made by the speech generator.
- The observed working-tree entries at final verification were:

  ```text
   M src/components/LevelScreen.tsx
  ?? docs/handover-senior-review.md
  ```

- The handover itself is English, as required for repository documentation.
- The next agent should first run `git status --short` and confirm the reviewed
  commit before implementing anything, because the repository may have changed
  after this review.
