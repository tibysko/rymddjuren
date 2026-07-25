# Design: Rymddjuren 🚀🐾

*(Updated after an interview with the player themselves!)*

## What the player asked for

- **Space!** – animals that live on different planets
- Mascot: a cheeky little owl called **Ugglis** 🦉
- Most fun: **feeding the animals** and **collecting things**
- Colours: **red and yellow**

## Concept

The player flies a rocket between planets. On every planet there are space animals
who need help – usually with food! The tasks are solved with maths.
For every planet completed, an animal comes along in the rocket and moves into the
player's **space station**, which grows and becomes more lively.

## Mascot

**Ugglis** 🦉 – a cheeky little space owl in a helmet who:
- gives the instructions (short text + 🔊 read-aloud)
- cheers you on and comforts you ("Bra jobbat!", "Nästan! Prova igen!")
- larks about and celebrates when things are going well
- has an original red-and-gold astronaut illustration generated for the game,
  shown consistently on the map, in feedback, at results and in the station

## Game loop

1. The star map shows the planets. The player picks the next unlocked planet.
2. One planet = about 10 short tasks, one at a time, large buttons.
3. Many tasks are about **feeding the animals** (pick the right number – all input is taps, no dragging, per the one-button rule).
4. Wrong answer → a second chance with gentle help (e.g. showing dots to count).
5. Planet completed → 1–3 stars ⭐ + **the animal comes along to the space station**.
6. The space station is the collection page – the animals float there and cheer when tapped, the station hull grows one lit module per animal, and the next animal is teased as a dark silhouette with a riddle while the ones after it stay secret.

## Planets → Lgr22 (Year 1)

| Planet | Space animal | Maths topic |
|---|---|---|
| 1. the Rabbit Planet (Kaninplaneten) | 🐰 Moon Rabbit (Månkanin) | Linking quantity to numeral, 1–10 |
| 2. the Star Path (Stjärnstigen) | 🐢 Space Turtle (Rymdsköldpadda) | The number line 0–20, which number is missing, neighbours |
| 3. the Monkey Planet (Apornas planet) | 🐵 Space Monkey (Rymdapa) | Addition 0–10 – jump across the ravine to the monkey: the chosen number = the jump's power |
| 4. the Comet Party (Kometkalaset) | 🦜 Star Parrot (Stjärnpapegoja) | Subtraction 0–10 – who ate up the sweets? |
| 5. the Twin Planet (Tvillingplaneten) | 🐼 Space Panda (Rymdpanda) | Doubles and halves – share the food equally |
| 6. the Friend Planet (Kompisplaneten) | 🦊 Star Fox (Stjärnräv) | Number bonds, e.g. 7 = 3 + 4 |
| 7. the Scale Planet (Vågplaneten) | 🦎 Space Lizard (Rymdödla) | The equals sign, which term is missing |
| 8. the Pattern Belt (Mönsterbältet) | 🐴 Star Horse (Stjärnhäst) | Patterns and number sequences |
| 9. the Giant Planet (Jätteplaneten) | 🦁 Space Lion (Rymdlejon) | Addition/subtraction 0–20 |
| 10. the Party Planet (Festplaneten) | 🐘 Moon Elephant (Månelefant) | Mixed challenge – the whole of space celebrates! |

## Colours & appearance

- Dark space background with a **red rocket** and **yellow stars** (the player's wish!)
- Warm red/yellow buttons and rewards, the planets in different colours
- Large touch targets, more picture than text

## Language & tone

- Very short, simple sentences: "Hur många?", "Mata apan!"
- The tasks are always shown visually (animals/fruit to count), not just numerals
- Speech synthesis (Swedish) reads everything aloud via the 🔊 button
- Fixed Swedish lines can be exported with the OpenAI Speech API for future
  prerecorded audio; the generated files are not integrated into the game yet

## Reward details

- Stars per planet: completed = ⭐, few mistakes = ⭐⭐, almost all correct = ⭐⭐⭐
- Planets can be replayed for more stars
- The animal collection in the space station is the big reward
- Progress is saved locally in the browser (localStorage)
