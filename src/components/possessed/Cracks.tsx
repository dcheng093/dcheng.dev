import { useMemo } from 'react'
import { mulberry32 } from '../../lib/random'

/** One jagged crack from (x, y), heading `angle`, for about `length` (viewBox units), as SVG polyline points. */
function crack(rng: () => number, x: number, y: number, angle: number, length: number) {
  const pts = [`${x},${y}`]
  let a = angle
  for (let d = 0; d < length; ) {
    const step = 18 + rng() * 40
    a += (rng() - 0.5) * 0.7
    x += Math.cos(a) * step
    y += Math.sin(a) * step
    d += step
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

// Where it's hitting the glass from: a little up and to the right.
const HIT = { x: 690, y: 360 }

/**
 * The screen as a pane of glass something is hitting from the other side: each hit leaves more cracks running out
 * from the same spot; the shatter covers it in them, with shards gone dark. Drawn once per level (nothing animates
 * except a brief shake per hit, in steps), and never in the way: it doesn't take clicks.
 */
export function Cracks({ count, shattered, shake }: { count: number; shattered: boolean; shake: number }) {
  const levels = useMemo(() => {
    const rng = mulberry32(666)
    return Array.from({ length: 7 }, (_, level) =>
      Array.from({ length: level === 6 ? 26 : 3 }, (_, i) => crack(rng, HIT.x, HIT.y, (i / (level === 6 ? 26 : 3)) * Math.PI * 2 + level * 0.9 + rng(), 120 + level * 90 + rng() * 140)),
    )
  }, [])
  const shards = useMemo(() => {
    const rng = mulberry32(37093)
    return Array.from({ length: 9 }, () => {
      const a = rng() * Math.PI * 2
      const r1 = 60 + rng() * 300
      const r2 = r1 + 80 + rng() * 200
      const w = 0.2 + rng() * 0.3
      const p = (r: number, t: number) => `${(HIT.x + Math.cos(t) * r).toFixed(0)},${(HIT.y + Math.sin(t) * r).toFixed(0)}`
      return [p(r1, a), p(r2, a), p(r2, a + w), p(r1, a + w)].join(' ')
    })
  }, [])
  const shown = shattered ? 7 : count
  if (!shown) return null
  return (
    <div key={shake} aria-hidden data-testid="cracks" data-cracks={shown} className={`pointer-events-none fixed inset-0 z-[97] ${shake ? 'animate-shake [animation-iteration-count:3]' : ''}`}>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {shattered && shards.map((s) => <polygon key={s} points={s} fill="#000" fillOpacity={0.35} />)}
        {levels.slice(0, shown).flat().map((pts) => (
          <g key={pts} fill="none" strokeLinejoin="round">
            <polyline points={pts} stroke="#000" strokeOpacity={0.55} strokeWidth={4} />
            <polyline points={pts} stroke="#fff" strokeOpacity={0.75} strokeWidth={1.4} />
          </g>
        ))}
        {shattered && <circle cx={HIT.x} cy={HIT.y} r={26} fill="#000" fillOpacity={0.6} stroke="#fff" strokeOpacity={0.6} />}
      </svg>
    </div>
  )
}
