import { useRef } from 'react'
import { useCanvasLoop } from './loop'

type DemoProps = { active: boolean }
const MONO = '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

// ——— timebound: an arrow in flight, and the plugin's four time powers played on it in turn ———

const POWERS = [
  { name: 'Lunar Dial', verb: 'freezes time', color: '#9ad8ff', particle: '#e8f6ff' },
  { name: 'Chrono Lock', verb: 'slows time', color: '#c9b38a', particle: '#6b6458' },
  { name: 'Flashstep', verb: 'skips ahead', color: '#ffe066', particle: '#fff6b0' },
  { name: 'Requiem', verb: 'rewinds', color: '#c77dff', particle: '#9b4dff' },
] as const
const PHASE = 3.8 // seconds per power
const SPEED = 0.42 // of the flight path per second

/** Where the arrow is (0 = bow, 1 = target) `t` seconds into a power's turn, and whether the power is acting. */
function flight(power: number, t: number): { p: number; on: boolean } {
  const v = SPEED
  switch (power) {
    case 0: // freeze: stops dead for a beat
      return t < 1 ? { p: v * t, on: false } : t < 2.3 ? { p: v, on: true } : { p: v * (t - 1.3), on: false }
    case 1: // slow: a crawl
      return t < 1 ? { p: v * t, on: false } : t < 2.8 ? { p: v + v * 0.15 * (t - 1), on: true } : { p: v + v * 0.27 + v * (t - 2.8), on: false }
    case 2: // skip: blinks forward
      return t < 1 ? { p: v * t, on: false } : { p: v * t + 0.32, on: t < 1.6 }
    default: // rewind: flies back to the bow, then again
      return t < 1.3 ? { p: v * t, on: false } : t < 2.4 ? { p: v * 1.3 * (1 - (t - 1.3) / 1.1), on: true } : { p: v * (t - 2.4), on: false }
  }
}

export function TimeboundDemo({ active }: DemoProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useCanvasLoop(canvas, active, (g, w, h, t) => {
    const B = Math.max(8, Math.floor(h / 14)) // one block
    const power = Math.floor(t / PHASE) % POWERS.length
    const local = t % PHASE
    const { p, on } = flight(power, local)
    const pw = POWERS[power]

    // Sky, then ground: a grass row over dirt and stone.
    const sky = g.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#5d8fe0')
    sky.addColorStop(1, '#b8d6ff')
    g.fillStyle = sky
    g.fillRect(0, 0, w, h)
    const groundY = h - B * 3
    for (let x = 0; x < w; x += B) {
      g.fillStyle = '#5daa3b'
      g.fillRect(x, groundY, B, B * 0.35)
      g.fillStyle = '#7a5230'
      g.fillRect(x, groundY + B * 0.35, B, B * 0.65)
      g.fillStyle = (x / B) % 3 === 0 ? '#8d8d8d' : '#7b7b7b'
      g.fillRect(x, groundY + B, B, B * 2)
      g.fillStyle = 'rgba(0,0,0,0.12)'
      g.fillRect(x + B - 1, groundY, 1, B * 3)
    }
    // A blocky archer on the left, a target block on the right.
    const ax = B * 2
    const ay = groundY - B * 3
    g.fillStyle = '#3b3fa8'
    g.fillRect(ax, ay + B * 2, B, B)
    g.fillStyle = '#36a2c4'
    g.fillRect(ax, ay + B, B, B)
    g.fillStyle = '#c99b7a'
    g.fillRect(ax + B * 0.1, ay + B * 0.1, B * 0.8, B * 0.8)
    g.strokeStyle = '#6b4423'
    g.lineWidth = Math.max(2, B * 0.15)
    g.beginPath()
    g.arc(ax + B * 1.2, ay + B * 1.4, B * 0.8, -1.2, 1.2)
    g.stroke()
    const tx = w - B * 3
    const ty = groundY - B * 2.5
    for (const [r, c] of [[1, '#fff'], [0.72, '#d33'], [0.44, '#fff'], [0.18, '#d33']] as const) {
      g.fillStyle = c
      g.fillRect(tx + B * (1 - r), ty + B * (1 - r), B * 2 * r, B * 2 * r)
    }

    // The power's wash over the world while it acts.
    if (on) {
      g.fillStyle = `${pw.color}33`
      g.fillRect(0, 0, w, h)
    }
    // The arrow.
    const x0 = ax + B * 2
    const x1 = tx
    const prog = Math.min(1, p)
    const arcY = (q: number) => ay + B * 1.4 - Math.sin(q * Math.PI) * B * 1.6
    const x = x0 + (x1 - x0) * prog
    const y = arcY(prog)
    g.save()
    g.translate(x, y)
    g.rotate(-Math.cos(prog * Math.PI) * 0.5)
    g.fillStyle = '#6b4423'
    g.fillRect(-B * 1.2, -1.5, B * 1.2, 3)
    g.fillStyle = '#ddd'
    g.fillRect(0, -3, B * 0.3, 6)
    g.fillStyle = '#eee'
    g.fillRect(-B * 1.25, -4, B * 0.3, 8)
    g.restore()

    // Particles, each power its own (as in the plugin): snowflakes, ash, sparks, portal motes.
    const n = on ? 18 : 6
    for (let i = 0; i < n; i++) {
      const s = i * 12.9898
      const r = (Math.sin(s) * 43758.5453) % 1
      const k = Math.abs(r)
      let px = x
      let py = y
      if (power === 0) {
        px += Math.cos(s + local * 0.6) * B * (1 + k * 2.5)
        py += Math.sin(s * 1.3 + local * 0.8) * B * (1 + k * 2)
      } else if (power === 1) {
        px += (k - 0.5) * B * 5
        py += ((local * 30 + i * 13) % (B * 4)) - B * 2
      } else if (power === 2) {
        const along = (i / n) * 0.32
        px = x0 + (x1 - x0) * Math.max(0, prog - along)
        py = arcY(Math.max(0, prog - along)) + (k - 0.5) * B
      } else {
        const a = s + local * 3
        const rad = B * (2.5 - ((local * 1.5 + k) % 1) * 2.2)
        px += Math.cos(a) * rad
        py += Math.sin(a) * rad
      }
      const size = Math.max(2, Math.round(B * (power === 0 ? 0.22 : 0.16)))
      g.fillStyle = pw.particle
      g.fillRect(Math.round(px), Math.round(py), size, size)
    }

    // The caption: which clock, and what it does.
    g.font = `bold ${Math.max(12, Math.round(B * 0.7))}px ui-monospace, monospace`
    g.textBaseline = 'top'
    g.fillStyle = '#000a'
    g.fillRect(10, 10, g.measureText(`${pw.name} ${pw.verb}`).width + 16, B * 1.1)
    g.fillStyle = pw.color
    g.fillText(pw.name, 18, 14)
    g.fillStyle = '#fff'
    g.fillText(` ${pw.verb}`, 18 + g.measureText(pw.name).width, 14)
    g.font = MONO
    g.fillStyle = '#000b'
    g.fillText('/timebound', 18, h - 18)
  })
  return <canvas ref={canvas} aria-hidden className="h-full w-full rounded-xl [image-rendering:pixelated]" />
}

