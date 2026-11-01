import { Link } from 'react-router-dom'
import { pageName, WEBRING } from '../../lib/sitemap'
import { ArrowIcon, ChevronUpIcon } from '../icons'
import { goTo } from './useInView'

/** A page's name for this site: the shrines' own titles are the fun site's voice, so they go by their subject here. */
const plainName = (path: string) => {
  const slug = path.match(/^\/shrine\/(.+)$/)?.[1]
  if (!slug) return pageName(path)
  const subject = slug.replace(/-/g, ' ')
  return `${subject[0].toUpperCase()}${subject.slice(1)} shrine`
}

/** Back to top, the copyright, and the site map of the other site (the webring's "List Sites" lands here). */
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0d10] px-4 pb-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <button type="button" onClick={() => goTo('home')} aria-label="Back to top" className="-mt-px border-t-2 border-[var(--accent)] px-4 py-3 text-white/70 transition-colors hover:text-white">
          <ChevronUpIcon size={20} />
        </button>
        <p className="mt-4 text-center text-sm leading-relaxed text-white/50">
          ©2026
          <br />
          All Rights Reserved
          <br />
          Daniel Cheng
        </p>
        <nav id="sitemap" aria-label="Site map" className="mt-12 w-full scroll-mt-20 border-t border-white/5 pt-8">
          <h2 className="text-center text-xs uppercase tracking-[0.25em] text-white/40">The fun version</h2>
          <ul className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3 md:grid-cols-4">
            {WEBRING.map((path) => (
              <li key={path}>
                <Link to={path} className="text-white/45 transition-colors hover:text-[var(--accent)]">
                  {plainName(path)}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/" className="mx-auto mt-8 flex w-fit items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
            Take me to the fun version <ArrowIcon size={14} />
          </Link>
        </nav>
      </div>
    </footer>
  )
}
