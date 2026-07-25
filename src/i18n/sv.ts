// All Swedish text the child sees or hears, gathered in one place.
//
// The rest of the codebase is English; this file is the single exception,
// because the game itself is played in Swedish. Keep every user-facing
// string here — prompts, spoken lines (speech synthesis), button labels,
// aria-labels and feedback — so the wording can be reviewed and tweaked
// without touching game logic.
//
// Strings that need numbers or names are functions; plain strings are
// constants. Grouped by where they appear.

/** Small numbers spelled out – reads better aloud than digits for a 7-year-old */
const NUMBER_WORDS = [
  'noll',
  'ett',
  'två',
  'tre',
  'fyra',
  'fem',
  'sex',
  'sju',
  'åtta',
  'nio',
  'tio',
]

function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n)
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export const sv = {
  // ---- Star map ----
  map: {
    title: '🚀 Rymddjuren',
    stationButton: '🛰️ Min rymdstation',
    greeting: 'Hej! Jag är Ugglis. Vilken planet ska vi flyga till?',
    locked: 'Låst',
    comingSoon: ' (kommer snart!)',
    buildButton: 'Version',
    buildHeading: 'Version på den här mobilen',
    buildVersion: (id: string) => `Version ${id}`,
    buildLocal: 'lokal',
    buildClose: 'Stäng',
  },

  // ---- Travel screen ----
  travel: {
    heading: (planet: string) => `Mot ${planet}!`,
  },

  // ---- Space station (the animals you have collected) ----
  station: {
    title: '🛰️ Min rymdstation',
    empty: 'Här är det tomt än! Klara en planet så flyttar ett djur in.',
    back: '⬅️ Stjärnkartan',
    speakLabel: 'Läs upp',
    /** Under the station picture: "7 av 10 djur bor här" */
    counter: (collected: number, total: number) => `${collected} av ${total} djur bor här`,
    /** Ugglis greets you with a line that depends on how full the station is
        (`empty` above is her line when no animal has moved in yet) */
    ugglisSome: (collected: number, left: number) =>
      `${capitalize(numberWord(collected))} djur bor här! Bara ${numberWord(left)} kvar!`,
    ugglisFull: 'Hela rymden är här! Hurra!',
    /** Small hint above the animal cards */
    tapHint: 'Tryck på ett djur!',
    /** The dark silhouette card: the animal that moves in next */
    nextLabel: 'Vem kommer sen?',
    /** The fully hidden cards after the next one */
    unknownLabel: 'Hemligt',
    /** One short riddle per animal – Ugglis reads it for the silhouette card */
    riddles: {
      1: 'Vem har långa öron och hoppar högt?',
      2: 'Vem går långsamt och har ett hus på ryggen?',
      3: 'Vem klättrar och älskar bananer?',
      4: 'Vem har granna fjädrar och kan härma dig?',
      5: 'Vem är svart och vit och äter bambu?',
      6: 'Vem är röd och listig och har en yvig svans?',
      7: 'Vem är liten och grön och solar på en sten?',
      8: 'Vem galopperar och har man och svans?',
      9: 'Vem har stor man och ryter högt?',
      10: 'Vem är jättestor och har lång snabel?',
    } as Record<number, string>,
  },

  // ---- Result screen ----
  result: {
    heading: (planet: string) => `Du klarade ${planet}! 🎉`,
    newAnimal: (animalName: string) => `${animalName} flyttar in i din rymdstation!`,
    praise: 'Bra jobbat, rymdhjälte!',
    back: 'Till stjärnkartan 🚀',
  },

  // ---- Level screen: shared chrome and feedback ----
  level: {
    speakLabel: 'Läs upp',
    backToMap: '⬅️ Stjärnkartan',
    check: 'Klart! ✅',
    /** Ugglis cheers on a correct answer – picked at random */
    cheers: ['Bra jobbat!', 'Superbra!', 'Wow, vad duktig du är!', 'Rätt! 🎉', 'Hurra!'],
    /** Ugglis offers a second chance – picked at random */
    tryAgain: ['Nästan! Prova igen!', 'Inte riktigt – du klarar det!', 'Försök en gång till!'],
  },

  // ---- Planets (name, animal and short description on the star map) ----
  planets: {
    1: { name: 'Kaninplaneten', animalName: 'Månkanin', desc: 'Räkna 1–10' },
    2: { name: 'Stjärnstigen', animalName: 'Rymdsköldpadda', desc: 'Talraden 0–20' },
    3: { name: 'Apornas planet', animalName: 'Rymdapa', desc: 'Plus 0–10' },
    4: { name: 'Kometkalaset', animalName: 'Stjärnpapegoja', desc: 'Minus 0–10' },
    5: { name: 'Tvillingplaneten', animalName: 'Rymdpanda', desc: 'Dubbelt & hälften' },
    6: { name: 'Kompisplaneten', animalName: 'Stjärnräv', desc: 'Talkamrater' },
    7: { name: 'Vågplaneten', animalName: 'Rymdödla', desc: 'Lika mycket =' },
    8: { name: 'Mönsterbältet', animalName: 'Stjärnhäst', desc: 'Mönster' },
    9: { name: 'Jätteplaneten', animalName: 'Rymdlejon', desc: 'Plus & minus 0–20' },
    10: { name: 'Festplaneten', animalName: 'Månelefant', desc: 'Stora utmaningen' },
  },

  // ---- Planet 1: counting and feeding ----
  count: {
    prompt: 'Hur många?',
    spoken: 'Hur många ser du?',
  },
  feed: {
    prompt: (target: number) => `Mata kaninen med ${target} morötter!`,
    spoken: (target: number) => `Mata kaninen med ${target} morötter!`,
  },

  // ---- Planet 2: the number line ----
  hop: {
    promptForward: 'Hur många hopp till stjärnan?',
    promptBack: 'Hoppa bakåt! Hur många hopp?',
    spokenForward: 'Hjälp kaninen hoppa fram till stjärnan! Hur många hopp behövs?',
    spokenBack: 'Stjärnan är bakom kaninen! Hur många hopp bakåt?',
    tooShort: (choice: number) => `Oj! ${choice} hopp räckte inte fram. Prova igen!`,
    tooFar: (choice: number) => `Oj! ${choice} hopp var för långt. Prova igen!`,
  },
  missing: {
    prompt: 'Vilket tal fattas?',
    spoken: 'Vilket tal fattas på stigen?',
  },

  // ---- Planet 3: the ravine jump ----
  jump: {
    prompt: (start: number, target: number) =>
      `Kaninen står på ${start}, bananen på ${target}. Hur långt hopp?`,
    spoken: (start: number, target: number) =>
      `Hjälp kaninen hoppa över ravinen till den hungriga apan! Kaninen står på talet ${start} och bananen hänger på talet ${target}. Hur långt är hoppet?`,
    fell: (choice: number) =>
      `Oj! ${choice} räckte inte fram – kaninen föll i ravinen! Prova igen.`,
    overshot: (choice: number) =>
      `Oj! ${choice} var för långt – kaninen hoppade förbi bananen! Prova igen.`,
  },

  // ---- Planet 4: the comet stairs and the party table ----
  stair: {
    promptDown: (start: number, target: number) =>
      `Kaninen står på ${start}, godiset på ${target}. Hur många steg ner?`,
    spokenDown: (start: number, target: number) =>
      `Kalas på kometen! Kaninen står på talet ${start} och godispåsen ligger på talet ${target}. Hur många steg ner ska kaninen hoppa?`,
    promptUp: (start: number, target: number) =>
      `Kaninen står på ${start}, papegojan på ${target}. Hur många hopp upp?`,
    spokenUp: (start: number, target: number) =>
      `Stjärnpapegojan sitter högre upp i komettrappan! Kaninen står på talet ${start} och papegojan sitter på talet ${target}. Hur många hopp upp behövs?`,
    /** What the rabbit is heading for, and what a move is called, per direction */
    goalDown: 'godiset',
    goalUp: 'papegojan',
    moveDown: 'steg',
    moveUp: 'hopp',
    tooShort: (choice: number, move: string, goal: string) =>
      `Oj! ${choice} ${move} räckte inte till ${goal}. Prova igen!`,
    tooFar: (choice: number, move: string, goal: string) =>
      `Oj! ${choice} ${move} var för många – kaninen for förbi ${goal}! Prova igen!`,
  },
  eat: {
    prompt: 'Hur många är kvar?',
    spoken: (total: number, eaten: number) =>
      `Det låg ${total} godisar på kalasbordet. Papegojan åt upp ${eaten}! Hur många godisar är kvar?`,
    start: (total: number) => `Först: ${total}`,
    eaten: (eaten: number) => `Åt upp: ${eaten}`,
    left: (left: number) => `Kvar: ${left}`,
    countTheRest: (total: number, eaten: number, left: number) =>
      `Först var det ${total}. Papegojan åt ${eaten}. Då är ${left} kvar.`,
  },

  // ---- Planet 5: sharing, the trampoline and the mirror pond ----
  share: {
    prompt: (total: number) => `Dela ${total} lika mellan pandorna!`,
    spoken: (total: number) =>
      `Tvillingpandorna vill ha lika mycket bambu! Dela ${total} pinnar så att gungbrädan blir helt rak.`,
    shareAllFirst: 'Dela ut alla pinnar först!',
    tilting: (left: number, right: number) =>
      `Gungbrädan tippar! ${left} och ${right} är inte lika.`,
    allShared: 'Allt utdelat!',
    source: 'Bambu att dela',
    help: 'Tryck på en panda. Den får en pinne!',
    giveLeftLabel: 'Ge vänster panda en pinne',
    giveRightLabel: 'Ge höger panda en pinne',
    giveLabel: 'Ge en pinne',
    takeBackLeftLabel: 'Ta tillbaka från vänster',
    takeBackRightLabel: 'Ta tillbaka från höger',
    undoLabel: 'Ta tillbaka',
  },
  double: {
    prompt: (target: number) =>
      `Till stjärnan på ${target}! Studsmattan dubblar. Vad hoppar du?`,
    spoken: (target: number) =>
      `Stjärnan är på talet ${target}. Studsmattan gör hoppet dubbelt så långt! Vilket tal ska kaninen hoppa?`,
    landedWrong: (choice: number, landed: number, target: number) =>
      `Du hoppade ${choice} – studsmattan gjorde ${landed}! Stjärnan är på ${target}.`,
  },
  mirror: {
    prompt: 'Hur många blir det med spegeln?',
    spoken: (n: number) =>
      `Titta i spegeldammen! ${n} stjärnor – och deras spegelbilder. Hur många stjärnor ser du sammanlagt?`,
  },

  // ---- Planet 6: number bonds ----
  pair: {
    prompt: (want: number) => `Räven vill ha ${want}! Välj två högar.`,
    spoken: (want: number) =>
      `Stjärnräven är hungrig och vill ha exakt ${want} druvor. Välj två högar som tillsammans blir ${want}!`,
    wrongSum: (a: number, b: number, sum: number, want: number) =>
      `${a} och ${b} blir ${sum} – räven vill ha ${want}!`,
  },
  bridge: {
    prompt: 'Hur många plankor fattas?',
    spoken: (filled: number) =>
      `Bron över rymdbäcken har plats för tio plankor, men bara ${filled} är på plats. Hur många plankor fattas?`,
  },

  // ---- Planet 7: the equals sign ----
  balance: {
    prompt: 'Gör lika!',
    spokenTwoPlusOne: (a: number, b: number, c: number) =>
      `Vågen ska bli helt rak – lika mycket på båda sidor! Vänster sida har ${a} och ${b}. Höger sida har ${c} och ett tomt fack. Vilken sten gör det lika?`,
    spokenWholeFirst: (total: number, a: number) =>
      `Lika mycket på båda sidor! Vänster sida har ${total}. Höger sida har ${a} och ett tomt fack. Vilken sten gör det lika?`,
    tooLittle: (choice: number) => `Vågen tippar åt vänster – ${choice} är för lite i facket!`,
    tooMuch: (choice: number) => `Vågen tippar åt höger – ${choice} är för mycket i facket!`,
  },

  // ---- Planet 8: patterns and number sequences ----
  pattern: {
    nextPrompt: 'Vad kommer sen?',
    nextSpoken: 'Titta på mönstret – och lyssna! Vilken asteroid kommer sen?',
    unitPrompt: 'Vilken bit upprepas?',
    unitSpoken:
      'Mönstret är byggt av en liten bit som upprepas om och om igen. Vilken bit är det?',
    wrongUnit: 'Nästan! Vilken bit kommer om och om igen?',
    broken: 'Hoppsan – det bröt mönstret! Titta och lyssna igen.',
  },
  growing: {
    prompt: 'Vilket tal kommer sen?',
    spoken: (sequence: string) => `Talen hoppar i ett mönster: ${sequence}... Vilket tal kommer sen?`,
  },

  // ---- Planet 9: bridging through ten ----
  via10: {
    promptUp: (start: number, target: number) =>
      `Från ${start} till ${target} – hoppa till tian först!`,
    promptDown: (start: number, target: number) =>
      `Från ${start} ner till ${target} – vila på tian!`,
    spokenUp: (start: number, target: number) =>
      `Ett jättehopp från ${start} till ${target}! Det är långt – hoppa till vilostationen på tian först. Hur långt är första hoppet?`,
    spokenDown: (start: number, target: number) =>
      `Ett jättehopp från ${start} ner till ${target}! Hoppa ner till vilostationen på tian först. Hur långt är första hoppet?`,
    hintPhase1: 'Först: hoppa till tian! 🚩',
    hintPhase2: 'Nu resten – till stjärnan! ⭐',
    missedTen: (landing: number) => `Oj! Du landade på ${landing} – hoppa till tian först!`,
    missedStar: (landing: number, target: number) =>
      `Oj! Du landade på ${landing} – stjärnan är på ${target}.`,
  },
} as const

/** Language tag used for speech synthesis */
export const SPEECH_LANG = 'sv-SE'
