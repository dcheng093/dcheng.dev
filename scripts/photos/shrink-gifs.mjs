// Re-encodes the game GIFs in public/me/ with a smaller palette (and optionally fewer frames).
//   node scripts/photos/shrink-gifs.mjs                      -> every public/me/game-*.gif, 64 colours, every frame
//   node scripts/photos/shrink-gifs.mjs --colors 128 --step 2 game-cs.gif
// --step 2 keeps every other frame (doubling each one's delay), halving the frame rate.
// Always encodes from the full-quality original in asset-originals/me/ (copied there on first run),
// so re-running with different settings never compounds the loss.
import { chromium } from '@playwright/test'
import gifenc from 'gifenc'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

const { GIFEncoder, quantize, applyPalette } = gifenc
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { colors: { type: 'string', default: '64' }, step: { type: 'string', default: '1' } },
})
const colors = Number(values.colors)
const step = Number(values.step)

const root = resolve(import.meta.dirname, '../..')
const dir = resolve(root, 'public/me')
const originals = resolve(root, 'asset-originals/me')
const libs = resolve(root, '.cache/chromium-libs/usr/lib/x86_64-linux-gnu')
const names = positionals.length ? positionals : (await readdir(dir)).filter((f) => /^game-.*\.gif$/i.test(f)).sort()

await mkdir(originals, { recursive: true })
// WebCodecs ImageDecoder needs a secure context (localhost counts; about:blank does not).
const server = createServer((_, res) => res.end('<!doctype html><title>decode</title>'))
await new Promise((ok) => server.listen(0, ok))
const browser = await chromium.launch({ env: { ...process.env, LD_LIBRARY_PATH: libs } })
const page = await browser.newPage()
await page.goto(`http://localhost:${server.address().port}/`)

for (const name of names) {
  const original = resolve(originals, name)
  if (!existsSync(original)) await copyFile(resolve(dir, name), original)
  const src = await readFile(original)

  // Fully composited frames (disposal handled by the browser), as RGBA.
  const frames = await page.evaluate(async (b64) => {
    const data = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const decoder = new ImageDecoder({ data, type: 'image/gif' })
    await decoder.tracks.ready
    const out = []
    for (let i = 0; i < decoder.tracks.selectedTrack.frameCount; i++) {
      const { image } = await decoder.decode({ frameIndex: i })
      const canvas = new OffscreenCanvas(image.displayWidth, image.displayHeight)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      const px = new Uint8Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)
      let bin = ''
      for (let j = 0; j < px.length; j += 0x8000) bin += String.fromCharCode(...px.subarray(j, j + 0x8000))
      out.push({ w: canvas.width, h: canvas.height, delay: image.duration / 1000, b64: btoa(bin) })
    }
    return out
  }, src.toString('base64'))

  const gif = GIFEncoder()
  for (let i = 0; i < frames.length; i += step) {
    const { w, h, b64 } = frames[i]
    const rgba = new Uint8Array(Buffer.from(b64, 'base64'))
    const delay = frames.slice(i, i + step).reduce((t, f) => t + f.delay, 0)
    const palette = quantize(rgba, colors)
    gif.writeFrame(applyPalette(rgba, palette), w, h, { palette, delay })
  }
  gif.finish()
  const bytes = gif.bytes()
  await writeFile(resolve(dir, name), bytes)
  console.log(`${name}: ${(src.length / 1e6).toFixed(2)} MB -> ${(bytes.length / 1e6).toFixed(2)} MB (${Math.ceil(frames.length / step)} frames, ${colors} colours)`)
}
await browser.close()
server.close()
