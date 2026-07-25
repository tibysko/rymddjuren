# Research: feedbackloop för Rymddjuren (Vite + React + TS)

*2026-07-25. Jämförelse mellan vår nuvarande loop och best practice för stacken.*

## Vår nuvarande loop (beslutad 2026-07-25)

Ola kör `npm run dev` → Claude ändrar kod och skriver tillbaka → Vite hot-reloadar → Claude klickar igenom i Olas Chrome, kollar konsolen, skickar GIF/skärmdumpar → Ola klickar igenom själv i samma flik.

Det täcker: snabb visuell granskning, manuell testning, konsolfel. Det här är luckorna researchen hittade, i prioritetsordning:

## 1. Enhetstester för frågegeneratorerna (störst lucka) — Vitest

Matten ÄR produkten, och `src/game/levels.ts` är ren logik utan UI — perfekt för enhetstester. En bugg som "subtraktion kan ge negativa svar" eller "samma fråga två gånger i rad" syns inte på en skärmdump men fångas på millisekunder av ett test. Vitest är standardvalet för Vite-projekt och kör i watch-läge. Vitest 4 har numera även browser mode med inbyggd visuell regression om vi vill växa åt det hållet senare.

**Förslag:** `npm i -D vitest`, testa varje generator: rätt talområde, rätt svar, inga dubbletter, alla svarsalternativ rimliga. Claude kör testerna i molnet innan filer skrivs tillbaka.

## 2. TypeScript-fel syns inte i webbläsaren — vite-plugin-checker

Vite transpilerar bara och typkollar INTE under `npm run dev` — ett typfel märks först vid `npm run build`. `vite-plugin-checker` visar TS-fel (och ev. ESLint) som overlay direkt i webbläsarfliken och i terminalen. Då ser både Ola och Claude felet i samma stund det uppstår i stället för vid nästa bygge.

**Förslag:** `npm i -D vite-plugin-checker` + två rader i `vite.config.ts`.

## 3. Speltest på surfplatta — `npm run dev -- --host`

Målspelaren är 7 år och spelar troligen på padda. Med `--host` blir dev-servern nåbar på hemmanätverket (t.ex. `http://192.168.x.x:5173`), så det senaste bygget kan speltestas på riktig pekskärm — tryckytor och en-handsstyrning går inte att bedöma med mus. Ingen installation behövs.

## 4. Smoke-test i molnet före återskrivning — Playwright

Claude har Playwright + Chromium i molnmiljön. Ett litet skript som startar spelet, klickar in på varje planet och verifierar "inga konsolfel, rätt skärm visas" fångar krascher innan filerna ens når Olas Mac. Playwrights `toHaveScreenshot()` ger dessutom automatisk pixeljämförelse mot referensbilder om vi vill ha visuell regression (t.ex. att en refaktor inte tyst förstör Stjärnstigen).

**Förslag:** börja med smoke-test utan referensbilder; lägg till skärmdumpsjämförelse om behov uppstår.

## 5. Skyddsnät för main — GitHub Actions

Pages deployar direkt från `main`. En enkel workflow som kör `tsc`, testerna och `npm run build` vid varje push gör att en trasig commit inte tyst sänker det publika spelet. Kräver bara en YAML-fil i repot.

## Tittade på men avstår (just nu)

- **Storybook** — bra för komponentbibliotek, för tungt för ett litet spel.
- **Percy/Applitools/Chromatic** — externa visuella molntjänster; overkill, Playwrights inbyggda jämförelse räcker.
- **Chrome DevTools MCP / vite-plugin-pilot** — ger AI-agenten "ögon" i webbläsaren (eval JS, nätverk, DOM inifrån). Vi har redan motsvarande via Claudes Chrome-tillägg; pilot kan bli aktuellt om tillägget inte räcker.

## Rekommenderad ordning

1. Vitest på `levels.ts` (kräver `npm install`, Ola godkänner + kör)
2. vite-plugin-checker (dito)
3. `--host` vid nästa speltest med barnet (gratis, nu direkt)
4. Playwright-smoke i molnet (ingen ändring i repot krävs)
5. GitHub Actions när 1–2 är på plats

## Källor

- https://github.com/vitejs/vite/discussions/12870 (Vite visar inte TS-fel i dev)
- https://www.nandann.com/blog/react-typescript-vite-vitest-setup-guide-2026
- https://mayashavin.com/articles/visual-testing-vitest-playwright
- https://alternativeto.net/news/2025/10/vitest-4-0-adds-browser-mode-visual-regression-testing-and-playwright-traces-support
- https://qaskills.sh/blog/playwright-visual-regression-testing-guide
- https://developer.chrome.com/blog/chrome-devtools-mcp
- https://dev.to/llej/chrome-devtools-mcp-but-from-the-inside-a-vite-plugin-that-lets-ai-debug-your-frontend-in-any-5g29
- https://dualite.dev/blogs/component-tests-guide
