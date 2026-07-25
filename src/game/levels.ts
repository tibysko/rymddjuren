// The planets of Rymddjuren – mapped to the Swedish curriculum Lgr22, year 1
// (see DESIGN.md). All player-facing text lives in src/i18n/sv.ts.

import { sv } from '../i18n/sv'
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

// Build the answer options: the correct answer plus nearby numbers
function makeChoices(answer: number, min = 1, max = 10, count = 3): number[] {
  const choices = new Set<number>([answer])
  let guard = 0
  while (choices.size < count && guard++ < 50) {
    const offset = randInt(1, 2) * (Math.random() < 0.5 ? -1 : 1)
    const c = answer + offset
    if (c >= min && c <= max) choices.add(c)
  }
  // Top up if we got stuck (e.g. the answer sits at the edge of the range)
  while (choices.size < count) {
    choices.add(randInt(min, max))
  }
  return shuffle([...choices])
}

// ---- Level 1: the Rabbit Planet – connect quantity to numeral, 1–10 ----

const COUNT_ITEMS = ['🥕', '🌟', '🍓', '🌸', '🪨']

function genCountQuestion(): ChoiceQuestion {
  const n = randInt(1, 10)
  const item = COUNT_ITEMS[randInt(0, COUNT_ITEMS.length - 1)]
  return {
    type: 'choice',
    prompt: sv.count.prompt,
    spoken: sv.count.spoken,
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
    prompt: sv.feed.prompt(target),
    spoken: sv.feed.spoken(target),
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

// ---- Level 2: the Star Path – the number line 0–20 (platformer style) ----

function genHopQuestion(): HopQuestion {
  const forward = Math.random() < 0.7
  const dist = randInt(1, 4)
  // The options are generated first, because the rabbit literally hops
  // whatever the child picks – every possible landing must fit on 0–20.
  const choices = makeChoices(dist, 1, 6)
  const maxChoice = Math.max(...choices)
  const start = forward ? randInt(0, 20 - maxChoice) : randInt(maxChoice, 20)
  const target = forward ? start + dist : start - dist
  // The stones cover the start, every possible landing and one spare at the edge
  const lo = Math.max(0, (forward ? start : start - maxChoice) - 1)
  const hi = Math.min(20, (forward ? start + maxChoice : start) + 1)
  const stones: number[] = []
  for (let n = lo; n <= hi; n++) stones.push(n)
  return {
    type: 'hop',
    prompt: forward ? sv.hop.promptForward : sv.hop.promptBack,
    spoken: forward ? sv.hop.spokenForward : sv.hop.spokenBack,
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
    prompt: sv.missing.prompt,
    spoken: sv.missing.spoken,
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

// ---- Level 3: the Monkey Planet – addition 0–10 (track B: the ravine jump) ----
//
// A side-scrolling scene: the rabbit stands on a number, the banana hangs on a
// number further away, and a ravine gapes in between. The child picks HOW FAR
// the jump goes – the number literally becomes the power of the jump
// (start + jump = the banana). Too short and the rabbit visibly falls into the
// ravine; too long and it sails past the banana. Addition is a forward jump,
// just like the Star Path but with gravity.

function genJumpQuestion(): JumpQuestion {
  const start = randInt(0, 4)
  const answer = randInt(2, 5) // the length of the jump = the missing number
  const target = start + answer // where the banana hangs (≤ 9)
  const hi = Math.min(10, target + 2)
  const lo = Math.max(0, start - 1)
  // Every possible jump has to fit on the ground (or the rabbit leaves the scene)
  const choices = makeChoices(answer, 1, hi - start)
  return {
    type: 'jump',
    prompt: sv.jump.prompt(start, target),
    spoken: sv.jump.spoken(start, target),
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

// ---- Level 4: the Comet Party – subtraction 0–10 (see docs/research-planet4-comet-party.md) ----
//
// Three mechanics showing the same subtraction from three angles:
// 1. The comet stairs DOWN – taking away as backward movement (heir to the
//    ravine jump). The stairs end at 0, so the child sees that you cannot take
//    away more than you have.
// 2. The party table – the parrot visibly eats sweets: "how many are left?"
// 3. The comet stairs UP – filling the gap ("from 5 up to 8"), the counting-up
//    strategy the research recommends. Counting backwards must never dominate.

function genStairDownQuestion(): StairQuestion {
  const answer = randInt(1, 5) // differences 1–5 – larger is too hard at the start of year 1
  // start ≥ 3 so makeChoices(answer, 1, start) can always produce 3 distinct options
  const start = randInt(Math.max(answer, 3), 9)
  const target = start - answer
  // Every selectable hop must land on the stairs (never below 0)
  const choices = makeChoices(answer, 1, start)
  const maxChoice = Math.max(...choices)
  const lo = Math.max(0, start - maxChoice - 1)
  const hi = Math.min(10, start + 1)
  return {
    type: 'stair',
    dir: 'down',
    prompt: sv.stair.promptDown(start, target),
    spoken: sv.stair.spokenDown(start, target),
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
  // Every selectable hop must fit on the stairs (never above 10)
  const choices = makeChoices(answer, 1, 10 - start)
  const maxChoice = Math.max(...choices)
  const lo = Math.max(0, start - 1)
  const hi = Math.min(10, start + maxChoice + 1)
  return {
    type: 'stair',
    dir: 'up',
    prompt: sv.stair.promptUp(start, target),
    spoken: sv.stair.spokenUp(start, target),
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
  const answer = total - eaten // may be 0 – "they are all eaten!" is an important discovery
  const item = PARTY_ITEMS[randInt(0, PARTY_ITEMS.length - 1)]
  return {
    type: 'eat',
    prompt: sv.eat.prompt,
    spoken: sv.eat.spoken(total, eaten),
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

// ---- Level 5: the Twin Planet – doubles & halves (see docs/research-planet5-10.md) ----
//
// Children's intuition for sharing arrives long before formal arithmetic, so
// doubles and halves start with SHARING: the seesaw tips towards the heavier
// side, making imbalance visible and tangible. The trampoline turns doubling
// into a movement (jump × 2), and the mirror pond shows a double as two equal
// parts.

function genShareQuestion(): ShareQuestion {
  const total = 2 * randInt(2, 5) // 4, 6, 8, 10 – always even
  return {
    type: 'share',
    prompt: sv.share.prompt(total),
    spoken: sv.share.spoken(total),
    item: '🎋',
    total,
  }
}

function genDoubleQuestion(): DoubleQuestion {
  const answer = randInt(2, 5)
  const target = 2 * answer // 4, 6, 8, 10
  return {
    type: 'double',
    prompt: sv.double.prompt(target),
    spoken: sv.double.spoken(target),
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
    prompt: sv.mirror.prompt,
    spoken: sv.mirror.spoken(n),
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

// ---- Level 6: the Friend Planet – number bonds ----
//
// Part–whole: the fox wishes for a number, and PAIRING UP two piles that add up
// to it IS the number-bond mechanic (in the spirit of Motion Math: Hungry
// Fish). The ten-friend bridge is a ten frame built as a bridge – how many
// planks are missing?

function genPairQuestion(): PairQuestion {
  const want = randInt(5, 10)
  const a = randInt(1, want - 1)
  const b = want - a
  // Two piles that fit plus two that (usually) do not. The fox accepts EVERY
  // pair that adds up correctly, so duplicates are never wrong.
  const piles = shuffle([a, b, randInt(1, 9), randInt(1, 9)])
  return {
    type: 'pair',
    prompt: sv.pair.prompt(want),
    spoken: sv.pair.spoken(want),
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
    prompt: sv.bridge.prompt,
    spoken: sv.bridge.spoken(filled),
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

// ---- Level 7: the Scale Planet – the equals sign ----
//
// Most important of all: the equals sign means "the same amount on both
// sides", not "here comes the answer". That is why the formats are rotated
// deliberately – sometimes the whole is on the left (7 = 3 + _), sometimes the
// partition is (3 + 4 = _ + 2). The scale visibly tips towards the heavier
// side, so a wrong answer SHOWS UP as imbalance.

function genBalanceTwoPlusOne(): BalanceQuestion {
  // left: a + b   right: c + the empty slot   (a + b = c + _)
  const a = randInt(1, 5)
  const b = randInt(1, 5)
  const c = randInt(Math.max(1, a + b - 6), a + b - 1)
  const answer = a + b - c
  return {
    type: 'balance',
    prompt: sv.balance.prompt,
    spoken: sv.balance.spokenTwoPlusOne(a, b, c),
    left: [a, b],
    right: [c],
    choices: makeChoices(answer, 1, 6),
    answer,
  }
}

function genBalanceWholeFirst(): BalanceQuestion {
  // left: the whole number   right: a + the empty slot   (7 = 3 + _)
  const t = randInt(4, 9)
  const a = randInt(1, t - 1)
  const answer = t - a
  return {
    type: 'balance',
    prompt: sv.balance.prompt,
    spoken: sv.balance.spokenWholeFirst(t, a),
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

// ---- Level 8: the Pattern Belt – patterns and number sequences ----
//
// The progression the research suggests: continue the pattern → translate it
// (every colour is a TONE, so the pattern can be heard as a melody) → find the
// repeating unit (hardest, hence only two per level). Number sequences are
// growing patterns.

const PATTERN_COLORS = ['🔴', '🟡', '🔵', '🟢']

function genPatternNextQuestion(): PatternQuestion {
  const colors = shuffle(PATTERN_COLORS)
  const unitLen = Math.random() < 0.7 ? 2 : 3
  const unit = colors.slice(0, unitLen)
  // e.g. AB → 🔴🟡🔴🟡🔴❓ (answer 🟡), ABC → 🔴🟡🔵🔴🟡🔵🔴❓ (answer 🟡)
  const sequence = [...unit, ...unit, unit[0]]
  const answer = unit[1]
  const wrong = colors[unitLen] // a colour that does not appear in the pattern
  const choices = shuffle([...new Set([answer, unit[0], wrong])])
  return {
    type: 'pattern',
    mode: 'next',
    prompt: sv.pattern.nextPrompt,
    spoken: sv.pattern.nextSpoken,
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
    prompt: sv.pattern.unitPrompt,
    spoken: sv.pattern.unitSpoken,
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
    prompt: sv.growing.prompt,
    spoken: sv.growing.spoken(seq.slice(0, len - 1).join(', ')),
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

// ---- Level 9: the Giant Planet – addition & subtraction 0–20 ----
//
// The key to 0–20 is BRIDGING THROUGH TEN: 8 + 5 = 8 + 2 + 3, using the number
// bonds from planet 6 as the tool. The number 10 is a glowing rest stop, and
// big jumps are made in two steps. The rest is hopping along the long number
// line.

function genVia10Question(): Via10Question {
  const add = Math.random() < 0.6
  const start = add ? randInt(6, 9) : randInt(12, 15)
  const target = add ? randInt(12, 15) : randInt(5, 9)
  const answer1 = Math.abs(10 - start)
  const answer2 = Math.abs(target - 10)
  const choices1 = makeChoices(answer1, 1, 5)
  const choices2 = makeChoices(answer2, 1, 5)
  // Draw the line so that EVERY selectable landing fits (the rabbit hops
  // whatever the child picks)
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
    prompt: add ? sv.via10.promptUp(start, target) : sv.via10.promptDown(start, target),
    spoken: add ? sv.via10.spokenUp(start, target) : sv.via10.spokenDown(start, target),
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

// ---- Level 10: the Party Planet – the big mixed challenge ----
//
// Interleaved practice gives the best long-term learning: the child has to
// CHOOSE a strategy rather than repeat the most recent one. The party mixes
// questions from every planet – adaptively weighted so planets with fewer
// stars come up more often. The data is already in localStorage.

function genLevel10(): Question[] {
  let stars: Record<number, number> = {}
  try {
    // Same key as App.tsx (STORAGE_KEY)
    const raw = localStorage.getItem('rymddjuren-progress')
    if (raw) stars = (JSON.parse(raw) as { stars?: Record<number, number> }).stars ?? {}
  } catch {
    // No saved data – mix evenly
  }
  const pool: number[] = []
  for (const lvl of LEVELS) {
    if (lvl.id === 10 || !lvl.generate) continue
    const weight = Math.max(1, 4 - (stars[lvl.id] ?? 0)) // fewer stars → more questions
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

// ---- The planet list ----

export const LEVELS: Level[] = [
  { id: 1, ...sv.planets[1], animal: '🐰', color: '#ff6b6b', generate: genLevel1 },
  { id: 2, ...sv.planets[2], animal: '🐢', color: '#feca57', generate: genLevel2 },
  { id: 3, ...sv.planets[3], animal: '🐵', color: '#ff9f43', generate: genLevel3 },
  { id: 4, ...sv.planets[4], animal: '🦜', color: '#54a0ff', generate: genLevel4 },
  { id: 5, ...sv.planets[5], animal: '🐼', color: '#5f27cd', generate: genLevel5 },
  { id: 6, ...sv.planets[6], animal: '🦊', color: '#ee5253', generate: genLevel6 },
  { id: 7, ...sv.planets[7], animal: '🦎', color: '#10ac84', generate: genLevel7 },
  { id: 8, ...sv.planets[8], animal: '🐴', color: '#f368e0', generate: genLevel8 },
  { id: 9, ...sv.planets[9], animal: '🦁', color: '#ff6348', generate: genLevel9 },
  { id: 10, ...sv.planets[10], animal: '🐘', color: '#ffd32a', generate: genLevel10 },
]

export const QUESTIONS_PER_LEVEL = 10

export function starsFor(firstTryCorrect: number): number {
  if (firstTryCorrect >= 9) return 3
  if (firstTryCorrect >= 7) return 2
  return 1
}
