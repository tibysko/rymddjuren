# Research: WebGPU i Rymddjuren

*2026-07-19 · Underlag för hur (och om) spelet kan använda WebGPU. Dagens spel renderar allt med React-DOM + CSS – ingen canvas alls.*

> **Uppdatering samma dag:** Ola valde spår 2 (PixiJS v8) – och vi byggde både
> effektlagret OCH Apornas planet som Pixi-bana. Se `src/game/pixi.ts`,
> `src/components/SpaceBackdrop.tsx` och `src/components/JumpScene.tsx` samt
> avsnittet "GPU-rendering" i README.md. Två praktiska lärdomar från bygget:
> `generateTexture` var opålitligt i vissa WebGPU-miljöer (vi ritar därför med
> Graphics/Text direkt), och init kan lyckas fast renderingen kraschar senare –
> därför finns en kanarie-rendering vid start plus en runtime-vakt som byter
> till WebGL och minns valet i localStorage.

## Sammanfattning

WebGPU är redo att användas 2026, men det är ett **lågnivå-API för grafikkortet** – det ersätter inte React/DOM, det ersätter WebGL/canvas. Eftersom Rymddjuren idag inte har någon canvas alls är frågan egentligen två frågor:

1. **Behöver spelet GPU-rendering?** För dagens mekaniker: nej. Emoji + CSS-animationer klarar allt vi gör, med perfekt tillgänglighet (riktiga knappar, uppläsning, stor text).
2. **Var skulle WebGPU göra nytta?** Som **effektlager**: stjärnfält med tusentals stjärnor, partikelregn vid jubel, kometsvansar – saker DOM är dåligt på. Där finns tre spår:

**Spår 1 (rekommendation): rå WebGPU som dekorativt bakgrundslager.** En enda `<canvas>` bakom spelet med stjärnfält/partiklar, skriven för hand i WGSL. Noll nya beroenden (passar vår regel), och spelet fungerar exakt som idag om WebGPU saknas – canvasen är ren glasyr. Lagom stort som lärprojekt: ~150–250 rader.

**Spår 2: PixiJS v8 om vi flyttar spelscener till canvas.** Om spår B-plattformsbanorna (se [research-plattformsspel.md](research-plattformsspel.md)) någon gång växer ur DOM är PixiJS v8 rätt verktyg: en 2D-motor byggd för både WebGPU och WebGL med automatisk fallback. Nytt beroende (~450 kB) – kräver beslut.

**Spår 3: Three.js/Babylon (3D).** Avfärdas – 3D är fel ambitionsnivå för spelet och målgruppen.

Notera: **Phaser 4** (släppt våren 2026) valde WebGL2, inte WebGPU – ett tecken på att 2D-spelvärlden inte anser WebGPU nödvändigt än.

## Vad WebGPU är – och inte är

WebGPU är efterträdaren till WebGL: ett modernt API som pratar direkt med grafikkortet via Metal (Apple), Direct3D 12 (Windows) och Vulkan (Linux/Android). Shaders skrivs i ett nytt språk, **WGSL**. Styrkan är stora mängder likadana objekt (partiklar, sprites) och compute shaders – beräkningar på GPU:n.

Det WebGPU *inte* ger oss: knappar, text, layout, uppläsning, fokushantering. Allt som ritas i en canvas är pixlar – osynligt för skärmläsare och omöjligt att göra till tryckytor utan mycket extraarbete. **Därför gäller oavsett spår: all interaktion (svarsknappar, 🔊, Ugglis text) stannar i DOM. GPU:n får bara måla det som är vackert, aldrig det som är klickbart.**

## Browserstöd (juli 2026)

| Webbläsare | Status |
|---|---|
| Chrome/Edge | ✅ Sedan v113 (2023), även Android |
| Safari (macOS/iOS/iPadOS) | ✅ Sedan Safari 26 / iOS 26 (hösten 2025) |
| Firefox | ✅ Windows sedan 141 (juli 2025), Mac sedan 145/147; Linux på gång under 2026 |

Globalt stöd ca **84 %** enligt caniuse. Slutsats: bra nog för *progressive enhancement*, inte bra nog att kräva. Familjens Mac (Safari 26+/Chrome) klarar det; en äldre lärplatta i skolan kanske inte. `spela.html` delas som fil och måste därför alltid fungera utan.

Fallback-trappan är enkel:

```ts
if (navigator.gpu) {
  const adapter = await navigator.gpu.requestAdapter()
  if (adapter) { /* starta WebGPU-lagret */ }
}
// annars: gör ingenting – CSS-stjärnorna finns kvar precis som idag
```

## Spår 1 i detalj: effektlager med rå WebGPU

Grundidé: en fixed-positionerad `<canvas>` längst bak (`z-index` under `.app`, `pointer-events: none`), med ett partikelsystem som byter läge efter spelets tillstånd:

- **Stjärnkartan:** djupt stjärnfält, 5 000–20 000 stjärnor i olika hastigheter (parallax) – omöjligt med DOM-element, trivialt för en GPU.
- **Rätt svar/jubel:** guldgult partikelregn/fyrverkeri (spelarens färger: rött & gult!).
- **Raketfärd mellan planeter:** stjärnorna strimmar förbi.
- **Fel svar:** ingenting särskilt – effekterna ska fira, aldrig straffa.

Tekniskt i vår stack:

