// npm run world-textures: turns Daniel's texture photos (asset-originals/me/) into what the /boring world loads
// (src/world-textures/, small WebP):
//   clouds-1..5.webp   cloud photos with the blue sky keyed out (alpha), turned to plain brightness so the scene can
//                      tint them to its light, edges feathered so no frame shows
//   water-normal.webp  the calm-ocean tile turned into a ripple normal map for the lake
// Re-run after changing a source; the outputs are committed.
import { mkdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '../..')
const src = (f) => resolve(root, 'asset-originals/me', f)
const out = resolve(root, 'src/world-textures')
await mkdir(out, { recursive: true })

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const CLOUDS = ['CLOUD07J.GIF', 'BACKGR11.JPG', 'BACKGR12.JPG', 'SKY1.png', 'CLOUDS_copy.JPG']
for (const [i, file] of CLOUDS.entries()) {
  const { data, info } = await sharp(src(file)).resize({ width: 512, height: 512, fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const rgba = Buffer.alloc(w * h * 4)
  for (let p = 0; p < w * h; p++) {
    const [r, g, b] = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]]
    // Sky is blue (red well below blue); cloud is white or grey (red close to blue). Bright and red≈blue: cloud.
    const whiteness = r / Math.max(1, b)
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    let a = smooth(0.66, 0.92, whiteness) * smooth(0.4, 0.72, lum)
    // Feather out towards the picture's edges in an ellipse, so a cloud cut by the frame melts away rather than stops
    // in a line, and the sprite never shows its rectangle.
    const x = ((p % w) / w - 0.5) * 2
    const y = (Math.floor(p / w) / h - 0.5) * 2
    a *= 1 - smooth(0.5, 0.98, Math.hypot(x, y))
    const v = Math.round(150 + lum * 105)
    rgba[p * 4] = rgba[p * 4 + 1] = rgba[p * 4 + 2] = v
    rgba[p * 4 + 3] = Math.round(a * 255)
  }
  const name = resolve(out, `clouds-${i + 1}.webp`)
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .blur(0.6)
    .webp({ quality: 80, alphaQuality: 70, effort: 6 })
    .toFile(name)
  console.log(`${file.padEnd(16)} -> clouds-${i + 1}.webp  ${w}×${h}  ${Math.round((await stat(name)).size / 1024)} KB  (was ${Math.round((await stat(src(file))).size / 1024)} KB)`)
}

// The lake: brightness of the ocean tile as a height field, its slopes as a tangent-space normal map. The tile is
// seamless, and the slopes wrap round the edges, so the map tiles too.
{
  const N = 512
  const { data } = await sharp(src('OPOCEAN2.JPG')).resize(N, N, { fit: 'fill' }).greyscale().blur(1.2).raw().toBuffer({ resolveWithObject: true })
  const hgt = (x, y) => data[((y + N) % N) * N + ((x + N) % N)] / 255
  const px = Buffer.alloc(N * N * 3)
  const strength = 3.2
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const dx = (hgt(x + 1, y) - hgt(x - 1, y)) * strength
      const dy = (hgt(x, y + 1) - hgt(x, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const i = (y * N + x) * 3
      px[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255)
      px[i + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255)
      px[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255)
    }
  const name = resolve(out, 'water-normal.webp')
  await sharp(px, { raw: { width: N, height: N, channels: 3 } }).webp({ quality: 85, effort: 6 }).toFile(name)
  console.log(`OPOCEAN2.JPG     -> water-normal.webp  ${N}×${N}  ${Math.round((await stat(name)).size / 1024)} KB`)
}
