// Shared helpers for the tests: save files to start from, a `game` fixture that
// opens the game in a known state, and a bot that plays a whole planet.

import { test as base, expect, type Page } from '@playwright/test'

export { expect }

/** The key the game saves progress under */
const STORAGE_KEY = 'rymddjuren-progress'

/** A brand new player */
export const EMPTY = { animals: [], stars: {} }

/** Halfway there, with a mix of one, two and three stars */
export const HALF = {
  animals: [1, 2, 3, 4, 5, 6],
  stars: { 1: 3, 2: 2, 3: 3, 4: 1, 5: 2, 6: 3 },
}

/** Every planet finished */
export const FULL = {
  animals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  stars: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3 },
}

export interface Progress {
  animals: number[]
  stars: Record<number, number>
}

interface StartOptions {
  /** Run at the child's real pace instead of the accelerated test pace. */
  realTime?: boolean
  /** Keep decorative and CSS motion enabled. */
  motion?: boolean
}

/** Everything a test needs to drive the game */
export interface Game {
  page: Page
  /** Open the game with this save file (and this random seed) */
  start: (progress: Progress, seed?: number, options?: StartOptions) => Promise<void>
  /** Open the space station from the star map */
  station: () => Promise<void>
  /** Fly to planet 1–10 and wait for the level to start */
  planet: (id: number) => Promise<void>
  /** Answer every question of the level. Returns true if it reached the end. */
  play: (budget?: number) => Promise<boolean>
  /** Stop with the tenth question ready, before answering it. */
  playUntilLast: () => Promise<void>
  /** Solve the question currently on screen, stopping as soon as it is judged right. */
  solveCurrent: () => Promise<boolean>
  /** Everything the browser logged as an error */
  errors: string[]
}

