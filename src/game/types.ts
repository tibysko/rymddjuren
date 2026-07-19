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

export interface JumpQuestion {
  type: 'jump'
  prompt: string
  spoken: string
  /** Apans startposition på marken (0–10) */
  start: number
  /** Bananens position – hit ska apan landa (0–10) */
  target: number
  /** Scenens vänstra kant (heltal som ritas ut) */
  lo: number
  /** Scenens högra kant */
  hi: number
  /** Hopplängder att välja bland (talet = hoppets kraft) */
  choices: number[]
  /** Rätt hopplängd = target - start */
  answer: number
}

export interface StairQuestion {
  type: 'stair'
  prompt: string
  spoken: string
  /** 'ner' = ta bort (bakåträkning), 'upp' = utfyllnad (räkna uppåt) */
  dir: 'ner' | 'upp'
  /** Kaninens startsteg i komettrappan */
  start: number
  /** Målsteget – godiset (ner) eller papegojan (upp) */
  target: number
  /** Lägsta trappsteg som ritas (aldrig under 0 – trappan slutar där!) */
  lo: number
  /** Högsta trappsteg som ritas */
  hi: number
  /** Antal steg att välja bland (talet = så många steg kaninen hoppar) */
  choices: number[]
  /** Rätt antal steg = |target - start| */
  answer: number
}

export interface EatQuestion {
  type: 'eat'
  prompt: string
  spoken: string
  /** Godis-emoji på kalasbordet */
  item: string
  /** Så många godisar fanns från början */
  total: number
  /** Så många äter papegojan upp (synligt!) */
  eaten: number
  choices: number[]
  /** Kvar = total - eaten */
  answer: number
}

export type Question = ChoiceQuestion | FeedQuestion | HopQuestion | JumpQuestion | StairQuestion | EatQuestion

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
