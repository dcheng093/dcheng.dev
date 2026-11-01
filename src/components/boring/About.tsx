import type { CSSProperties } from 'react'
import { monthYear, portfolio } from '../../content/portfolio'
import { intraStats } from './intraStats'
import { SectionTitle } from './SectionTitle'
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

// ——— The stack: logos burst out of the centre into two rings, then each bobs on its own (his brother's skill cloud) ———

function StackOrbit() {
  const ref = useReveal<HTMLDivElement>(0.3)
  const rings = [portfolio.stack.filter((s) => s.level === 'main'), portfolio.stack.filter((s) => s.level === 'experienced')]
  let n = 0
  return (
    <div ref={ref} className="orbit relative mx-auto aspect-square w-full max-w-sm [container-type:inline-size]">
      <div aria-hidden className="absolute inset-[26%] rounded-full border border-dashed border-white/10" />
      <div aria-hidden className="absolute inset-[4%] rounded-full border border-dashed border-white/10" />
      <p aria-hidden className="absolute inset-0 grid place-items-center font-marker text-lg text-white/40">my stack</p>
      <ul aria-label="Languages and tools">
        {rings.map((ring, r) =>
          ring.map((s, i) => {
            const angle = ((i / ring.length) * 360 + (r ? 30 : -90)) * (Math.PI / 180)
            const radius = r ? 46 : 24
            const k = n++
            return (
              <li
                key={s.name}
                className="orbit-badge group absolute left-1/2 top-1/2"
                style={
                  {
                    '--tx': `${(Math.cos(angle) * radius).toFixed(2)}cqw`,
                    '--ty': `${(Math.sin(angle) * radius).toFixed(2)}cqw`,
                    '--delay': `${(r * 0.35 + i * 0.05).toFixed(2)}s`,
                    '--bob': `${4 + ((k * 0.7) % 2)}s`,
                    '--bob-delay': `${-((k * 1.3) % 2)}s`,
                  } as CSSProperties
                }
              >
                <div className="orbit-bob -ml-8 -mt-8 grid h-16 w-16 place-items-center rounded-full border-2 border-black bg-[#e6e6ee] shadow-[0_0_14px_#ffffff30] transition-transform duration-200 group-hover:scale-110">
                  <img src={`/boring/logos/${s.logo}.webp`} alt="" width={40} height={40} loading="lazy" className="h-9 w-9 object-contain" />
                </div>
                <span className="pointer-events-none absolute left-1/2 top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <b>{s.name}</b> · {s.note}
                </span>
                <span className="sr-only">
                  {s.name}: {s.note}
                </span>
              </li>
            )
          }),
        )}
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
  const recent = [...stats.ongoing, ...stats.recent].slice(0, 8)
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
        {recent.map((p) => (
          <li key={p.name} className="grid grid-cols-[4.6rem_4.4rem_1fr] items-center gap-2">
            <span className="text-white/50">{p.date ? monthYear(p.date) : 'now'}</span>
            {p.status === 'ongoing' ? (
              <span className="animate-pulse rounded bg-amber-400 px-1 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-black">in progress</span>
            ) : (
              <span className={`rounded px-1.5 py-0.5 text-center text-xs font-semibold ${p.score > 100 ? 'bg-[var(--accent)] text-white' : 'bg-emerald-500 text-black'}`}>{p.score}</span>
            )}
            <span className="truncate">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
