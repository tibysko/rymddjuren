// Planeterna i Rymddjuren – mappade mot Lgr22 åk 1 (se DESIGN.md)

import type { ChoiceQuestion, EatQuestion, FeedQuestion, HopQuestion, JumpQuestion, Level, Question, StairQuestion } from './types'

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
  { id: 5, name: 'Tvillingplaneten', animal: '🐼', animalName: 'Rymdpanda', color: '#5f27cd', desc: 'Dubbelt & hälften', generate: null },
  { id: 6, name: 'Kompisplaneten', animal: '🦊', animalName: 'Stjärnräv', color: '#ee5253', desc: 'Talkamrater', generate: null },
  { id: 7, name: 'Vågplaneten', animal: '🦎', animalName: 'Rymdödla', color: '#10ac84', desc: 'Lika mycket =', generate: null },
  { id: 8, name: 'Mönsterbältet', animal: '🐴', animalName: 'Stjärnhäst', color: '#f368e0', desc: 'Mönster', generate: null },
  { id: 9, name: 'Jätteplaneten', animal: '🦁', animalName: 'Rymdlejon', color: '#ff6348', desc: 'Plus & minus 0–20', generate: null },
  { id: 10, name: 'Festplaneten', animal: '🐘', animalName: 'Månelefant', color: '#ffd32a', desc: 'Stora utmaningen', generate: null },
]

export const QUESTIONS_PER_LEVEL = 10

export function starsFor(firstTryCorrect: number): number {
  if (firstTryCorrect >= 9) return 3
  if (firstTryCorrect >= 7) return 2
  return 1
}
