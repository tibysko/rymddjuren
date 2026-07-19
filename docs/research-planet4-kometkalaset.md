# Research: Kometkalaset (planet 4) – subtraktion 0–10

*2026-07-19 · Underlag för nästa nivå, i samma anda som docs/research-plattformsspel.md. Bygger vidare på spår B från Apornas planet: valt tal = rörelsens kraft/längd.*

## Sammanfattning

Subtraktion är inte "addition baklänges med samma mekanik" – forskningen säger att **räkna bakåt är påtagligt svårare än att räkna framåt** för 6–7-åringar, och att subtraktion har **flera betydelser** (ta bort, jämföra/skillnad, utfyllnad) som barnet behöver möta. Rekommendationen är därför att Kometkalaset får **tre mekaniker som är samma subtraktion från tre håll**:

1. **Komettrappan** (ta bort som bakåtrörelse) – direkta arvtagaren till ravinhoppet
2. **Kalasbordet** (ta bort som synligt ätande) – "vem åt upp godiset?", temat från DESIGN.md
3. **Skillnadshoppet** (utfyllnad – räkna *uppåt*) – den strategi forskningen faktiskt rekommenderar mest

Alla tre går att bygga med befintlig stack och återanvänder mönstret från `JumpQuestion`/`HopQuestion`.

## Vad forskningen säger om subtraktion

