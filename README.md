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
- [ ] Planet 5–7: Dubbelt/hälften, talkamrater, likhetstecknet
- [ ] Planet 8–10: Mönster, tal 0–20, blandad utmaning
- [ ] Fler djur/animationer i rymdstationen
