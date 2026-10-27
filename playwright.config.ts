import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from '@playwright/test'

// WSL without sudo: `npm run e2e:setup` extracts Chromium's missing system libs here.
const libs = resolve(import.meta.dirname, '.cache/chromium-libs/usr/lib/x86_64-linux-gnu')
const env = existsSync(libs) ? { ...process.env, LD_LIBRARY_PATH: [libs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } : undefined

const PORT = 4173

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: 'chromium',
    launchOptions: { env: env as Record<string, string> | undefined },
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'phone-portrait', use: { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true } },
    { name: 'phone-landscape', use: { viewport: { width: 667, height: 375 }, hasTouch: true, isMobile: true } },
    { name: 'tablet-portrait', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'tablet-landscape', use: { viewport: { width: 1024, height: 768 }, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
})
