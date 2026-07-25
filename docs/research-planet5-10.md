# Research: planets 5–10 – mechanic proposals for the rest of the journey

*2026-07-19 · Groundwork in the same spirit as docs/research-platformer.md and docs/research-planet4-comet-party.md. The basic rule applies everywhere: the maths IS the mechanic, a wrong answer gives a visible, understandable result in the game world.*

## Summary

Every planet gets its own "verb" that carries the maths, just as the jump carries addition on the Monkey Planet and the stairs carry subtraction on the Comet Party:

| Planet | Verb | The maths becomes… |
|---|---|---|
| 5. The Twin Planet | **share & bounce** | the seesaw tips if it isn't equal |
| 6. The Friend Planet | **pair up** | two piles merge into the target |
| 7. The Scale Planet | **weigh** | the scale visibly tips the wrong way |
| 8. The Pattern Belt | **gallop in rhythm** | the horse stops when the pattern breaks |
| 9. The Giant Planet | **jump via 10** | a two-step jump with a resting place on the ten |
| 10. The Party Planet | **celebrate everything mixed** | every correct answer lights up the party |

All of it can be built in the existing stack without new dependencies (the seesaw and the balance scale are the same new scene; sound can be done with the browser's built-in WebAudio).

---

## Planet 5: the Twin Planet (Tvillingplaneten) 🐼 – doubles and halves

**The research:** young children have a strong intuition for fair sharing long before formal mathematics – "sharing equally" is one of the first mathematical concepts they master in action ([fair sharing as an informal foundation for division](https://www.sciencedirect.com/science/article/abs/pii/S0959475221000190), [children's sharing strategies](https://files.eric.ed.gov/fulltext/ED583729.pdf)). Doubles/halves should therefore start in the *sharing*, not in the numbers.

**Mechanic 1 – The seesaw (halves):** the twin pandas sit at either end of a seesaw. A pile of bamboo sticks (say 8) is to be shared – the child taps to move sticks across to the pandas, one at a time. The seesaw tips ALL THE TIME towards the heavier side, so the imbalance is both seen and felt. Equal numbers → the plank is level, the pandas cheer. A wrong answer is impossible to miss: the plank is tilting! (This also prepares exactly the equality idea of the Scale Planet.)

**Mechanic 2 – The trampoline (doubles):** the comet stairs get a trampoline – the rabbit jumps the number the child chooses, the trampoline gives *double*. "Du vill till 8 – vad ska du hoppa?" If the child picks 3 the rabbit bounces to 6 and lands visibly wrong. The idea comes straight from the track B research and reuses the staircase scene.

**Mechanic 3 – The mirror pond (doubles as an image):** X stars are reflected in the pond – "hur många ser du totalt?" Doubling as a visual structure (two equal parts), not as a counting rule.

## Planet 6: the Friend Planet (Kompisplaneten) 🦊 – number bonds

**The research:** the part–whole model (number bonds) and ten frames are the standard tools for decomposing numbers ([ten frames + number bonds](https://teachablemath.com/ten-frames-number-bonds/)), and the ten-friends are the hub of Swedish Year 1. The reference game is Motion Math: Hungry Fish – combining two bubbles into the fish's desired number IS a number bond mechanic ([review](https://www.commonsensemedia.org/app-reviews/motion-math-hungry-fish)).

**Mechanic 1 – Feed the fox:** the Star Fox wants exactly 7 🍇. Bunches of grapes with 2, 3, 4, 5... float on the screen. The child picks TWO bunches that are pulled together and merge – if it makes 7 the fox eats happily; if it makes 6 the fox sniffs, shakes its head and the bunches split apart again (visibly wrong: you SEE that the pile is too small/large against the fox's thought bubble with 7 dots). All the decompositions of the same number show up: 7 = 3+4 = 2+5 = 1+6.

**Mechanic 2 – The fox den's two entrances:** 6 fox cubs are to go into two dens, in every possible way. The child sends them in one by one – every distribution that gets covered is ticked off as a "friend pair". The same number, many decompositions = the core of part–whole.

**Mechanic 3 – The ten-friend bridge:** a bridge of 10 planks where X are already in place – how many are missing? A ten frame as the playing field; the answer is fetched as planks (à la Math Duck's "fetch the missing number", without a timer).

## Planet 7: the Scale Planet (Vågplaneten) 🦎 – the equals sign

**The research:** the single most important insight for Year 1: children often learn that `=` means "here comes the answer" (an operational interpretation) instead of "the same amount on both sides" (relational). Relational understanding in Year 2 predicts algebra competence in Year 4 ([Keys to the Gate](https://files.eric.ed.gov/fulltext/ED514405.pdf), [research overview](https://www.cambridgemaths.org/Images/espresso_34_the_equal_sign.pdf)). The antidotes: balance scales ([classroom study](https://sree.memberclicks.net/assets/conferences/2020s/abstract/poster/404_identified.pdf)) and *unusual formats* (8 = 3 + _, not just 3 + 5 = _). DragonBox Algebra 5+ shows that even 5-year-olds can handle balance thinking when it is a game ([the game](https://dragonbox.com/products/algebra-5)).

**Mechanic – The scale IS the level (reuse the seesaw from planet 5):** the Space Lizard stands on a balance scale. Left side: a basket with 3 + 4 stones. Right side: a basket with 5 stones and one empty slot. "Gör lika!" The child picks a stone (1–6) for the slot – the scale visibly tips towards the heavy side on a wrong choice, the lizard slips and clings on (harmless and funny – nobody falls off). The right stone → the scale is level, the lizard strikes a balancing pose.

**The formats are rotated deliberately:** `3 + _ = 7`, but just as often `7 = 3 + _` and eventually `2 + 5 = 4 + _`. Ugglis always says "lika mycket på båda sidor!" – never "vad blir svaret".

## Planet 8: the Pattern Belt (Mönsterbältet) 🐴 – patterns and number sequences

**The research:** patterning ability at age 5 predicts mathematical ability at 11, and the recommended progression is copy → continue → translate into another material → find the unit that repeats ([The Education Hub on patterns](https://theeducationhub.org.nz/the-role-of-pattern-in-childrens-early-mathematical-understanding/), [patterning in preschool predicts mathematics](https://www.sciencedirect.com/science/article/abs/pii/S0022096520304197)).

**Mechanic 1 – The gallop track:** asteroids lie in a pattern: 🔴🟡🔴🟡🔴❓. The Star Horse gallops automatically across them in rhythm and stops at the question mark – the child picks the next asteroid, and the horse literally jumps onto the chosen one. Wrong → the asteroid bobs away and the horse stays put and snorts (the pattern "doesn't carry"). Right → the gallop continues in rhythm. **Bonus: the pattern can be HEARD** – each colour is a tone (WebAudio), so red-yellow-red-yellow becomes a melody. That is the research's "translate the pattern into another material" built into the game.

**Mechanic 2 – Growing stairs:** number sequences as steps: 2, 4, 6, ❓ – reuses the comet stairs, the jump lands on the chosen number, and a staircase that is too low is immediately visible.

**Mechanic 3 – Find the unit:** "vilken bit upprepas?" – pick the right package (🔴🟡 vs 🔴🔴🟡). The last and hardest step in the progression; save it for the end of the level.

## Planet 9: the Giant Planet (Jätteplaneten) 🦁 – addition & subtraction 0–20

**The research:** the key to 0–20 is *bridging through ten*: 8 + 5 is worked out as 8 + 2 + 3, with the ten-friends as the tool ([NCETM on bridging 10](https://www.ncetm.org.uk/classroom-resources/primm-111-addition-and-subtraction-bridging-10/), [Maths with Mum](https://www.mathswithmum.com/bridging-to-ten/)). The Friend Planet (6) is thus the prerequisite – here it picks up speed.

**Mechanic 1 – The giant staircase with the resting ten:** the staircase/number line 0–20 where the number 10 is a glowing rest stop (a little mountain with a flag). Big jumps are made in TWO steps: "8 + 5 – hoppa först till tian!" The child picks the first jump (2) and then the rest (3). The multi-step task is a level, not a question – exactly the Giant Planet idea from the track B research. A wrong first jump → the rabbit lands beside the rest stop and Ugglis gives a hint: "hoppa till tian först!"

**Mechanic 2 – Chained missions:** "hoppa 5 fram, sedan 2 bak" – the lion's obstacle course chains plus and minus in the same run. Reuses HopQuestion/StairQuestion as-is, just a longer line.

**Mechanic 3 – The lion's double stride:** the doubles as anchor facts: 6+6, 7+7 – and from there 6+7 ("double plus one"). Ties planet 5 together with 0–20.

## Planet 10: the Party Planet (Festplaneten) 🐘 – the big mixed challenge

**The research:** mixed practice (interleaving) gives dramatically better long-term learning than blocked practice – in Rohrer's classroom studies roughly twice as good on delayed tests – because the child has to *choose a strategy*, not just repeat the most recent one ([Interleaved Practice Improves Mathematics Learning](https://files.eric.ed.gov/fulltext/ED557355.pdf), [Rohrer's practice guide](http://uweb.cas.usf.edu/~drohrer/pdfs/Interleaved_Mathematics_Practice_Guide.pdf)). The Party Planet is therefore not just a finale – pedagogically it is the most important level.

**Mechanic – The party where all the mechanics return:** all the animals are present and every question is a party chore using an already-built mechanic: hop to the right table (the Star Path), share the cake equally (the seesaw), feed the elephant with number bonds (the fox), weigh the presents (the scale), hang the garland in a pattern (the gallop track). Technically: the generators already exist – the level mixes question types from planets 1–9.

**Adaptive party menu:** localStorage already knows which planets have the fewest stars – weight in more questions from those, so every child repeats exactly what they need. Every correct answer lights a party lamp/lantern on the screen; ten lit = big fireworks and the Moon Elephant moves in. 🎆

---

## Build order and tech

1. **Planet 5 before 7:** the seesaw scene is built once and used in both (share equally → weigh equally). The trampoline reuses the staircase scene.
2. **Planet 6** is the most new interaction (pairing up two piles) but simple logic – and it unlocks planet 9's bridge to ten.
3. **Planet 8's sound** is done with built-in WebAudio (no dependencies); the game must work exactly as well with the sound off.
4. **Planet 10 last**, once the generators for 1–9 exist – it is mostly reuse + adaptive weighting.
5. As always: test with the target audience after every planet – especially the scale (does she understand "gör lika" without the word "equals sign"?) and the pattern melody (does the sound help or distract?).
