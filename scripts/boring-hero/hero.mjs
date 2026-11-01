// npm run boring-hero: draws the boring site's hero backdrop (scripts/boring-hero/hero.html) and saves it as
// public/boring/hero.webp. The output is committed; re-run only to change the picture.
//   node scripts/boring-hero/hero.mjs [out.webp] [query]   e.g. a test shot: node scripts/boring-hero/hero.mjs /tmp/try.webp "fov=40"
import { chromium } from 'playwright'
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createServer } from 'vite'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const out = resolve(process.argv[2] ?? resolve(ROOT, 'public/boring/hero.webp'))
const query = process.argv[3] ?? ''

// WSL without sudo: `npm run e2e:setup` extracts Chromium's missing system libs here (as in playwright.config.ts).
const libs = resolve(ROOT, '.cache/chromium-libs/usr/lib/x86_64-linux-gnu')
const env = existsSync(libs) ? { ...process.env, LD_LIBRARY_PATH: [libs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } : undefined

// Its own dependency cache: a dev server already running on the project holds (and on Windows, locks) the shared one.
const server = await createServer({ root: ROOT, cacheDir: join(tmpdir(), 'vite-boring-hero'), logLevel: 'error', server: { port: 0 } })
await server.listen()
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'], env })
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  page.on('pageerror', (e) => console.error('page error:', e.message))
  await page.goto(`${server.resolvedUrls.local[0]}scripts/boring-hero/hero.html${query ? `?${query}` : ''}`)
  await page.waitForFunction(() => window.__heroReady === true, null, { timeout: 120_000 })
  const png = await page.locator('#shot').screenshot()
  await sharp(png).webp({ quality: 80 }).toFile(out)
  console.log(`wrote ${out} (${Math.round(readFileSync(out).length / 1024)} KB, 1920×1080)`)
} finally {
  await browser.close()
  await server.close()
}
