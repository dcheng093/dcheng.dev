import type { CSSProperties, ReactNode } from 'react'
import type { Slot } from '../../content/assets'
import { gifCursor } from '../../lib/cursor'
import { Img } from '../media/Img'

type BandProps = {
  id: string
  tile: string
  cursor?: Slot
  title?: ReactNode
  /** Desktop (lg+) collage height; below lg the band grows to fit its flowed content. */
  lgHeight?: number
  /** Keep the wrapped flow layout at every width (no pinned desktop collage). */
  flow?: boolean
  /** GIFs heaped into the empty space either side of the 1200px collage on wide screens. */
  edges?: readonly Slot[]
  className?: string
  children: ReactNode
}

/**
 * One Cameron's-World-style stratum. Below lg, children flow in a jumbled wrap; at lg+ each
 * <Piece> pins itself absolutely with its own lg: classes so the band becomes a collage.
 */
export function Band({ id, tile, cursor, title, lgHeight = 600, flow = false, edges, className = '', children }: BandProps) {
  return (
    <section
      id={id}
      data-band={id}
      className={`relative overflow-x-clip border-y-4 border-double border-white ${tile} ${className}`}
      style={{ cursor: cursor ? gifCursor(cursor) : undefined, ['--band-h' as string]: `${lgHeight}px` }}
    >
      {edges && <Gutter side="left" items={edges} />}
      {edges && <Gutter side="right" items={[...edges].reverse()} />}
      {title && <div className="relative z-10 px-4 pt-4 text-center">{title}</div>}
      <div className={`relative mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-4 p-4 ${flow ? 'lg:gap-6' : 'lg:block lg:h-[var(--band-h)]'}`}>
        {children}
      </div>
    </section>
  )
}

/**
 * A collage item. `lg` holds literal Tailwind classes for desktop placement (e.g. "lg:left-[5%] lg:top-[10%]")
 * — they must be written out in full at the call site so Tailwind can see them.
 */
export function Piece({ lg = '', tilt = 0, className = '', style, children }: { lg?: string; tilt?: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={`relative max-w-full lg:absolute ${lg} ${className}`} style={{ rotate: `${tilt}deg`, ...style }}>
      {children}
    </div>
  )
}

const GUTTER_MOTION = ['animate-wobble', '', 'animate-boing', '', 'animate-jank-x']

/**
 * The strip outside the 1200px collage, which wide screens otherwise leave as bare wallpaper. Cameron's World never
 * left a gap, so it gets a dense heap of the band's GIFs, repeated until it overflows and is clipped.
 */
function Gutter({ side, items }: { side: 'left' | 'right'; items: readonly Slot[] }) {
  const heap = [...items, ...items, ...items]
  return (
    <aside
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 hidden w-[calc((100%-1200px)/2)] flex-wrap content-start justify-center gap-x-2 gap-y-3 overflow-hidden px-1 py-4 min-[1320px]:flex ${side === 'left' ? 'left-0' : 'right-0'}`}
    >
      {heap.map((slot, i) => (
        <Img
          key={i}
          slot={slot}
          width={Math.min(slot.w, 96)}
          className={GUTTER_MOTION[i % GUTTER_MOTION.length]}
          style={{ rotate: `${((i * 37) % 21) - 10}deg` }}
        />
      ))}
    </aside>
  )
}
