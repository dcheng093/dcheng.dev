import { Link } from 'react-router-dom'
import { pageName, WEBRING } from '../../lib/sitemap'
import { portfolio } from '../../content/portfolio'
import { ArrowIcon, ChevronUpIcon } from '../icons'
import { goTo } from './useInView'

/** A page's name for this site: the shrines' own titles are the fun site's voice, so they go by their subject here. */
const plainName = (path: string) => {
  const slug = path.match(/^\/shrine\/(.+)$/)?.[1]
  if (!slug) return pageName(path)
  const subject = slug.replace(/-/g, ' ')
  return `${subject[0].toUpperCase()}${subject.slice(1)} shrine`
}

/** The copyright, back to the top, and the site map of the other site (the webring's "List Sites" lands here). */
export function Footer() {
  return (
    <footer className="relative border-t border-[#f4f1ea]/10 bg-[#050507] px-5 py-14 text-[#f4f1ea] sm:px-10 lg:pl-[calc(var(--side)+2rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <p className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.045em]">
          {portfolio.name}
          <span className="text-[var(--accent)]">.</span>
        </p>
        <button type="button" onClick={() => goTo('home')} aria-label="Back to top" className="boring-link inline-flex items-center gap-2 text-sm text-[#f4f1ea]/70 hover:text-[#f4f1ea]">
          Back to top <ChevronUpIcon size={16} />
        </button>
      </div>
      <p className="mt-4 text-sm text-[#f4f1ea]/45">© 2026 {portfolio.name}. All rights reserved.</p>
      <nav id="sitemap" aria-label="Site map" className="mt-14 scroll-mt-20 border-t border-[#f4f1ea]/10 pt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f4f1ea]/40">The fun version</h2>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3 lg:grid-cols-4">
          {WEBRING.map((path) => (
            <li key={path}>
              <Link to={path} className="text-[#f4f1ea]/45 transition-colors hover:text-[var(--accent)]">
                {plainName(path)}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/" className="boring-link mt-8 inline-flex items-center gap-2 text-sm text-[#f4f1ea]/60 hover:text-[#f4f1ea]">
          Take me to the fun version <ArrowIcon size={14} />
        </Link>
      </nav>
    </footer>
  )
}
