// npm run og: draws the link preview card (scripts/og/og.html) and saves it as public/og.jpg, the image chat apps
// and social sites show when dcheng.dev is shared (index.html's og:image). Re-run it when the dream world or the face
// changes; the output is committed.
//   node scripts/og/og.mjs [out.jpg] [query]   e.g. a test shot: node scripts/og/og.mjs /tmp/try.jpg "t=3&fov=50"
import { chromium } from 'playwright'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createServer } from 'vite'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const out = resolve(process.argv[2] ?? resolve(ROOT, 'public/og.jpg'))
const query = process.argv[3] ?? ''

// The site's WordArt is Impact, which WSL doesn't have: borrow Windows' copy (it's only drawn into the picture).
const FONTS = ['/mnt/c/Windows/Fonts/impact.ttf', '/mnt/c/Windows/Fonts/ariblk.ttf', '/usr/share/fonts/truetype/msttcorefonts/Impact.ttf']
const font = FONTS.find(existsSync)
if (!font) throw new Error(`No Impact (or Arial Black) font found; looked in:\n  ${FONTS.join('\n  ')}`)

// WSL without sudo: `npm run e2e:setup` extracts Chromium's missing system libs here (as in playwright.config.ts).
const libs = resolve(ROOT, '.cache/chromium-libs/usr/lib/x86_64-linux-gnu')
const env = existsSync(libs) ? { ...process.env, LD_LIBRARY_PATH: [libs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } : undefined

const server = await createServer({ root: ROOT, logLevel: 'error', server: { port: 0 } })
await server.listen()
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'], env })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  page.on('pageerror', (e) => console.error('page error:', e.message))
  await page.goto(`${server.resolvedUrls.local[0]}scripts/og/og.html${query ? `?${query}` : ''}`)
  await page.addStyleTag({ content: `@font-face { font-family: OgImpact; src: url(data:font/ttf;base64,${readFileSync(font).toString('base64')}); }` })
  await page.waitForFunction(() => window.__ogReady === true, null, { timeout: 60_000 })
  await page.evaluate(async () => {
    await document.fonts.load('64px OgImpact')
    await document.fonts.ready
    await document.querySelector('#face').decode()
  })
  if (!(await page.evaluate(() => document.fonts.check('64px OgImpact')))) throw new Error('the title font did not load')
  const png = await page.locator('#card').screenshot()
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(out)
  console.log(`wrote ${out} (${Math.round(readFileSync(out).length / 1024)} KB, 1200×630, ${font.split('/').pop()})`)
} finally {
  await browser.close()
  await server.close()
}
