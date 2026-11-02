import type { CSSProperties, SVGProps } from 'react'

// The hero's construction drawing: compass circles, a golden-ratio grid and guide lines, the way a draughtsman lays
// out a page before the lettering goes in. Each stroke draws itself (pathLength 1, dashoffset 1 → 0), one after another.
const PHI = 1.618
const W = 1200
const H = 700
const cx = W / 2
const cy = H / 2

type Stroke = { el: 'circle' | 'line' | 'rect' | 'path'; props: SVGProps<SVGElement> }

const STROKES: Stroke[] = [
  { el: 'line', props: { x1: 0, y1: cy, x2: W, y2: cy } },
  { el: 'line', props: { x1: cx, y1: 0, x2: cx, y2: H } },
  { el: 'circle', props: { cx, cy, r: 300 } },
  { el: 'circle', props: { cx, cy, r: 300 / PHI } },
  { el: 'circle', props: { cx, cy, r: 300 / PHI / PHI } },
  { el: 'rect', props: { x: cx - 485, y: cy - 300, width: 970, height: 600 } },
  { el: 'line', props: { x1: cx - 485, y1: cy - 300, x2: cx + 485, y2: cy + 300 } },
  { el: 'line', props: { x1: cx + 485, y1: cy - 300, x2: cx - 485, y2: cy + 300 } },
  { el: 'line', props: { x1: cx - 485 + 600, y1: cy - 300, x2: cx - 485 + 600, y2: cy + 300 } },
  { el: 'line', props: { x1: cx - 485, y1: cy - 300 + 600 / PHI, x2: cx + 485, y2: cy - 300 + 600 / PHI } },
  { el: 'path', props: { d: `M ${cx - 485 + 600} ${cy + 300} A 600 600 0 0 1 ${cx - 485} ${cy - 300}` } },
  { el: 'circle', props: { cx: cx - 485, cy: cy - 300, r: 6 } },
  { el: 'circle', props: { cx: cx + 485, cy: cy + 300, r: 6 } },
  { el: 'circle', props: { cx, cy, r: 4 } },
]

export function HeroDrawing() {
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="hero-drawing pointer-events-none absolute inset-0 h-full w-full">
      {STROKES.map(({ el: El, props }, i) => (
        <El key={i} {...(props as object)} pathLength={1} style={{ '--i': i } as CSSProperties} />
      ))}
    </svg>
  )
}
