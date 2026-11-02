import { useId, useState, type CSSProperties } from 'react'
import { monthYear, portfolio } from '../../content/portfolio'
import { intraStats, type IntraRow } from './intraStats'
import { mulberry32 } from '../../lib/random'
import { Chapter, Panel } from './Chapter'
import { ChevronUpIcon } from '../icons'
import { useReveal } from './useInView'

const delay = (s: number) => ({ '--delay': `${s}s` }) as CSSProperties

/** The intro paragraph, with his name and the two languages picked out. */
function Intro() {
  return (
    <p>
      {portfolio.intro.map((part, i) =>
        part.strong ? (
          <strong key={i} className="font-serif-ed italic text-[#c9c1ff]">{part.text}</strong>
        ) : part.accent ? (
          <em key={i} className="text-[#c9c1ff]">{part.text}</em>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  )
}

export function About() {
  const chapter = portfolio.chapters.find((c) => c.id === 'about')!
  return (
    <Chapter id="about" title={chapter.title} lede={<Intro />}>
      <Panel className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        {/* His cutout in its own colours, dissolving into the frame at the shoulders and the bottom (no crop line). */}
        <figure className="portrait-frame relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl">
          <img src="/me/boring/daniel.webp" alt={portfolio.name} width={595} height={1100} loading="lazy" className="portrait-fade absolute inset-x-0 bottom-0 mx-auto h-[96%] w-auto object-contain" />
        </figure>
        <div className="space-y-6">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#16161d]/50">Away from the keyboard</p>
          <p className="font-serif-ed text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.12] tracking-[-0.015em]">{portfolio.hobby}</p>
          <img src="/me/HOBBY-2.webp" alt="Daniel's desk: his PC, keyboard and mouse" width={400} height={300} loading="lazy" className="w-full rounded-2xl object-cover" />
        </div>
      </Panel>
    </Chapter>
  )
}

export function Stack() {
  const chapter = portfolio.chapters.find((c) => c.id === 'stack')!
  const groups = [
    { level: 'main', label: 'Main' },
    { level: 'experienced', label: 'Experienced' },
    { level: 'site', label: 'This website' },
  ] as const
  return (
    <Chapter id="stack" title={chapter.title} lede={chapter.lede}>
      <Panel className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <StackOrbit />
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
          {groups.map((g, i) => (
            <div key={g.level} className="border-t border-[#16161d]/15 pt-4" style={delay(i * 0.1)}>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#16161d]/50">{g.label}</p>
              <p className="font-serif-ed mt-2 text-2xl leading-tight">
                {portfolio.stack
                  .filter((s) => s.level === g.level)
                  .map((s) => s.name)
                  .join(', ')}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </Chapter>
  )
}

export function Intra() {
  const chapter = portfolio.chapters.find((c) => c.id === 'intra')!
  return (
    <Chapter id="intra" title={chapter.title} lede={<p>{chapter.lede}</p>} dropCap>
      <Panel className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#16161d]/50">42 Kuala Lumpur · {portfolio.intra.login}</p>
          <p className="font-serif-ed text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.06] tracking-[-0.02em]">
            C first: rebuilding libc, printf and a line reader, then sorting with two stacks. Then Python, a maze generator and a grammar for a language model.
          </p>
          <p className="max-w-md text-[#16161d]/70">Every project is graded by other students, and most can earn a bonus past 100. Scores straight from the intra.</p>
        </div>
        {/* The card stays dark, like a screen set into the page. */}
        <div className="rounded-3xl bg-[#0c0b12] p-2 shadow-[0_30px_60px_-30px_#16161d]">
          <IntraCard />
        </div>
      </Panel>
    </Chapter>
  )
}

// ——— The stack: three visible orbits, the logos scattered along them, each ring turning at its own pace ———

// Each ring: which level sits on it, its radius (% of the orbit's width), how big its logos are, and how long a lap
// takes (negative turns the other way). Within a ring the logos keep their random spacing; the rings slide past each
// other, so the picture never settles into a pattern.
const RINGS = [
  { level: 'main', radius: 17, size: 1, lap: 90 },
  { level: 'experienced', radius: 31, size: 0.9, lap: -130 },
  { level: 'site', radius: 45, size: 0.82, lap: 170 },
] as const

/** A stable random number generator per name, so the scatter looks the same on every visit. */
const seeded = (name: string) => mulberry32([...name].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261))

/** Random angles (degrees) for `count` logos on a ring, never closer than `gap` degrees apart. */
function scatter(seed: string, count: number, gap: number) {
  const rng = seeded(seed)
  const angles: number[] = []
  for (let tries = 0; angles.length < count && tries < 500; tries++) {
    const a = rng() * 360
    if (angles.every((b) => Math.abs(((a - b + 540) % 360) - 180) >= gap)) angles.push(a)
  }
  return angles
}

function StackOrbit() {
  const ref = useReveal<HTMLDivElement>(0.3)
  return (
    <div ref={ref} className="orbit relative mx-auto aspect-square w-full max-w-md [container-type:inline-size]">
      <div aria-hidden className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_20%,transparent)_0%,transparent_70%)] blur-xl" />
      {RINGS.map((ring) => (
        <div key={ring.level} aria-hidden className="orbit-ring absolute rounded-full border-[1.5px] border-[#16161d]/[0.18]" style={{ inset: `${50 - ring.radius}%` }} />
      ))}
      <p aria-hidden className="font-serif-ed absolute inset-0 grid place-items-center text-2xl italic text-[#16161d]/35">my stack</p>
      <ul aria-label="Languages and tools">
        {RINGS.map((ring, r) => {
          const items = portfolio.stack.filter((s) => s.level === ring.level)
          // Room for a logo plus a little air, as an angle on this ring.
          const gap = ((13 * ring.size + 4) / ring.radius) * (180 / Math.PI)
          const angles = scatter(ring.level, items.length, gap)
          return items.map((s, i) => {
            const rng = seeded(s.name)
            const scale = ring.size * (0.94 + rng() * 0.12)
            return (
              <li
                key={s.name}
                tabIndex={0}
                className="orbit-arm group absolute left-1/2 top-1/2 outline-none hover:z-30 focus:z-30"
                style={
                  {
                    '--start': `${angles[i].toFixed(1)}deg`,
                    '--lap': `${Math.abs(ring.lap)}s`,
                    '--turn': ring.lap < 0 ? '-360deg' : '360deg',
                    '--r': `${ring.radius}cqw`,
                    '--delay': `${(r * 0.3 + i * 0.07).toFixed(2)}s`,
                    '--fx': `${(1.5 + rng() * 2).toFixed(1)}px`,
                    '--fy': `${(1.5 + rng() * 2).toFixed(1)}px`,
                    '--rot': `${(1.5 + rng() * 2).toFixed(1)}deg`,
                    '--dur': `${(7 + rng() * 6).toFixed(1)}s`,
                    '--phase': `${(-rng() * 12).toFixed(1)}s`,
                    '--s': scale.toFixed(3),
                  } as CSSProperties
                }
              >
                {/* The arm turns; the spot sits on the ring at its end; the upright layer turns back the other way, so
                    the logo and its label always stay level. */}
                <div className="orbit-spot">
                  <div className="orbit-upright relative">
                    <div className="orbit-float grid place-items-center rounded-full border-2 border-[#16161d] bg-white shadow-[0_6px_16px_-6px_#16161d55] transition-[scale] duration-200 group-hover:scale-110 group-focus:scale-110 [height:calc(min(3.5rem,13cqw)*var(--s))] [margin:calc(min(1.75rem,6.5cqw)*var(--s)*-1)_0_0_calc(min(1.75rem,6.5cqw)*var(--s)*-1)] [width:calc(min(3.5rem,13cqw)*var(--s))]">
                      <img src={`/boring/logos/${s.logo}.webp`} alt="" width={40} height={40} loading="lazy" className="size-[58%] object-contain" />
                    </div>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-0 top-[min(2rem,7.5cqw)] w-max max-w-[13rem] -translate-x-1/2 rounded-md bg-[#16161d] px-2.5 py-1.5 text-center text-xs leading-snug text-[#f4f1ea] opacity-0 shadow-[0_6px_18px_#0005] transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100"
                    >
                      <b>{s.name}</b> · {s.note}
                    </span>
                  </div>
                </div>
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
    <div ref={ref} className="intra rounded-2xl p-4 text-white sm:p-5">
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
    <li className={`grid grid-cols-[4.1rem_5.2rem_1fr] items-center gap-2 sm:grid-cols-[4.6rem_5.6rem_1fr] ${className}`}>
      <span className="text-white/50">{row.date ? monthYear(row.date) : 'now'}</span>
      {row.ongoing ? (
        <span className="animate-pulse whitespace-nowrap rounded bg-amber-400 px-1 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-black">in progress</span>
      ) : (
        <span className={`rounded px-1.5 py-0.5 text-center text-xs font-semibold ${row.score! > 100 ? 'bg-[var(--accent)] text-white' : 'bg-emerald-500 text-black'}`}>{row.score}</span>
      )}
      <span className="min-w-0 break-words leading-tight">
        {row.name}
        {row.count > 1 && <span className="ml-1.5 text-xs text-white/40">×{row.count}</span>}
      </span>
    </li>
  )
}
