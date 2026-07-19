// Planeterna i Rymddjuren – mappade mot Lgr22 åk 1 (se DESIGN.md)

import type {
  BalanceQuestion,
  ChoiceQuestion,
  DoubleQuestion,
  EatQuestion,
  FeedQuestion,
  HopQuestion,
  JumpQuestion,
  Level,
  PairQuestion,
  PatternQuestion,
  Question,
  ShareQuestion,
  StairQuestion,
  Via10Question,
} from './types'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Skapa svarsalternativ: rätt svar + närliggande tal
function makeChoices(answer: number, min = 1, max = 10, count = 3): number[] {
  const choices = new Set<number>([answer])
  let guard = 0
  while (choices.size < count && guard++ < 50) {
    const offset = randInt(1, 2) * (Math.random() < 0.5 ? -1 : 1)
    const c = answer + offset
    if (c >= min && c <= max) choices.add(c)
  }
  // fyll på om vi fastnat (t.ex. answer i kanten)
  while (choices.size < count) {
    choices.add(randInt(min, max))
  }
  return shuffle([...choices])
}

// ---- Bana 1: Kaninplaneten – koppla antal till siffra, 1–10 ----

const COUNT_ITEMS = ['🥕', '🌟', '🍓', '🌸', '🪨']

function genCountQuestion(): ChoiceQuestion {
  const n = randInt(1, 10)
  const item = COUNT_ITEMS[randInt(0, COUNT_ITEMS.length - 1)]
  return {
    type: 'choice',
    prompt: 'Hur många?',
    spoken: 'Hur många ser du?',
    item,
    count: n,
    choices: makeChoices(n),
    answer: n,
  }
}

function genFeedQuestion(): FeedQuestion {
  const target = randInt(2, 8)
  const total = Math.min(10, target + randInt(2, 4))
  return {
    type: 'feed',
    prompt: `Mata kaninen med ${target} morötter!`,
    spoken: `Mata kaninen med ${target} morötter!`,
    animal: '🐰',
    item: '🥕',
    target,
    total,
  }
}

function genLevel1(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 5; i++) questions.push(genCountQuestion())
  for (let i = 0; i < 5; i++) questions.push(genFeedQuestion())
  return shuffle(questions)
}

// ---- Bana 2: Stjärnstigen – talraden 0–20 (plattformsbana) ----

function genHopQuestion(): HopQuestion {
  const forward = Math.random() < 0.7
  const dist = randInt(1, 4)
  // Svarsalternativen skapas först – kaninen hoppar bokstavligt det barnet
  // väljer, så alla möjliga landningar måste rymmas på tallinjen 0–20.
  const choices = makeChoices(dist, 1, 6)
  const maxChoice = Math.max(...choices)
  const start = forward ? randInt(0, 20 - maxChoice) : randInt(maxChoice, 20)
  const target = forward ? start + dist : start - dist
  // Stenarna täcker start, alla möjliga landningar och en extra sten i kanten
  const lo = Math.max(0, (forward ? start : start - maxChoice) - 1)
  const hi = Math.min(20, (forward ? start + maxChoice : start) + 1)
  const stones: number[] = []
  for (let n = lo; n <= hi; n++) stones.push(n)
  return {
    type: 'hop',
    prompt: forward ? 'Hur många hopp till stjärnan?' : 'Hoppa bakåt! Hur många hopp?',
    spoken: forward
      ? 'Hjälp kaninen hoppa fram till stjärnan! Hur många hopp behövs?'
      : 'Stjärnan är bakom kaninen! Hur många hopp bakåt?',
    stones,
    start,
    target,
    choices,
    answer: dist,
  }
}

function genMissingQuestion(): ChoiceQuestion {
  const lo = randInt(0, 16)
  const stones = [lo, lo + 1, lo + 2, lo + 3, lo + 4]
  const missIdx = randInt(1, 3)
  const answer = stones[missIdx]
  return {
    type: 'choice',
    prompt: 'Vilket tal fattas?',
    spoken: 'Vilket tal fattas på stigen?',
    numberline: stones.map((n, i) => (i === missIdx ? null : n)),
    choices: makeChoices(answer, 0, 20),
    answer,
  }
}

