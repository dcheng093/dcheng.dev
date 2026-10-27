// Shrinks oversized photos in public/me/ in place, keeping the full-size originals in asset-originals/me/.
//   node scripts/photos/shrink.mjs
// A photo is shrunk when its long side exceeds MAX_SIDE or it weighs more than MAX_BYTES.
// JPEGs stay JPEG; PNGs with transparency stay PNG; opaque PNGs (photos saved as PNG) become .jpg.
// JPEGs that are already small still get their EXIF block (author names, GPS, camera) stripped losslessly.
// Re-running is safe: originals are copied only once, and already-small, clean files are skipped.
import { chromium } from '@playwright/test'
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const MAX_SIDE = 960
const MAX_BYTES = 400_000
const JPEG_QUALITY = 0.85

const root = resolve(import.meta.dirname, '../..')
const dir = resolve(root, 'public/me')
const originals = resolve(root, 'asset-originals/me')
const libs = resolve(root, '.cache/chromium-libs/usr/lib/x86_64-linux-gnu')
const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' }

/** JPEG minus its APP1 (EXIF/XMP) segments, or null if there are none or EXIF says the photo is rotated. */
function stripExif(buf) {
  const keep = [buf.subarray(0, 2)]
  let i = 2
  let found = false
  while (i + 4 <= buf.length && buf[i] === 0xff && buf[i + 1] !== 0xda) {
    const end = i + 2 + buf.readUInt16BE(i + 2)
    if (buf[i + 1] === 0xe1) {
      found = true
      if (exifOrientation(buf.subarray(i + 4, end)) > 1) return null
    } else keep.push(buf.subarray(i, end))
    i = end
  }
  return found ? Buffer.concat([...keep, buf.subarray(i)]) : null
}

function exifOrientation(seg) {
  if (seg.toString('latin1', 0, 6) !== 'Exif\0\0') return 1
  const t = seg.subarray(6)
  const le = t.toString('latin1', 0, 2) === 'II'
  const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o))
  const ifd = le ? t.readUInt32LE(4) : t.readUInt32BE(4)
  for (let k = 0; k < u16(ifd); k++) if (u16(ifd + 2 + k * 12) === 0x112) return u16(ifd + 2 + k * 12 + 8)
  return 1
}

await mkdir(originals, { recursive: true })
const browser = await chromium.launch({ env: { ...process.env, LD_LIBRARY_PATH: libs } })
const page = await browser.newPage()

for (const name of (await readdir(dir)).sort()) {
  const ext = extname(name).toLowerCase()
  if (!mime[ext]) continue
  const file = resolve(dir, name)
  const bytes = (await stat(file)).size
  const dataUrl = `data:${mime[ext]};base64,${(await readFile(file)).toString('base64')}`

  const out = await page.evaluate(
    async ({ dataUrl, isPng, maxSide, maxBytes, bytes, quality }) => {
      const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob())
      const long = Math.max(bmp.width, bmp.height)
      if (long <= maxSide && bytes <= maxBytes) return null
      const scale = Math.min(1, maxSide / long)
      const canvas = new OffscreenCanvas(Math.round(bmp.width * scale), Math.round(bmp.height * scale))
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
      let transparent = false
      if (isPng) {
        const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 3; i < px.length; i += 4) if (px[i] < 255) { transparent = true; break }
      }
      const type = transparent ? 'image/png' : 'image/jpeg'
      const blob = await canvas.convertToBlob({ type, quality })
      const buf = new Uint8Array(await blob.arrayBuffer())
      let bin = ''
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000))
      return { b64: btoa(bin), type, from: [bmp.width, bmp.height], to: [canvas.width, canvas.height] }
    },
    { dataUrl, isPng: ext === '.png', maxSide: MAX_SIDE, maxBytes: MAX_BYTES, bytes, quality: JPEG_QUALITY },
  )
  if (!out) {
    const clean = mime[ext] === 'image/jpeg' ? stripExif(await readFile(file)) : null
    if (clean) {
      if (!existsSync(resolve(originals, name))) await copyFile(file, resolve(originals, name))
      await writeFile(file, clean)
      console.log(`${name}: stripped EXIF (${bytes - clean.length} bytes of metadata)`)
    }
    continue
  }

  if (!existsSync(resolve(originals, name))) await copyFile(file, resolve(originals, name))
  const outName = out.type === 'image/jpeg' && ext === '.png' ? name.slice(0, -ext.length) + '.jpg' : name
  const data = Buffer.from(out.b64, 'base64')
  await writeFile(resolve(dir, outName), data)
  if (outName !== name) await rm(file)
  console.log(`${name} ${out.from.join('x')} ${(bytes / 1e6).toFixed(2)} MB -> ${outName} ${out.to.join('x')} ${(data.length / 1e6).toFixed(2)} MB`)
}
await browser.close()
