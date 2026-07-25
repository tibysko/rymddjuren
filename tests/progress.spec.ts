import { expect, test } from './game'

const STORAGE_KEY = 'rymddjuren-progress'

for (const [name, raw] of [
  ['null', 'null'],
  ['invalid JSON', '{not json'],
  ['wrong field types', JSON.stringify({ stars: 'three', animals: { first: 1 } })],
] as const) {
  test(`a saved progress value with ${name} opens the star map`, async ({ page }) => {
    await page.addInitScript(
      ([key, value]: [string, string]) => localStorage.setItem(key, value),
      [STORAGE_KEY, raw] as [string, string],
    )
    await page.goto('/')

    await expect(page.locator('.starmap')).toBeVisible()
    await expect(page.locator('.planet').first()).toBeEnabled()
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
      .toBe('{"stars":{},"animals":[]}')
  })
}

test('a partly valid save keeps valid progress and repairs the rest', async ({ page }) => {
  const raw = JSON.stringify({
    stars: { 1: 9, 2: 2, 3: 'three', 11: 1 },
    animals: [1, 1, 2, 0, 11, '3'],
  })
  await page.addInitScript(
    ([key, value]: [string, string]) => localStorage.setItem(key, value),
    [STORAGE_KEY, raw] as [string, string],
  )
  await page.goto('/')

  await expect(page.locator('.planet').nth(2)).toBeEnabled()
  await expect(page.locator('.planet').nth(3)).toBeDisabled()
  await page.locator('.station-btn').click()
  await expect(page.locator('.station-counter')).toHaveText('2 av 10 djur bor här')
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
    .toBe('{"stars":{"1":3,"2":2},"animals":[1,2]}')
})
