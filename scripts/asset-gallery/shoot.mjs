// Serves asset-research/ on localhost (ImageDecoder needs a secure context) and screenshots
// each gallery card into asset-research/shots/. `--serve` keeps the server up for manual viewing.
import { createServer } from 'node:http'
import { mkdir, readFile } from 'node:fs/promises'
import { extname, normalize, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const root = resolve(import.meta.dirname, '../../asset-research')
const libs = resolve(import.meta.dirname, '../../.cache/chromium-libs/usr/lib/x86_64-linux-gnu')
const types = { '.html': 'text/html', '.gif': 'image/gif', '.json': 'application/json' }

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '')
  const file = resolve(root, path || 'gallery.html')
  if (!file.startsWith(root)) return res.writeHead(403).end()
  try {
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(await readFile(file))
  } catch {
    res.writeHead(404).end()
  }
})
const port = Number(process.env.PORT ?? 4599)
await new Promise((ok) => server.listen(port, ok))
console.log(`gallery: http://localhost:${port}/gallery.html`)
if (process.argv.includes('--serve')) await new Promise(() => {})

const browser = await chromium.launch({ env: { ...process.env, LD_LIBRARY_PATH: libs } })
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })
await page.goto(`http://localhost:${port}/gallery.html`)
await page.waitForSelector('body[data-ready="1"]', { timeout: 60000 })
const shots = resolve(root, 'shots')
await mkdir(shots, { recursive: true })
for (const card of await page.$$('.card')) {
  const id = await card.getAttribute('id')
  await card.screenshot({ path: resolve(shots, `${id}.png`) })
}
console.log('screenshots written to', shots)
await browser.close()
server.close()
