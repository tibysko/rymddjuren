// Planeterna i Rymddjuren – mappade mot Lgr22 åk 1 (se DESIGN.md)

import type { ChoiceQuestion, FeedQuestion, HopQuestion, Level, Question } from './types'

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
  const start = forward ? randInt(0, 20 - dist) : randInt(dist, 20)
  const target = forward ? start + dist : start - dist
  const lo = Math.max(0, Math.min(start, target) - 1)
  const hi = Math.min(20, Math.max(start, target) + 1)
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
    choices: makeChoices(dist, 1, 6),
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
  { id: 3, name: 'Apornas planet', animal: '🐵', animalName: 'Rymdapa', color: '#ff9f43', desc: 'Plus 0–10', generate: null },
  { id: 4, name: 'Kometkalaset', animal: '🦜', animalName: 'Stjärnpapegoja', color: '#54a0ff', desc: 'Minus 0–10', generate: null },
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
