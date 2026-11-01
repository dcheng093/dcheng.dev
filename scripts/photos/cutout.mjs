// Cuts Daniel out of a photo (background removed, offline model) for the boring site's hero: public/me/boring/daniel.webp.
//   node scripts/photos/cutout.mjs ["asset-originals/me/boring (4).jpg"]
// Check the hair edge by eye afterwards; the model is good, not perfect.
import { removeBackground } from '@imgly/background-removal-node'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '../..')
const src = resolve(root, process.argv[2] ?? 'asset-originals/me/boring (4).jpg')
const out = resolve(root, 'public/me/boring/daniel.webp')

const cut = await removeBackground(new Blob([await readFile(src)], { type: 'image/jpeg' }), { output: { format: 'image/png' } })

// Defringe: the edge pixels the model left half-transparent still carry the old (light) wall, which glows on a
// dark page. Tighten their alpha and pull their colour towards the dark of the hair.
const { data, info } = await sharp(Buffer.from(await cut.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 0; i < data.length; i += 4) {
  const a = data[i + 3] / 255
  if (a === 0 || a === 1) continue
  const shade = 0.35 + 0.65 * a ** 2
  for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * shade)
  data[i + 3] = Math.round(255 * a ** 1.6)
}

await sharp(data, { raw: info })
  .trim()
  .resize({ height: 1100, withoutEnlargement: true })
  .webp({ quality: 86, alphaQuality: 90 })
  .toFile(out)
const { width, height, size } = await sharp(out).metadata().then(async (m) => ({ ...m, size: (await readFile(out)).length }))
console.log(`wrote ${out} (${width}×${height}, ${Math.round(size / 1024)} KB)`)