export const test = base.extend<{ game: Game }>({
  game: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`)
    })

    const game: Game = {
      page,
      errors,

      async start(progress, seed = 1337, options = {}) {
        const speed = options.realTime ? 1 : 20
        await page.emulateMedia({ reducedMotion: options.motion ? 'no-preference' : 'reduce' })
        await page.addInitScript(
          ([key, saved, randomSeed, clockSpeed]: [string, string, number, number]) => {
            localStorage.setItem(key, saved)

            // Browser flows should verify behaviour, not spend minutes waiting
            // for pauses deliberately tuned for a seven-year-old. Keep one
            // real-time animation test, but accelerate timers and animation
            // frames for the rest of the suite. This is isolated to the test
            // page and cannot affect the production build.
            if (clockSpeed > 1) {
              const scaleDelay = (delay?: number) => Math.max(0, (delay ?? 0) / clockSpeed)
              const nativeSetTimeout = window.setTimeout.bind(window)
              const nativeSetInterval = window.setInterval.bind(window)
              const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window)
              const frameOrigin = performance.now()

              const stopCssMotion = () => {
                const style = document.createElement('style')
                style.textContent = `
                  *, *::before, *::after {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                    scroll-behavior: auto !important;
                  }
                `
                document.documentElement.appendChild(style)
              }
              if (document.documentElement) stopCssMotion()
              else document.addEventListener('DOMContentLoaded', stopCssMotion, { once: true })

              window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) =>
                nativeSetTimeout(handler, scaleDelay(delay), ...args)) as typeof window.setTimeout
              window.setInterval = ((handler: TimerHandler, delay?: number, ...args: unknown[]) =>
                nativeSetInterval(handler, scaleDelay(delay), ...args)) as typeof window.setInterval
              window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
                nativeRequestAnimationFrame((timestamp) =>
                  callback(frameOrigin + (timestamp - frameOrigin) * clockSpeed),
                )) as typeof window.requestAnimationFrame
            }

            // A small deterministic generator, so a rerun gives the same
            // questions – otherwise screenshots differ every single time.
            let state = randomSeed
            Math.random = () => {
              state = (state * 1664525 + 1013904223) >>> 0
              return state / 4294967296
            }
            // Two things the bot needs and the DOM does not keep: when the page
            // last changed (so it only taps while the game stands still), and
            // every verdict Ugglis has given (so it knows whether the answer it
            // just gave was judged at all – a tap during an animation is simply
            // ignored by the game).
            const spy = { movedAt: 0, said: 0, verdict: '', showing: '' }
            ;(window as Window & { __spy?: typeof spy }).__spy = spy
            const watch = () =>
              new MutationObserver(() => {
                spy.movedAt = performance.now()
                const bubble = document.querySelector('.ugglis-feedback')
                const showing = bubble
                  ? bubble.classList.contains('happy')
                    ? 'happy'
                    : 'oops'
                  : ''
                if (showing === spy.showing) return
                spy.showing = showing
                if (showing) {
                  spy.said += 1
                  spy.verdict = showing
                }
              }).observe(document.documentElement, {
                subtree: true,
                childList: true,
                attributes: true,
                characterData: true,
              })
            if (document.documentElement) watch()
            else document.addEventListener('DOMContentLoaded', watch)
          },
          [STORAGE_KEY, JSON.stringify(progress), seed, speed] as [string, string, number, number],
        )
        await page.goto('/')
        await expect(page.locator('.starmap')).toBeVisible()
      },

      async station() {
        await page.locator('.station-btn').click()
        await expect(page.locator('.station')).toBeVisible()
      },

      async planet(id) {
        await page.locator('.planet').nth(id - 1).click()
        await expect(page.locator('.level')).toBeVisible({ timeout: 15_000 })
      },

      async play(budget = 120) {
        return playLevel(page, budget)
      },

      async playUntilLast() {
        await playLevel(page, 120, 10)
      },

      async solveCurrent() {
        return solveCurrentQuestion(page)
      },
    }

    await use(game)
  },
})

// ---- The bot ----------------------------------------------------------------
//
// It plays the way a child does: wait for the animation to finish, look at what
// is on screen, answer, and if Ugglis says "try again" pick something else. It
// does not know the answers in advance – the only questions it can work out are
// the ones the screen spells out (the seesaw must be shared evenly, the fox says
// which sum it wants, the rabbit's prompt says how many carrots). Everything
// else is answered by elimination, and since every question offers exactly three
// choices, a question is solved in at most three tries.

/**
 * How long the level must stand still before the bot is sure it is its turn.
 * Longer than the slowest step of any scene animation (the comet stairs move
 * one step every 550 ms), otherwise the bot taps into a running animation.
 */
const QUIET_MS = 650

interface Spy {
  movedAt: number
  said: number
  verdict: string
}

/** What the bot sees when it looks at the screen */
interface Snapshot {
  done: boolean
  question: number
  /** Changes when the question changes – the bot's cue to forget old answers */
  sig: string
  kind: 'choice' | 'feed' | 'share' | 'pair' | 'none'
  choices: number
  /** How many times Ugglis has judged an answer so far */
  said: number
  feed: { target: number | null; total: number; fed: number }
  shareLeft: number
  pair: { want: number; piles: number[] }
}

/**
 * Wait until the level has finished moving: no feedback from Ugglis, no scene
 * animation, and nothing changed in the page for a moment. Tapping before that
 * is what the game itself ignores (`locked`), so the bot would only waste taps.
 */
async function waitUntilStill(page: Page, timeout = 20_000) {
  await page.waitForFunction(
    (quiet) => {
      if (document.querySelector('.result')) return true
      const spy = (window as Window & { __spy?: Spy }).__spy
      if (!spy) return true
      if (document.querySelector('.ugglis-feedback')) return false // Ugglis is talking
      if (document.querySelector('.choices.waiting')) return false // the parrot is eating
      return performance.now() - spy.movedAt > quiet
    },
    QUIET_MS,
    { timeout, polling: 80 },
  )
}

/**
 * Wait for what the answer just given led to. `ignored` means the game never
 * judged it at all – the tap landed in the middle of an animation – and such an
 * answer must NOT be ruled out, or the bot can talk itself out of the right one.
 */
async function verdictOf(page: Page, saidBefore: number): Promise<'happy' | 'oops' | 'ignored'> {
  const outcome = await page
    .waitForFunction(
      ([before, quiet]: [number, number]) => {
        const spy = (window as Window & { __spy?: Spy }).__spy
        if (!spy) return 'ignored'
        if (spy.said > before) return spy.verdict
        if (document.querySelector('.result')) return 'happy'
        // The monkey planet draws its jump inside a canvas, so the page can sit
        // perfectly still while the rabbit is in mid-air. There, only Ugglis can
        // say whether the answer counted – wait for her.
        if (document.querySelector('.jump-canvas')) return false
        // Nothing is moving and Ugglis said nothing: the tap did not count
        return performance.now() - spy.movedAt > quiet ? 'ignored' : false
      },
      [saidBefore, QUIET_MS] as [number, number],
      { timeout: 10_000, polling: 80 },
    )
    .then((handle) => handle.jsonValue())
    .catch(() => 'ignored' as const)
  return outcome as 'happy' | 'oops' | 'ignored'
}

async function look(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const text = (sel: string) => document.querySelector(sel)?.textContent?.trim() ?? ''
    const said = (window as Window & { __spy?: { said: number } }).__spy?.said ?? 0
    if (document.querySelector('.result')) {
      return {
        done: true,
        question: 0,
        sig: 'result',
        kind: 'none',
        choices: 0,
        said,
        feed: { target: null, total: 0, fed: 0 },
        shareLeft: 0,
        pair: { want: 0, piles: [] },
      } as Snapshot
    }

    const choiceButtons = [...document.querySelectorAll('.choice-btn')]
    const feedItems = [...document.querySelectorAll('.feed-item')]
    const piles = [...document.querySelectorAll('.pile')]
    const isShare = !!document.querySelector('.seesaw-panda')

    const kind: Snapshot['kind'] = piles.length
      ? 'pair'
      : isShare
        ? 'share'
        : feedItems.length
          ? 'feed'
          : choiceButtons.length
            ? 'choice'
            : 'none'

    // "Mata kaninen med 6 morötter!" – the number the child is asked to feed
    const promptNumber = text('.prompt').match(/\d+/)

    return {
      done: false,
      question: Number(text('.level-count').split('/')[0]) || 0,
      // The question number, the question itself, the buttons offered and the
      // giant planet's phase hint – anything that changes means a new question.
      sig: [
        text('.level-count'),
        text('.prompt'),
        text('.via10-hint'),
        choiceButtons.map((b) => b.textContent).join(','),
      ].join('|'),
      kind,
      choices: choiceButtons.length,
      said,
      feed: {
        target: promptNumber ? Number(promptNumber[0]) : null,
        total: feedItems.length,
        fed: feedItems.filter((b) => b.classList.contains('fed')).length,
      },
      shareLeft: document.querySelectorAll('.share-pile-item').length,
      pair: {
        want: Number(document.querySelector('.fox-row')?.getAttribute('data-want') ?? 0),
        piles: piles.map((p) => Number(p.getAttribute('data-value') ?? 0)),
      },
    } as Snapshot
  })
}

/**
 * Answer the question on screen once. Returns a key naming the answer given, so
 * the caller can rule it out if the same question is still there afterwards.
 */
async function answer(page: Page, s: Snapshot, ruledOut: Set<string>): Promise<string | null> {
  switch (s.kind) {
    case 'choice': {
      const i = firstAllowed(s.choices, ruledOut, 'choice')
      if (i === null) return null
      await page.locator('.choice-btn').nth(i).click()
      return `choice:${i}`
    }

    case 'feed': {
      // The prompt says how many – but if that turns out to be wrong, count up
      // through every possible number of carrots instead.
      const wanted =
        s.feed.target !== null && !ruledOut.has(`feed:${s.feed.target}`)
          ? s.feed.target
          : firstAllowed(s.feed.total + 1, ruledOut, 'feed')
      if (wanted === null) return null

      const items = page.locator('.feed-item')
      for (let i = 0; i < s.feed.total; i++) {
        const item = items.nth(i)
        const isFed = (await item.getAttribute('class'))?.includes('fed') ?? false
        if (isFed !== i < wanted) await item.click() // toggle only what is off
      }
      await page.locator('.check-btn').click()
      return `feed:${wanted}`
    }

    case 'share': {
      // Share the whole pile evenly: one stick to each panda in turn. The pile
      // always holds an even number, so taking turns is always the answer.
      const pandas = page.locator('.seesaw-panda')
      for (let i = 0; i < s.shareLeft; i++) await pandas.nth(i % 2).click()
      await page.locator('.check-btn').click()
      return 'share'
    }

    case 'pair': {
      // The fox says which sum it wants and every pile shows its own number
      const { want, piles } = s.pair
      for (let a = 0; a < piles.length; a++) {
        for (let b = a + 1; b < piles.length; b++) {
          if (piles[a] + piles[b] !== want) continue
          if (ruledOut.has(`pair:${a},${b}`)) continue
          await page.locator('.pile').nth(a).click()
          await page.locator('.pile').nth(b).click()
          return `pair:${a},${b}`
        }
      }
      return null
    }

    default:
      return null
  }
}

/** The lowest index 0…count-1 that has not been ruled out yet */
function firstAllowed(count: number, ruledOut: Set<string>, prefix: string): number | null {
  for (let i = 0; i < count; i++) if (!ruledOut.has(`${prefix}:${i}`)) return i
  return null
}

/**
 * Play a whole level: every question is answered until the result screen shows.
 * `budget` caps how many answers the game actually judges. Taps it ignored (one
 * landed mid-animation) do not count against it – only the loop guard, which is
 * there so a game that stops responding fails instead of spinning forever.
 */
async function playLevel(page: Page, budget: number, stopAtQuestion?: number): Promise<boolean> {
  let sig = ''
  let ruledOut = new Set<string>()
  let judged = 0

  for (let i = 0; judged < budget && i < budget * 5; i++) {
    await waitUntilStill(page).catch(() => {}) // a stuck animation must not hide a bug
    const s = await look(page)
    if (s.done) return true
    if (stopAtQuestion !== undefined && s.question >= stopAtQuestion) return false

    // A new question – nothing to remember from the previous one
    if (s.sig !== sig) {
      sig = s.sig
      ruledOut = new Set()
    }

    const given = await answer(page, s, ruledOut)
    if (!given) {
      // Nothing to tap, or every answer ruled out and the question is still
      // here – start over rather than stand still
      ruledOut = new Set()
      await page.waitForTimeout(200)
      continue
    }

    const verdict = await verdictOf(page, s.said)
    if (verdict === 'oops') ruledOut.add(given)
    if (verdict !== 'ignored') judged += 1
  }

  return (await page.locator('.result').count()) > 0
}

/** Answer the current question by elimination, without waiting for the next one. */
async function solveCurrentQuestion(page: Page, budget = 8): Promise<boolean> {
  const ruledOut = new Set<string>()
  for (let i = 0; i < budget; i++) {
    await waitUntilStill(page)
    const s = await look(page)
    if (s.done) return true
    const given = await answer(page, s, ruledOut)
    if (!given) return false
    const verdict = await verdictOf(page, s.said)
    if (verdict === 'happy') return true
    if (verdict === 'oops') ruledOut.add(given)
  }
  return false
}
