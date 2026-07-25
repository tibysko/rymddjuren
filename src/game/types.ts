// Shared types for Rymddjuren

export interface ChoiceQuestion {
  type: 'choice'
  prompt: string
  spoken: string
  /** Emoji to count (for "how many?") */
  item?: string
  count?: number
  /** Number line where null = the number that is missing */
  numberline?: (number | null)[]
  /** The mirror pond (planet 5): show the row once more as a reflection */
  mirror?: boolean
  /** The ten-friend bridge (planet 6): this many of the bridge's 10 planks are in place */
  tenframe?: number
  choices: number[]
  answer: number
}

export interface FeedQuestion {
  type: 'feed'
  prompt: string
  spoken: string
  animal: string
  item: string
  /** This many should be fed */
  target: number
  /** This many are shown to choose from */
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
  /** Where the rabbit starts on the ground (0–10) */
  start: number
  /** Where the banana hangs – the rabbit should land here (0–10) */
  target: number
  /** Left edge of the scene (whole number that gets drawn) */
  lo: number
  /** Right edge of the scene */
  hi: number
  /** Jump lengths to choose from (the number = the power of the jump) */
  choices: number[]
  /** The correct jump length = target - start */
  answer: number
}

export interface StairQuestion {
  type: 'stair'
  prompt: string
  spoken: string
  /** 'down' = taking away (counting backwards), 'up' = filling the gap (counting up) */
  dir: 'down' | 'up'
  /** The rabbit's starting step in the comet stairs */
  start: number
  /** The goal step – the sweets (down) or the parrot (up) */
  target: number
  /** Lowest step that gets drawn (never below 0 – the stairs end there!) */
  lo: number
  /** Highest step that gets drawn */
  hi: number
  /** Step counts to choose from (the number = how many steps the rabbit hops) */
  choices: number[]
  /** The correct number of steps = |target - start| */
  answer: number
}

export interface EatQuestion {
  type: 'eat'
  prompt: string
  spoken: string
  /** Sweet emoji on the party table */
  item: string
  /** This many sweets were there to begin with */
  total: number
  /** This many the parrot eats (visibly!) */
  eaten: number
  choices: number[]
  /** Left over = total - eaten */
  answer: number
}

/** The Twin Planet: share equally between the pandas – the seesaw visibly tips */
export interface ShareQuestion {
  type: 'share'
  prompt: string
  spoken: string
  item: string
  /** This many are to be shared – always an even number */
  total: number
}

/** The Twin Planet: the trampoline doubles the jump – chosen number × 2 = landing */
export interface DoubleQuestion {
  type: 'double'
  prompt: string
  spoken: string
  /** Where the star sits – always even (= double the answer) */
  target: number
  /** The highest number drawn on the track */
  hi: number
  choices: number[]
  /** The correct jump power = target / 2 */
  answer: number
}

/** The Friend Planet: pick TWO piles that together make the fox's number */
export interface PairQuestion {
  type: 'pair'
  prompt: string
  spoken: string
  item: string
  /** The number the fox wishes for */
  want: number
  /** The sizes of the piles – at least one pair adds up to want */
  piles: number[]
}

/** The Scale Planet: make both sides equal – the scale tips towards the heavier side */
export interface BalanceQuestion {
  type: 'balance'
  prompt: string
  spoken: string
  /** Known baskets on the left side */
  left: number[]
  /** Known baskets on the right side (plus the empty slot) */
  right: number[]
  choices: number[]
  /** The correct stone = sum of left − sum of right */
  answer: number
}

/** The Pattern Belt: continue the pattern / find the repeating unit */
export interface PatternQuestion {
  type: 'pattern'
  prompt: string
  spoken: string
  /** 'next' = what comes next?  'unit' = which piece repeats? */
  mode: 'next' | 'unit'
  /** The pattern that is shown (without the missing part) */
  sequence: string[]
  /** Emoji (next) or emoji pieces (unit) to choose from */
  choices: string[]
  answer: string
}

/** The Giant Planet: big jumps in TWO steps – via the rest stop at 10 */
export interface Via10Question {
  type: 'via10'
  prompt: string
  spoken: string
  start: number
  target: number
  /** Lowest/highest number drawn (10 is always included) */
  lo: number
  hi: number
  /** Step 1: the jump to ten */
  choices1: number[]
  answer1: number
  /** Step 2: the rest of the way to the star */
  choices2: number[]
  answer2: number
}

export type Question =
  | ChoiceQuestion
  | FeedQuestion
  | HopQuestion
  | JumpQuestion
  | StairQuestion
  | EatQuestion
  | ShareQuestion
  | DoubleQuestion
  | PairQuestion
  | BalanceQuestion
  | PatternQuestion
  | Via10Question

export interface Level {
  id: number
  name: string
  animal: string
  animalName: string
  color: string
  desc: string
  /** null = the level has not been built yet */
  generate: (() => Question[]) | null
}

export interface Progress {
  stars: Record<number, number>
  animals: number[]
}
