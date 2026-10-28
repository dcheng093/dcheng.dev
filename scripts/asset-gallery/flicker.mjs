// Flags GIFs that flash: anything faster than 200ms a frame whose overall brightness jumps by 20/255+ between
// frames fails. Static images always pass. Use it on every new background tile before adopting it.
//   node scripts/asset-gallery/flicker.mjs public/gifs/bg-*.gif
import sharp from 'sharp'

const MIN_DELAY_MS = 200
const MAX_JUMP = 20

let failed = 0
for (const file of process.argv.slice(2)) {
  const img = sharp(file, { animated: true })
  const { width, pageHeight, height, pages = 1, delay = [] } = await img.metadata()
  const h = pageHeight ?? height
  const { data } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true })
  const px = width * h
  const lum = Array.from({ length: pages }, (_, f) => {
    let sum = 0
    for (let i = f * px * 4; i < (f + 1) * px * 4; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    return sum / px
  })
  const jump = Math.max(0, ...lum.map((l, f) => Math.abs(l - lum[(f + 1) % pages])))
  const minDelay = pages > 1 ? Math.min(...delay) : Infinity
  const ok = pages === 1 || minDelay >= MIN_DELAY_MS || jump < MAX_JUMP
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}  ${width}x${h}  ${pages}f  ${pages > 1 ? `${minDelay}ms` : 'static'}  jump ${jump.toFixed(1)}`)
}
process.exitCode = failed ? 1 : 0
