import type { ReactNode } from 'react'
import { daniel } from '../../content/daniel'
import { SectionTitle } from './SectionTitle'

const card = 'rounded-3xl bg-[#141418] p-6 ring-1 ring-white/5 sm:p-8'

export function About() {
  const { boring } = daniel
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 sm:px-6">
      <SectionTitle>About Me</SectionTitle>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-5">
          <div className={`${card} text-center text-lg leading-relaxed text-white/85`}>
            <p>
              {boring.intro.map((part, i) =>
                'strong' in part && part.strong ? (
                  <strong key={i} className="font-semibold text-[var(--accent)] underline decoration-2 underline-offset-4">{part.text}</strong>
                ) : 'accent' in part && part.accent ? (
                  <span key={i} className="font-semibold text-[var(--accent-2)]">{part.text}</span>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </p>
          </div>
          <div className={card}>
            <StackOrbit items={boring.stack} />
          </div>
        </div>
        <div className="space-y-5">
          <div className={card}>
            <IntraCard />
          </div>
          <div className={`${card} space-y-5`}>
            <p className="text-center text-lg leading-relaxed text-white/85">{boring.hobby}</p>
            <img src="/me/HOBBY-2.webp" alt="Daniel's desk: his PC, keyboard and mouse" width={400} height={300} loading="lazy" className="w-full rounded-2xl object-cover ring-1 ring-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ——— The stack, as badges orbiting slowly (his brother's skill cloud, in Daniel's own colours) ———

const BADGES: Record<string, { label: string; color: string }> = {
  C: { label: 'C', color: '#5c6bc0' },
  Python: { label: 'Py', color: '#3776ab' },
  Bash: { label: '$_', color: '#2e7d32' },
  Git: { label: 'git', color: '#f05032' },
  Make: { label: 'make', color: '#8d6e63' },
  Linux: { label: 'linux', color: '#222' },
  TypeScript: { label: 'TS', color: '#3178c6' },
  React: { label: 'React', color: '#0ea5c6' },
  'three.js': { label: '3js', color: '#111' },
  Tailwind: { label: 'tw', color: '#0891b2' },
}

function StackOrbit({ items }: { items: readonly string[] }) {
  // Two rings: the first four on the inside, the rest further out, turning the other way.
  const rings = [items.slice(0, 4), items.slice(4)]
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm [container-type:inline-size]" role="list" aria-label="Languages and tools">
      <div aria-hidden className="absolute inset-[24%] rounded-full border border-dashed border-white/10" />
      <div aria-hidden className="absolute inset-[3%] rounded-full border border-dashed border-white/10" />
      <p aria-hidden className="absolute inset-0 grid place-items-center font-marker text-lg text-white/40">my stack</p>
      {rings.map((ring, r) => (
        <div key={r} className={`absolute inset-0 ${r ? 'animate-[orbit_80s_linear_infinite_reverse]' : 'animate-[orbit_60s_linear_infinite]'}`}>
          {ring.map((name, i) => {
            const angle = (i / ring.length) * 360 + r * 18
            const radius = r ? 47 : 26
            const b = BADGES[name] ?? { label: name, color: '#444' }
            return (
              <div
                key={name}
                role="listitem"
                aria-label={name}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `rotate(${angle}deg) translateY(-${radius}cqw) rotate(${-angle}deg)` }}
              >
                <Badge spin={r ? 'reverse' : 'normal'} color={b.color} title={name}>
                  {b.label}
                </Badge>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Badge({ children, color, title, spin }: { children: ReactNode; color: string; title: string; spin: 'normal' | 'reverse' }) {
  return (
    <span
      title={title}
      className={`-ml-7 -mt-7 grid h-14 w-14 place-items-center rounded-full bg-[#ececf2] text-sm font-bold shadow-[0_4px_14px_#0008] ring-4 ring-[#141418] ${
        spin === 'reverse' ? 'animate-[orbit_80s_linear_infinite]' : 'animate-[orbit_60s_linear_infinite_reverse]'
      }`}
      style={{ color }}
    >
      {children}
    </span>
  )
}

// ——— The 42 intra card (his LeetCode card, for 42) ———

function IntraCard() {
  const { intra } = daniel.boring
  const validated = intra.projects.reduce((n, p) => n + ('count' in p && p.count ? p.count : 1), 0)
  const kinds = ['C', 'Python', 'System', 'Exam'] as const
  const byKind = kinds.map((k) => ({ kind: k, n: intra.projects.filter((p) => p.kind === k).reduce((n, p) => n + ('count' in p && p.count ? p.count : 1), 0) }))
  // The ring: the average mark, out of the 125 a project can reach with its bonus.
  const average = intra.projects.reduce((n, p) => n + p.score, 0) / intra.projects.length
  const ring = 2 * Math.PI * 42
  return (
    <div className="rounded-2xl border border-white/10 p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-white font-black text-black">42</span>
          <span className="text-2xl font-semibold">{intra.login}</span>
        </div>
        <span className="text-sm text-white/60">{intra.campus}</span>
      </div>
      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff1a" strokeWidth="7" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${ring * (average / 125)} ${ring}`} />
          </svg>
          <p className="absolute inset-0 grid place-items-center text-center leading-none">
            <span>
              <span className="block text-3xl font-semibold">{validated}</span>
              <span className="text-[11px] text-white/50">validated</span>
              <span className="mt-1 block text-[10px] text-white/40">avg {Math.round(average)}</span>
            </span>
          </p>
        </div>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {byKind.map(({ kind, n }) => (
            <li key={kind}>
              <p className="flex justify-between text-sm">
                <span>{kind}</span>
                <span className="text-white/60">{n}</span>
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[var(--accent-2)]" style={{ width: `${(n / validated) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-5 border-t border-white/10 pt-3 text-sm text-white/60">Recent projects</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {[...intra.projects].reverse().map((p) => (
          <li key={p.name} className="grid grid-cols-[4.5rem_3.2rem_1fr] items-center gap-2">
            <span className="text-white/50">{p.when}</span>
            <span className={`rounded px-1.5 py-0.5 text-center text-xs font-semibold ${p.score > 100 ? 'bg-[var(--accent)] text-white' : 'bg-emerald-500 text-black'}`}>{p.score}</span>
            <span className="truncate">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
