# Research: Rymddjuren som plattformsspel

*2026-07-18 · Underlag för hur vi kan ge spelet mer plattformskänsla utan att tappa designregeln om intrinsic integration (matten = mekaniken).*

## Sammanfattning

Det finns tre realistiska spår, i stigande ambitionsnivå. Rekommendationen är att bygga **spår B** för nästa planet och spara spår C tills vi vet att det behövs.

**A. Bygga vidare på dagens modell** – "välj tal → se konsekvensen utspela sig". Ingen realtidsstyrning, men mer rörelse och fler mekaniktyper per planet. Billigast, noll ny teknik.

**B. Auto-rörelse med matte som motor** – kaninen springer/hoppar själv, men *hur långt* styrs av talet barnet väljer. Barnet får plattformskänsla (fart, hopp över stup, landa på plattformar) utan att behöva skicklighetsstyra. Kan byggas i befintlig React-app med en enkel animationsloop – ingen spelmotor krävs.

**C. Riktigt plattformsspel** – barnet styr kaninen med knappar/touch, fysik och kollisioner, matten inbäddad i banan (à la Math Duck). Kräver spelmotor (Phaser 3 eller KAPLAY) inbäddad i React. Störst wow-faktor, störst jobb, och störst risk att motoriken – inte matten – blir det svåra.

## Vad referensspelen faktiskt gör

