import { useId, useState, type CSSProperties } from 'react'
import { monthYear, portfolio } from '../../content/portfolio'
import { intraStats, type IntraRow } from './intraStats'
import { mulberry32 } from '../../lib/random'
import { SectionTitle } from './SectionTitle'
import { ChevronUpIcon } from '../icons'
import { useReveal } from './useInView'

const card = 'reveal-up lift rounded-3xl bg-[#141418] p-6 ring-1 ring-white/5 sm:p-8'
const delay = (s: number) => ({ '--delay': `${s}s` }) as CSSProperties

export function About() {
  const grid = useReveal<HTMLDivElement>(0.1)
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:px-6">
      <SectionTitle>About Me</SectionTitle>
      <div ref={grid} className="reveal-group grid gap-5 md:grid-cols-2">
        <div className="space-y-5">
          <div className={`${card} text-center text-lg leading-relaxed text-white/85`} style={delay(0)}>
            <p>
              {portfolio.intro.map((part, i) =>
                part.strong ? (
                  <strong key={i} className="font-semibold text-[var(--accent)] underline decoration-2 underline-offset-4">{part.text}</strong>
                ) : part.accent ? (
                  <span key={i} className="font-semibold text-[var(--accent-2)]">{part.text}</span>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </p>
          </div>
          <div className={card} style={delay(0.2)}>
            <StackOrbit />
          </div>
        </div>
        <div className="space-y-5">
          <div className={card} style={delay(0.4)}>
            <IntraCard />
          </div>
          <div className={`${card} space-y-5`} style={delay(0.6)}>
            <p className="text-center text-lg leading-relaxed text-white/85">{portfolio.hobby}</p>
            <img src="/me/HOBBY-2.webp" alt="Daniel's desk: his PC, keyboard and mouse" width={400} height={300} loading="lazy" className="w-full rounded-2xl object-cover ring-1 ring-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ——— The stack: logos burst out of the centre into a loose cluster, then each floats on its own (his brother's cloud) ———

// Where each group sits (radius as % of the orbit's width), how big its logos are, and an uneven starting angle so
// the groups never line up. Every logo is then nudged by its own seeded jitter: a cluster, not a diagram.
const RINGS = [
  { level: 'main', radius: 17, size: 1, start: -104 },
  { level: 'experienced', radius: 31, size: 0.9, start: 37 },
  { level: 'site', radius: 45, size: 0.82, start: 11 },
] as const

/** A stable random number generator per logo name, so the cluster looks the same on every visit. */
const seeded = (name: string) => mulberry32([...name].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261))

function StackOrbit() {
  const ref = useReveal<HTMLDivElement>(0.3)
  let n = 0
  return (
    <div ref={ref} className="orbit relative mx-auto aspect-square w-full max-w-md [container-type:inline-size]">
      <div aria-hidden className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_22%,transparent)_0%,transparent_70%)] blur-xl" />
      <p aria-hidden className="absolute inset-0 grid place-items-center font-marker text-lg text-white/40">my stack</p>
      <ul aria-label="Languages and tools">
        {RINGS.map((ring, r) => {
          const items = portfolio.stack.filter((s) => s.level === ring.level)
          return items.map((s, i) => {
            const rng = seeded(s.name)
            const angle = ((i / items.length) * 360 + ring.start + (rng() - 0.5) * 28) * (Math.PI / 180)
            const radius = Math.min(46, ring.radius + (rng() - 0.5) * 8)
            const scale = ring.size * (0.94 + rng() * 0.12)
            const k = n++
            return (
              <li
                key={s.name}
                tabIndex={0}
                className="orbit-badge group absolute left-1/2 top-1/2 outline-none hover:z-30 focus-within:z-30 focus:z-30"
                style={
                  {
                    '--tx': `${(Math.cos(angle) * radius).toFixed(2)}cqw`,
                    '--ty': `${(Math.sin(angle) * radius).toFixed(2)}cqw`,
                    '--delay': `${(r * 0.3 + i * 0.06).toFixed(2)}s`,
                    // Its own slow loop: how far it wanders, how much it tilts, how long a lap takes, where it starts.
                    '--fx': `${(4 + rng() * 5).toFixed(1)}px`,
                    '--fy': `${(4 + rng() * 5).toFixed(1)}px`,
                    '--rot': `${(2 + rng() * 2.5).toFixed(1)}deg`,
                    '--dur': `${(7 + rng() * 6).toFixed(1)}s`,
                    '--phase': `${(-rng() * 12 - k).toFixed(1)}s`,
                    '--s': scale.toFixed(3),
                  } as CSSProperties
                }
              >
                {/* Sized to the orbit (up to 56px before its own scale), so twelve still fit around a phone-sized one. */}
                <div className="orbit-float grid place-items-center rounded-full border-2 border-black bg-[#e6e6ee] shadow-[0_0_14px_#ffffff30] transition-[scale] duration-200 group-hover:scale-110 group-focus:scale-110 [height:calc(min(3.5rem,13cqw)*var(--s))] [margin:calc(min(1.75rem,6.5cqw)*var(--s)*-1)_0_0_calc(min(1.75rem,6.5cqw)*var(--s)*-1)] [width:calc(min(3.5rem,13cqw)*var(--s))]">
                  <img src={`/boring/logos/${s.logo}.webp`} alt="" width={40} height={40} loading="lazy" className="size-[58%] object-contain" />
                </div>
                {/* The label sits under the badge, leaning inwards (a badge on the right reads leftwards), so it stays
                    inside the card. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-[min(2rem,7.5cqw)] w-max max-w-[14rem] rounded-md bg-black/95 px-2.5 py-1.5 text-center text-xs leading-snug text-white opacity-0 shadow-[0_6px_18px_#000a] ring-1 ring-white/15 transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100"
                  style={{ translate: `${(-50 - Math.cos(angle) * 35).toFixed(1)}% 0` }}
                >
                  <b>{s.name}</b> · {s.note}
                </span>
                <span className="sr-only">
                  {s.name}: {s.note}
                </span>
              </li>
            )
          })
        })}
      </ul>
    </div>
  )
}

// ——— The 42 intra card (his LeetCode card, for 42), worked out from portfolio.ts ———

function IntraCard() {
  const { intra } = portfolio
  const stats = intraStats(intra.projects)
  const ref = useReveal<HTMLDivElement>(0.3)
  const ring = 2 * Math.PI * 42
  const [all, setAll] = useState(false)
  const more = useId()
  const first = stats.rows.slice(0, SHOWN)
  const rest = stats.rows.slice(SHOWN)
  return (
    <div ref={ref} className="intra rounded-2xl border border-white/10 p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-black ring-1 ring-white/20">
            <img src="/boring/logos/42.webp" alt="42" width={30} height={30} loading="lazy" className="h-6 w-auto" />
          </span>
          <span>
            <span className="block text-2xl font-semibold leading-none">{intra.login}</span>
            <span className="text-xs text-white/50">{intra.campus}</span>
          </span>
        </div>
        <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold">Milestone {intra.milestone}</span>
      </div>
      <ol className="mt-4 flex gap-1" aria-label={`Milestone ${intra.milestone} of ${intra.milestones}`}>
        {Array.from({ length: intra.milestones + 1 }, (_, m) => (
          <li key={m} className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="intra-fill h-full rounded-full bg-[var(--accent)]" style={{ '--to': m <= intra.milestone ? '100%' : '0%', '--delay': `${0.3 + m * 0.08}s` } as CSSProperties} />
            </div>
            <span className={`mt-1 block text-center text-[10px] ${m === intra.milestone ? 'font-semibold text-white' : 'text-white/35'}`}>{m}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff1a" strokeWidth="7" />
            <circle
              className="intra-ring"
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={ring}
              style={{ '--off': `${ring * (1 - stats.average / 125)}`, '--full': `${ring}` } as CSSProperties}
            />
          </svg>
          <p className="absolute inset-0 grid place-items-center text-center leading-none">
            <span>
              <span className="block text-3xl font-semibold">{stats.validated}</span>
              <span className="text-[11px] text-white/50">validated</span>
              <span className="mt-1 block text-[10px] text-white/40">avg {Math.round(stats.average)}</span>
            </span>
          </p>
        </div>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {stats.byKind.map(({ kind, n }, i) => (
            <li key={kind}>
              <p className="flex justify-between text-sm">
                <span>{kind}</span>
                <span className="text-white/60">{n}</span>
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-white/10">
                <div className="intra-fill h-full rounded-full bg-[var(--accent-2)]" style={{ '--to': `${(n / Math.max(1, stats.validated)) * 100}%`, '--delay': `${0.5 + i * 0.1}s` } as CSSProperties} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-5 border-t border-white/10 pt-3 text-sm text-white/60">Recent projects</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {first.map((row) => (
          <IntraLine key={row.name} row={row} />
        ))}
      </ul>
      {rest.length > 0 && (
        <>
          {/* Everything else, folded away until asked for: the height eases open (a 0fr → 1fr grid row). */}
          <div id={more} className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${all ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <ul className="space-y-1.5 overflow-hidden text-sm" inert={!all}>
              {rest.map((row, i) => (
                <IntraLine key={row.name} row={row} className={i === 0 ? 'mt-1.5' : ''} />
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setAll((a) => !a)}
            aria-expanded={all}
            aria-controls={more}
            aria-label={all ? 'Show fewer projects' : 'Show all projects'}
            title={all ? 'Show fewer' : `Show all ${stats.rows.length}`}
            className="mx-auto mt-3 grid h-8 w-8 place-items-center rounded-full text-white/60 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronUpIcon size={18} className={`transition-transform duration-300 ${all ? '' : 'rotate-180'}`} />
          </button>
        </>
      )}
    </div>
  )
}

/** How many project rows the card shows before the expand arrow. */
const SHOWN = 6

function IntraLine({ row, className = '' }: { row: IntraRow; className?: string }) {
  return (
    <li className={`grid grid-cols-[4.6rem_4.4rem_1fr] items-center gap-2 ${className}`}>
      <span className="text-white/50">{row.date ? monthYear(row.date) : 'now'}</span>
      {row.ongoing ? (
        <span className="animate-pulse rounded bg-amber-400 px-1 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-black">in progress</span>
      ) : (
        <span className={`rounded px-1.5 py-0.5 text-center text-xs font-semibold ${row.score! > 100 ? 'bg-[var(--accent)] text-white' : 'bg-emerald-500 text-black'}`}>{row.score}</span>
      )}
      <span className="truncate">
        {row.name}
        {row.count > 1 && <span className="ml-1.5 text-xs text-white/40">×{row.count}</span>}
      </span>
    </li>
  )
}
