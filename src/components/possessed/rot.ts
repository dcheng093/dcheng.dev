import { assets } from '../../content/assets'

// What possession does to Daniel's own photos: drawn once onto a canvas and mutilated there (red-black, dripping,
// hollow-eyed, a grin pulled too long), then reused as a still. Nothing here animates, so nothing here can flicker.

/** Head cut-outs: transparent, face filling the square, so eyes and mouth sit about where we guess. */
const HEADS = new Set([assets.headGrin.src, assets.headShock.src, assets.headWink.src])
const PHOTOS = new Set([assets.hero.src, assets.headshot.src, assets.body.src, ...assets.misc.map((s) => s.src)])

export const isDaniel = (src: string) => HEADS.has(src) || PHOTOS.has(src)
const isHead = (src: string) => HEADS.has(src)

/** Same picture, same wounds: a tiny deterministic random from the file name. */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function mutilate(img: HTMLImageElement, src: string): string | null {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  if (!g || !w || !h) return null
  const rand = rng(src)
  const head = isHead(src)
  g.drawImage(img, 0, 0)

  // The grin: the mouth's band of the face pulled down and stretched.
  if (head) g.drawImage(c, 0, h * 0.6, w, h * 0.12, -w * 0.04, h * 0.6, w * 1.08, h * 0.24)
  // Photos: a few slices slid sideways, like a tape that's been chewed.
  else
    for (let i = 0; i < 4; i++) {
      const y = rand() * h * 0.9
      const bh = h * (0.01 + rand() * 0.05)
      g.drawImage(c, 0, y, w, bh, (rand() - 0.5) * w * 0.12, y, w, bh)
    }

  // Red and black: darken the mids, keep only a sick red.
  const data = g.getImageData(0, 0, w, h)
  const px = data.data
  for (let i = 0; i < px.length; i += 4) {
    const l = (0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2]) / 255
    const v = l ** 1.7 * 255
    px[i] = Math.min(255, v * 1.3 + 14)
    px[i + 1] = v * 0.32
    px[i + 2] = v * 0.36
  }
  // Drips: columns of the picture run down it.
  for (let n = 0; n < Math.round(w / 9); n++) {
    const x = Math.floor(rand() * w)
    let y = Math.floor(h * (0.15 + rand() * 0.5))
    const len = Math.floor(h * (0.05 + rand() * 0.35))
    const at = (yy: number) => (yy * w + x) * 4
    const from = at(y)
    if (px[from + 3] < 128) continue
    const [r, gg, b] = [px[from], px[from + 1], px[from + 2]]
    for (let k = 0; k < len && y < h - 1; k++, y++) {
      const p = at(y)
      if (px[p + 3] < 128) break
      const f = 1 - k / len
      px[p] = px[p] * (1 - f) + r * f
      px[p + 1] = px[p + 1] * (1 - f) + gg * f
      px[p + 2] = px[p + 2] * (1 - f) + b * f
    }
  }
  g.putImageData(data, 0, 0)

  if (head) {
    // Hollow eyes with a pin of red at the bottom of each, and what's leaking out of them. Only on the head itself.
    g.globalCompositeOperation = 'source-atop'
    for (const ex of [0.37, 0.63]) {
      const cx = w * ex
      const cy = h * 0.42
      const r = w * 0.075
      const hollow = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.4)
      hollow.addColorStop(0, '#000')
      hollow.addColorStop(0.6, '#000')
      hollow.addColorStop(1, '#0000')
      g.fillStyle = hollow
      g.beginPath()
      g.ellipse(cx, cy, r * 1.4, r * 1.1, 0, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#000'
      g.fillRect(cx - r * 0.18, cy, r * 0.36, h * (0.12 + rand() * 0.12))
      g.fillStyle = '#ff1a1a'
      g.shadowColor = '#f00'
      g.shadowBlur = r * 0.6
      g.beginPath()
      g.arc(cx, cy + r * 0.25, r * 0.16, 0, Math.PI * 2)
      g.fill()
      g.shadowBlur = 0
    }
  }
  return c.toDataURL(head ? 'image/png' : 'image/jpeg', 0.85)
}

const cache = new Map<string, Promise<string | null>>()

/** The possessed version of one of Daniel's pictures (a data: URL), or null if it can't be drawn here. */
export function rotted(src: string): Promise<string | null> {
  let job = cache.get(src)
  if (!job) {
    job = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        try {
          resolve(mutilate(img, src))
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = src
    })
    cache.set(src, job)
  }
  return job
}
