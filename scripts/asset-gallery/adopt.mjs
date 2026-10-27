// Copies chosen GIF candidates into public/gifs/ and regenerates public/gifs/CREDITS.md.
//   node scripts/asset-gallery/adopt.mjs              -> every candidate whose verdict is PICK / PICK*
//   node scripts/asset-gallery/adopt.mjs id1 id2 ...  -> exactly these ids
// Re-run any time; files for ids no longer chosen are left alone (delete them by hand).
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const candidates = JSON.parse(await readFile(resolve(root, 'asset-research/candidates.json'), 'utf8'))
const wanted = process.argv.slice(2)
const chosen = wanted.length
  ? wanted.map((id) => candidates.find((c) => c.id === id) ?? (console.error(`unknown id: ${id}`), process.exit(1)))
  : candidates.filter((c) => c.verdict?.startsWith('PICK'))

const outDir = resolve(root, 'public/gifs')
await mkdir(outDir, { recursive: true })
for (const c of chosen) await copyFile(resolve(root, 'asset-research/candidates', `${c.id}.gif`), resolve(outDir, `${c.id}.gif`))

const rows = chosen
  .map((c) => `| ${c.id}.gif | ${c.category} | ${c.source} | [source page](${c.sourcePage}) | [original](${c.assetUrl}) | ${c.terms} |`)
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
