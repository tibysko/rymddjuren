# Handover: two things the tests found but did not fix (Rymddjuren / matte-spel)

**Status: both are measured and reproducible, neither is decided.** They came out
of getting the Playwright suite running (`docs/handover-tester.md`) and were left
alone on purpose: one changes how a planet looks, the other may only exist in the
test browser. Both need Ola's call before anyone touches them.

Neither one fails `npm test` today. The suite is green with both present, so
nothing here is urgent — but nothing here will be noticed again either, unless
somebody reads this file.

## 1. The Monkey Planet scrolls sideways on a phone

`.jump-canvas` is 800 px wide inside a 430 px viewport, so the whole page can be
dragged sideways by 185 px while playing planet 3. The game is built for one-hand
phone play, so this is a real defect, not a cosmetic one.

Measured in the test browser at a 430×900 viewport:

```
document.documentElement.scrollWidth  615
document.documentElement.clientWidth  430
.jump-canvas        offsetWidth 800  offsetHeight 320
.jump-canvas canvas offsetWidth 800  offsetHeight 320
```

### Why

`src/styles.css` (`.jump-canvas`, around line 1360) sets a height but never a
width:

```css
.jump-canvas {
  position: relative;
  height: 320px;
  ...
  overflow: hidden;
}
```

`JumpScene.tsx` creates its Pixi app with `createPixiApp({ resizeTo: holder.current })`,
so the app is supposed to follow the holder. But the canvas element carries
Pixi's default intrinsic width of 800 px, and the holder has nothing telling it
to be narrower — the holder ends up sized by its content instead of by the
screen, and `overflow: hidden` never gets the chance to clip anything because
the box itself is the thing that is too wide.

### What to consider

Probably one line — `width: 100%` on `.jump-canvas` — but verify rather than
assume: with `resizeTo` pointing at the holder, the Pixi world will re-render at
the new width, and the level's camera/parallax (`worldW`, `viewW`, the `cam`
clamp in `JumpScene.tsx`) is computed from `app.screen.width`. Check that the
banana and the number line still fit and that the camera still follows the rabbit
on a narrow screen. A 430 px-wide canvas is a lot less room than 800.

This is why it was left undecided: it changes how the level looks, and that is a
design decision, not a bug fix.

### If you change it

The screenshot baseline for planet 3 will legitimately change (it is currently
615 px wide, which is itself a symptom). Look at the new picture, then:

```bash
npm run test:update -- tests/visual.spec.ts
```

and commit the new `tests/visual.spec.ts-snapshots/planet-03-chromium-darwin.png`.

## 2. The first star burst stalls the browser for about a second

The first time `cheerBurst()` fires — tapping an animal in the space station, or
the first correct answer in a level — the browser stops responding for roughly
1.1 s. Every later burst is instant.

This one comes with a caveat: **it was measured in headless Chromium with
software WebGL (SwiftShader), and has not been checked on a real phone.** A
device with a working GPU may pay a small fraction of this. Do not act on it
before measuring on the phone the game is actually played on.

### The measurements

Timing Playwright's individual mouse events on a station animal, first tap:

```
mouse.move    5 ms
mouse.down    7 ms
mouse.up   1109 ms      <- the click event
mouse.down   10 ms      (second tap)
mouse.up      3 ms
```

It is not JavaScript. Timing every click handler in the page, from a
capture-phase listener on `document` to a bubble-phase listener on `window`
(so React's own root listener is inside the window):

```
all click handlers   1.9 ms
```

It is not speech synthesis:

```
speechSynthesis.getVoices()  0.7 ms   (0 voices in headless)
new SpeechSynthesisUtterance + speak  0.1 ms
speechSynthesis.cancel()     0.1 ms
```

It is not requestAnimationFrame starvation — five consecutive rAF pairs took
25–33 ms each, before the tap.

Removing the effect layer from the DOM before tapping makes it vanish:

```
mouse.up with .space-backdrop removed   3 ms
```

So the cost is the compositor producing the first frame that actually draws the
burst — Pixi building its graphics and pipeline on first use. Chromium's
`Input.dispatchMouseEvent` does not acknowledge the click until that frame is
done, which is why it shows up as a slow `mouse.up` rather than as slow JS.

### Where it already bites

`tests/station.spec.ts` cannot assert the 700 ms `cheering` class on a first tap,
because the class is gone before the stalled `click()` even returns. The test
taps once to warm the burst up and then times the real one. That workaround is
commented in place — if the underlying cost goes away, the warm-up tap can go
with it.

### What to consider

If it turns out to be real on a phone: warm the burst up once while the star map
is idle, so the cost is paid before the child's first tap rather than on it. The
effect layer already exists by then (`SpaceBackdrop` registers itself through
`registerBurst()` in `src/game/fx.ts`), so this would be a burst of zero
particles, or a pre-build of whatever Pixi is lazily constructing.

Do not "fix" this by removing the star burst. It is one of the game's rewards.

## Constraints (unchanged)

The project rules stand above all of this: no timers, no death, no speed
requirements, one-hand play, very short simple Swedish for the player (all of it
in `src/i18n/sv.ts`, never hardcoded), big touch targets, everything readable
aloud, `prefers-reduced-motion` respected, no new dependencies without asking,
and never touch `_to_delete/`, `dist/` or `dist-single/`.

Finish with `npm test` green.
