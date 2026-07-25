// A small bridge so the game can ask the effect layer for a star burst
// (e.g. on every correct answer) without knowing about Pixi or SpaceBackdrop.
// SpaceBackdrop registers itself when it starts; if there is no effect layer
// (old browser, reduced motion) nothing at all happens.

type BurstFn = () => void

let handler: BurstFn | null = null

export function registerBurst(fn: BurstFn | null) {
  handler = fn
}

/** Fireworks! Called e.g. when the child answers correctly. */
export function cheerBurst() {
  handler?.()
}
