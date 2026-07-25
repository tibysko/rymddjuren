# Research: Rymddjuren as a platformer

*2026-07-18 · Groundwork for how we can give the game more of a platformer feel without losing the design rule about intrinsic integration (maths = the mechanic).*

## Summary

There are three realistic tracks, in increasing order of ambition. The recommendation is to build **track B** for the next planet and to save track C until we know it is needed.

**A. Building on today's model** – "choose a number → watch the consequence play out". No real-time controls, but more movement and more mechanic types per planet. Cheapest, zero new technology.

**B. Auto-movement with maths as the engine** – the rabbit runs/jumps by itself, but *how far* is governed by the number the child chooses. The child gets the platformer feel (speed, jumping over chasms, landing on platforms) without having to control it with skill. Can be built in the existing React app with a simple animation loop – no game engine required.

**C. A real platformer** – the child controls the rabbit with buttons/touch, physics and collisions, the maths embedded in the level (à la Math Duck). Requires a game engine (Phaser 3 or KAPLAY) embedded in React. Biggest wow factor, biggest job, and the biggest risk that motor skills – not maths – become the hard part.

## What the reference games actually do

**Math Duck** (Coolmath Games): a genuine mini platformer where the duck runs around and *collects digits* to complete equations (`3 + _ = 9` → find the box with 6), then takes the key and reaches the door. A 10-second timer per level and, later on, moving spikes. The maths is intrinsic: navigating to the right digit IS the answer. Lesson: the mechanic is excellent, but the timer and the spikes make it stressful – the wrong tone for 6–7-year-olds. ([Coolmath guide](https://www.coolmathgames.com/blog/how-to-play-math-duck), [the game](https://www.coolmathgames.com/0-math-duck))

**Jump Numbers** (Artgig): skip counting where the child jumps between numbers in sequence and "squashes together" digits to form the next number, in order to rescue creatures (Snortles) from danger. Adaptive difficulty. Two lessons from their development blog: they started with complex gestures for several operations and had to back off to the simple thing, and the children were engaged mainly by the *emotional connection* – they wanted to rescue the Snortles. We already have the animals; give them something to be rescued from/to. ([Artgig on the development](https://artgigapps.com/blog/finding-game-making-our-new-app-jump), [Common Sense review](https://www.commonsensemedia.org/app-reviews/jump-numbers))

**Monster Numbers** (Didactoons): alternates runner/platformer sequences with separate maths tasks between the segments. So it is partly a *cautionary example* by our design rule – the platformer part is the reward, the maths a gate. Fun game, but the maths is not the mechanic. ([Didactoons](https://www.didactoons.com/monster-numbers/))

**Zombie Division** (Habgood & Ainsworth 2011, already our design foundation): the attack IS the division – you defeat a zombie numbered 8 by striking with the "2". The model: the player's *verb* (jump, strike, feed) carries the maths.

## Research support for number line hopping

Good news: exactly what the Star Path does – hopping along a linear number line – has strong support. Number line training improves children's arithmetic and number sense ([number line training in classrooms](https://sciencedirect.com/science/article/abs/pii/S0079612322001911), [mental number line games](https://www.sciencedirect.com/science/article/abs/pii/S0022096522001084)), and the classic Siegler & Ramani study showed that *linear* (but not circular) number board games improve number sense in preschoolers ([the study](https://www.researchgate.net/publication/232563588_Playing_Linear_Number_Board_Games-But_Not_Circular_Ones-Improves_Low-Income_Preschoolers'_Numerical_Understanding)). Making the movement along the number line even more central is therefore pedagogically right, not just more fun.

## Motor skills & controls for 6–7-year-olds

NN/g's review of children's physical development gives clear boundaries ([the article](https://www.nngroup.com/articles/children-ux-physical-development/)):

- Works: tapping **large targets (at least 2×2 cm)**, simple swipes, simple arrow keys on a computer.
- Doesn't work: precision dragging, small buttons, **two-handed coordination** (e.g. left hand steers + right hand jumps = classic platformer controls!), and **fast reactions to visual stimuli**.

That last one is the core argument against track C as a first choice: a classic platformer requires exactly what 6–7-year-olds are worst at (timing + two-handed control), and then the game risks measuring motor skills instead of maths. If we do want controls anyway: **one-button control** (tap anywhere = jump, à la auto-runners) is the established solution for this age group.

## Track B in detail (the recommendation)

Core idea: turn today's `answerHop` principle into a *side-scrolling adventure*. The rabbit moves automatically along a level with platforms, chasms and a goal. At each obstacle it stops and the child chooses a number – the number literally becomes the length/force of the jump:

- **The Monkey Planet (plus 0–10):** ravines in the level. "Du står på 4, lianen hänger vid 9 – hur långt hopp?" If the child picks 3, the monkey/rabbit swings and lands visibly in thin air at 7, dangles and climbs back. Addition = a forward jump, just like the Star Path but with gravity and scenery.
- **The Comet Party (minus 0–10):** hop *down* the steps of the comet's tail – subtraction as backwards/downwards movement.
- **The Twin Planet (doubles & halves):** trampolines that double the jump – "du hoppar 3, studsmattan ger dubbelt – var landar du?"
- **The Giant Planet (plus & minus 0–20):** longer levels that chain several jumps: "hoppa 5 fram, sedan 2 bak" – multi-step tasks as a level, not as a question.

Technically the existing stack is enough: a `requestAnimationFrame` loop or CSS transitions for the movement (like today's `setInterval` hop, only smoother), absolutely positioned elements or a single `<canvas>`. No game engine, no new dependency, everything reuses the `Question` types and the star logic.

## Track C in detail (if we want to step it up later)

If we want genuine controls and physics, the established pattern is to embed **Phaser 3** in React – there is an official template for exactly our stack: [phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts) (Vite + TypeScript + an EventBus for communication between the React UI and the game scene). React keeps the menus/star map/results; Phaser owns only `LevelScreen`. ([Official announcement](https://phaser.io/news/2024/02/official-phaser-3-and-react-template))

Lightweight alternative: [KAPLAY](https://kaplayjs.com/) – the successor to Kaboom.js (Kaboom is archived by Replit; KAPLAY is the actively maintained fork with [its own roadmap for 2026](https://github.com/kaplayjs/kaplay/wiki/KAPLAY-Roadmap-2026)). A simpler API than Phaser, built for small arcade games – a good match for our scale if we go this way.

Design requirements if we build C, given the motor skill boundaries: one-button control (tap = jump), no timer, no death – a wrong jump gives, as today, a visible, understandable "oops!" and a new chance, and the maths decides *where* you can jump (digit collecting à la Math Duck) rather than dexterity deciding whether you clear the level.

## Suggested next steps

1. Build the Monkey Planet (planet 3) as a track B prototype: side-scrolling scene, ravine jump, addition as jump force.
2. Test with the target audience (one 6–7-year-old goes a long way) – does the "visibly wrong" feedback land even with gravity?
3. Then decide whether track C/Phaser is needed, or whether B gives enough of a platformer feel.