**Math Duck** (Coolmath Games): ett äkta mini-plattformsspel där ankan springer runt och *samlar siffror* för att fullborda ekvationer (`3 + _ = 9` → hitta rutan med 6), sedan ta nyckeln och nå dörren. En 10-sekunderstimer per bana och senare rörliga spikar. Matten är intrinsic: att navigera till rätt siffra ÄR svaret. Lärdom: mekaniken är utmärkt, men timern och spikarna gör det stressigt – fel ton för 6–7-åringar. ([Coolmath-guide](https://www.coolmathgames.com/blog/how-to-play-math-duck), [spelet](https://www.coolmathgames.com/0-math-duck))

**Jump Numbers** (Artgig): skip counting där barnet hoppar mellan tal i sekvens och "squashar ihop" siffror för att bilda nästa tal, för att rädda varelser (Snortles) undan hot. Adaptiv svårighetsgrad. Två lärdomar från deras utvecklingsblogg: de började med komplexa gester för flera räknesätt och fick backa till det enkla, och barnen engagerades främst av den *emotionella kopplingen* – de ville rädda Snortles. Vi har redan djuren; ge dem något att räddas ifrån/till. ([Artgig om utvecklingen](https://artgigapps.com/blog/finding-game-making-our-new-app-jump), [Common Sense-recension](https://www.commonsensemedia.org/app-reviews/jump-numbers))

**Monster Numbers** (Didactoons): varvar runner-/plattformssekvenser med separata matteuppgifter mellan segmenten. Det är alltså delvis ett *varningsexempel* enligt vår designregel – plattformsdelen är belöning, matten en grind. Kul spel, men matten är inte mekaniken. ([Didactoons](https://www.didactoons.com/monster-numbers/))

**Zombie Division** (Habgood & Ainsworth 2011, redan vår designgrund): attacken ÄR divisionen – du besegrar en zombie med nummer 8 genom att slå med "2:an". Modellen: spelarens *verb* (hoppa, slå, mata) bär matten.

## Forskningsstöd för tallinje-hoppande

Bra nyheter: just det Stjärnstigen gör – hoppa på en linjär tallinje – har starkt stöd. Träning på tallinjen förbättrar barns aritmetik och taluppfattning ([number line training i klassrum](https://sciencedirect.com/science/article/abs/pii/S0079612322001911), [mental number line games](https://www.sciencedirect.com/science/article/abs/pii/S0022096522001084)), och klassikern Siegler & Ramani visade att *linjära* (men inte cirkulära) talspel förbättrar taluppfattning hos förskolebarn ([studien](https://www.researchgate.net/publication/232563588_Playing_Linear_Number_Board_Games-But_Not_Circular_Ones-Improves_Low-Income_Preschoolers'_Numerical_Understanding)). Att göra rörelsen på tallinjen ännu mer central är alltså pedagogiskt rätt, inte bara roligare.

## Motorik & kontroller för 6–7-åringar

NN/g:s genomgång av barns fysiska utveckling ger tydliga ramar ([artikeln](https://www.nngroup.com/articles/children-ux-physical-development/)):

- Fungerar: tap på **stora mål (minst 2×2 cm)**, enkla svep, enkla piltangenter på dator.
- Fungerar inte: precisionsdrag, små knappar, **tvåhandskoordination** (t.ex. vänster hand styr + höger hoppar = klassisk plattformskontroll!), och **snabba reaktioner på visuella stimuli**.

Det sista är kärnargumentet mot spår C som förstaval: ett klassiskt plattformsspel kräver exakt det 6–7-åringar är sämst på (timing + tvåhandsstyrning), och då riskerar spelet att mäta motorik i stället för matte. Om vi ändå vill ha styrning: **en-knapps-kontroll** (tap var som helst = hoppa, à la auto-runners) är den etablerade lösningen för åldersgruppen.

## Spår B i detalj (rekommendationen)

Grundidé: gör dagens `answerHop`-princip till ett *sidscrollande äventyr*. Kaninen rör sig automatiskt längs en bana med plattformar, stup och mål. Vid varje hinder stannar den och barnet väljer tal – talet blir bokstavligen hoppets längd/kraft:

- **Apornas planet (plus 0–10):** raviner i banan. "Du står på 4, lianen hänger vid 9 – hur långt hopp?" Väljer barnet 3 svingar apan/kaninen och landar synligt i tomma luften på 7, dinglar och klättrar tillbaka. Addition = framåthopp, precis som Stjärnstigen men med gravitation och scenografi.
- **Kometkalaset (minus 0–10):** hoppa *ner* för kometsvansens trappsteg – subtraktion som bakåt/nedåtrörelse.
- **Tvillingplaneten (dubbelt & hälften):** studsmattor som dubblar hoppet – "du hoppar 3, studsmattan ger dubbelt – var landar du?"
- **Jätteplaneten (plus & minus 0–20):** längre banor som kedjar flera hopp: "hoppa 5 fram, sedan 2 bak" – flerstegsuppgifter som en bana, inte en fråga.

Tekniskt räcker befintlig stack: en `requestAnimationFrame`-loop eller CSS-transitions för rörelsen (som dagens `setInterval`-hopp, fast mjukare), absolut-positionerade element eller en enda `<canvas>`. Ingen spelmotor, inget nytt beroende, allt återanvänder `Question`-typerna och stjärnlogiken.

## Spår C i detalj (om vi vill växla upp senare)

Om vi vill ha äkta styrning och fysik är det etablerade mönstret att bädda in **Phaser 3** i React – det finns en officiell mall för exakt vår stack: [phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts) (Vite + TypeScript + en EventBus för kommunikation mellan React-UI och spelscenen). React behåller menyer/stjärnkarta/resultat; Phaser äger bara `LevelScreen`. ([Officiell nyhet](https://phaser.io/news/2024/02/official-phaser-3-and-react-template))

Lättviktsalternativ: [KAPLAY](https://kaplayjs.com/) – efterföljaren till Kaboom.js (Kaboom är arkiverat av Replit; KAPLAY är den aktivt underhållna forken med [egen roadmap för 2026](https://github.com/kaplayjs/kaplay/wiki/KAPLAY-Roadmap-2026)). Enklare API än Phaser, byggt för små arkadspel – bra match för vår skala om vi går denna väg.

Designkrav om vi bygger C, givet motorikramarna: en-knappsstyrning (tap = hoppa), ingen timer, ingen död – fel hopp ger som idag ett synligt, begripligt "oj!" och en ny chans, och matten avgör *vart* man kan hoppa (siffersamlande à la Math Duck) snarare än att fingerfärdighet avgör om man klarar banan.

## Förslag på nästa steg

1. Bygg Apornas planet (planet 3) som spår B-prototyp: sidscrollande scen, ravinhopp, addition som hoppkraft.
2. Testa med målgruppen (en 6–7-åring räcker långt) – landar "synligt fel"-återkopplingen även med gravitation?
3. Besluta därefter om spår C/Phaser behövs, eller om B ger nog plattformskänsla.
