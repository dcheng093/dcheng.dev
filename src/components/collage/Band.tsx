import type { CSSProperties, ReactNode } from 'react'
import type { Slot } from '../../content/assets'
import { gifCursor } from '../../lib/cursor'

type BandProps = {
  id: string
  tile: string
  cursor?: Slot
  title?: ReactNode
  /** Desktop (lg+) collage height; below lg the band grows to fit its flowed content. */
  lgHeight?: number
  /** Keep the wrapped flow layout at every width (no pinned desktop collage). */
  flow?: boolean
  className?: string
  children: ReactNode
}

/**
 * One Cameron's-World-style stratum. Below lg, children flow in a jumbled wrap; at lg+ each
 * <Piece> pins itself absolutely with its own lg: classes so the band becomes a collage.
 */
export function Band({ id, tile, cursor, title, lgHeight = 600, flow = false, className = '', children }: BandProps) {
  return (
    <section
      id={id}
      data-band={id}
      className={`relative overflow-x-clip border-y-4 border-double border-white ${tile} ${className}`}
      style={{ cursor: cursor ? gifCursor(cursor) : undefined, ['--band-h' as string]: `${lgHeight}px` }}
    >
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
