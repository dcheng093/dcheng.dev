import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { portfolio } from '../../content/portfolio'
import { usePlace } from './place'
import { goTo } from './useInView'

/**
 * The contents, once the hero is behind you: a fixed sidebar on wide screens (the current chapter lit, a marker
 * springing to it), and a thin progress bar under the header on phones.
 */
export function Sidebar() {
  const place = usePlace()
  const active = portfolio.chapters.findIndex((c) => c.id === place)
  const shown = place !== 'intro'
  const list = useRef<HTMLOListElement>(null)
  const [marker, setMarker] = useState<{ y: number; h: number } | null>(null)
  useEffect(() => {
    const item = list.current?.children[Math.max(0, active)] as HTMLElement | undefined
    if (item) setMarker({ y: item.offsetTop, h: item.offsetHeight })
  }, [active])
  return (
    <>
      <nav
        aria-label="Chapters"
        className={`fixed left-0 top-0 z-40 hidden h-svh w-[var(--side)] flex-col justify-center bg-gradient-to-r from-[#050507]/75 via-[#050507]/35 to-transparent pl-10 transition-[opacity,translate] duration-700 ease-out lg:flex ${shown ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-6 opacity-0'}`}
      >
        <ol ref={list} className="relative space-y-3 border-l border-[#f4f1ea]/15 pl-5">
          {portfolio.chapters.map((c, i) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={i === active ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  goTo(c.id)
                }}
                className={`flex items-baseline gap-3 text-sm transition-colors duration-300 ${i === active ? 'text-[#f4f1ea]' : 'text-[#f4f1ea]/45 hover:text-[#f4f1ea]/80'}`}
              >
                <span className="w-5 tabular-nums text-xs text-[#f4f1ea]/40">{String(i + 1).padStart(2, '0')}</span>
                <span className={i === active ? 'font-semibold' : ''}>{c.title}</span>
              </a>
            </li>
          ))}
          {marker && active >= 0 && (
            <span
              aria-hidden
              className="side-marker absolute -left-px top-0 w-0.5 rounded-full bg-[var(--accent)]"
              style={{ height: marker.h, translate: `0 ${marker.y}px` } as CSSProperties}
            />
          )}
        </ol>
      </nav>
      <div aria-hidden className={`fixed inset-x-0 top-14 z-40 h-0.5 bg-[#f4f1ea]/10 transition-opacity duration-500 lg:hidden ${shown ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-[var(--accent)] transition-[width] duration-700 ease-out" style={{ width: `${((active + 1) / portfolio.chapters.length) * 100}%` }} />
      </div>
    </>
  )
}
