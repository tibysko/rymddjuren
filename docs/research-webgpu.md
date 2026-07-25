# Research: WebGPU in Rymddjuren

*2026-07-19 · Groundwork for how (and whether) the game can use WebGPU. Today's game renders everything with React DOM + CSS – no canvas at all.*

> **Update the same day:** Ola chose track 2 (PixiJS v8) – and we built both
> the effect layer AND the Monkey Planet as a Pixi level. See `src/game/pixi.ts`,
> `src/components/SpaceBackdrop.tsx` and `src/components/JumpScene.tsx` as well as
> the "GPU rendering" section in README.md. Two practical lessons from the build:
> `generateTexture` was unreliable in some WebGPU environments (so we draw with
> Graphics/Text directly), and init can succeed even though rendering crashes later –
> which is why there is a canary render at startup plus a runtime guard that switches
> to WebGL and remembers the choice in localStorage.

## Summary

WebGPU is ready to use in 2026, but it is a **low-level API for the graphics card** – it does not replace React/DOM, it replaces WebGL/canvas. Since Rymddjuren today has no canvas at all, the question is really two questions:

1. **Does the game need GPU rendering?** For today's mechanics: no. Emoji + CSS animations handle everything we do, with perfect accessibility (real buttons, read-aloud, large text).
2. **Where would WebGPU actually help?** As an **effect layer**: starfields with thousands of stars, particle showers when cheering, comet tails – things the DOM is bad at. There are three tracks for that:

**Track 1 (the recommendation): raw WebGPU as a decorative background layer.** A single `<canvas>` behind the game with a starfield/particles, hand-written in WGSL. Zero new dependencies (fits our rule), and the game works exactly as it does today if WebGPU is missing – the canvas is pure icing. A sensibly sized learning project: ~150–250 lines.

**Track 2: PixiJS v8 if we move game scenes to canvas.** If the track B platformer levels (see [research-platformer.md](research-platformer.md)) ever outgrow the DOM, PixiJS v8 is the right tool: a 2D engine built for both WebGPU and WebGL with automatic fallback. A new dependency (~450 kB) – requires a decision.

**Track 3: Three.js/Babylon (3D).** Rejected – 3D is the wrong level of ambition for this game and this audience.

Note: **Phaser 4** (released in spring 2026) chose WebGL2, not WebGPU – a sign that the 2D game world does not consider WebGPU necessary yet.

## What WebGPU is – and isn't

WebGPU is the successor to WebGL: a modern API that talks directly to the graphics card via Metal (Apple), Direct3D 12 (Windows) and Vulkan (Linux/Android). Shaders are written in a new language, **WGSL**. Its strength is large quantities of identical objects (particles, sprites) and compute shaders – computations on the GPU.

