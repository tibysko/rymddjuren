// Gemensamma typer för Rymddjuren

export interface ChoiceQuestion {
  type: 'choice'
  prompt: string
  spoken: string
  /** Emoji att räkna (för "Hur många?") */
  item?: string
  count?: number
  /** Tallinje där null = det tal som fattas */
  numberline?: (number | null)[]
  choices: number[]
  answer: number
}

export interface FeedQuestion {
  type: 'feed'
  prompt: string
  spoken: string
  animal: string
  item: string
  /** Så många ska matas */
  target: number
  /** Så många visas att välja bland */
  total: number
}

export interface HopQuestion {
  type: 'hop'
  prompt: string
  spoken: string
  stones: number[]
  start: number
  target: number
  choices: number[]
  answer: number
}

export type Question = ChoiceQuestion | FeedQuestion | HopQuestion

export interface Level {
  id: number
  name: string
  animal: string
  animalName: string
  color: string
  desc: string
  /** null = banan är inte byggd än */
  generate: (() => Question[]) | null
}

export interface Progress {
  stars: Record<number, number>
  animals: number[]
}