function genLevel2(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 6; i++) questions.push(genHopQuestion())
  for (let i = 0; i < 4; i++) questions.push(genMissingQuestion())
  return shuffle(questions)
}

// ---- Bana 3: Apornas planet – addition 0–10 (spår B: ravinhopp) ----
//
// Sidscrollande scen: apan står på ett tal, bananen hänger på ett tal längre
// bort, och en ravin gapar emellan. Barnet väljer HUR LÅNGT hoppet är – talet
// blir bokstavligen hoppets kraft (start + hopp = bananen). Väljer barnet för
// kort hopp faller apan synligt ner i ravinen; för långt hopp = förbi bananen.
// Addition = framåthopp, precis som Stjärnstigen fast med gravitation.

function genJumpQuestion(): JumpQuestion {
  const start = randInt(0, 4)
  const answer = randInt(2, 5) // hoppets längd = det tal som fattas
  const target = start + answer // bananens plats (≤ 9)
  const hi = Math.min(10, target + 2)
  const lo = Math.max(0, start - 1)
  // Alla möjliga hopp måste rymmas på marken (annars kan apan hoppa ut ur scen)
  const choices = makeChoices(answer, 1, hi - start)
  return {
    type: 'jump',
    prompt: `Kaninen står på ${start}, bananen på ${target}. Hur långt hopp?`,
    spoken: `Hjälp kaninen hoppa över ravinen till den hungriga apan! Kaninen står på talet ${start} och bananen hänger på talet ${target}. Hur långt är hoppet?`,
    start,
    target,
    lo,
    hi,
    choices,
    answer,
  }
}

function genLevel3(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) questions.push(genJumpQuestion())
  return questions
}

// ---- Bana 4: Kometkalaset – subtraktion 0–10 (se docs/research-planet4-kometkalaset.md) ----
//
// Tre mekaniker som visar samma subtraktion från tre håll:
// 1. Komettrappan NER – ta bort som bakåtrörelse (arvtagare till ravinhoppet).
//    Trappan slutar vid 0, så barnet ser att man inte kan ta bort mer än man har.
// 2. Kalasbordet – papegojan äter synligt upp godisar: "Hur många är kvar?"
// 3. Komettrappan UPP – utfyllnad ("från 5 upp till 8"), counting up-strategin
//    som forskningen rekommenderar. Bakåträkning får aldrig dominera banan.

function genStairDownQuestion(): StairQuestion {
  const answer = randInt(1, 5) // differenser 1–5 – större är för svårt i åk 1-start
  // start ≥ 3 så att makeChoices(answer, 1, start) alltid kan skapa 3 olika alternativ
  const start = randInt(Math.max(answer, 3), 9)
  const target = start - answer
  // Alla valbara hopp måste landa på trappan (aldrig under 0)
  const choices = makeChoices(answer, 1, start)
  const maxChoice = Math.max(...choices)
  const lo = Math.max(0, start - maxChoice - 1)
  const hi = Math.min(10, start + 1)
  return {
    type: 'stair',
    dir: 'ner',
    prompt: `Kaninen står på ${start}, godiset på ${target}. Hur många steg ner?`,
    spoken: `Kalas på kometen! Kaninen står på talet ${start} och godispåsen ligger på talet ${target}. Hur många steg ner ska kaninen hoppa?`,
    start,
    target,
    lo,
    hi,
    choices,
    answer,
  }
}

