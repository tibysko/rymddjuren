// Every planet gets played from start to finish by a bot that taps at random.
// It does not know the right answers on purpose: right or wrong, the level must
// keep going, never crash, and always end on the result screen. One test per
// planet, so they run in parallel and a failure names the planet.

import { FULL, expect, test } from './game'

const PLANETS = [
  [1, 'Kaninplaneten'],
  [2, 'Stjärnstigen'],
  [3, 'Apornas planet'],
  [4, 'Kometkalaset'],
  [5, 'Tvillingplaneten'],
  [6, 'Kompisplaneten'],
  [7, 'Vågplaneten'],
  [8, 'Mönsterbältet'],
  [9, 'Jätteplaneten'],
  [10, 'Festplaneten'],
] as const

for (const [id, name] of PLANETS) {
  test(`planet ${id}: ${name} går att spela igenom`, async ({ game }) => {
    await game.start(FULL, 100 + id)
    await game.planet(id)

    // Every question must show a prompt that can be read aloud
    await expect(game.page.locator('.prompt')).toBeVisible()
    await expect(game.page.locator('.level .speak-btn')).toHaveCount(1)

    const finished = await game.play()
    expect(finished, 'banan nådde aldrig resultatskärmen').toBe(true)
    await expect(game.page.locator('.result')).toBeVisible()

    expect(game.errors, 'webbläsaren loggade fel').toEqual([])
  })
}

test('en klarad planet ger ett djur som flyttar in i stationen', async ({ game }) => {
  await game.start({ animals: [], stars: {} })
  await game.planet(1)
  await game.play()

  await expect(game.page.locator('.result-stars .star')).toHaveCount(3)
  await expect(game.page.locator('.result-animal')).toContainText('rymdstation')

  // ...and it is actually there afterwards
  await game.page.locator('.result .big-btn').click()
  await game.page.locator('.station-btn').click()
  await expect(game.page.locator('.station-animal.home')).toHaveCount(1)
})
