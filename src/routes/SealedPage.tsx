import { useEffect, type ReactNode } from 'react'
import { Marquee } from '../components/chaos/Chaos'
import { World3D } from '../components/three/Page3D'
import type { SealedPage } from '../lib/hunt'
import { possess } from '../lib/possession'

const BUTTON_STYLES = ['bg-black text-[#d8d0e0] border-[#d8d0e0]', 'bg-[#e8e4dc] text-black border-black', 'bg-[#2a0000] text-[#ff3030] border-[#7a0000]']

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center font-times text-lg font-bold uppercase tracking-[0.35em] text-[#efe8f4] sm:text-xl">
      {children}
      <span aria-hidden className="mt-1 block font-mono text-xs tracking-normal text-[#7a0000]">
        ==========================
      </span>
    </h2>
  )
}

/** Two interlocked triangles around an eye. The triangles turn, in steps, very slowly; the eye doesn't. */
function Sigil({ size = 140 }: { size?: number }) {
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden className="mx-auto drop-shadow-[0_0_8px_#7a0000]">
      <g className="animate-spin-z [animation-duration:60s] [animation-timing-function:steps(60)] [transform-box:fill-box] [transform-origin:center]" fill="none" stroke="#c9b48a" strokeWidth={1.5}>
        <polygon points="0,-42 36.4,21 -36.4,21" />
        <polygon points="0,42 36.4,-21 -36.4,-21" />
        <circle r={46} strokeWidth={0.75} strokeDasharray="1 5" />
      </g>
      <path d="M-20 0 Q0 -15 20 0 Q0 15 -20 0Z" fill="#000" stroke="#d8d0e0" strokeWidth={1} />
      <circle r={6} fill="#8a0000" />
      <circle r={2.5} fill="#000" />
    </svg>
  )
}

/**
 * A sealed page, decrypted from src/sealed/hunt.json: the text lives there, not here. Austere on purpose: one
 * column of serif text over its 3D world, no jokes. Opening one marks the visitor: the whole site turns (possession).
 */
export function Sealed({ page }: { page: SealedPage }) {
  useEffect(() => possess(), [])
  const panel = 'border border-[#d8d0e0]/20 bg-black/75 p-4 sm:p-5'
  return (
    // Black only until the world is up behind it (or forever, without WebGL). A plain bg-black would win over the
    // world rule in index.css.
    <div data-testid="sealed-page" className="min-h-screen px-3 pb-12 pt-4 font-times text-[#d8d0e0] sm:px-6 [html:not([data-world])_&]:bg-black">
      {page.world && <World3D id={page.world} markPage />}
      <div className="mx-auto max-w-[620px] space-y-7">
        {page.tape && (
          <div className="border-y border-[#d8d0e0]/25 bg-black/80 py-1 font-mono text-sm tracking-[0.35em] text-[#8f8a96]" aria-label="Tape">
            <Marquee speed={22}>
              {page.tape} &nbsp;&nbsp;&nbsp; {page.tape}
            </Marquee>
          </div>
        )}

        <header className="space-y-3 text-center">
          <Sigil />
          <h1 className="text-2xl font-bold uppercase tracking-[0.12em] text-white [text-shadow:0_0_14px_#7a0000] sm:text-4xl sm:tracking-[0.2em]">{page.title}</h1>
          {page.subtitle && <p className="text-lg italic text-[#b8b0c4]">{page.subtitle}</p>}
        </header>

        {page.sections.map((s) => (
          // A test's cipher and its clue stay legible even on the possessed site.
          <section key={s.heading} className={panel} aria-label={s.heading} data-uncorrupted={s.armour ? '' : undefined}>
            <Heading>{s.heading}</Heading>
            {s.body && (
              <div className="mt-3 space-y-3 text-lg leading-relaxed">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            )}
            {s.list && (
              <ul className="mt-3 space-y-2 text-lg leading-snug">
                {s.list.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            {s.armour && (
              <pre data-testid="armour" className="mt-4 overflow-x-auto whitespace-pre border border-[#7a0000]/70 bg-black p-3 font-mono text-[11px] leading-relaxed text-[#e8e4dc] sm:text-sm">
                {s.armour.join('\n')}
              </pre>
            )}
          </section>
        ))}

        {page.buttons && (
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Buttons">
            {page.buttons.map((label, i) => (
              <li key={label} className={`grid h-[31px] w-[88px] place-items-center border text-center font-mono text-[9px] uppercase tracking-widest ${BUTTON_STYLES[i % BUTTON_STYLES.length]}`}>
                {label}
              </li>
            ))}
          </ul>
        )}

        <footer className="space-y-2 text-center">
          {page.signature && (
            <p className="flex items-center justify-center gap-2 font-mono text-sm tracking-[0.4em] text-[#8f8a96]">
              <Sigil size={28} /> {page.signature}
            </p>
          )}
          {page.close && <p className="text-lg italic">{page.close}</p>}
        </footer>
      </div>
    </div>
  )
}