What WebGPU does *not* give us: buttons, text, layout, read-aloud, focus handling. Everything drawn in a canvas is pixels – invisible to screen readers and impossible to turn into tap targets without a lot of extra work. **Therefore, whichever track we take: all interaction (answer buttons, 🔊, Ugglis' text) stays in the DOM. The GPU only gets to paint what is beautiful, never what is clickable.**

## Browser support (July 2026)

| Browser | Status |
|---|---|
| Chrome/Edge | ✅ Since v113 (2023), Android too |
| Safari (macOS/iOS/iPadOS) | ✅ Since Safari 26 / iOS 26 (autumn 2025) |
| Firefox | ✅ Windows since 141 (July 2025), Mac since 145/147; Linux on the way during 2026 |

Global support around **84 %** according to caniuse. Conclusion: good enough for *progressive enhancement*, not good enough to require. The family Mac (Safari 26+/Chrome) can handle it; an older school tablet perhaps not. `play.html` is shared as a file and must therefore always work without it.

The fallback ladder is simple:

```ts
if (navigator.gpu) {
  const adapter = await navigator.gpu.requestAdapter()
  if (adapter) { /* start the WebGPU layer */ }
}
// otherwise: do nothing – the CSS stars stay exactly as they are today
```

## Track 1 in detail: an effect layer with raw WebGPU

Core idea: a fixed-positioned `<canvas>` at the very back (`z-index` below `.app`, `pointer-events: none`), with a particle system that changes mode according to the game's state:

- **The star map:** a deep starfield, 5,000–20,000 stars at different speeds (parallax) – impossible with DOM elements, trivial for a GPU.
- **Correct answer/cheering:** a golden-yellow particle shower/fireworks (the player's colours: red & yellow!).
- **Rocket travel between planets:** the stars streak past.
- **Wrong answer:** nothing in particular – the effects should celebrate, never punish.

Technically in our stack:

- A React component `<SpaceBackdrop mode="map" | "cheer" | "travel" />` with `useEffect` + `ref` that owns the whole WebGPU lifecycle (adapter → device → context → render loop with `requestAnimationFrame`). React never touches the canvas after startup – the mode is passed in via a mutable ref, not a props re-render.
- WGSL shaders as ordinary TS strings (or a `?raw` import in Vite) – works automatically in `build:single`/`play.html` since everything ends up as inline JS. **Size impact: ~0 kB of dependencies.**
- Types: if TS complains about `navigator.gpu`, add `@webgpu/types` as a *dev* dependency (types only, no runtime code).
- Important for the target audience: `prefers-reduced-motion` must switch the layer off, and the particles must never compete for attention with the task – muted on LevelScreen, festive on ResultScreen.

Pitfalls to be aware of: `device.lost` has to be handled (the GPU can be taken away from the tab – in which case we just turn the layer off), canvas size × `devicePixelRatio` has to be set manually, and Safari/Firefox still have small implementation differences – test in at least two browsers.

## Track 2 in detail: PixiJS v8 (if game scenes move to canvas)

PixiJS v8 (2024) is the established 2D renderer with genuine WebGPU support. `autoDetectRenderer({ preference: 'webgpu' })` picks WebGPU where it exists and falls back to WebGL otherwise – exactly the robustness we need. Pixi's own documentation does, however, call the WebGPU renderer "more performant, still maturing" and recommends WebGL for production – so even with Pixi, WebGPU becomes an option rather than the foundation.

When this track becomes relevant: if a track B level wants smoothly scrolling cameras, hundreds of sprites and parallax layers at the same time as the DOM starts stuttering. We are not there – today's scenes (the seesaw, the balance scale, the gallop track) are ~10 elements each.

Cost: a new runtime dependency (~450 kB minified, noticeable in `play.html`), a new mental model (a scene graph instead of JSX for the play area), and the buttons still have to stay in the DOM on top. There is `@pixi/react`, but at our scale a plain Pixi app mounted with `useEffect` is simpler.

## Why not…

- **Three.js WebGPURenderer / react-three-fiber:** mature and stable in 2026, but 3D. The wrong tool for a 2D emoji game, a big dependency, and 3D space risks shifting focus from the maths to the graphics.
- **Babylon.js:** the same thing, even bigger.
- **Phaser 4 / KAPLAY:** relevant to track C in the platformer research, but they don't give us WebGPU (Phaser 4 is WebGL2; canvas mode discontinued) – so they don't answer this question.
- **Compute shaders (physics on the GPU):** cool, but our game has ~1 moving animal at a time. GPU physics solves a problem we don't have.

## Audience and design requirements (apply to all tracks)

- No mechanic may require the canvas: the maths, the buttons and the read-aloud work identically without WebGPU. The effect layer is reward and atmosphere – never information needed to solve the task.
- A wrong answer must still be visible in the *game world* (the seesaw tips) – that is the DOM scenes' job and is not changed by any of this.
- Respect `prefers-reduced-motion` and keep the particle count down on the task screen.
- Battery: a constant render loop draws power on a laptop – pause the loop when the tab is hidden (`visibilitychange`) and when nothing is animating.

## Suggested next steps

1. Build track 1 as a prototype: `<SpaceBackdrop>` with a starfield behind the star map + a golden shower on ResultScreen, with a `navigator.gpu` guard and reduced-motion support.
2. Test on the family Mac in both Safari and Chrome, and verify that `play.html` still works entirely without WebGPU (e.g. with the flag turned off).
3. Show it to the player – does the star shower become a bigger reward than today's CSS confetti? If yes, keep it; if it steals focus, tone it down.
4. Reconsider PixiJS the day a track B level actually stutters in the DOM.

## Sources

- [caniuse: WebGPU](https://caniuse.com/webgpu) · [gpuweb Implementation Status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) · [web.dev: WebGPU in all major browsers](https://web.dev/blog/webgpu-supported-major-browsers)
- [Mozilla: Shipping WebGPU on Windows in Firefox 141](https://mozillagfx.wordpress.com/2025/07/15/shipping-webgpu-on-windows-in-firefox-141/)
- [PixiJS v8: renderers-guide](https://pixijs.com/8.x/guides/components/renderers) · [PixiJS v8 launch](https://pixijs.com/blog/pixi-v8-launches) · [PixiJS React v8](https://pixijs.com/blog/pixi-react-v8-live)
- [Phaser 4 renderer (WebGL2)](https://phaser.io/news/2026/04/phaser-4-renderer-faster-cleaner-and-built-for-modern-games)
- [Three.js WebGPURenderer manual](https://threejs.org/manual/en/webgpurenderer.html)
