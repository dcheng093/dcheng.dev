// Copies chosen GIF candidates into public/gifs/ and regenerates public/gifs/CREDITS.md.
//   node scripts/asset-gallery/adopt.mjs              -> every candidate whose verdict is PICK / PICK*
//   node scripts/asset-gallery/adopt.mjs id1 id2 ...  -> exactly these ids
// Re-run any time; files for ids no longer chosen are left alone (delete them by hand).
// Candidates are GIFs unless their entry sets `ext` (e.g. "jpg" for a static photo tile).
// An entry's `slow` (e.g. 3) multiplies its frame delays on the way in, for tiles that are too fast as found.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { slowGif } from './gif.mjs'

const root = resolve(import.meta.dirname, '../..')
const candidates = JSON.parse(await readFile(resolve(root, 'asset-research/candidates.json'), 'utf8'))
const wanted = process.argv.slice(2)
const chosen = wanted.length
  ? wanted.map((id) => candidates.find((c) => c.id === id) ?? (console.error(`unknown id: ${id}`), process.exit(1)))
  : candidates.filter((c) => c.verdict?.startsWith('PICK'))

const outDir = resolve(root, 'public/gifs')
await mkdir(outDir, { recursive: true })
const file = (c) => `${c.id}.${c.ext ?? 'gif'}`
for (const c of chosen) {
  const from = resolve(root, 'asset-research/candidates', file(c))
  if (!c.slow) {
    await copyFile(from, resolve(outDir, file(c)))
    continue
  }
  const b = Buffer.from(await readFile(from))
  const delays = slowGif(b, c.slow)
  await writeFile(resolve(outDir, file(c)), b)
  console.log(`${file(c)}: slowed x${c.slow} (${[...new Set(delays)].join('/')} ms per frame)`)
}

const rows = chosen
  .map((c) => `| ${file(c)} | ${c.category} | ${c.source} | [source page](${c.sourcePage}) | [original](${c.assetUrl}) | ${c.terms} |`)
  .join('\n')
await writeFile(
  resolve(outDir, 'CREDITS.md'),
  `# Third-party GIF credits

These animated GIFs were found via GifCities (Internet Archive's GeoCities GIF search) and AnimatedImages.org.
None is assumed to be public domain. GifCities GIFs come from personal GeoCities pages whose authors are unknown;
AnimatedImages.org GIFs are used under that site's stated terms (individual website decoration, not as a collection).
If you made one of these and want it credited differently or removed, contact the site owner and it will be swapped out.

| File | Subject | Found via | Source page | Original URL | Stated terms |
|---|---|---|---|---|---|
${rows}
`,
)
console.log(`adopted ${chosen.length} GIFs into public/gifs/ and wrote CREDITS.md`)
