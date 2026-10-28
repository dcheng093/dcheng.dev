// Slows a GIF down by multiplying every frame delay; pixels are untouched (no re-encode, no quality loss).
//   node scripts/photos/slow-gif.mjs public/gifs/bg-dollar-bills.gif --factor 3
// Always works from the untouched original in asset-originals/<dir>/ (copied there on first run),
// so re-running with a different factor never compounds.
// For adopted GIFs (public/gifs), prefer a `slow` factor on the candidates.json entry: gifs:adopt applies it,
// whereas a one-off slow here gets overwritten the next time gifs:adopt runs.
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { slowGif } from '../asset-gallery/gif.mjs'

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

  const delays = slowGif(b, factor)
  await writeFile(target, b)
  console.log(`${arg}: ${delays.length} frames, delays now ${[...new Set(delays)].join('/')} ms (x${factor})`)
}
