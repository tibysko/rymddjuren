// Regression checks for the child playtest feedback. These use the same
// phone viewport as the rest of the suite; physical Android/Brave remains a
// separate manual check because browser emulation cannot reproduce that stack.

import { expect, test, FULL } from './game'

test('level controls are large, touch-safe and have a named way back', async ({ game }) => {
  await game.start(FULL, 401)
  await game.planet(1)

  const back = game.page.getByRole('button', { name: '⬅️ Stjärnkartan' })
  await expect(back).toBeVisible()
  await expect(back).toHaveCSS('touch-action', 'manipulation')
  await expect(back).toHaveCSS('min-width', '48px')
  await expect(game.page.locator('.feed-item').nth(0)).toHaveCSS('touch-action', 'manipulation')
})

test('completion content has its own opaque readable panel', async ({ game }) => {
  await game.start(FULL, 402)
  await game.planet(1)
  await game.play()

  const result = game.page.locator('.result-panel')
  await expect(result).toBeVisible()
  await expect(result).toHaveCSS('background-color', 'rgba(18, 11, 46, 0.93)')
})

test('space station has a visible return to the star map', async ({ game }) => {
  await game.start(FULL, 403)
  await game.station()

  const back = game.page.getByRole('button', { name: '⬅️ Stjärnkartan' })
  await expect(back).toBeVisible()
  await expect(back).toHaveCSS('min-height', '48px')
})
