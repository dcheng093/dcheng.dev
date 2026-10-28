// Downloads every candidate in asset-research/candidates.json into asset-research/candidates/,
// verifies it is a GIF, and records measured bytes/dims/frames/sha256 back into the manifest.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseGif } from './gif.mjs'

const root = resolve(import.meta.dirname, '../../asset-research')
const manifestPath = resolve(root, 'candidates.json')
const outDir = resolve(root, 'candidates')
await mkdir(outDir, { recursive: true })

const candidates = JSON.parse(await readFile(manifestPath, 'utf8'))
for (const c of candidates) {
  const res = await fetch(c.assetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) {
    console.error(`${c.id}: HTTP ${res.status}`)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const sha256 = createHash('sha256').update(buf).digest('hex')
  // Static photo tiles (ext "jpg") are stored as-is; everything else must be a GIF.
  if (c.ext === 'jpg') {
    if (buf[0] !== 0xff || buf[1] !== 0xd8) {
      console.error(`${c.id}: not a JPEG, skipped`)
      continue
    }
    await writeFile(resolve(outDir, `${c.id}.jpg`), buf)
    c.measured = { bytes: buf.length, width: c.width, height: c.height, frames: 1, loopSeconds: 0, sha256 }
    console.log(`${c.id}\t${buf.length} B\tjpg`)
    continue
  }
  if (buf.subarray(0, 3).toString('latin1') !== 'GIF') {
    console.error(`${c.id}: not a GIF, skipped`)
    continue
  }
  await writeFile(resolve(outDir, `${c.id}.gif`), buf)
  c.measured = { ...parseGif(buf), sha256 }
  console.log(`${c.id}\t${buf.length} B\t${c.measured.width}x${c.measured.height}\t${c.measured.frames}f`)
}
await writeFile(manifestPath, JSON.stringify(candidates, null, 2))
