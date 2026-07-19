// Liten brygga så att spelet kan be effektlagret om en stjärnexplosion
// (t.ex. vid varje rätt svar) utan att känna till Pixi eller SpaceBackdrop.
// SpaceBackdrop registrerar sig när den startar; finns inget effektlager
// (gammal webbläsare, reduced motion) händer helt enkelt ingenting.

type BurstFn = () => void

let handler: BurstFn | null = null

export function registerBurst(fn: BurstFn | null) {
  handler = fn
}

/** Fyrverkeri! Anropas t.ex. när barnet svarar rätt. */
export function cheerBurst() {
  handler?.()
}
