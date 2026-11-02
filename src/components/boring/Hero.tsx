import type { CSSProperties } from 'react'
import { portfolio, type SocialId } from '../../content/portfolio'
import { DiscordIcon, GitHubIcon, MailIcon, SoundCloudIcon, TwitchIcon, YouTubeIcon } from '../icons'
import { HeroDrawing } from './HeroDrawing'
import { goTo } from './useInView'

const SOCIAL_ICONS: Record<SocialId, typeof GitHubIcon> = {
  github: GitHubIcon,
  email: MailIcon,
  discord: DiscordIcon,
  youtube: YouTubeIcon,
  twitch: TwitchIcon,
  soundcloud: SoundCloudIcon,
}

/** A social as a link (or, for Discord, a button that copies the name), with its label beside the icon. */
export function SocialLink({ id, label, href, copy, onCopy, showLabel = false, className = '' }: { id: SocialId; label: string; href?: string; copy?: string; onCopy?: (text: string) => void; showLabel?: boolean; className?: string }) {
  const Icon = SOCIAL_ICONS[id]
  const body = (
    <>
      <Icon size={18} />
      {showLabel && <span>{label}</span>}
    </>
  )
  const cls = `boring-link inline-flex items-center gap-2 ${className}`
  if (copy)
    return (
      <button type="button" onClick={() => onCopy?.(copy)} aria-label={`${label}: ${copy} (copy)`} className={cls}>
        {body}
      </button>
    )
  return (
    <a href={href} target={href?.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" aria-label={label} className={cls}>
      {body}
    </a>
  )
}

/** The opening: a construction drawing traces itself, then the name rises into it, huge, with the one-line pitch. */
export function Hero() {
  const [first, ...rest] = portfolio.name.split(' ')
  return (
    <section id="home" data-place="intro" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-12 pt-28 sm:px-10 lg:px-16">
      <HeroDrawing />
      <h1 className="relative text-[#f4f1ea]" aria-label={portfolio.name}>
        {[first, rest.join(' ')].map((word, i) => (
          // The type size is on the mask, so its em padding leaves room for the "g"'s descender.
          <span key={word} aria-hidden className="-mb-[0.2em] block overflow-hidden pb-[0.24em] font-display text-[clamp(4.2rem,15vw,15rem)] font-bold leading-[0.86] tracking-[-0.045em]">
            <span className="hero-rise block" style={{ '--i': i } as CSSProperties}>
              {word}
            </span>
          </span>
        ))}
      </h1>
      <div className="relative mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <p className="hero-fade font-serif-ed max-w-2xl text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-[#f4f1ea]/90" style={{ '--d': '1.3s' } as CSSProperties}>
          {portfolio.heroLine}
        </p>
        <nav aria-label="Contents" className="hero-fade" style={{ '--d': '1.5s' } as CSSProperties}>
          <ol className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm lg:justify-end">
            {portfolio.chapters.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    goTo(c.id)
                  }}
                  className="boring-link inline-flex gap-2 text-[#f4f1ea]/80 hover:text-[#f4f1ea]"
                >
                  <span className="tabular-nums text-[#f4f1ea]/40">{String(i + 1).padStart(2, '0')}</span>
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      {/* Scroll cue: a thin line that keeps drawing downwards. */}
      <span aria-hidden className="scroll-cue absolute bottom-0 left-1/2 h-14 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-[#f4f1ea]/70" />
    </section>
  )
}