function genStairUpQuestion(): StairQuestion {
  const answer = randInt(1, 4)
  const start = randInt(0, Math.min(7, 9 - answer))
  const target = start + answer
  // Alla valbara hopp måste rymmas på trappan (aldrig över 10)
  const choices = makeChoices(answer, 1, 10 - start)
  const maxChoice = Math.max(...choices)
  const lo = Math.max(0, start - 1)
  const hi = Math.min(10, start + maxChoice + 1)
  return {
    type: 'stair',
    dir: 'upp',
    prompt: `Kaninen står på ${start}, papegojan på ${target}. Hur många hopp upp?`,
    spoken: `Stjärnpapegojan sitter högre upp i komettrappan! Kaninen står på talet ${start} och papegojan sitter på talet ${target}. Hur många hopp upp behövs?`,
    start,
    target,
    lo,
    hi,
    choices,
    answer,
  }
}

const PARTY_ITEMS = ['🍬', '🍭', '🧁']

function genEatQuestion(): EatQuestion {
  const total = randInt(3, 8)
  const eaten = randInt(1, Math.min(5, total))
  const answer = total - eaten // kan bli 0 – "alla är uppätna!" är en viktig upptäckt
  const item = PARTY_ITEMS[randInt(0, PARTY_ITEMS.length - 1)]
  return {
    type: 'eat',
    prompt: 'Hur många är kvar?',
    spoken: `Det låg ${total} godisar på kalasbordet. Papegojan åt upp ${eaten}! Hur många godisar är kvar?`,
    item,
    total,
    eaten,
    choices: makeChoices(answer, 0, total),
    answer,
  }
}

function genLevel4(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 4; i++) questions.push(genStairDownQuestion())
  for (let i = 0; i < 3; i++) questions.push(genEatQuestion())
  for (let i = 0; i < 3; i++) questions.push(genStairUpQuestion())
  return shuffle(questions)
}

// ---- Bana 5: Tvillingplaneten – dubbelt & hälften (se docs/research-planet5-10.md) ----
//
// Barns delningsintuition är stark långt före formell matte – därför börjar
// dubbelt/hälften i DELANDET: gungbrädan tippar mot den tyngre sidan så att
// obalans syns och känns. Studsmattan gör dubbelt till en rörelse (hopp × 2),
// och spegeldammen visar dubbelt som två lika delar.

function genShareQuestion(): ShareQuestion {
  const total = 2 * randInt(2, 5) // 4, 6, 8, 10 – alltid jämnt
  return {
    type: 'share',
    prompt: `Dela ${total} lika mellan pandorna!`,
    spoken: `Tvillingpandorna vill ha lika mycket bambu! Dela ${total} pinnar så att gungbrädan blir helt rak.`,
    item: '🎋',
    total,
  }
}

function genDoubleQuestion(): DoubleQuestion {
  const answer = randInt(2, 5)
  const target = 2 * answer // 4, 6, 8, 10
  return {
    type: 'double',
    prompt: `Till stjärnan på ${target}! Studsmattan dubblar. Vad hoppar du?`,
    spoken: `Stjärnan är på talet ${target}. Studsmattan gör hoppet dubbelt så långt! Vilket tal ska kaninen hoppa?`,
    target,
    hi: 10,
    choices: makeChoices(answer, 1, 5),
    answer,
  }
}

function genMirrorQuestion(): ChoiceQuestion {
  const n = randInt(2, 5)
  return {
    type: 'choice',
    prompt: 'Hur många blir det med spegeln?',
    spoken: `Titta i spegeldammen! ${n} stjärnor – och deras spegelbilder. Hur många stjärnor ser du sammanlagt?`,
    item: '⭐',
    count: n,
    mirror: true,
    choices: makeChoices(2 * n, 2, 10),
    answer: 2 * n,
  }
}

function genLevel5(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 4; i++) questions.push(genShareQuestion())
  for (let i = 0; i < 4; i++) questions.push(genDoubleQuestion())
  for (let i = 0; i < 2; i++) questions.push(genMirrorQuestion())
  return shuffle(questions)
}

// ---- Bana 6: Kompisplaneten – talkamrater ----
//
// Del–helhet: räven önskar sig ett tal, och att PARA IHOP två högar som
// tillsammans blir talet ÄR talkamratsmekaniken (à la Motion Math: Hungry
// Fish). Tiokompisbron är en tioram byggd som bro – hur många plankor fattas?

