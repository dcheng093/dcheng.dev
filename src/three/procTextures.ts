import * as THREE from 'three'

/**
 * Textures drawn in code for things Daniel's texture pack doesn't cover (felt, barcodes, receipts, code…).
 * Small canvases, nearest-neighbour filtered so they stay crunchy like the GIF textures, cached by id.
 */
export type ProcId =
  | 'felt' | 'barcode' | 'receipt' | 'paper' | 'code' | 'keycaps' | 'enamel' | 'hay' | 'bricks' | 'card'
  | 'chip' | 'caution' | 'iris' | 'tiles' | 'sad' | 'wood' | 'checkbox' | 'creditCard' | 'cassette' | 'vinyl'
  | 'tarot' | 'giftWrap' | 'speaker'

type Draw = (c: CanvasRenderingContext2D, s: number) => void

const fill = (c: CanvasRenderingContext2D, colour: string, s: number) => {
  c.fillStyle = colour
  c.fillRect(0, 0, s, s)
}
const noise = (c: CanvasRenderingContext2D, s: number, colours: string[], n: number, seed = 1) => {
  let x = seed
  const r = () => ((x = (x * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < n; i++) {
    c.fillStyle = colours[i % colours.length]
    c.fillRect(Math.floor(r() * s), Math.floor(r() * s), 1 + Math.floor(r() * 2), 1)
  }
}
const text = (c: CanvasRenderingContext2D, str: string, x: number, y: number, colour: string, font: string) => {
  c.fillStyle = colour
  c.font = font
  c.fillText(str, x, y)
}

const DRAW: Record<ProcId, Draw> = {
  felt: (c, s) => {
    fill(c, '#0b6b2e', s)
    noise(c, s, ['#0e7d36', '#095a26'], 900)
  },
  barcode: (c, s) => {
    fill(c, '#fff', s)
    let x = 6
    let i = 0
    while (x < s - 6) {
      const w = [1, 2, 1, 3, 1, 2][i++ % 6]
      c.fillStyle = i % 2 ? '#000' : '#fff'
      c.fillRect(x, 8, w, s - 24)
      x += w
    }
    text(c, '4 20069 42042 0', 8, s - 4, '#000', '9px monospace')
  },
  receipt: (c, s) => {
    fill(c, '#fbf8ef', s)
    const lines = ['DANIEL MART', '1x DANIEL  £69', '1x KETTLE  £12', 'TAX       £42', '-------------', 'TOTAL    £123', 'NO REFUNDS']
    lines.forEach((l, i) => text(c, l, 4, 12 + i * 9, '#333', '8px monospace'))
  },
  paper: (c, s) => {
    fill(c, '#fffdf2', s)
    c.fillStyle = '#9cc3e8'
    for (let y = 10; y < s; y += 8) c.fillRect(0, y, s, 1)
    c.fillStyle = '#e88'
    c.fillRect(10, 0, 1, s)
  },
  code: (c, s) => {
    fill(c, '#0c0c0c', s)
    const lines = ['Error: TOO_MANY_LINES', 'Error: SPACE_REPLACE_TAB', 'Error: INVALID_HEADER', 'Error: TOO_MANY_FUNCS', 'Norme: KO', 'int main(void)', '{', '  return (42);', '}']
    lines.forEach((l, i) => text(c, l, 2, 9 + i * 7, i < 5 ? '#ff5050' : '#5f5', '6px monospace'))
  },
  keycaps: (c, s) => {
    fill(c, '#222', s)
    const k = s / 8
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        c.fillStyle = `hsl(${(x * 40 + y * 25) % 360} 70% 55%)` // RGB, obviously
        c.fillRect(x * k + 1, y * k + 1, k - 2, k - 2)
      }
  },
  enamel: (c, s) => {
    const g = c.createRadialGradient(s * 0.35, s * 0.3, 2, s / 2, s / 2, s * 0.7)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(1, '#e8e2cf')
    c.fillStyle = g
    c.fillRect(0, 0, s, s)
  },
  hay: (c, s) => {
    fill(c, '#c9a13b', s)
    c.strokeStyle = '#e3c25e'
    for (let i = 0; i < 90; i++) {
      const x = (i * 37) % s
      c.beginPath()
      c.moveTo(x, (i * 13) % s)
      c.lineTo(x + 10, ((i * 13) % s) + 3)
      c.stroke()
    }
  },
  bricks: (c, s) => {
    fill(c, '#d8d0c0', s)
    const h = s / 8
    for (let r = 0; r < 8; r++)
      for (let x = r % 2 ? -h : 0; x < s; x += h * 2) {
        c.fillStyle = r % 3 ? '#a8432c' : '#b5502f'
        c.fillRect(x + 1, r * h + 1, h * 2 - 2, h - 2)
      }
  },
  card: (c, s) => {
    fill(c, '#fff', s)
    c.strokeStyle = '#c00'
    c.lineWidth = 2
    c.strokeRect(3, 3, s - 6, s - 6)
    text(c, 'A', 6, 16, '#c00', 'bold 14px serif')
    text(c, '♥', s / 2 - 12, s / 2 + 12, '#c00', 'bold 32px serif')
  },
  chip: (c, s) => {
    fill(c, '#b00020', s)
    c.fillStyle = '#fff'
    for (let i = 0; i < 8; i++) {
      c.save()
      c.translate(s / 2, s / 2)
      c.rotate((i / 8) * Math.PI * 2)
      c.fillRect(s * 0.36, -3, s * 0.12, 6)
      c.restore()
    }
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.24, 0, Math.PI * 2)
    c.fill()
    text(c, '£42', s / 2 - 11, s / 2 + 4, '#b00020', 'bold 10px sans-serif')
  },
  caution: (c, s) => {
    for (let i = -s; i < s * 2; i += 16) {
      c.fillStyle = (i / 16) % 2 ? '#111' : '#f5c400'
      c.beginPath()
      c.moveTo(i, 0)
      c.lineTo(i + 8, 0)
      c.lineTo(i + 8 - s, s)
      c.lineTo(i - s, s)
      c.fill()
    }
  },
  iris: (c, s) => {
    fill(c, '#f6f2ea', s)
    c.fillStyle = '#2e7bd6'
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.22, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#000'
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.1, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#fff'
    c.fillRect(s / 2 - 6, s / 2 - 7, 4, 4)
  },
  tiles: (c, s) => {
    fill(c, '#1b1b55', s)
    const n = [3, 1, 4, 1, 5, 9, 2, 6, 5]
    n.forEach((v, i) => {
      const x = (i % 3) * (s / 3)
      const y = Math.floor(i / 3) * (s / 3)
      c.fillStyle = '#ffd400'
      c.fillRect(x + 2, y + 2, s / 3 - 4, s / 3 - 4)
      text(c, String(v), x + s / 9 - 2, y + s / 5 + 2, '#1b1b55', 'bold 14px monospace')
    })
  },
  sad: (c, s) => {
    fill(c, '#ffd84a', s)
    c.fillStyle = '#000'
    c.fillRect(s * 0.3, s * 0.32, 5, 8)
    c.fillRect(s * 0.62, s * 0.32, 5, 8)
    c.strokeStyle = '#000'
    c.lineWidth = 3
    c.beginPath()
    c.arc(s / 2, s * 0.82, s * 0.2, Math.PI * 1.15, Math.PI * 1.85)
    c.stroke()
    c.fillStyle = '#5ab0ff'
    c.fillRect(s * 0.31, s * 0.45, 3, 7) // a single tear
  },
  wood: (c, s) => {
    fill(c, '#8a5a2b', s)
    c.strokeStyle = '#6e441e'
    for (let y = 0; y < s; y += 5) {
      c.beginPath()
      c.moveTo(0, y)
      c.bezierCurveTo(s * 0.3, y + 3, s * 0.6, y - 3, s, y + 1)
      c.stroke()
    }
  },
  checkbox: (c, s) => {
    fill(c, '#fff', s)
    c.strokeStyle = '#000'
    c.lineWidth = 4
    c.strokeRect(8, 8, s - 16, s - 16)
    c.strokeStyle = '#0a0'
    c.lineWidth = 6
    c.beginPath()
    c.moveTo(s * 0.25, s * 0.5)
    c.lineTo(s * 0.43, s * 0.7)
    c.lineTo(s * 0.78, s * 0.28)
    c.stroke()
  },
  creditCard: (c, s) => {
    const g = c.createLinearGradient(0, 0, s, s)
    g.addColorStop(0, '#2b2d8c')
    g.addColorStop(1, '#c03fb8')
    c.fillStyle = g
    c.fillRect(0, 0, s, s)
    c.fillStyle = '#e6c35c'
    c.fillRect(8, s * 0.35, 14, 10)
    text(c, '4242 4242 4242 4242', 6, s * 0.7, '#fff', '7px monospace')
    text(c, 'D. CHENG', 6, s * 0.86, '#fff', '7px monospace')
  },
  cassette: (c, s) => {
    fill(c, '#1d1d1d', s)
    c.fillStyle = '#f2e6c9'
    c.fillRect(6, 6, s - 12, s * 0.45)
    text(c, 'DANIEL MIX VOL.1', 9, 18, '#c00', '7px monospace')
    c.fillStyle = '#555'
    for (const x of [0.32, 0.68]) {
      c.beginPath()
      c.arc(s * x, s * 0.7, s * 0.1, 0, Math.PI * 2)
      c.fill()
    }
  },
  vinyl: (c, s) => {
    fill(c, '#0a0a0a', s)
    c.strokeStyle = '#222'
    for (let r = s * 0.2; r < s / 2; r += 2) {
      c.beginPath()
      c.arc(s / 2, s / 2, r, 0, Math.PI * 2)
      c.stroke()
    }
    c.fillStyle = '#e0303a'
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.16, 0, Math.PI * 2)
    c.fill()
  },
  tarot: (c, s) => {
    fill(c, '#241048', s)
    c.strokeStyle = '#e8c35a'
    c.lineWidth = 2
    c.strokeRect(4, 4, s - 8, s - 8)
    text(c, '☾', s / 2 - 10, s / 2 + 8, '#e8c35a', '28px serif')
    text(c, 'THE KETTLE', 9, s - 9, '#e8c35a', '8px serif')
  },
  giftWrap: (c, s) => {
    fill(c, '#e0245e', s)
    c.fillStyle = '#ffd400'
    c.fillRect(s / 2 - 5, 0, 10, s)
    c.fillRect(0, s / 2 - 5, s, 10)
    noise(c, s, ['#ff6f9b'], 120, 7)
  },
  speaker: (c, s) => {
    fill(c, '#151515', s)
    for (let r = s * 0.42; r > 2; r -= 5) {
      c.fillStyle = r % 10 < 5 ? '#2a2a2a' : '#0d0d0d'
      c.beginPath()
      c.arc(s / 2, s / 2, r, 0, Math.PI * 2)
      c.fill()
    }
  },
}

