// The space station: the rules that must hold however many animals live there.

import { EMPTY, FULL, HALF, expect, test } from './game'

test.describe('Rymdstationen', () => {
  test('sex djur bor här, nästa är en siluett, resten är hemliga', async ({ game }) => {
    await game.start(HALF)
    await game.station()
    const { page } = game

    await expect(page.locator('.station-animal.home')).toHaveCount(6)
    await expect(page.locator('.station-animal.next')).toHaveCount(1)
    await expect(page.locator('.station-animal.unknown')).toHaveCount(3)
    await expect(page.locator('.station-counter')).toHaveText('6 av 10 djur bor här')
    await expect(page.locator('.station-module.on')).toHaveCount(6)

    // The surprise must be kept: no hidden animal may show its emoji or name
    const hidden = await page.locator('.station-animal.unknown .station-animal-emoji').allTextContents()
    expect(hidden.every((text) => text.trim() === '❓')).toBe(true)
  })

  test('siluetten har en gåta man kan lyssna på', async ({ game }) => {
    await game.start(HALF)
    await game.station()
    const riddle = game.page.locator('.station-animal-riddle')
    await expect(riddle).toBeVisible()
    await expect(riddle).toContainText('?')
  })

  test('tryck på ett djur ger en glädjestuds som tar slut', async ({ game }) => {
    // This is the one test that measures a real animation, so it deliberately
    // opts out of the accelerated clock and reduced-motion test default.
    await game.start(HALF, undefined, { realTime: true, motion: true })
    await game.station()
    const card = game.page.locator('.station-animal.home').first()

    // The very first star burst has to build its graphics, which stalls the
    // browser for about a second – long enough to miss the 700 ms bounce. Tap
    // once to get that out of the way, then time the real one.
    await card.click()
    await expect(card).not.toHaveClass(/cheering/, { timeout: 3000 })

    await card.click()
    await expect(card).toHaveClass(/cheering/)
    await expect(card).not.toHaveClass(/cheering/, { timeout: 3000 })
  })

  test('tom station: inga djur, men nästa djur tittar fram', async ({ game }) => {
    await game.start(EMPTY)
    await game.station()
    await expect(game.page.locator('.station-animal.home')).toHaveCount(0)
    await expect(game.page.locator('.station-animal.next')).toHaveCount(1)
    await expect(game.page.locator('.station-counter')).toHaveText('0 av 10 djur bor här')
  })

  test('full station: inget hemligt kvar och Ugglis firar', async ({ game }) => {
    await game.start(FULL)
    await game.station()
    await expect(game.page.locator('.station-animal.next')).toHaveCount(0)
    await expect(game.page.locator('.station-animal.unknown')).toHaveCount(0)
    await expect(game.page.locator('.station-ugglis')).toContainText('Hurra')
  })

  test('allt kan läsas upp med 🔊', async ({ game }) => {
    await game.start(HALF)
    await game.station()
    await expect(game.page.locator('.station .speak-btn')).toHaveCount(1)
  })

  test('inga fel i konsolen', async ({ game }) => {
    await game.start(HALF)
    await game.station()
    await game.page.locator('.station-animal.home').first().click()
    await game.page.waitForTimeout(500)
    expect(game.errors).toEqual([])
  })
})

test.describe('Minska rörelse', () => {
  test('inget animeras för den som bett om mindre rörelse', async ({ game }) => {
    // Playwright 1.62's `test.use({ reducedMotion })` never reaches the page
    // (colorScheme and locale do) – emulate it on the page instead, before the
    // game loads, so both the CSS and the JS see it.
    await game.page.emulateMedia({ reducedMotion: 'reduce' })
    await game.start(HALF)
    await game.station()
    const animated = await game.page.evaluate(() =>
      [...document.querySelectorAll('.station-animal-emoji, .station-module.on')]
        .map((el) => getComputedStyle(el).animationName)
        .filter((name) => name && name !== 'none'),
    )
    expect(animated).toEqual([])
  })
})