function genPairQuestion(): PairQuestion {
  const want = randInt(5, 10)
  const a = randInt(1, want - 1)
  const b = want - a
  // Två högar som passar + två som (oftast) inte gör det. Räven godkänner
  // VARJE par som summerar rätt, så dubbletter är aldrig fel.
  const piles = shuffle([a, b, randInt(1, 9), randInt(1, 9)])
  return {
    type: 'pair',
    prompt: `Räven vill ha ${want}! Välj två högar.`,
    spoken: `Stjärnräven är hungrig och vill ha exakt ${want} druvor. Välj två högar som tillsammans blir ${want}!`,
    item: '🍇',
    want,
    piles,
  }
}

function genBridgeQuestion(): ChoiceQuestion {
  const filled = randInt(1, 9)
  const answer = 10 - filled
  return {
    type: 'choice',
    prompt: 'Hur många plankor fattas?',
    spoken: `Bron över rymdbäcken har plats för tio plankor, men bara ${filled} är på plats. Hur många plankor fattas?`,
    tenframe: filled,
    choices: makeChoices(answer, 1, 9),
    answer,
  }
}

function genLevel6(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 5; i++) questions.push(genPairQuestion())
  for (let i = 0; i < 5; i++) questions.push(genBridgeQuestion())
  return shuffle(questions)
}

// ---- Bana 7: Vågplaneten – likhetstecknet ----
//
// Viktigast av allt: likhetstecknet betyder "lika mycket på båda sidor",
// inte "här kommer svaret". Därför roteras formaten medvetet – ibland är
// helheten till vänster (7 = 3 + _), ibland uppdelningen (3 + 4 = _ + 2).
// Vågen tippar synligt mot den tyngre sidan – fel svar SYNS som obalans.

function genBalanceTwoPlusOne(): BalanceQuestion {
  // vänster: a + b   höger: c + facket   (a + b = c + _)
  const a = randInt(1, 5)
  const b = randInt(1, 5)
  const c = randInt(Math.max(1, a + b - 6), a + b - 1)
  const answer = a + b - c
  return {
    type: 'balance',
    prompt: 'Gör lika!',
    spoken: `Vågen ska bli helt rak – lika mycket på båda sidor! Vänster sida har ${a} och ${b}. Höger sida har ${c} och ett tomt fack. Vilken sten gör det lika?`,
    left: [a, b],
    right: [c],
    choices: makeChoices(answer, 1, 6),
    answer,
  }
}

function genBalanceWholeFirst(): BalanceQuestion {
  // vänster: hela talet   höger: a + facket   (7 = 3 + _)
  const t = randInt(4, 9)
  const a = randInt(1, t - 1)
  const answer = t - a
  return {
    type: 'balance',
    prompt: 'Gör lika!',
    spoken: `Lika mycket på båda sidor! Vänster sida har ${t}. Höger sida har ${a} och ett tomt fack. Vilken sten gör det lika?`,
    left: [t],
    right: [a],
    choices: makeChoices(answer, 1, 8),
    answer,
  }
}

function genLevel7(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 5; i++) questions.push(genBalanceTwoPlusOne())
  for (let i = 0; i < 5; i++) questions.push(genBalanceWholeFirst())
  return shuffle(questions)
}

// ---- Bana 8: Mönsterbältet – mönster och talföljder ----
//
// Progression enligt forskningen: fortsätt mönstret → översätt det (varje
// färg är en TON, så mönstret hörs som melodi) → hitta biten som upprepas
// (svårast, därför bara två sådana per bana). Talföljder = växande mönster.

const PATTERN_COLORS = ['🔴', '🟡', '🔵', '🟢']