// ——— The Descent: the game's own sprites, a lamp in the dark, and the Witness following your trail ———

const images: Record<string, HTMLImageElement> = {}
const sprite = (name: string) => {
  if (!images[name]) {
    images[name] = new Image()
    images[name].src = `/boring/descent/${name}.webp`
  }
  return images[name]
}
const ready = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0

// Rows of the 64px walk sheets, by heading.
const ROW = { down: 0, left: 1, up: 2, right: 3 } as const
const heading = (dx: number, dy: number) => (Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down')

type Walker = { x: number; y: number; dx: number; dy: number }
type DescentState = { me: Walker; witness: Walker; trail: { x: number; y: number; at: number }[]; lastStep: number; pointer: { x: number; y: number } | null }

export function DescentDemo({ active }: DemoProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const dark = useRef<HTMLCanvasElement | null>(null)
  const state = useRef<DescentState | null>(null)
  useCanvasLoop(canvas, active, (g, w, h, t, dt) => {
    const tiles = sprite('tiles')
    const player = sprite('player')
    const witness = sprite('witness')
    if (!state.current) state.current = { me: { x: w * 0.5, y: h * 0.55, dx: 0, dy: 1 }, witness: { x: w * 0.1, y: h * 0.9, dx: 1, dy: 0 }, trail: [], lastStep: 0, pointer: null }
    const s = state.current
    g.imageSmoothingEnabled = false
    g.fillStyle = '#07060c'
    g.fillRect(0, 0, w, h)
    if (!ready(tiles) || !ready(player) || !ready(witness)) return

    // The monastery: flagstones, a band of wall across the top, a few crates, a barrel and a birdcage.
    const S = 2
    for (let y = 0; y < h; y += 64 * S) for (let x = 0; x < w; x += 128 * S) g.drawImage(tiles, 32, 320, 128, 64, x, y, 128 * S, 64 * S)
    for (let x = 0; x < w; x += 128 * S) g.drawImage(tiles, 32, 128, 128, 40, x, 0, 128 * S, 40 * S)
    const props: [number, number, number, number, number, number][] = [
      [258, 258, 30, 30, 0.12, 0.42],
      [292, 262, 22, 26, 0.18, 0.62],
      [262, 306, 22, 26, 0.82, 0.4],
      [354, 294, 32, 44, 0.86, 0.72],
      [322, 258, 28, 30, 0.5, 0.86],
    ]
    for (const [sx, sy, sw, sh, fx, fy] of props) g.drawImage(tiles, sx, sy, sw, sh, fx * w - sw, fy * h - sh, sw * S, sh * S)

    // You: wander the room on your own, or head for the cursor.
    const wander = { x: w * (0.5 + 0.34 * Math.sin(t * 0.33)), y: h * (0.6 + 0.24 * Math.sin(t * 0.47 + 1)) }
    const goal = s.pointer ?? wander
    const mx = goal.x - s.me.x
    const my = goal.y - s.me.y
    const dist = Math.hypot(mx, my)
    const moving = dist > 4
    if (moving) {
      const step = Math.min(dist, 70 * dt)
      s.me.dx = mx / dist
      s.me.dy = my / dist
      s.me.x += s.me.dx * step
      s.me.y += s.me.dy * step
    }
    // Every step leaves evidence: a footprint. The Witness reads them, oldest first, and follows.
    if (moving && t - s.lastStep > 0.4) {
      s.trail.push({ x: s.me.x, y: s.me.y + 18, at: t })
      s.lastStep = t
      if (s.trail.length > 30) s.trail.shift()
    }
    const next = s.trail[0]
    if (next) {
      const wx = next.x - s.witness.x
      const wy = next.y - 22 - s.witness.y
      const wd = Math.hypot(wx, wy)
      if (wd < 6) s.trail.shift()
      else {
        s.witness.dx = wx / wd
        s.witness.dy = wy / wd
        s.witness.x += s.witness.dx * Math.min(wd, 42 * dt)
        s.witness.y += s.witness.dy * Math.min(wd, 42 * dt)
      }
    }
    for (const f of s.trail) {
      g.fillStyle = `rgba(200,170,120,${Math.max(0, 0.5 - (t - f.at) * 0.05)})`
      g.fillRect(Math.round(f.x) - 2, Math.round(f.y), 3, 2)
    }
    const draw = (img: HTMLImageElement, cols: number, fps: number, wk: Walker, still: boolean) => {
      const frame = still ? 0 : Math.floor(t * fps) % cols
      g.drawImage(img, frame * 64, ROW[heading(wk.dx, wk.dy)] * 64, 64, 64, Math.round(wk.x - 48), Math.round(wk.y - 64), 96, 96)
    }
    draw(witness, 4, 4, s.witness, false)
    draw(player, 8, 10, s.me, !moving)

    // The dark, with a hole where the lamp is: it flickers, warm.
    if (!dark.current) dark.current = document.createElement('canvas')
    const d = dark.current
    if (d.width !== g.canvas.width || d.height !== g.canvas.height) {
      d.width = g.canvas.width
      d.height = g.canvas.height
    }
    const dg = d.getContext('2d')!
    const scale = g.canvas.width / w
    dg.setTransform(scale, 0, 0, scale, 0, 0)
    dg.globalCompositeOperation = 'source-over'
    dg.clearRect(0, 0, w, h)
    dg.fillStyle = 'rgba(4,3,9,0.95)'
    dg.fillRect(0, 0, w, h)
    const lx = s.me.x + 6
    const ly = s.me.y - 20
    const r = Math.min(w, h) * 0.3 + Math.sin(t * 9) * 2 + Math.sin(t * 2.3) * 3
    const hole = dg.createRadialGradient(lx, ly, r * 0.2, lx, ly, r)
    hole.addColorStop(0, 'rgba(0,0,0,1)')
    hole.addColorStop(1, 'rgba(0,0,0,0)')
    dg.globalCompositeOperation = 'destination-out'
    dg.fillStyle = hole
    dg.fillRect(0, 0, w, h)
    g.drawImage(d, 0, 0, w, h)
    const warm = g.createRadialGradient(lx, ly, 0, lx, ly, r)
    warm.addColorStop(0, 'rgba(255,170,80,0.22)')
    warm.addColorStop(1, 'rgba(255,140,40,0)')
    g.fillStyle = warm
    g.fillRect(0, 0, w, h)

    g.font = MONO
    g.textBaseline = 'middle'
    g.fillStyle = 'rgba(255,220,180,0.55)'
    g.fillText(s.pointer ? 'you hold the lamp' : 'something follows your footprints…', 12, h - 14)
  })
  const toCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="h-full w-full rounded-xl"
      onPointerMove={(e) => {
        if (state.current && e.pointerType === 'mouse') state.current.pointer = toCanvas(e)
      }}
      onPointerLeave={() => {
        if (state.current) state.current.pointer = null
      }}
    />
  )
}
