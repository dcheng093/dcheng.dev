// Broad first pass for a new theme: searches GifCities for each term, downloads small animated results
// into asset-research/survey-<name>/, and writes survey.json + survey.html (every GIF at 2x, labelled)
// so a human can shortlist ids before they go into candidates.json.
//   node scripts/asset-gallery/survey.mjs kawaii "cute bunny" kitten ...   (first arg = survey name)
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseGif } from './gif.mjs'

const [name, ...terms] = process.argv.slice(2)
const PER_TERM = 14
const MAX_SIDE = 200
const MAX_BYTES = 80_000

const outDir = resolve(import.meta.dirname, '../../asset-research', `survey-${name}`)
await mkdir(outDir, { recursive: true })
const seen = new Set()
const found = []

for (const term of terms) {
  const res = await fetch(`https://gifcities.archive.org/api/v1/gifsearch?q=${encodeURIComponent(term)}`)
  const hits = res.ok ? await res.json() : []
  let kept = 0
  for (const h of hits) {
    if (kept >= PER_TERM) break
    if (seen.has(h.checksum) || Math.max(h.width, h.height) > MAX_SIDE || Math.min(h.width, h.height) < 16) continue
    seen.add(h.checksum)
    const assetUrl = `https://blob.gifcities.org/gifcities/${h.checksum}.gif`
    const r = await fetch(assetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!r.ok) continue
    const buf = Buffer.from(await r.arrayBuffer())
    if (buf.length > MAX_BYTES || buf.subarray(0, 4).toString('latin1') !== 'GIF8') continue
    let g
    try { g = parseGif(buf) } catch { continue }
    if (g.frames < 2) continue
    const id = `s${String(found.length).padStart(3, '0')}`
    await writeFile(resolve(outDir, `${id}.gif`), buf)
    found.push({ id, term, urlText: h.url_text, checksum: h.checksum, assetUrl, sourcePage: h.page, width: g.width, height: g.height, bytes: buf.length, frames: g.frames, loopSeconds: g.loopSeconds })
    kept++
  }
  console.log(`${term}: ${kept}`)
}

await writeFile(resolve(outDir, 'survey.json'), JSON.stringify(found, null, 1))
await writeFile(
  resolve(outDir, 'survey.html'),
  `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:6px;background:#fdf;font:11px monospace;display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end">
${found.map((f) => `<figure style="margin:0;text-align:center;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/12px 12px;padding:3px"><img src="${f.id}.gif" style="image-rendering:pixelated;width:${Math.min(f.width * 2, 240)}px"><figcaption style="background:#fff">${f.id} ${f.term}</figcaption></figure>`).join('\n')}
</body>`,
)
console.log(`${found.length} GIFs -> ${outDir}/survey.html`)
