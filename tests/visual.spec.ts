// Screenshots of every screen, compared against a saved picture. If a change
// makes something look different, the test fails and the report shows the old
// picture, the new one and the difference side by side.
//
// After a deliberate change: `npm run test:update` accepts the new look.
// The pictures live in tests/visual.spec.ts-snapshots/ and belong in git.
//
// Every picture is taken with reduced motion asked for. That is not only about
// standing still: the starfield is a Pixi layer that draws random stars and
// shooting stars from the same Math.random the tests seed, and it boots
// asynchronously – so with it running, the questions a planet generates came
// out different from one run to the next and no screenshot could ever match.
// Reduced motion makes the game skip that layer entirely (SpaceBackdrop), which
// leaves the level generator as the only thing drawing random numbers.

import { EMPTY, FULL, HALF, expect, test, type Game, type Progress } from './game'

const SHOT = { fullPage: true, maxDiffPixels: 400 }

/** Open the game the way every picture here needs it: still, and reproducible */
async function open(game: Game, progress: Progress, seed?: number) {
  await game.page.emulateMedia({ reducedMotion: 'reduce' })
  // Screenshot comparison needs the browser's real animation-frame clock to
  // decide when two consecutive frames are stable. Reduced motion still keeps
  // the decorative Pixi backdrop out of these tests.
  await game.start(progress, seed, { realTime: true })
}

/** Hide what is left of the canvas layers and paint the page so nothing ends in white */
async function calm(page: import('@playwright/test').Page) {
  await page.addStyleTag({
    content: `
      html { background: #1a1030; }
      .space-backdrop, .jump-canvas canvas { visibility: hidden !important; }
    `,
  })
  await page.waitForTimeout(300)
}

test('stjärnkartan', async ({ game }) => {
  await open(game, HALF)
  await calm(game.page)
  await expect(game.page).toHaveScreenshot('stjarnkarta.png', SHOT)
})

test('versionsstämpeln visar vilken build som körs', async ({ game }) => {
  await game.start(HALF)
  const button = game.page.getByRole('button', { name: 'Version' })
  await expect(button).toBeVisible()
  await button.click()
  await expect(game.page.getByRole('dialog')).toContainText('Version')
})

test('stationen är tom', async ({ game }) => {
  await open(game, EMPTY)
  await game.station()
  await calm(game.page)
  await expect(game.page).toHaveScreenshot('station-tom.png', SHOT)
})

test('stationen är halvfull', async ({ game }) => {
  await open(game, HALF)
  await game.station()
  await calm(game.page)
  await expect(game.page).toHaveScreenshot('station-delvis.png', SHOT)
})

test('stationen är full', async ({ game }) => {
  await open(game, FULL)
  await game.station()
  await calm(game.page)
  await expect(game.page).toHaveScreenshot('station-full.png', SHOT)
})

// One picture per planet: the first question, so a broken level is obvious
for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  test(`planet ${id} första frågan`, async ({ game }) => {
    await open(game, FULL, 100 + id)
    await game.planet(id)
    await game.page.waitForTimeout(800)
    await calm(game.page)
    await expect(game.page).toHaveScreenshot(`planet-${String(id).padStart(2, '0')}.png`, SHOT)
  })
}
