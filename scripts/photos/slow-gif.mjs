// Slows a GIF down by multiplying every frame delay; pixels are untouched (no re-encode, no quality loss).
//   node scripts/photos/slow-gif.mjs public/gifs/bg-dollar-bills.gif --factor 3
// Always works from the untouched original in asset-originals/<dir>/ (copied there on first run),
// so re-running with a different factor never compounds.
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({ allowPositionals: true, options: { factor: { type: 'string', default: '2' } } })
const factor = Number(values.factor)
if (!positionals.length || !(factor > 0)) {
  console.error('usage: slow-gif.mjs <file.gif>... [--factor N]')
  process.exit(1)
}

const root = resolve(import.meta.dirname, '../..')

for (const arg of positionals) {
  const target = resolve(arg)
  const originals = resolve(root, 'asset-originals', relative(resolve(root, 'public'), dirname(target)))
  const original = resolve(originals, basename(target))
  await mkdir(originals, { recursive: true })
  if (!existsSync(original)) await copyFile(target, original)
  const b = Buffer.from(await readFile(original))
  if (b.subarray(0, 3).toString('latin1') !== 'GIF') throw new Error(`${arg}: not a GIF`)

  // Same block walk as scripts/asset-gallery/gif.mjs, patching each Graphic Control Extension's delay.
  const flags = b[10]
  let i = 13 + (flags & 0x80 ? 3 * (2 << (flags & 7)) : 0)
  const delays = []
  while (i < b.length) {
    if (b[i] === 0x21) {
      if (b[i + 1] === 0xf9) {
        const d = Math.min(0xffff, Math.round(b.readUInt16LE(i + 4) * factor))
        b.writeUInt16LE(d, i + 4)
        delays.push(d * 10)
      }
      i += 2
      while (i < b.length && b[i]) i += b[i] + 1
      i++
    } else if (b[i] === 0x2c) {
      const pf = b[i + 9]
      i += 10
      if (pf & 0x80) i += 3 * (2 << (pf & 7))
      i++
      while (i < b.length && b[i]) i += b[i] + 1
      i++
    } else break
  }
  await writeFile(target, b)
  console.log(`${arg}: ${delays.length} frames, delays now ${[...new Set(delays)].join('/')} ms (x${factor})`)
}
