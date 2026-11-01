import { useEffect, useState } from 'react'
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

export function Navbar() {
  const current = useCurrentSection()
  const [open, setOpen] = useState(false)
  const go = (id: string) => {
    setOpen(false)
    goTo(id)
  }
  const link = (s: (typeof SECTIONS)[number]) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      onClick={(e) => {
        e.preventDefault()
        go(s.id)
      }}
      aria-current={current === s.id ? 'location' : undefined}
      className={`font-marker text-lg transition-colors duration-200 ${current === s.id ? 'text-[var(--accent)]' : 'text-white hover:text-white/70'}`}
    >
      <span className={`border-b-2 pb-0.5 transition-[border-color] duration-200 ${current === s.id ? 'border-[var(--accent)]' : 'border-transparent'}`}>{s.label}</span>
    </a>
  )
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-md">
      <nav aria-label="Sections" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            go('home')
          }}
          className="font-marker text-2xl tracking-wide text-white"
        >
          &lt;dcheng.dev<span className="text-[var(--accent)]">/</span>&gt;
        </a>
        <div className="hidden items-center gap-8 md:flex">{SECTIONS.map(link)}</div>
        <button type="button" className="text-white md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <MenuIcon size={26} />
        </button>
      </nav>
      {open && <div className="flex flex-col items-center gap-4 border-t border-white/10 bg-black/90 py-5 md:hidden">{SECTIONS.map(link)}</div>}
    </header>
  )
}
