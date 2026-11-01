import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { MenuIcon } from '../icons'
import { goTo } from './useInView'

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const

/** The section the reader is in: the last one whose top has passed the upper third of the screen. */
function useCurrentSection() {
  const [current, setCurrent] = useState<string>('home')
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight / 3
      let at: string = SECTIONS[0].id
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) at = s.id
      }
      setCurrent(at)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return current
}

/** One underline for a row of links: it springs across to whichever is active (and overshoots a touch, then settles). */
function useUnderline(current: string) {
  const row = useRef<HTMLDivElement>(null)
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const link = row.current?.querySelector<HTMLElement>(`[data-section="${current}"] [data-label]`)
      const box = row.current?.getBoundingClientRect()
      if (!link || !box) return
      const r = link.getBoundingClientRect()
      setBar({ x: r.left - box.left, w: r.width })
    }
    measure()
    window.addEventListener('resize', measure)
    void document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [current])
  return { row, bar }
}

export function Navbar() {
  const current = useCurrentSection()
  const [open, setOpen] = useState(false)
  const { row, bar } = useUnderline(current)
  const go = (id: string) => {
    setOpen(false)
    goTo(id)
  }
  const link = (s: (typeof SECTIONS)[number], i: number, stagger = false) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      data-section={s.id}
      onClick={(e) => {
        e.preventDefault()
        go(s.id)
      }}
      aria-current={current === s.id ? 'location' : undefined}
      className={`font-marker text-lg transition-colors duration-200 ${current === s.id ? 'text-[var(--accent)]' : 'text-white hover:text-white/70'} ${stagger ? 'boring-menu-item' : ''}`}
      style={stagger ? ({ '--i': i } as CSSProperties) : undefined}
    >
      <span data-label className={stagger && current === s.id ? 'border-b-2 border-[var(--accent)] pb-0.5' : ''}>
        {s.label}
      </span>
    </a>
  )
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-md">
      <nav aria-label="Sections" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#home"
          aria-label="dcheng.dev: back to the top"
          onClick={(e) => {
            e.preventDefault()
            go('home')
          }}
          className="block"
        >
          {/* The logo writes itself in: outline first, then the fill. */}
          <svg aria-hidden viewBox="0 0 230 40" className="boring-logo h-9 w-auto overflow-visible">
            <text x="2" y="30">
              &lt;dcheng.dev<tspan className="logo-slash">/</tspan>&gt;
            </text>
          </svg>
        </a>
        <div ref={row} className="relative hidden items-center gap-8 md:flex">
          {SECTIONS.map((s, i) => link(s, i))}
          {bar && (
            <span
              aria-hidden
              className="boring-underline absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-[var(--accent)]"
              style={{ width: bar.w, translate: `${bar.x}px 0` }}
            />
          )}
        </div>
        <button type="button" className="text-white md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <MenuIcon size={26} />
        </button>
      </nav>
      {open && <div className="boring-menu flex flex-col items-center gap-4 border-t border-white/10 bg-black/90 py-5 md:hidden">{SECTIONS.map((s, i) => link(s, i, true))}</div>}
    </header>
  )
}
