import { FULL, expect, test } from './game'

test('leaving the last celebration never opens the result screen afterwards', async ({ game }) => {
  // This uses real time so the 1.2-second completion window is long enough to
  // exercise the child's actual back-button path rather than a test-only race.
  await game.start(FULL, 541, { realTime: true })
  await game.planet(1)
  await game.playUntilLast()
  await expect(game.page.locator('.level-count')).toHaveText('10/10')

  const solved = await game.solveCurrent()
  expect(solved).toBe(true)
  await expect(game.page.locator('.ugglis-feedback.happy')).toBeVisible()
  await game.page.getByRole('button', { name: '⬅️ Stjärnkartan' }).click()

  await expect(game.page.locator('.starmap')).toBeVisible()
  await game.page.waitForTimeout(1_400)
  await expect(game.page.locator('.result')).toHaveCount(0)
})
