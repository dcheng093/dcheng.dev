import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { monthYear, portfolio } from '../../content/portfolio'
import { ArrowIcon } from '../icons'
import { Demo } from './demos/Demo'
import { SectionTitle } from './SectionTitle'
import { useInView } from './useInView'

// Oldest first, whatever order portfolio.ts lists them in.
const projects = [...portfolio.projects].sort((a, b) => a.date.localeCompare(b.date))

/** Featured Projects: one big card at a time, each with its animation; dots, arrows, arrow keys and swipes move it. */
export function Projects() {
  const [at, setAt] = useState(0)
  // Which way the last move went, so the next slide comes in from that side.
  const [dir, setDir] = useState<1 | -1>(1)
  const box = useRef<HTMLDivElement>(null)
  const onScreen = useInView(box, 0.25)
  const swipe = useRef<number | null>(null)
  const go = (i: number) => {
    setDir(i >= at ? 1 : -1)
    setAt((i + projects.length) % projects.length)
  }
  const p = projects[at]

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(at + 1)
    else if (e.key === 'ArrowLeft') go(at - 1)
    else return
    e.preventDefault()
  }
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') swipe.current = e.clientX
  }
  const onUp = (e: PointerEvent) => {
    if (swipe.current === null) return
    const dx = e.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) > 50) go(at + (dx < 0 ? 1 : -1))
  }

  return (
    <section id="projects" className="scroll-mt-16 px-3 py-24 sm:px-4">
      <SectionTitle>Featured Projects</SectionTitle>
      <div
        ref={box}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured projects"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (swipe.current = null)}
        className="mx-auto max-w-6xl rounded-[2rem] bg-[#121216] p-5 ring-1 ring-white/5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:p-10"
      >
        <article key={p.repo} aria-roledescription="slide" aria-label={`${at + 1} of ${projects.length}: ${p.title}`} className={`grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12 ${dir > 0 ? 'boring-slide-next' : 'boring-slide-prev'}`}>
          <div className="aspect-square w-full touch-pan-y sm:aspect-[4/3]">
            <Demo id={p.demo} active={onScreen} />
          </div>
          <div>
            <p className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em]">
              {p.ongoing ? <span className="font-semibold text-amber-300">In progress</span> : <span className="text-[var(--accent-2)]">{monthYear(p.date)}</span>}
              <span className="rounded-full px-2.5 py-0.5 text-[11px] tracking-[0.12em] text-white/70 ring-1 ring-white/20">{p.tag}</span>
            </p>
            <h3 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">{p.title}</h3>
            {p.paragraphs.map((text) => (
              <p key={text} className="mt-5 leading-relaxed text-white/70">
                {text}
              </p>
            ))}
            <a
              href={`https://github.com/${p.repo}`}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 inline-flex items-center gap-2 border-b-2 border-[var(--accent)] pb-1 text-sm font-semibold uppercase tracking-[0.18em] text-white"
            >
              View repo <ArrowIcon size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </article>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(at - 1)} aria-label="Previous project" className="grid h-9 w-9 rotate-180 place-items-center rounded-full text-white/60 ring-1 ring-white/15 transition-colors hover:text-white">
            <ArrowIcon size={16} />
          </button>
          <div className="flex items-center gap-2">
            {projects.map((q, i) => (
              <button
                key={q.repo}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${q.title}`}
                aria-current={i === at ? 'true' : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${i === at ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-white/25 hover:bg-white/50'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(at + 1)} aria-label="Next project" className="grid h-9 w-9 place-items-center rounded-full text-white/60 ring-1 ring-white/15 transition-colors hover:text-white">
            <ArrowIcon size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
