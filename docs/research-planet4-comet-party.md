# Research: the Comet Party (Kometkalaset, planet 4) – subtraction 0–10

*2026-07-19 · Groundwork for the next level, in the same spirit as docs/research-platformer.md. Builds on track B from the Monkey Planet: the chosen number = the force/length of the movement.*

## Summary

Subtraction is not "addition backwards with the same mechanic" – the research says that **counting backwards is markedly harder than counting forwards** for 6–7-year-olds, and that subtraction has **several meanings** (take away, compare/difference, completion) that the child needs to meet. The recommendation is therefore that the Comet Party gets **three mechanics that are the same subtraction seen from three directions**:

1. **The comet stairs** (take away as backwards movement) – the direct heir to the ravine jump
2. **The party table** (take away as visible eating) – "vem åt upp godiset?", the theme from DESIGN.md
3. **The difference hop** (completion – counting *up*) – the strategy the research actually recommends most

All three can be built with the existing stack and reuse the pattern from `JumpQuestion`/`HopQuestion`.

## What the research says about subtraction

**Counting backwards is hard.** Everyone – children and adults alike – counts more reliably forwards than backwards, and children make considerably more errors when counting backwards. That is why "counting up" (counting up from the smaller number) is the recommended strategy when the numbers are close together, and also as a support strategy for children with mathematical difficulties. Seeing subtraction as "which number is missing?" addition gives the child access to the easier forward direction. ([Langford: Counting strategies](https://langfordmath.com/ECEMath/BasicFacts/CountingStrategiesText.html), [the progression addition→subtraction](https://gfletchy.com/2016/03/04/the-progression-of-addition-and-subtraction/))

Consequence for us: the level must not *only* train counting backwards. The comet stairs (backwards) need to be complemented by the difference hop (upwards) – otherwise we mostly train the error-prone approach.

**Subtraction has several faces.** Swedish didactics (e.g. Majema's teaching materials and NCM) distinguishes between *take away* ("3 sweets get eaten – how many are left?"), *compare/difference* ("how many more does the parrot have?") and *completion* ("how many are missing up to 8?"). A classic misconception that takes root early is that you "flip the numbers around" when it doesn't work out – the antidote is solid number sense around "you can't take away more than you have", built on concrete materials. ([Majema on subtraction](https://www.majema.se/blogs/lektioner-matematik/subtraktion-ett-av-de-fyra-raknesatten), [NCM/McIntosh, ch. 20](https://ncm.gu.se/media/ncm/matematiklyftet/TH05A_04_mcintosh_kap20x.pdf))

**The number line still holds.** The same support that carried the Star Path carries subtraction as movement along the line too: linear number games and number line training improve arithmetic and number sense ([Siegler & Ramani](https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/sieg-ram08.pdf), [number line training in classrooms](https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0079612322001911), [mental number line games](https://www.sciencedirect.com/science/article/abs/pii/S0022096522001084)). One detail worth remembering from "You learn what you encode": children learn what they actually *do* – if they count the steps out loud when the monkey jumps, the number sequence is reinforced. Let Ugglis count the hops out loud ("åtta … sju … sex!").

## What the reference games do

**Motion Math: Hungry Fish** – the child's fish wants a number; number bubbles are dragged together to form it (5 can become 12 when dragged together with −7 at higher levels). The lesson for us is not negative numbers (too hard) but **the verb**: *feeding* is the mechanic, and the fish reacts immediately to a right/wrong combination. That rhymes perfectly with our "feed the animals" concept – the parrot can be the one that eats. ([Common Sense review](https://www.commonsensemedia.org/app-reviews/motion-math-hungry-fish))

**DragonBox Numbers (Kahoot! Numbers)** – the numbers are creatures ("Nooms") that can be smooshed together and **cut apart**. Subtraction is literally splitting a creature into pieces – decomposition as a physical act. In Run mode the jump height equals the number, exactly like our track B. Lesson: *taking apart* a number is at least as good a bodily metaphor for subtraction as walking backwards. ([Games for Young Minds on DragonBox Numbers](https://www.gamesforyoungminds.com/blog/2018/3/16/dragonbox-numbers))

**Math Duck** – already analysed in the previous research: navigating to the right digit IS the answer (`9 − _ = 3` → fetch the 6). The mechanic is excellent but the timer makes it stressful; without a timer, "fetch the missing number" would be a nice variant of completion tasks. ([Coolmath guide](https://www.coolmathgames.com/blog/how-to-play-math-duck), [the game](https://www.coolmathgames.com/0-math-duck))

## Proposal: three mechanics for the Comet Party

Theme from DESIGN.md: a party on the comet, 🦜 the Star Parrot (Stjärnpapegoja), "vem åt upp godiset?". Dark space, sweets in yellow/red.

### 1. The comet stairs – subtraction as downward movement (heir to the ravine jump)

The comet's tail is a staircase with the numbers 10→0. The rabbit stands on a number high up, the bag of sweets lies on a lower step. "Du står på 9, godiset ligger på 5 – hur många steg ner?" The chosen number = the number of steps the rabbit bounces down. Too few steps → the rabbit stops visibly above the sweets and peers down; too many → it bounces past (never below 0 – the stairs end there, which *shows* that you can't take away more than you have). Ugglis counts the steps out loud backwards. This is `JumpQuestion` with the sign reversed plus staircase scenery.

### 2. The party table – take away as visible eating

The party table is laid with, say, 7 sweets. The parrot flies in and eats 3 of them, one at a time, with sound and crumbs – *taking away becomes a visible event, not a digit*. Then: "Hur många är kvar?" A wrong answer → the second chance shows the eaten ones as pale outlines so the child can count both what's left and what's gone (à la the dot help on the Rabbit Planet). This is essentially a `FeedQuestion` in reverse and gives the level variety without any new technology. The Hungry Fish lesson: the parrot should react immediately – a satisfied burp when right, a confused head tilt when wrong.

### 3. The difference hop – counting up (the completion strategy)

The same staircase, but now the rabbit stands *down* by the sweets on 5 and the parrot sits on 8: "Hur många hopp upp till papegojan?" The child practises 8 − 5 = 3 as "from 5 up to 8" – exactly the counting up strategy the research recommends – without the screen ever saying "subtraction". Mechanically it is `HopQuestion` forwards in a staircase setting; pedagogically it is the bridge to planet 6 (number bonds) and 7 (which term is missing).

### Mix

Proposal: ~4 comet stairs + 3 party tables + 3 difference hops per round, so that counting backwards never dominates. All answers lie in 0–10, differences mostly 1–5 (bigger "distances" make counting backwards disproportionately hard at the start of Year 1).

## Tech

Everything fits in the existing stack, no new dependencies: the comet stairs and the difference hop reuse the `JumpQuestion`/`HopQuestion` patterns (a new `stair` variant in `types.ts`, generators in `levels.ts`), the party table is a reversed `FeedQuestion` with an eating animation in the style of today's jump animation. The staircase is drawn as absolutely positioned steps, exactly like the ravine scene.

## Suggested next steps

1. Build the comet stairs first – it is the smallest step from planet 3 and gives recognition ("same game, new planet").
2. Add the party table for variety and the difference hop for counting up.
3. Test with the target audience: does she understand that "steps down" means minus without anyone saying the word minus? Does she count out loud along with Ugglis?
4. Save the comparison meaning ("how many more?") for planets 5–6 – three meanings at once is too much.