function genPatternNextQuestion(): PatternQuestion {
  const colors = shuffle(PATTERN_COLORS)
  const unitLen = Math.random() < 0.7 ? 2 : 3
  const unit = colors.slice(0, unitLen)
  // t.ex. AB → 🔴🟡🔴🟡🔴❓  (svar 🟡), ABC → 🔴🟡🔵🔴🟡🔵🔴❓ (svar 🟡)
  const sequence = [...unit, ...unit, unit[0]]
  const answer = unit[1]
  const wrong = colors[unitLen] // en färg som inte finns i mönstret
  const choices = shuffle([...new Set([answer, unit[0], wrong])])
  return {
    type: 'pattern',
    mode: 'next',
    prompt: 'Vad kommer sen?',
    spoken: 'Titta på mönstret – och lyssna! Vilken asteroid kommer sen?',
    sequence,
    choices,
    answer,
  }
}

function genPatternUnitQuestion(): PatternQuestion {
  const colors = shuffle(PATTERN_COLORS)
  const [x, y] = colors.slice(0, 2)
  const sequence = [x, y, x, y, x, y]
  const answer = x + y
  const choices = shuffle([answer, x + x, y + y])
  return {
    type: 'pattern',
    mode: 'unit',
    prompt: 'Vilken bit upprepas?',
    spoken: 'Mönstret är byggt av en liten bit som upprepas om och om igen. Vilken bit är det?',
    sequence,
    choices,
    answer,
  }
}

function genGrowingQuestion(): ChoiceQuestion {
  const step = randInt(1, 2)
  const up = Math.random() < 0.7
  const len = 4
  const startLo = up ? 0 : step * (len - 1)
  const startHi = up ? 20 - step * (len - 1) : 20
  const s = randInt(startLo, startHi)
  const seq = Array.from({ length: len }, (_, i) => (up ? s + i * step : s - i * step))
  const answer = seq[len - 1]
  return {
    type: 'choice',
    prompt: 'Vilket tal kommer sen?',
    spoken: `Talen hoppar i ett mönster: ${seq.slice(0, len - 1).join(', ')}... Vilket tal kommer sen?`,
    numberline: [...seq.slice(0, len - 1), null],
    choices: makeChoices(answer, 0, 20),
    answer,
  }
}

function genLevel8(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 5; i++) questions.push(genPatternNextQuestion())
  for (let i = 0; i < 3; i++) questions.push(genGrowingQuestion())
  for (let i = 0; i < 2; i++) questions.push(genPatternUnitQuestion())
  return shuffle(questions)
}

// ---- Bana 9: Jätteplaneten – addition & subtraktion 0–20 ----
//
// Nyckeln till 0–20 är att BRYGGA ÖVER TIAN: 8 + 5 = 8 + 2 + 3, med
// tiokompisarna (planet 6!) som verktyg. Talet 10 är en lysande vilostation
// och stora hopp görs i två steg. Resten är hopp på den långa talraden.

function genVia10Question(): Via10Question {
  const add = Math.random() < 0.6
  const start = add ? randInt(6, 9) : randInt(12, 15)
  const target = add ? randInt(12, 15) : randInt(5, 9)
  const answer1 = Math.abs(10 - start)
  const answer2 = Math.abs(target - 10)
  const choices1 = makeChoices(answer1, 1, 5)
  const choices2 = makeChoices(answer2, 1, 5)
  // Rita linjen så att ALLA valbara landningar ryms (kaninen hoppar det barnet väljer)
  const max1 = Math.max(...choices1)
  const max2 = Math.max(...choices2)
  const lo = add
    ? start - 1
    : Math.max(0, Math.min(start - max1, 10 - max2, target) - 1)
  const hi = add
    ? Math.min(20, Math.max(start + max1, 10 + max2, target) + 1)
    : start + 1
  return {
    type: 'via10',
    prompt: add
      ? `Från ${start} till ${target} – hoppa till tian först!`
      : `Från ${start} ner till ${target} – vila på tian!`,
    spoken: add
      ? `Ett jättehopp från ${start} till ${target}! Det är långt – hoppa till vilostationen på tian först. Hur långt är första hoppet?`
      : `Ett jättehopp från ${start} ner till ${target}! Hoppa ner till vilostationen på tian först. Hur långt är första hoppet?`,
    start,
    target,
    lo,
    hi,
    choices1,
    answer1,
    choices2,
    answer2,
  }
}

