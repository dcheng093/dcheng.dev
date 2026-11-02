import { useEffect, useState, type CSSProperties } from 'react'
import { portfolio } from '../../content/portfolio'
import { MenuIcon } from '../icons'
import { goTo } from './useInView'

/**
 * The header: the name on the left, "Get in touch" on the right. See-through over the hero, smoked glass once
 * scrolled. On arrival it drops in from above, then its parts land one after another (index.css). The chapters live
 * in the sidebar (wide screens) or this menu (phones).
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  const go = (id: string) => {
    setOpen(false)
    goTo(id)
  }
  return (
    <header
      className={`boring-nav-drop fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${scrolled || open ? 'border-b border-[#f4f1ea]/10 bg-[#050507]/70 backdrop-blur-xl' : 'border-b border-transparent'}`}
    >
      <nav aria-label="Sections" className="flex h-14 items-center justify-between px-5 sm:px-10">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            go('home')
          }}
          className="boring-nav-item font-display text-lg font-bold tracking-[-0.03em] text-[#f4f1ea]"
          style={{ '--i': 0 } as CSSProperties}
        >
          {portfolio.name}
          <span className="text-[var(--accent)]">.</span>
        </a>
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              go('contact')
            }}
            className="boring-nav-item hidden rounded-full bg-[#f4f1ea] px-4 py-1.5 text-sm font-semibold text-[#16161d] transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] hover:scale-105 sm:inline-block"
            style={{ '--i': 1 } as CSSProperties}
          >
            Get in touch
          </a>
          <button
            type="button"
            className="boring-nav-item text-[#f4f1ea] lg:hidden"
            style={{ '--i': 2 } as CSSProperties}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </nav>
      {open && (
        <ol className="boring-menu flex flex-col gap-3 border-t border-[#f4f1ea]/10 px-5 py-6 lg:hidden">
          {portfolio.chapters.map((c, i) => (
            <li key={c.id} className="boring-menu-item" style={{ '--i': i } as CSSProperties}>
              <a
                href={`#${c.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(c.id)
                }}
                className="flex items-baseline gap-3 font-display text-3xl font-bold tracking-[-0.03em] text-[#f4f1ea]"
              >
                <span className="text-sm font-normal tabular-nums text-[#f4f1ea]/40">{String(i + 1).padStart(2, '0')}</span>
                {c.title}
              </a>
            </li>
          ))}
        </ol>
      )}
    </header>
  )
}
