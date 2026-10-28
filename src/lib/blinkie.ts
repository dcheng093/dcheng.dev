import { applyPalette, GIFEncoder, quantize } from 'gifenc'
import { mulberry32 } from './random'

/** The Blinkie Maker: what each frame looks like (pure), plus drawing and GIF encoding (browser only). */
export type Effect = 'blink' | 'scroll' | 'rainbow' | 'sparkle'
export type BlinkieOpts = { text: string; size: 'blinkie' | 'button'; font: string; fg: string; bg: string; effect: Effect }

export const SIZES = { blinkie: { w: 150, h: 20 }, button: { w: 88, h: 31 } } as const

export const FONTS = [
  { id: 'pixel', label: 'Press Start 2P', css: '"Press Start 2P"', px: 8 },
  { id: 'silk', label: 'Silkscreen', css: 'Silkscreen', px: 10 },
  { id: 'vt', label: 'VT323', css: 'VT323', px: 16 },
] as const

export const EFFECTS: { id: Effect; label: string }[] = [
  { id: 'blink', label: 'Blink' },
  { id: 'scroll', label: 'Scroll' },
  { id: 'rainbow', label: 'Rainbow' },
  { id: 'sparkle', label: 'Sparkle' },
]

// Blink stays at 2.5 swaps a second on purpose: slower than the 3Hz flash threshold.
const TIMING: Record<Effect, { frames: number; delay: number }> = {
  blink: { frames: 2, delay: 400 },
  scroll: { frames: 30, delay: 70 },
  rainbow: { frames: 12, delay: 120 },
  sparkle: { frames: 6, delay: 160 },
}
export const timing = (effect: Effect) => TIMING[effect]

export type FrameStyle = { fg: string; bg: string; x: number; sparkles: [number, number][] }

/** How frame i looks. `textW` is the measured text width; text is centred unless scrolling. */
export function frameStyle(o: BlinkieOpts, i: number, textW: number): FrameStyle {
  const { w, h } = SIZES[o.size]
  const { frames } = TIMING[o.effect]
  const centred = Math.round((w - textW) / 2)
  switch (o.effect) {
    case 'blink':
      return i % 2 ? { fg: o.bg, bg: o.fg, x: centred, sparkles: [] } : { fg: o.fg, bg: o.bg, x: centred, sparkles: [] }
    case 'scroll':
      return { fg: o.fg, bg: o.bg, x: Math.round(w - ((w + textW) * i) / frames), sparkles: [] }
    case 'rainbow':
      return { fg: `hsl(${Math.round((360 * i) / frames)} 100% 60%)`, bg: o.bg, x: centred, sparkles: [] }
    case 'sparkle': {
      const rng = mulberry32(i + 1)
      return { fg: o.fg, bg: o.bg, x: centred, sparkles: Array.from({ length: 4 }, () => [Math.floor(rng() * w), Math.floor(rng() * h)]) }
    }
  }
}

const font = (o: BlinkieOpts) => {
  const f = FONTS.find((x) => x.id === o.font) ?? FONTS[0]
  return `${f.px}px ${f.css}, monospace`
}

export function drawFrame(ctx: CanvasRenderingContext2D, o: BlinkieOpts, i: number) {
  const { w, h } = SIZES[o.size]
  ctx.font = font(o)
  ctx.textBaseline = 'middle'
  const textW = Math.ceil(ctx.measureText(o.text).width)
  const s = frameStyle(o, i, textW)
  ctx.fillStyle = s.bg
  ctx.fillRect(0, 0, w, h)
  // The classic blinkie border: 1px darker frame.
  ctx.strokeStyle = s.fg
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
  ctx.fillStyle = s.fg
  ctx.fillText(o.text, s.x, Math.round(h / 2) + 1)
  ctx.fillStyle = '#fff'
  for (const [x, y] of s.sparkles) {
    ctx.fillRect(x - 1, y, 3, 1)
    ctx.fillRect(x, y - 1, 1, 3)
  }
}

/** Renders every frame and encodes an animated GIF. Fonts must already be loaded. */
export function encodeBlinkie(o: BlinkieOpts): Uint8Array {
  const { w, h } = SIZES[o.size]
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const gif = GIFEncoder()
  const { frames, delay } = TIMING[o.effect]
  for (let i = 0; i < frames; i++) {
    drawFrame(ctx, o, i)
    const { data } = ctx.getImageData(0, 0, w, h)
    const palette = quantize(data, 64)
    gif.writeFrame(applyPalette(data, palette), w, h, { palette, delay })
  }
  gif.finish()
  return gif.bytes()
}