function genLevel9(): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < 6; i++) questions.push(genVia10Question())
  for (let i = 0; i < 4; i++) questions.push(genHopQuestion())
  return shuffle(questions)
}

// ---- Bana 10: Festplaneten – den stora blandade utmaningen ----
//
// Blandad övning (interleaving) ger bäst långtidsinlärning: barnet måste
// VÄLJA strategi, inte upprepa den senaste. Festen blandar frågor från alla
// planeter – adaptivt viktade så att planeter med färre stjärnor kommer
// oftare. Datan finns redan i localStorage.

function genLevel10(): Question[] {
  let stars: Record<number, number> = {}
  try {
    // samma nyckel som App.tsx (STORAGE_KEY)
    const raw = localStorage.getItem('rymddjuren-progress')
    if (raw) stars = (JSON.parse(raw) as { stars?: Record<number, number> }).stars ?? {}
  } catch {
    // ingen sparad data – blanda jämnt
  }
  const pool: number[] = []
  for (const lvl of LEVELS) {
    if (lvl.id === 10 || !lvl.generate) continue
    const weight = Math.max(1, 4 - (stars[lvl.id] ?? 0)) // färre stjärnor → fler frågor
    for (let i = 0; i < weight; i++) pool.push(lvl.id)
  }
  const questions: Question[] = []
  for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
    const id = pool[randInt(0, pool.length - 1)]
    const bank = LEVELS.find((l) => l.id === id)!.generate!()
    questions.push(bank[randInt(0, bank.length - 1)])
  }
  return questions
}

// ---- Planetlistan ----

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Kaninplaneten',
    animal: '🐰',
    animalName: 'Månkanin',
    color: '#ff6b6b',
    desc: 'Räkna 1–10',
    generate: genLevel1,
  },
  {
    id: 2,
    name: 'Stjärnstigen',
    animal: '🐢',
    animalName: 'Rymdsköldpadda',
    color: '#feca57',
    desc: 'Talraden 0–20',
    generate: genLevel2,
  },
  { id: 3, name: 'Apornas planet', animal: '🐵', animalName: 'Rymdapa', color: '#ff9f43', desc: 'Plus 0–10', generate: genLevel3 },
  { id: 4, name: 'Kometkalaset', animal: '🦜', animalName: 'Stjärnpapegoja', color: '#54a0ff', desc: 'Minus 0–10', generate: genLevel4 },
  { id: 5, name: 'Tvillingplaneten', animal: '🐼', animalName: 'Rymdpanda', color: '#5f27cd', desc: 'Dubbelt & hälften', generate: genLevel5 },
  { id: 6, name: 'Kompisplaneten', animal: '🦊', animalName: 'Stjärnräv', color: '#ee5253', desc: 'Talkamrater', generate: genLevel6 },
  { id: 7, name: 'Vågplaneten', animal: '🦎', animalName: 'Rymdödla', color: '#10ac84', desc: 'Lika mycket =', generate: genLevel7 },
  { id: 8, name: 'Mönsterbältet', animal: '🐴', animalName: 'Stjärnhäst', color: '#f368e0', desc: 'Mönster', generate: genLevel8 },
  { id: 9, name: 'Jätteplaneten', animal: '🦁', animalName: 'Rymdlejon', color: '#ff6348', desc: 'Plus & minus 0–20', generate: genLevel9 },
  { id: 10, name: 'Festplaneten', animal: '🐘', animalName: 'Månelefant', color: '#ffd32a', desc: 'Stora utmaningen', generate: genLevel10 },
]

export const QUESTIONS_PER_LEVEL = 10

export function starsFor(firstTryCorrect: number): number {
  if (firstTryCorrect >= 9) return 3
  if (firstTryCorrect >= 7) return 2
  return 1
}
