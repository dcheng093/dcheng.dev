import type { ReactNode } from 'react'
import type { ChapterId } from '../../content/portfolio'
import { useReveal } from './useInView'

/**
 * One chapter of the page: its title huge over the world (it rises out of a mask when it scrolls in), a serif lede,
 * then its content on cream panels. On wide screens everything sits clear of the contents sidebar.
 */
export function Chapter({ id, title, lede, dropCap = false, children }: { id: ChapterId; title: string; lede?: ReactNode; dropCap?: boolean; children: ReactNode }) {
  const head = useReveal<HTMLDivElement>(0.25)
  return (
    <section id={id} data-place={id} aria-labelledby={`${id}-title`} className="relative scroll-mt-0 px-4 pb-24 sm:px-8 lg:pl-[calc(var(--side)+2rem)] lg:pr-12">
      <div ref={head} className="chapter-head flex min-h-[80svh] flex-col justify-end pb-14 pt-32">
        <h2 id={`${id}-title`} className="-mb-[0.2em] overflow-hidden pb-[0.24em] font-display text-[clamp(4.5rem,14vw,13.5rem)] font-bold leading-[0.86] tracking-[-0.045em] text-[#f4f1ea]">
          <span className="chapter-title block">{title}</span>
        </h2>
        {lede && (
          <div className={`chapter-lede font-serif-ed mt-8 max-w-3xl text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.08] tracking-[-0.02em] text-[#f4f1ea]/90 ${dropCap ? 'drop-cap' : ''}`}>
            {lede}
          </div>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

/** A cream panel: where a chapter's detail lives (the reference's parchment). */
export function Panel({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useReveal<HTMLDivElement>(0.12)
  return (
    <div ref={ref} className={`ed-panel reveal-up rounded-[28px] bg-[#f4f1ea] p-6 text-[#16161d] sm:p-10 ${className}`} style={{ ['--delay' as string]: `${delay}s` }}>
      {children}
    </div>
  )
}
