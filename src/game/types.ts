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
  /** Spegeldammen (planet 5): visa raden en gång till som spegelbild */
  mirror?: boolean
  /** Tiokompisbron (planet 6): så många av broens 10 plankor är på plats */
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

/** Tvillingplaneten: dela lika mellan pandorna – gungbrädan tippar synligt */
export interface ShareQuestion {
  type: 'share'
  prompt: string
  spoken: string
  item: string
  /** Så många ska delas – alltid jämnt */
  total: number
}

/** Tvillingplaneten: studsmattan dubblar hoppet – valt tal × 2 = landning */
export interface DoubleQuestion {
  type: 'double'
  prompt: string
  spoken: string
  /** Stjärnans plats – alltid jämn (= dubbelt av svaret) */
  target: number
  /** Banans högsta tal som ritas */
  hi: number
  choices: number[]
  /** Rätt hoppkraft = target / 2 */
  answer: number
}

/** Kompisplaneten: välj TVÅ högar som tillsammans blir rävens tal */
export interface PairQuestion {
  type: 'pair'
  prompt: string
  spoken: string
  item: string
  /** Talet räven önskar sig */
  want: number
  /** Högarnas storlekar – minst ett par summerar till want */
  piles: number[]
}

/** Vågplaneten: gör lika på båda sidor – vågen tippar mot den tyngre */
export interface BalanceQuestion {
  type: 'balance'
  prompt: string
  spoken: string
  /** Kända korgar på vänster sida */
  left: number[]
  /** Kända korgar på höger sida (plus det tomma facket) */
  right: number[]
  choices: number[]
  /** Rätt sten = summa vänster − summa höger */
  answer: number
}

/** Mönsterbältet: fortsätt mönstret / hitta biten som upprepas */
export interface PatternQuestion {
  type: 'pattern'
  prompt: string
  spoken: string
  /** 'next' = vad kommer sen?  'unit' = vilken bit upprepas? */
  mode: 'next' | 'unit'
  /** Mönstret som visas (utan det som fattas) */
  sequence: string[]
  /** Emoji (next) eller emoji-bitar (unit) att välja bland */
  choices: string[]
  answer: string
}

/** Jätteplaneten: stora hopp i TVÅ steg – via vilostationen på 10 */
export interface Via10Question {
  type: 'via10'
  prompt: string
  spoken: string
  start: number
  target: number
  /** Lägsta/högsta tal som ritas (10 ingår alltid) */
  lo: number
  hi: number
  /** Steg 1: hoppet till tian */
  choices1: number[]
  answer1: number
  /** Steg 2: resten till stjärnan */
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
  /** null = banan är inte byggd än */
  generate: (() => Question[]) | null
}

export interface Progress {
  stars: Record<number, number>
  animals: number[]
}
