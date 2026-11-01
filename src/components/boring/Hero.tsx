import type { CSSProperties } from 'react'
import { portfolio, type SocialId } from '../../content/portfolio'
import { useCopy } from '../../hooks/useCopy'
import { mulberry32 } from '../../lib/random'
import { DiscordIcon, GitHubIcon, MailIcon, SoundCloudIcon, TwitchIcon, YouTubeIcon } from '../icons'
import { HeroBackdrop } from './HeroBackdrop'
import { RevealText } from './SectionTitle'
import { ACCENT, ACCENT_2 } from './theme'

/** A paint stroke in a 1×1 box (for an objectBoundingBox clip path): fat in the middle, ragged, a dry tapering tail. */
function brush() {
  const rng = mulberry32(7)
  const top: string[] = []
  const bottom: string[] = []
  const n = 30
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const body = 0.5 * Math.sin(Math.PI * Math.min(1, t * 1.12)) ** 0.55 * (1 - t * 0.4)
    top.push(`${t.toFixed(3)},${(0.5 - body - rng() * 0.07).toFixed(3)}`)
    bottom.unshift(`${t.toFixed(3)},${(0.5 + body + rng() * 0.07).toFixed(3)}`)
  }
  return `M${top.join(' L')} L${bottom.join(' L')} Z`
}
const BRUSH = brush()

// Four swipes of paint (his brother's are pink, blue, lime and purple); each grows from alternate sides, 0.1s apart.
const STROKES = [
  { color: '#ff5fc8', top: '2%', left: '-4%', width: '96%', rotate: -4 },
  { color: ACCENT, top: '24%', left: '2%', width: '104%', rotate: 2 },
  { color: ACCENT_2, top: '50%', left: '-2%', width: '92%', rotate: -3 },
  { color: '#b8ff5a', top: '70%', left: '8%', width: '86%', rotate: 3 },
]

const SOCIAL_ICONS: Record<SocialId, { Icon: typeof GitHubIcon; color: string }> = {
  github: { Icon: GitHubIcon, color: '#111' },
  email: { Icon: MailIcon, color: '#ea4335' },
  discord: { Icon: DiscordIcon, color: '#5865f2' },
  youtube: { Icon: YouTubeIcon, color: '#ff0000' },
  twitch: { Icon: TwitchIcon, color: '#9146ff' },
  soundcloud: { Icon: SoundCloudIcon, color: '#ff5500' },
}

export function SocialLink({ id, label, href, copy, size = 28, onCopy }: { id: SocialId; label: string; href?: string; copy?: string; size?: number; onCopy?: (text: string) => void }) {
  const { Icon, color } = SOCIAL_ICONS[id]
  const cls = 'grid place-items-center transition-transform duration-200 hover:scale-110'
  if (copy)
    return (
      <button type="button" onClick={() => onCopy?.(copy)} aria-label={`${label}: ${copy} (copy)`} className={cls} style={{ color }}>
        <Icon size={size} />
      </button>
    )
  return (
    <a href={href} target={href?.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" aria-label={label} className={cls} style={{ color }}>
      <Icon size={size} />
    </a>
  )
}

export function Hero() {
  const { copied, copy } = useCopy()
  const [first, second, name] = portfolio.greeting
  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-16">
      <HeroBackdrop />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/5 to-[#0a0a0a]" />
      <svg aria-hidden width="0" height="0" className="absolute">
        <clipPath id="boring-brush" clipPathUnits="objectBoundingBox">
          <path d={BRUSH} />
        </clipPath>
      </svg>
      <div className="mx-auto grid w-full max-w-6xl items-end gap-4 px-4 sm:px-6 md:grid-cols-2">
        <div className="order-2 flex flex-col items-center pb-14 md:order-1 md:pb-28">
          <div className="relative w-[min(88vw,520px)]">
            <div aria-hidden className="absolute inset-0">
              {STROKES.map((s, i) => (
                <div key={s.color} className="absolute h-[34%]" style={{ top: s.top, left: s.left, width: s.width, transform: `rotate(${s.rotate}deg)` }}>
                  <div
                    className="boring-stroke h-full w-full"
                    style={{ backgroundColor: s.color, clipPath: 'url(#boring-brush)', transformOrigin: i % 2 ? 'left center' : 'right center', '--i': i } as CSSProperties}
                  />
                </div>
              ))}
            </div>
            <h1 className="relative">
              <span className="sr-only">{portfolio.greeting.join(' ')}</span>
              <svg aria-hidden viewBox="0 0 520 250" className="boring-greeting block w-full overflow-visible">
                <text x="34" y="78" className="greet-line">{first}</text>
                <text x="34" y="148" className="greet-line">{second}</text>
                <text x="34" y="222" className="greet-line greet-name">{name}</text>
              </svg>
            </h1>
          </div>
          <p className="boring-fade-late mt-2 text-center font-medium text-white [text-shadow:2px_2px_0_#000]">{portfolio.tagline}</p>
          <p className="mt-6 font-marker text-xl text-white">
            <RevealText text="My Socials" delay={1} />
          </p>
          <div className="relative mt-2">
            <ul className="boring-pop grid grid-cols-3 gap-x-5 gap-y-3 rounded-xl border-4 border-black bg-[#fff4c2] px-5 py-3 shadow-[5px_5px_0_#000]" aria-label="Socials">
              {portfolio.socials.map((s) => (
                <li key={s.id}>
                  <SocialLink {...s} onCopy={(text) => void copy(text)} />
                </li>
              ))}
            </ul>
            <span
              role="status"
              className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-0.5 text-xs text-white transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}
            >
              {copied ? `copied my Discord: ${portfolio.socials.find((s) => s.copy)?.copy}` : ''}
            </span>
          </div>
        </div>
        <img
          src="/me/boring/daniel.webp"
          alt={portfolio.name}
          width={595}
          height={1100}
          fetchPriority="high"
          className="boring-rise hero-cutout order-1 mx-auto h-auto max-h-[52svh] w-auto md:order-2 md:max-h-[84svh]"
        />
      </div>
    </section>
  )
}
