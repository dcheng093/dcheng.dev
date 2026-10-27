// Builds asset-research/gallery.html from candidates.json. Each card plays the GIF at 1x and 3x
// on checkerboard / black / white, lists metadata, and decodes every frame with WebCodecs
// ImageDecoder so judging never relies on the filename or the first frame.
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../asset-research')
const candidates = JSON.parse(await readFile(resolve(root, 'candidates.json'), 'utf8'))

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch])

const card = (c) => {
  const m = c.measured ?? {}
  const src = `candidates/${c.id}.gif`
  const scale3 = Math.min(3, Math.floor(480 / c.width) || 1)
  return `
<section class="card" id="${esc(c.id)}" data-src="${esc(src)}">
  <h2>${c.rank === 'alt' ? 'ALT' : '#' + c.rank} · ${esc(c.id)} <small>${esc(c.category)}</small></h2>
  <div class="plays">
    ${['checker', 'black', 'white'].map((bg) => `<div class="bg ${bg}"><img src="${src}" width="${c.width}" height="${c.height}"></div>`).join('')}
    <div class="bg checker"><img src="${src}" width="${c.width * scale3}" height="${c.height * scale3}" class="px"></div>
  </div>
  <dl>
    <dt>source</dt><dd>${esc(c.source)} — <a href="${esc(c.sourcePage)}">source page</a> · <a href="${esc(c.assetUrl)}">asset</a></dd>
    <dt>listed</dt><dd>${c.width}×${c.height} · ${c.bytes.toLocaleString()} B · ${c.frames} frames · ${c.loopSeconds}s loop · ${c.palette} colors</dd>
    <dt>measured</dt><dd>${m.width ? `${m.width}×${m.height} · ${m.bytes.toLocaleString()} B · ${m.frames} frames · ${m.loopSeconds}s · gct ${m.globalPalette} / lct ${m.localPalette} · transparent ${m.transparent}` : 'NOT DOWNLOADED'}</dd>
    <dt>sha256</dt><dd><code>${esc(m.sha256 ?? '-')}</code></dd>
    <dt>terms</dt><dd>${esc(c.terms)}</dd>
    <dt>notes</dt><dd>${esc(c.notes || '—')}</dd>
  </dl>
  <div class="frames">decoding…</div>
</section>`
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>GIF candidates</title>
<style>
  body { font: 13px/1.4 Verdana, sans-serif; background: #ddd; margin: 16px; }
  .card { background: #fff; border: 2px outset #ccc; padding: 10px; margin: 0 0 16px; }
  h2 { margin: 0 0 8px; font-size: 16px; } h2 small { color: #666; font-weight: normal; }
  .plays { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .bg { padding: 8px; display: grid; place-items: center; min-width: 60px; min-height: 40px; }
  .black { background: #000; } .white { background: #fff; outline: 1px solid #ccc; }
  .checker { background: repeating-conic-gradient(#f0f 0 25%, #0f0 0 50%) 0 0 / 16px 16px; }
  .px, canvas { image-rendering: pixelated; }
  dl { display: grid; grid-template-columns: 80px 1fr; gap: 2px 8px; margin: 8px 0; }
  dt { font-weight: bold; } dd { margin: 0; word-break: break-all; }
  .frames { display: flex; flex-wrap: wrap; gap: 4px; }
  .frame { border: 1px solid #999; padding: 2px; font-size: 10px; text-align: center; background: repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 8px 8px; }
  .frame canvas { display: block; max-width: 160px; height: auto; }
</style></head><body>
<h1>GIF candidates (${candidates.length})</h1>
<p>Each card: 1× on checkerboard/black/white, then up to 3× pixelated. Frame strip below is decoded per-frame with its delay.</p>
${candidates.map(card).join('\n')}
<script type="module">
  const cards = [...document.querySelectorAll('.card')]
  await Promise.all(cards.map(async (card) => {
    const strip = card.querySelector('.frames')
    try {
      const data = await (await fetch(card.dataset.src)).arrayBuffer()
      const dec = new ImageDecoder({ data, type: 'image/gif' })
      await dec.tracks.ready
      const n = dec.tracks.selectedTrack.frameCount
      strip.textContent = ''
      for (let i = 0; i < n; i++) {
        const { image } = await dec.decode({ frameIndex: i })
        const cv = document.createElement('canvas')
        cv.width = image.displayWidth; cv.height = image.displayHeight
        cv.getContext('2d').drawImage(image, 0, 0)
        const ms = image.duration == null ? '?' : Math.round(image.duration / 1000)
        image.close()
        const box = document.createElement('div')
        box.className = 'frame'
        box.append(cv, document.createTextNode(i + ' · ' + ms + 'ms'))
        strip.append(box)
      }
    } catch (e) { strip.textContent = 'decode failed: ' + e }
  }))
  document.body.dataset.ready = '1'
</script>
</body></html>`

await writeFile(resolve(root, 'gallery.html'), html)
console.log(`gallery.html written (${candidates.length} cards)`)
