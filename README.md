# Mattespelet

Ett matte-spel för en 7-åring som börjar årskurs 1, byggt med React + Vite + TypeScript.

## Kom igång

```bash
npm install
npm run dev
```

Öppna sedan adressen som visas (vanligtvis http://localhost:5173).

## Spela på mobilen (GitHub Pages)

Spelet publiceras automatiskt vid varje push till `main`: workflowen
`.github/workflows/pages.yml` bygger enfilsversionen (`npm run build:single`)
och lägger upp `spela.html` som startsida på GitHub Pages.

- Adress: `https://<github-användarnamn>.github.io/rymddjuren/`
- Spara adressen som ikon på mobilens hemskärm ("Lägg till på hemskärmen")
  så funkar det som en app
- `npm run build:single` skapar även `spela.html` lokalt – hela spelet i en
  fil som funkar utan server

## Vad ska spelet träna? (Lgr22, åk 1)

Baserat på Skolverkets kursplan i matematik (Lgr22, centralt innehåll åk 1–3)
och bedömningsstödet i taluppfattning för åk 1:

- **Taluppfattning** – talraden 0–20 (räkna framåt/bakåt), koppla antal till siffra, talens grannar
- **Addition & subtraktion** – först inom 0–10, sedan 0–20
- **Talkamrater** – tals uppdelning, t.ex. 7 = 3 + 4
- **Likhetstecknets betydelse** – "vilken term fattas?", t.ex. 3 + _ = 7
- **Dubbelt och hälften** – proportionella samband
- **Mönster och talföljder** – enkla talföljder och geometriska mönster
- **Fler/färre** – jämföra antal och tal

## Designprinciper

- Spelaren kan läsa **väldigt enkla meningar** – alla instruktioner är korta och enkla, t.ex. "Hur många?" eller "Vilket tal fattas?"
- Stor text, stora knappar, mer bild än text
- Högtalarknapp 🔊 som läser upp instruktionen (talsyntes på svenska)

## Plan (byggs steg för steg)

- [x] Projektskelett (Vite + React)
- [x] Stjärnkarta / nivåstruktur med belöningar (se DESIGN.md)
- [x] Planet 1: Kaninplaneten – räkna antal + mata kaninen
- [x] Planet 2: Stjärnstigen – talraden 0–20 (kaninen hoppar exakt så många hopp som barnet väljer – fel svar landar synligt fel på tallinjen, rätt svar landar på stjärnan)
- [x] TypeScript-migrering
- [x] Planet 3: Apornas planet – ravinhopp där valt tal = hoppets kraft (plus 0–10, "spår B", se docs/research-plattformsspel.md)
- [x] Planet 4: Kometkalaset – minus 0–10 på tre sätt: komettrappan ner (ta bort som bakåtrörelse, trappan slutar vid 0), kalasbordet (papegojan äter synligt upp godisar – "hur många är kvar?") och trappan upp (räkna uppåt/utfyllnad, se docs/research-planet4-kometkalaset.md)
- [x] Planet 5: Tvillingplaneten – gungbrädan tippar mot den tyngre sidan när man delar lika, studsmattan dubblar hoppet, spegeldammen visar dubbelt (se docs/research-planet5-10.md)
- [x] Planet 6: Kompisplaneten – para ihop två högar till rävens tal (talkamrater) + tiokompisbron (tioram som bro)
- [x] Planet 7: Vågplaneten – balansvågen ÄR banan, formaten roteras (3 + _ = 7 och 7 = 3 + _) så att likhetstecknet betyder "lika mycket", inte "här kommer svaret"
- [x] Planet 8: Mönsterbältet – hästen galopperar i mönstret (varje färg är en ton – mönstret hörs!), talföljder och "vilken bit upprepas?"
- [x] Planet 9: Jätteplaneten – jättehopp i två steg via vilostationen på tian (bridging through ten) på talraden 0–20
- [x] Planet 10: Festplaneten – blandad utmaning med frågor från alla planeter, adaptivt viktade mot de planeter som fått färst stjärnor; festlyktor tänds för varje rätt svar
- [x] GPU-rendering med PixiJS v8 (WebGPU med automatisk WebGL-fallback, se docs/research-webgpu.md): stjärnfältet bakom spelet + guldregn på resultatskärmen, och Apornas planet som riktig canvas-bana med kamera och parallax
- [ ] Fler djur/animationer i rymdstationen

## GPU-rendering (WebGPU/WebGL)

Två saker ritas med PixiJS v8 (`src/game/pixi.ts` väljer renderare):

- **Effektlagret** (`SpaceBackdrop.tsx`): stjärnfält som blinkar bakom hela
  spelet, med stjärnfall och kometer på stjärnkartan, hyperrymdsstrimmor
  under raketresan till en planet, stjärnexplosion vid varje rätt svar
  (`cheerBurst()` i `src/game/fx.ts`) och guld-/rödstjärneregn när en planet
  är avklarad. Ren dekoration – `pointer-events: none`, respekterar
  `prefers-reduced-motion`.
- **Apornas planet** (`JumpScene.tsx`): ravinhoppet som canvas-bana med mjuk
  kamera och parallax. Knappar, Ugglis och 🔊 bor kvar i DOM.

Robusthet: WebGPU provas först med en "kanarie-rendering"; misslyckas den
(eller kraschar WebGPU senare under körning) byter spelet till WebGL och
minns valet i localStorage. Fungerar ingen av dem faller hoppbanan tillbaka
till den gamla DOM-versionen – matten fungerar alltid. Tvinga renderare med
`?renderer=webgl` eller `?renderer=webgpu` i adressraden; konsolen loggar
vilken som används.
