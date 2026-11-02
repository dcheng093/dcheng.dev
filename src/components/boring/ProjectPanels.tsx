import { useEffect, useRef, type CSSProperties } from 'react'
import { monthYear, portfolio, type PortfolioProject } from '../../content/portfolio'
import { ArrowIcon } from '../icons'
import { Chapter } from './Chapter'
import { Demo } from './demos/Demo'
import { useInView } from './useInView'

// Oldest first, whatever order portfolio.ts lists them in.
const projects = [...portfolio.projects].sort((a, b) => a.date.localeCompare(b.date))

/**
 * Work: every project on its own panel. On wide screens the panels pin like a deck of cards, each new one sliding up
 * over the last (the reference's pinned panels); on phones they simply follow one another. A "View repo" label trails the
 * cursor across a panel.
 */
export function ProjectPanels() {
  const chapter = portfolio.chapters.find((c) => c.id === 'work')!
  const { label, show, move, hide } = useCursorLabel()
  const follow = { show, move, hide }
  return (
    <Chapter id="work" title={chapter.title} lede={chapter.lede}>
      <ol aria-label="Projects">
        {projects.map((p, i) => (
          // Each row pins below the header (a little lower than the last, so the deck's edges show) and stays pinned
          // until the whole list is done, so the next panel slides up over it.
          <li key={p.repo} className="relative lg:sticky lg:mb-[45svh] lg:last:mb-0" style={{ zIndex: i + 1, top: `calc(5.5rem + ${i * 0.75}rem)` } as CSSProperties}>
            <ProjectPanel project={p} n={i + 1} follow={follow} />
          </li>
        ))}
      </ol>
      <span ref={label} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60] hidden rounded-full bg-[#16161d] px-4 py-2 text-sm font-semibold text-[#f4f1ea] opacity-0 shadow-xl transition-opacity duration-200 lg:block">
        View repo ↗
      </span>
    </Chapter>
  )
}

function ProjectPanel({ project: p, n, follow }: { project: PortfolioProject; n: number; follow: Pick<ReturnType<typeof useCursorLabel>, 'show' | 'move' | 'hide'> }) {
  const box = useRef<HTMLElement>(null)
  const onScreen = useInView(box, 0.35)
  return (
    <article
      ref={box}
      aria-label={`${n}. ${p.title}`}
      onPointerEnter={follow.show}
      onPointerMove={follow.move}
      onPointerLeave={follow.hide}
      className="ed-panel mb-5 grid gap-8 rounded-[28px] bg-[#f4f1ea] p-6 text-[#16161d] shadow-[0_-30px_60px_-20px_#05050799] sm:p-10 lg:mb-0 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1fr_1.15fr] lg:items-center"
    >
      <div className="flex flex-col">
        <p className="font-display text-[clamp(3.5rem,7vw,6rem)] font-bold leading-none tracking-[-0.05em] text-[#16161d]/12">{String(n).padStart(2, '0')}</p>
        <p className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
          {p.ongoing ? <span className="text-amber-600">In progress</span> : <span className="text-[#16161d]/55">{monthYear(p.date)}</span>}
          <span className="rounded-full px-2.5 py-0.5 tracking-[0.12em] text-[#16161d]/60 ring-1 ring-[#16161d]/20">{p.tag}</span>
        </p>
        <h3 className="mt-3 font-display text-[clamp(2.4rem,4.4vw,4rem)] font-bold leading-[0.95] tracking-[-0.035em]">{p.title}</h3>
        {p.paragraphs.map((text, i) => (
          <p key={text} className={i ? 'mt-4 leading-relaxed text-[#16161d]/70' : 'font-serif-ed mt-5 text-[clamp(1.25rem,1.8vw,1.6rem)] leading-[1.18] tracking-[-0.01em]'}>
            {text}
          </p>
        ))}
        <a
          href={`https://github.com/${p.repo}`}
          target="_blank"
          rel="noreferrer"
          className="boring-link group mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]"
        >
          View repo <ArrowIcon size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-[#0b0a12] shadow-[0_20px_50px_-25px_#16161d] sm:aspect-[4/3]">
        <Demo id={p.demo} active={onScreen} />
      </div>
    </article>
  )
}

/** A label that trails the cursor (eased, not glued to it), shown while the pointer is over a project panel. */
function useCursorLabel() {
  const label = useRef<HTMLSpanElement>(null)
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, on: false, raf: 0 })
  useEffect(() => {
    const s = state.current
    return () => cancelAnimationFrame(s.raf)
  }, [])
  const tick = () => {
    const s = state.current
    const el = label.current
    if (!el) return
    s.x += (s.tx - s.x) * 0.18
    s.y += (s.ty - s.y) * 0.18
    el.style.translate = `${s.x + 18}px ${s.y + 18}px`
    if (s.on || Math.abs(s.tx - s.x) > 0.5) s.raf = requestAnimationFrame(tick)
  }
  return {
    label,
    show: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const s = state.current
      s.on = true
      s.x = s.tx = e.clientX
      s.y = s.ty = e.clientY
      if (label.current) label.current.style.opacity = '1'
      cancelAnimationFrame(s.raf)
      s.raf = requestAnimationFrame(tick)
    },
    move: (e: React.PointerEvent) => {
      state.current.tx = e.clientX
      state.current.ty = e.clientY
    },
    hide: () => {
      state.current.on = false
      if (label.current) label.current.style.opacity = '0'
    },
  }
}
