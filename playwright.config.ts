// Playwright runs the real game in a real browser: it builds the production
// version, serves it, and plays it the way the child would.
//
//   npm test              run everything
//   npm run test:ui       watch the tests play, step by step
//   npm run test:report   open the report from the last run
//   npm run test:update   accept new screenshots after a deliberate change
//
// The browser binary is installed once with `npx playwright install chromium`.

import { defineConfig } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',

  // Every test file and every test inside it runs at the same time – ten
  // planets tested in parallel takes as long as the slowest one, not the sum.
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  // A planet is ten questions, and the game deliberately takes its time: every
  // answer is celebrated for 1.2 s and every rabbit hops one step at a time. On
  // its own a planet takes under a minute, but several run side by side and each
  // one drives a software-rendered starfield, so a loaded machine can be three
  // or four times slower. Generous on purpose – it only bites if something hangs.
  timeout: 420_000,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  expect: {
    // A few stray pixels (font smoothing, a star that moved) must not fail a run
    toHaveScreenshot: { maxDiffPixels: 400, animations: 'disabled' },
  },

  use: {
    baseURL: BASE_URL,
    // A phone-sized screen – that is what the game is played on
    viewport: { width: 430, height: 900 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Lets a sandbox point at its own browser; empty on a normal machine
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },

  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],

  // Build and serve the game automatically. The production build is used on
  // purpose: `npm run dev` unlocks every planet, which would hide bugs in the
  // unlocking rules.
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
  },
})
