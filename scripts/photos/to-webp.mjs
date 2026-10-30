// Re-encodes the heaviest pictures in public/me/ as WebP (animated ones stay animated, cut-outs keep their
// transparency), keeping the originals in asset-originals/me/ like shrink.mjs does.
//   node scripts/photos/to-webp.mjs          -> the heavy files listed below (game clips, head cut-outs)
//   node scripts/photos/to-webp.mjs --all    -> also every other .jpg/.png in public/me/ that comes out smaller,
//                                              rewriting every reference to it (src/, secrets/hunt.mjs; reseal after)
// The game clips were ~9 MB of GIF between them, all loading on Home: as animated WebP they're a fraction of that,
// every frame and delay kept. Re-running is safe: it always encodes from the original, and the GIF/PNG it replaces
// is removed from public/me/ (it's in asset-originals/me/), so update any reference to the old name.
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '../..')
const dir = resolve(root, 'public/me')
const originals = resolve(root, 'asset-originals/me')

// [file, quality, max width]. Lower quality for the game clips (motion hides it); higher for faces (they get looked
// at). The width caps a picture at the size the site shows it (originals can be far bigger).
const FILES = [
  ['game-cs.gif', 62],
  ['game-apex.gif', 62],
  ['game-valorant.gif', 62],
  ['game-tf2.gif', 62],
  ['game-aimlabs.gif', 62],
  ['head-grind.png', 85],
  ['head-shock.png', 85],
  ['head-wink.png', 85],
  ['full-body-cutout.png', 85, 443],
  ['MISC-13.png', 82, 400],
]

await mkdir(originals, { recursive: true })
for (const [file, quality, width] of FILES) {
  const kept = resolve(originals, file)
  const here = resolve(dir, file)
  if (!existsSync(kept)) {
    if (!existsSync(here)) {
      console.log(`${file}: not found, skipped`)
      continue
    }
    await copyFile(here, kept)
  }
  const out = resolve(dir, file.replace(/\.(gif|png)$/i, '.webp'))
  const img = sharp(kept, { animated: true })
  await (width ? img.resize({ width, withoutEnlargement: true }) : img).webp({ quality, alphaQuality: 90, effort: 6 }).toFile(out)
  if (existsSync(here)) await rm(here)
  const [before, after] = [(await stat(kept)).size, (await stat(out)).size]
  console.log(`${file.padEnd(24)} ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`)
}

// ——— --all: every other photo and texture, where WebP is actually smaller ———
// Never these: replay_001.jpg's hidden bytes after the end of the picture are a puzzle (WebP would drop them), and
// HOBBY-3.jpg is what scripts/seal.mjs builds it from.
const KEEP = new Set(['replay_001.jpg', 'HOBBY-3.jpg'])

if (process.argv.includes('--all')) {
  const renamed = new Map()
  for (const file of (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f) && !KEEP.has(f))) {
    const here = resolve(dir, file)
    const kept = resolve(originals, file)
    if (!existsSync(kept)) await copyFile(here, kept)
    const webp = await sharp(kept).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toBuffer()
    const before = (await stat(here)).size
    if (webp.length >= before) continue // already smaller as it is
    const name = file.replace(/\.(jpe?g|png)$/i, '.webp')
    await writeFile(resolve(dir, name), webp)
    await rm(here)
    renamed.set(file, name)
    console.log(`${file.padEnd(40)} ${Math.round(before / 1024)} KB -> ${Math.round(webp.length / 1024)} KB`)
  }
  // Every reference to a renamed file: as a path (/me/NAME) or as a quoted file name ('NAME', in me() and lists).
  const sources = async (d) =>
    (await readdir(d, { withFileTypes: true })).flatMap((e) =>
      e.isDirectory() ? [] : /\.(tsx?|css|mjs)$/.test(e.name) ? [resolve(d, e.name)] : [],
    )
  const walk = async (d) => {
    const out = await sources(d)
    for (const e of await readdir(d, { withFileTypes: true })) if (e.isDirectory() && e.name !== 'test') out.push(...(await walk(resolve(d, e.name))))
    return out
  }
  const files = [...(await walk(resolve(root, 'src'))), resolve(root, 'secrets/hunt.mjs')].filter(existsSync)
  for (const f of files) {
    const text = await readFile(f, 'utf8')
    let next = text
    for (const [from, to] of renamed) next = next.split(`/me/${from}`).join(`/me/${to}`).split(`'${from}'`).join(`'${to}'`)
    if (next !== text) {
      await writeFile(f, next)
      console.log(`  updated ${f.slice(root.length + 1)}`)
    }
  }
  console.log(`${renamed.size} pictures now WebP. Run npm run seal if secrets/hunt.mjs changed.`)
}
