# The Maths Game

A maths game for a 7-year-old starting Year 1, built with React + Vite + TypeScript.

A technical overview of the architecture, game flow, question types and how to add
a new mechanic can be found in [docs/CODEBASE.md](docs/CODEBASE.md).

## Getting started

```bash
npm install
npm run dev
```

Then open the address that appears (usually http://localhost:5173).

## Play on the phone (GitHub Pages)

The game is published automatically on every push to `main`: the
`.github/workflows/pages.yml` workflow builds the single-file build (`npm run build:single`)
and publishes `play.html` as the start page on GitHub Pages.

- Address: `https://<github-username>.github.io/rymddjuren/`
- Save the address as an icon on the phone's home screen ("Add to Home Screen")
  and it works like an app
- `npm run build:single` also creates `play.html` locally – the whole game in one
  file that works without a server

## What should the game practise? (Lgr22, Year 1)

Based on the Swedish National Agency for Education's maths syllabus (Lgr22, core
content for Years 1–3) and the Year 1 assessment support material for number sense:

- **Number sense** – the number line 0–20 (counting forwards/backwards), linking quantity to numeral, a number's neighbours
- **Addition & subtraction** – first within 0–10, then 0–20
- **Number bonds** – splitting numbers, e.g. 7 = 3 + 4
- **The meaning of the equals sign** – "which term is missing?", e.g. 3 + _ = 7
- **Doubles and halves** – proportional relationships
- **Patterns and number sequences** – simple number sequences and geometric patterns
- **More/fewer** – comparing quantities and numbers

## Design principles

- The player can read **very simple sentences** – all instructions are short and simple, e.g. "Hur många?" or "Vilket tal fattas?"
- Large text, large buttons, more picture than text
- A speaker button 🔊 that reads the instruction aloud (Swedish speech synthesis)

## Plan (built step by step)

- [x] Project skeleton (Vite + React)
- [x] Star map / level structure with rewards (see DESIGN.md)
- [x] Planet 1: the Rabbit Planet (Kaninplaneten) – count quantities + feed the rabbit
- [x] Planet 2: the Star Path (Stjärnstigen) – the number line 0–20 (the rabbit hops exactly as many hops as the child picks – a wrong answer lands visibly wrong on the number line, a correct answer lands on the star)
- [x] TypeScript migration
- [x] Planet 3: the Monkey Planet (Apornas planet) – ravine jumping where the chosen number = the power of the jump (plus 0–10, "track B", see docs/research-platformer.md)
- [x] Planet 4: the Comet Party (Kometkalaset) – minus 0–10 in three ways: the comet stairs going down (taking away as backward movement, the stairs stop at 0), the party table (the parrot visibly eats up the sweets – "hur många är kvar?") and the stairs going up (counting up/filling in, see docs/research-planet4-comet-party.md)
- [x] Planet 5: the Twin Planet (Tvillingplaneten) – the seesaw tips towards the heavier side when you share equally, the trampoline doubles the jump, the mirror pond shows double (see docs/research-planet5-10.md)
- [x] Planet 6: the Friend Planet (Kompisplaneten) – pair up two piles to make the fox's number (number bonds) + the ten-friend bridge (ten-frame as a bridge)
- [x] Planet 7: the Scale Planet (Vågplaneten) – the balance scale IS the level, the formats are rotated (3 + _ = 7 and 7 = 3 + _) so that the equals sign means "the same amount", not "here comes the answer"
- [x] Planet 8: the Pattern Belt (Mönsterbältet) – the horse gallops in the pattern (every colour is a note – you can hear the pattern!), number sequences and "which piece repeats?"
- [x] Planet 9: the Giant Planet (Jätteplaneten) – giant jumps in two steps via the rest station at ten (bridging through ten) on the number line 0–20
- [x] Planet 10: the Party Planet (Festplaneten) – mixed challenge with questions from all the planets, adaptively weighted towards the planets that have earned the fewest stars; party lanterns light up for every correct answer
- [x] GPU rendering with PixiJS v8 (WebGPU with automatic WebGL fallback, see docs/research-webgpu.md): the starfield behind the game + golden rain on the results screen, and the Monkey Planet as a real canvas level with camera and parallax
- [ ] More animals/animations in the space station

## GPU rendering (WebGPU/WebGL)

Two things are drawn with PixiJS v8 (`src/game/pixi.ts` picks the renderer):

- **The effect layer** (`SpaceBackdrop.tsx`): a starfield twinkling behind the whole
  game, with shooting stars and comets on the star map, hyperspace streaks
  during the rocket trip to a planet, a star explosion on every correct answer
  (`cheerBurst()` in `src/game/fx.ts`) and a rain of gold/red stars when a planet
  is completed. Pure decoration – `pointer-events: none`, respects
  `prefers-reduced-motion`.
- **The Monkey Planet** (`JumpScene.tsx`): the ravine jump as a canvas level with a
  smooth camera and parallax. Buttons, Ugglis and 🔊 stay in the DOM.

Robustness: WebGPU is tried first with a "canary render"; if that fails
(or if WebGPU crashes later at runtime) the game switches to WebGL and
remembers the choice in localStorage. If neither works, the jump level falls back
to the old DOM version – the maths always works. Force a renderer with
`?renderer=webgl` or `?renderer=webgpu` in the address bar; the console logs
which one is in use.
