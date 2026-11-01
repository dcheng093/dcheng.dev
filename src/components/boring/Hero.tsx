import { daniel } from '../../content/daniel'
import { useCopy } from '../../hooks/useCopy'
import { mulberry32 } from '../../lib/random'
import { DiscordIcon, GitHubIcon, MailIcon } from '../icons'
import { ACCENT, ACCENT_2 } from './theme'

/** A paint stroke: a long blob with ragged edges and a dry, tapering tail. Seeded, so it's the same every visit. */
function stroke(seed: number, w: number, h: number) {
  const rng = mulberry32(seed)
  const top: string[] = []
  const bottom: string[] = []
  const n = 26
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = t * w
    // Fat in the middle, thin towards the right-hand tail; ragged all along.
    const body = (h / 2) * Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.6 * (1 - t * 0.45)
    top.push(`${x.toFixed(1)},${(h / 2 - body - rng() * h * 0.08).toFixed(1)}`)
    bottom.unshift(`${x.toFixed(1)},${(h / 2 + body + rng() * h * 0.08).toFixed(1)}`)
  }
  return `M${top.join(' L')} L${bottom.join(' L')} Z`
}

const STROKES = [
  { d: stroke(3, 560, 150), fill: '#ff5fc8', x: 0, y: 20, r: -4 },
  { d: stroke(7, 600, 170), fill: ACCENT, x: 10, y: 70, r: 2 },
  { d: stroke(11, 520, 130), fill: ACCENT_2, x: 40, y: 170, r: -3 },
  { d: stroke(19, 480, 110), fill: '#b8ff5a', x: 70, y: 235, r: 3 },
]

export function Hero() {
  const { copied, copy } = useCopy()
  const { links, boring } = daniel
  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-16">
      <img src="/boring/hero.webp" alt="" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/10 to-[#0a0a0a]" />
      <div className="mx-auto grid w-full max-w-6xl items-end gap-4 px-4 sm:px-6 md:grid-cols-2">
        <div className="order-2 flex flex-col items-center pb-14 md:order-1 md:pb-28">
          <div className="relative px-6 py-10 sm:px-10">
            <svg aria-hidden viewBox="0 0 640 360" preserveAspectRatio="none" className="absolute inset-0 -z-10 h-full w-full opacity-90">
              {STROKES.map((s) => (
                <path key={s.fill} d={s.d} fill={s.fill} opacity={0.85} transform={`translate(${s.x} ${s.y}) rotate(${s.r} 300 80)`} />
              ))}
            </svg>
            <h1 className="font-marker text-3xl leading-tight text-white [text-shadow:3px_3px_0_#000,-1px_-1px_0_#000] sm:text-5xl">
              {boring.greeting.slice(0, -1).map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
              <span className="block text-[#fff35c]">{boring.greeting.at(-1)}</span>
            </h1>
            <p className="mt-3 font-medium text-white [text-shadow:2px_2px_0_#000]">{boring.tagline}</p>
          </div>
          <p className="mt-6 font-marker text-xl text-white">My Socials</p>
          <ul className="mt-2 flex items-center gap-4 rounded-2xl bg-white px-5 py-3 shadow-[5px_5px_0_#000]" aria-label="Socials">
            {links.github && (
              <li>
                <a href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="block text-black transition-transform duration-200 hover:scale-110">
                  <GitHubIcon size={26} />
                </a>
              </li>
            )}
            {links.email && (
              <li>
                <a href={`mailto:${links.email}`} aria-label="Email" className="block text-[#ea4335] transition-transform duration-200 hover:scale-110">
                  <MailIcon size={28} />
                </a>
              </li>
            )}
            <li className="relative">
              <button
                type="button"
                onClick={() => void copy(links.discord)}
                aria-label={`Discord: ${links.discord} (copy)`}
                className="block text-[#5865f2] transition-transform duration-200 hover:scale-110"
              >
                <DiscordIcon size={28} />
              </button>
              <span
                role="status"
                className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-0.5 text-xs text-white transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}
              >
                {copied ? `copied @${links.discord}` : ''}
              </span>
            </li>
          </ul>
        </div>
        <img
          src="/me/boring/daniel.webp"
          alt={daniel.name}
          width={595}
          height={1100}
          className="boring-rise hero-cutout order-1 mx-auto h-auto max-h-[52svh] w-auto md:order-2 md:max-h-[84svh]"
        />
      </div>
    </section>
  )
}