**Räkna bakåt är svårt.** Alla – barn som vuxna – räknar säkrare framåt än bakåt, och barn gör betydligt fler fel när de räknar baklänges. Därför är "counting up" (räkna uppåt från det mindre talet) den strategi som rekommenderas när talen ligger nära varandra, och även som stödstrategi för barn med matematiksvårigheter. Att se subtraktion som "vilket tal fattas?"-addition ger barnet tillgång till den lättare framåtriktningen. ([Langford: Counting strategies](https://langfordmath.com/ECEMath/BasicFacts/CountingStrategiesText.html), [progressionen addition→subtraktion](https://gfletchy.com/2016/03/04/the-progression-of-addition-and-subtraction/))

Konsekvens för oss: banan får inte *bara* träna bakåträkning. Komettrappan (bakåt) behöver kompletteras med skillnadshoppet (uppåt) – annars tränar vi mest det felbenägna sättet.

**Subtraktion har flera ansikten.** Svensk didaktik (t.ex. Majemas lärarmaterial och NCM) skiljer på *ta bort* ("3 godisar äts upp – hur många kvar?"), *jämföra/skillnad* ("hur många fler har papegojan?") och *utfyllnad* ("hur många fattas upp till 8?"). En klassisk missuppfattning som grundläggs tidigt är att man "vänder på talen" när det inte går ihop – motmedlet är god taluppfattning kring "man kan inte ta bort mer än man har", byggd på konkret material. ([Majema om subtraktion](https://www.majema.se/blogs/lektioner-matematik/subtraktion-ett-av-de-fyra-raknesatten), [NCM/McIntosh, kap 20](https://ncm.gu.se/media/ncm/matematiklyftet/TH05A_04_mcintosh_kap20x.pdf))

**Tallinjen håller fortfarande.** Samma stöd som bar Stjärnstigen bär även subtraktion som rörelse på linjen: linjära talspel och number line-träning förbättrar aritmetik och taluppfattning ([Siegler & Ramani](https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/sieg-ram08.pdf), [number line training i klassrum](https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0079612322001911), [mental number line games](https://www.sciencedirect.com/science/article/abs/pii/S0022096522001084)). En detalj värd att minnas från "You learn what you encode": barnen lär sig det de faktiskt *gör* – räknar de stegen högt när apan hoppar, förstärks talraden. Låt Ugglis räkna hoppen högt ("åtta … sju … sex!").

## Vad referensspelen gör

**Motion Math: Hungry Fish** – barnets fisk vill ha ett tal; sifferbubblor dras ihop för att bilda det (5 kan bli 12 ihopdraget med −7 på högre nivåer). Lärdomen för oss är inte negativa tal (för svårt) utan **verbet**: *mata* är mekaniken, och fisken reagerar direkt på rätt/fel kombination. Det rimmar perfekt med vårt "mata djuren"-koncept – papegojan kan vara den som äter. ([Common Sense-recension](https://www.commonsensemedia.org/app-reviews/motion-math-hungry-fish))

**DragonBox Numbers (Kahoot! Numbers)** – talen är varelser ("Noomar") som kan smooshas ihop och **klippas isär**. Subtraktion är bokstavligen att dela en varelse i bitar – decomposition som fysisk handling. I Run-läget är hopphöjden lika med talet, precis som vårt spår B. Lärdom: att *ta isär* ett tal är en minst lika bra kroppslig metafor för subtraktion som att gå bakåt. ([Games for Young Minds om DragonBox Numbers](https://www.gamesforyoungminds.com/blog/2018/3/16/dragonbox-numbers))

**Math Duck** – redan analyserat i förra researchen: att navigera till rätt siffra ÄR svaret (`9 − _ = 3` → hämta 6:an). Mekaniken är utmärkt men timern gör den stressig; utan timer vore "hämta talet som fattas" en fin variant av utfyllnadsuppgifter. ([Coolmath-guide](https://www.coolmathgames.com/blog/how-to-play-math-duck), [spelet](https://www.coolmathgames.com/0-math-duck))

## Förslag: tre mekaniker för Kometkalaset

Tema från DESIGN.md: kalas på kometen, 🦜 Stjärnpapegojan, "vem åt upp godiset?". Mörk rymd, godis i gult/rött.

### 1. Komettrappan – subtraktion som nedåtrörelse (arvtagare till ravinhoppet)

Kometsvansen är en trappa med talen 10→0. Kaninen står på ett tal högt upp, godispåsen ligger på ett lägre trappsteg. "Du står på 9, godiset ligger på 5 – hur många steg ner?" Valt tal = antal trappsteg kaninen studsar ner. För få steg → kaninen stannar synligt ovanför godiset och kikar ner; för många → studsar förbi (aldrig under 0 – trappan slutar där, vilket *visar* att man inte kan ta bort mer än man har). Ugglis räknar stegen högt baklänges. Detta är `JumpQuestion` med omvänt tecken plus trappscenografi.

### 2. Kalasbordet – ta bort som synligt ätande

Kalasbordet dukas med t.ex. 7 godisar. Papegojan flyger fram och äter upp 3, en i taget, med ljud och smulor – *ta bort blir en synlig händelse, inte en siffra*. Sedan: "Hur många är kvar?" Fel svar → andra chansen visar de uppätna som bleka konturer så barnet kan räkna både kvar och borta (à la prick-hjälpen på Kaninplaneten). Detta är närmast en `FeedQuestion` baklänges och ger banan variation utan ny teknik. Hungry Fish-lärdomen: papegojan ska reagera direkt – nöjd rap vid rätt, förvirrat huvudlutande vid fel.

### 3. Skillnadshoppet – räkna uppåt (utfyllnadsstrategin)

Samma trappa, men nu står kaninen *nere* hos godiset på 5 och papegojan sitter på 8: "Hur många hopp upp till papegojan?" Barnet tränar 8 − 5 = 3 som "från 5 upp till 8" – exakt den counting up-strategi forskningen rekommenderar – utan att skärmen någonsin säger "subtraktion". Mekaniskt är det `HopQuestion` framåt i trappmiljö; pedagogiskt är det bryggan till planet 6 (talkamrater) och 7 (vilken term fattas).

### Blandning

Förslag: ~4 komettrappor + 3 kalasbord + 3 skillnadshopp per omgång, så att bakåträkning aldrig dominerar. Alla svar ligger i 0–10, differenser mest 1–5 (större "avstånd" gör bakåträkning oproportionerligt svår i åk 1-start).

## Teknik

Allt ryms i befintlig stack, inga nya beroenden: komettrappan och skillnadshoppet återanvänder `JumpQuestion`/`HopQuestion`-mönstren (ny `stair`-variant i `types.ts`, generatorer i `levels.ts`), kalasbordet är en omvänd `FeedQuestion` med en ät-animation i stil med dagens hoppanimation. Trappan ritas som absolut-positionerade steg precis som ravinscenen.

## Förslag på nästa steg

1. Bygg komettrappan först – den är minsta steget från planet 3 och ger igenkänning ("samma spel, ny planet").
2. Lägg till kalasbordet för variation och skillnadshoppet för counting up.
3. Testa med målgruppen: förstår hon att "steg ner" är minus utan att någon säger ordet minus? Räknar hon högt med Ugglis?
4. Spara jämförelse-betydelsen ("hur många fler?") till planet 5–6 – tre betydelser på en gång är för mycket.
