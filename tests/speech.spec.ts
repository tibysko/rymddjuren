import { FULL, expect, test } from './game'

test('the map and result offer read-aloud', async ({ game }) => {
  await game.start(FULL, 712)
  await expect(game.page.locator('.starmap .ugglis-hello .speak-btn')).toBeVisible()

  await game.page.locator('.planet').first().click()
  await expect(game.page.locator('.level')).toBeVisible()

  await game.play()
  await expect(game.page.locator('.result .result-heading .speak-btn')).toBeVisible()
})

test('Ugglis feedback can be read aloud again', async ({ game }) => {
  await game.start(FULL, 713, { realTime: true })
  await game.planet(1)

  const choices = game.page.locator('.choice-btn')
  if (await choices.count()) {
    await choices.first().click()
  } else {
    await game.page.locator('.feed-item').first().click()
    await game.page.locator('.check-btn').click()
  }
  await expect(game.page.locator('.ugglis-feedback .feedback-speak-btn')).toBeVisible()
})
