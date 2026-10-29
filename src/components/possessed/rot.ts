import { assets } from '../../content/assets'

// What possession does to Daniel's own photos: drawn once onto a canvas and mutilated there (red-black, dripping,
// hollow-eyed, a grin pulled too long), then reused as a still. Nothing here animates, so nothing here can flicker.

/**
 * Where the face is in each head cut-out, as fractions of the picture (measured by eye on the 512px files): each
 * eye's centre and size, and the band the mouth sits in. A new head needs its own entry, or it only gets the colour
 * and the drips.
 */
type Face = { eyes: [number, number][]; eye: number; mouth: [number, number] }
const FACES: Record<string, Face> = {
  [assets.headGrin.src]: { eyes: [[0.361, 0.434], [0.615, 0.426]], eye: 0.066, mouth: [0.64, 0.09] },
  [assets.headWink.src]: { eyes: [[0.303, 0.332], [0.674, 0.297]], eye: 0.08, mouth: [0.565, 0.12] },
  [assets.headShock.src]: { eyes: [[0.434, 0.363], [0.703, 0.344]], eye: 0.06, mouth: [0.575, 0.08] },
}
const PHOTOS = new Set([assets.hero.src, assets.headshot.src, assets.body.src, ...assets.misc.map((s) => s.src)])

export const isDaniel = (src: string) => src in FACES || PHOTOS.has(src)

/** Something running out of an eye: a thin streak from the lower lid that thickens into a drop at the end. */
function tear(g: CanvasRenderingContext2D, x: number, y: number, len: number, w: number) {
  g.beginPath()
  g.moveTo(x - w * 0.3, y)
  g.quadraticCurveTo(x - w * 0.45, y + len * 0.6, x - w * 0.5, y + len)
  g.arc(x, y + len, w * 0.5, Math.PI, 0, true)
  g.quadraticCurveTo(x + w * 0.45, y + len * 0.6, x + w * 0.3, y)
  g.closePath()
  g.fill()
}

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
  const face = FACES[src]
  const head = !!face
  g.drawImage(img, 0, 0)

  // The grin: the mouth's band of the face pulled down and stretched, its top and bottom edges feathered, and kept
  // inside the head's own outline (so it reads as a face pulled long, not a slab pasted across it).
  if (face) {
    const [top, tall] = face.mouth
    const band = document.createElement('canvas')
    band.width = w
    band.height = h
    const b = band.getContext('2d')!
    b.drawImage(c, 0, h * top, w, h * tall, -w * 0.04, h * top, w * 1.08, h * tall * 2)
    const fade = b.createLinearGradient(0, h * top, 0, h * (top + tall * 2))
    fade.addColorStop(0, '#0000')
    fade.addColorStop(0.25, '#000')
    fade.addColorStop(0.75, '#000')
    fade.addColorStop(1, '#0000')
    b.globalCompositeOperation = 'destination-in'
    b.fillStyle = fade
    b.fillRect(0, 0, w, h)
    g.globalCompositeOperation = 'source-atop'
    g.drawImage(band, 0, 0)
    g.globalCompositeOperation = 'source-over'
  }
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

  if (face) {
    // Hollow eyes with a pin of red at the bottom of each, and what's leaking out of them. Only on the head itself.
    g.globalCompositeOperation = 'source-atop'
    for (const [ex, ey] of face.eyes) {
      const cx = w * ex
      const cy = h * ey
      const r = w * face.eye
      const hollow = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.4)
      hollow.addColorStop(0, '#000')
      hollow.addColorStop(0.6, '#000')
      hollow.addColorStop(1, '#0000')
      g.fillStyle = hollow
      g.beginPath()
      g.ellipse(cx, cy, r * 1.4, r * 1.1, 0, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#120000'
      tear(g, cx + (rand() - 0.5) * r * 0.6, cy + r * 0.7, h * (0.1 + rand() * 0.1), r * 0.32)
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