- En React-komponent `<SpaceBackdrop mode="map" | "cheer" | "travel" />` med `useEffect` + `ref` som äger hela WebGPU-livscykeln (adapter → device → context → render-loop med `requestAnimationFrame`). React rör aldrig canvasen efter start – läget skickas in via en mutable ref, inte props-omrendering.
- WGSL-shaders som vanliga TS-strängar (eller `?raw`-import i Vite) – fungerar automatiskt i `build:single`/`spela.html` eftersom allt blir inline JS. **Storlekspåverkan: ~0 kB beroenden.**
- Typer: om TS gnäller på `navigator.gpu` läggs `@webgpu/types` till som *dev*-beroende (bara typer, ingen runtime-kod).
- Viktigt för målgruppen: `prefers-reduced-motion` ska stänga av lagret, och partiklarna får aldrig tävla om uppmärksamheten med uppgiften – dova på LevelScreen, festliga på ResultScreen.

Fallgropar att känna till: `device.lost` måste hanteras (GPU:n kan tas ifrån fliken – då släcker vi bara lagret), canvasstorlek × `devicePixelRatio` måste sättas manuellt, och Safari/Firefox har fortfarande små implementationsskillnader – testa i minst två webbläsare.

## Spår 2 i detalj: PixiJS v8 (om spelscener flyttar till canvas)

PixiJS v8 (2024) är den etablerade 2D-renderaren med äkta WebGPU-stöd. `autoDetectRenderer({ preference: 'webgpu' })` väljer WebGPU där det finns och faller tillbaka till WebGL annars – exakt den robusthet vi behöver. Pixis egen dokumentation kallar dock WebGPU-renderaren "more performant, still maturing" och rekommenderar WebGL för produktion – även med Pixi blir WebGPU alltså ett tillval, inte grunden.

När detta spår blir aktuellt: om en spår B-bana vill ha mjukt scrollande kameror, hundratals sprites och parallaxlager samtidigt som DOM börjar hacka. Dit har vi inte nått – dagens scener (gungbrädan, vågen, galoppbanan) är ~10 element styck.

Kostnad: nytt runtime-beroende (~450 kB min, märks i `spela.html`), ny mental modell (scengraf i stället för JSX för spelytan), och knapparna måste ändå ligga kvar i DOM ovanpå. Det finns `@pixi/react`, men för vår skala är en vanlig `useEffect`-monterad Pixi-app enklare.

## Varför inte…

- **Three.js WebGPURenderer / react-three-fiber:** mogen och stabil 2026, men 3D. Fel verktyg för ett 2D-emojispel, stort beroende, och 3D-rymd riskerar att flytta fokus från matten till grafiken.
- **Babylon.js:** samma sak, ännu större.
- **Phaser 4 / KAPLAY:** relevanta för spår C i plattformsresearchen, men ger inte WebGPU (Phaser 4 är WebGL2; canvas-läget avvecklat) – så de svarar inte på den här frågan.
- **Compute shaders (fysik på GPU:n):** häftigt, men vårt spel har ~1 rörligt djur åt gången. GPU-fysik löser ett problem vi inte har.

## Målgrupps- och designkrav (gäller alla spår)

- Ingen mekanik får kräva canvasen: matten, knapparna och uppläsningen fungerar identiskt utan WebGPU. Effektlagret är belöning och stämning – aldrig information som behövs för att lösa uppgiften.
- Fel svar ska fortsatt synas i *spelvärlden* (gungbrädan tippar) – det är DOM-scenernas jobb och ändras inte av detta.
- Respektera `prefers-reduced-motion` och håll partikelmängden nere på uppgiftsskärmen.
- Batteri: en ständig render-loop drar ström på en laptop – pausa loopen när fliken är dold (`visibilitychange`) och när inget animeras.

## Förslag på nästa steg

1. Bygg spår 1 som prototyp: `<SpaceBackdrop>` med stjärnfält bakom stjärnkartan + guldregn på ResultScreen, med `navigator.gpu`-vakt och reduced-motion-stöd.
2. Testa på familjens Mac i både Safari och Chrome, och verifiera att `spela.html` fortfarande fungerar helt utan WebGPU (t.ex. med flaggan avstängd).
3. Visa för spelaren – blir stjärnregnet en större belöning än dagens CSS-konfetti? Om ja, behåll; om det stjäl fokus, tona ner.
4. Ompröva PixiJS först den dag en spår B-bana faktiskt hackar i DOM.

## Källor

- [caniuse: WebGPU](https://caniuse.com/webgpu) · [gpuweb Implementation Status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) · [web.dev: WebGPU i alla stora webbläsare](https://web.dev/blog/webgpu-supported-major-browsers)
- [Mozilla: Shipping WebGPU on Windows in Firefox 141](https://mozillagfx.wordpress.com/2025/07/15/shipping-webgpu-on-windows-in-firefox-141/)
- [PixiJS v8: renderers-guide](https://pixijs.com/8.x/guides/components/renderers) · [PixiJS v8 launch](https://pixijs.com/blog/pixi-v8-launches) · [PixiJS React v8](https://pixijs.com/blog/pixi-react-v8-live)
- [Phaser 4 renderer (WebGL2)](https://phaser.io/news/2026/04/phaser-4-renderer-faster-cleaner-and-built-for-modern-games)
- [Three.js WebGPURenderer-manual](https://threejs.org/manual/en/webgpurenderer.html)