const cache = new Map<ProcId, THREE.CanvasTexture>()

export function procTexture(id: ProcId) {
  let t = cache.get(id)
  if (!t) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    DRAW[id](canvas.getContext('2d')!, 64)
    t = new THREE.CanvasTexture(canvas)
    t.magFilter = THREE.NearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    cache.set(id, t)
  }
  return t
}

/** Pictures on a plain black or white background (the tree, the goose) with that background made transparent. */
const keyedCache = new Map<string, THREE.Texture>()
export function keyedTexture(url: string, key: 'black' | 'white') {
  const id = `${url}|${key}`
  let t = keyedCache.get(id)
  if (t) return t
  // No image until the cut-out is ready: WebGL2 fixes a texture's size at first upload, so uploading a
  // placeholder first would leave the real picture with nowhere to go.
  const tex = new THREE.Texture()
  tex.magFilter = THREE.NearestFilter
  tex.colorSpace = THREE.SRGBColorSpace
  t = tex
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const c = canvas.getContext('2d', { willReadFrequently: true })!
    c.drawImage(img, 0, 0)
    const data = c.getImageData(0, 0, canvas.width, canvas.height)
    const d = data.data
    for (let i = 0; i < d.length; i += 4) {
      const sum = d[i] + d[i + 1] + d[i + 2]
      if (key === 'black' ? sum < 60 : sum > 700) d[i + 3] = 0
    }
    c.putImageData(data, 0, 0)
    tex.image = canvas
    tex.needsUpdate = true
  }
  img.src = url
  keyedCache.set(id, t)
  return t
}
