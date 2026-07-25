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

## Generate speech files

The fixed Swedish voice lines can be generated as standalone audio files with
the OpenAI Speech API. This is an offline asset-generation tool only; generated
files are not currently used by the game.

```bash
export OPENAI_API_KEY="..."
npm run generate:speech -- --dry-run
npm run generate:speech
```

The command writes MP3 files to `generated-speech/`, skips existing files and
never sends the API key to the browser. Use `--force` to replace files,
`--speed 0.9` for slower speech or `--only feedback/cheer-` to generate a
subset. Run `npm run generate:speech -- --help` for model, voice, format and
output options. `--name` together with `--text` creates one ad hoc pronunciation
test. All production speech text is still sourced from `src/i18n/sv.ts`.

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
- [x] The space station is alive (`Station.tsx`): the animals float weightlessly and wiggle now and then, tapping one makes it bounce, burst into stars (`cheerBurst()`) and say its name out loud, the hull grows one lit module per animal above a "X av 10 djur bor här" counter, every card shows the stars earned on that planet framed in the planet's colour, Ugglis lives there with a 🔊 button and a line that follows the collection, the next animal is teased as a dark silhouette with a spoken riddle while the ones after it stay secret ❓, and a full station is greeted with a few seconds of golden rain
- [x] Ugglis has an original red-and-gold astronaut illustration, generated as a game asset and reused consistently on the map, in answer feedback, on the results screen and in the space station
- [x] The game tests itself (`npm test`, `tests/`): Playwright builds the production version, serves it and plays it in a phone-sized browser. A bot plays all ten planets from the first question to the results screen – it waits for each animation to finish, answers, and if Ugglis says "try again" it rules that answer out and picks another – while the tests watch for browser errors. On top of that come the rules of the space station and a screenshot of every screen. See [Tests](#tests).

## Tests

```bash
npx playwright install chromium   # once
npm test                          # everything, about five minutes
npm run test:ui                   # watch the bot play, step by step
npm run test:report               # the report from the last run
npm run test:update               # accept new screenshots after a deliberate change
```

- `tests/game.ts` – the save files to start from and the bot that plays a level.
  It only knows what the screen shows: the prompt says how many carrots to feed,
  the fox says which sum it wants, the seesaw has to be shared evenly, and
  everything else it works out by elimination (every question offers three
  choices, so at most three tries).
- `tests/planets.spec.ts` – one test per planet, played all the way through.
- `tests/station.spec.ts` – the rules of the space station.
- `tests/visual.spec.ts` – screenshots, taken with reduced motion asked for so
  the starfield does not move (and does not draw random numbers) between runs.
  The pictures live in `tests/visual.spec.ts-snapshots/` and belong in git; they
  are machine-specific (`…-chromium-darwin.png`).

The tests must never drive the game's design: if a test is awkward to write,
change the test, not the game.

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
