import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Img } from '../components/media/Img'
import { Blink, Marquee, WavyText } from '../components/chaos/Chaos'
import { usePopnuke } from '../components/popnuke/popnukeState'
import { usePopups } from '../components/popups/popupState'
import { Viewer3D } from '../components/three/Viewer3D'
import { Win95Window } from '../components/Win95Window'
import { cursors, icons, popnukeGifs } from '../content/assets'
import { EULA, FIGURES, INSTALL_LOG, POPNUKE_3D, PRODUCT, REVIEWS, SEALS, SPECS } from '../content/popnuke'
import { gifCursor } from '../lib/cursor'

const canWebGL = () => typeof window !== 'undefined' && 'WebGL2RenderingContext' in window

/**
 * POPNUKE by Daniel Cheng Software Ltd.: a 1999 shareware download page with a scroll-driven 3D product demo
 * on top. Installing it really does stop the random pop-ups and the Virus Alert (see PopnukeProvider).
 */
export function Popnuke() {
  const [setup, setSetup] = useState(false)
  return (
    <div data-testid="popnuke" className="tile-popnuke min-h-screen" style={{ cursor: gifCursor(cursors.arrow) }}>
      <Hero />
      <div className="mx-auto max-w-3xl space-y-4 p-3 pb-10 sm:p-6">
        <ProductBox onDownload={() => setSetup(true)} />
        <Awards />
        <Box title="How it works">
          <ol className="space-y-2">
            {FIGURES.map((f) => (
              <li key={f.fig} className="border-l-4 border-yellow-400 pl-2">
                <p className="font-mono text-xs font-bold tracking-widest text-gray-600">{f.fig}</p>
                <p>{f.text}</p>
              </li>
            ))}
          </ol>
        </Box>
        <Box title="Specifications">
          <table className="w-full text-left text-sm">
            <tbody>
              {SPECS.map(([k, v]) => (
                <tr key={k} className="odd:bg-yellow-50">
                  <th className="w-36 py-0.5 pr-2 align-top font-bold">{k}</th>
                  <td className="py-0.5">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <Box title="Screenshots">
          <Screenshot />
        </Box>
        <Reviews />
        <DownloadPanel onDownload={() => setSetup(true)} />
      </div>
      {setup && <SetupWizard onClose={() => setSetup(false)} />}
    </div>
  )
}

/** A boxed section, odditycommoddity-style: a heading with a little icon, underlined. */
function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-4 border-double border-[#3d1466] bg-[#fffdf0] p-3 font-[Verdana,sans-serif] text-black shadow-[6px_6px_0_#000]">
      <h2 className="mb-2 flex items-center gap-1 border-b-2 border-dotted border-[#3d1466] pb-1 font-bold uppercase tracking-wide text-[#3d1466]">
        <Img slot={popnukeGifs.trefoilDisc} width={18} /> {title}
      </h2>
      {children}
    </section>
  )
}

const FRAMES = ['FRAME 01/04 — THE PROBLEM', 'FRAME 02/04 — POPNUKE INTERCEPTS', 'FRAME 03/04 — THE PRODUCT', 'FRAME 04/04 — AVAILABLE NOW. FREE*']

/** The scroll-driven 3D demo: a tall section with a sticky canvas; scrolling through it plays the story. */
function Hero() {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const progress = useRef(0)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const s = section.current
      if (!s) return
      const r = s.getBoundingClientRect()
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)))
      progress.current = p
      setFrame(p < 0.25 ? 0 : p < 0.6 ? 1 : p < 0.85 ? 2 : 3)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!canWebGL()) return
    let cleanup: (() => void) | null = null
    let cancelled = false
    void import('../three/mount').then((three) => {
      if (!cancelled && canvas.current) cleanup = three.mountPopnukeHero(canvas.current, () => progress.current)
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <section ref={section} data-testid="popnuke-hero" className="relative h-[250vh] bg-[#0c0018]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvas} aria-label="POPNUKE product demonstration" data-testid="popnuke-hero-canvas" className="absolute inset-0 h-full w-full [image-rendering:pixelated]" />
        <div className="pointer-events-none absolute inset-x-0 top-6 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-yellow-200/80">DANIEL CHENG SOFTWARE LTD. PRESENTS</p>
          <h1 className="font-impact text-5xl text-yellow-300 [text-shadow:3px_3px_0_#000] sm:text-7xl">
            <WavyText text="POPNUKE" />
          </h1>
        </div>
        <p data-testid="popnuke-frame" className="pointer-events-none absolute inset-x-0 bottom-10 text-center font-mono text-sm tracking-widest text-white [text-shadow:1px_1px_0_#000]">
          {FRAMES[frame]}
        </p>
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-vt text-lg text-yellow-200">
          <Blink>▼</Blink> scroll to continue the demonstration <Blink>▼</Blink>
        </p>
      </div>
    </section>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} out of 5 radioactive symbols`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Img key={i} slot={popnukeGifs.trefoilDisc} width={18} className={i < n ? '' : 'opacity-25 grayscale'} />
      ))}
    </span>
  )
}

function ProductBox({ onDownload }: { onDownload: () => void }) {
  const { installed } = usePopnuke()
  return (
    <section className="border-4 border-black bg-gradient-to-b from-[#3d1466] to-[#14001f] p-3 text-white shadow-[6px_6px_0_#000]">
      <Marquee className="mb-2 bg-yellow-300 font-vt text-lg text-black">
        ★ NEW VERSION 3.0.0.1 ★ NOW NUKES THE ALBANIAN VIRUS ★ FREE* DOWNLOAD ★ NO VIRUS REAL BEST 2004 ★ AS SEEN IN THE POP-UPS ★
      </Marquee>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Img slot={popnukeGifs.trefoilRust} width={130} className="shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-impact text-4xl text-yellow-300">{PRODUCT.name}</p>
          <p className="font-bold">{PRODUCT.edition}</p>
          <p className="text-sm text-gray-300">by {PRODUCT.publisher}</p>
          <p className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
            <Stars n={5} /> <span className="text-xs">(7 votes, 4 by Daniel)</span>
          </p>
          <p className="mt-2 font-impact text-xl">{PRODUCT.tagline}</p>
          <p className="text-[10px] text-gray-400">{PRODUCT.footnote}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        {installed ? (
          <p className="font-impact text-2xl text-lime">INSTALLED ✓</p>
        ) : (
          <button type="button" onClick={onDownload} aria-label="Download POPNUKE" data-testid="popnuke-download-top">
            <Img slot={popnukeGifs.downloadNow} width={187} />
          </button>
        )}
      </div>
    </section>
  )
}

function Awards() {
  return (
    <Box title="Awards & accreditations">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Img slot={popnukeGifs.radioactiveAward} width={150} />
        {SEALS.map((s, i) => (
          // Deadpan official seals, drawn in CSS.
          <div
            key={s}
            className="grid size-24 place-items-center rounded-full border-4 border-double border-[#8a6d00] bg-[radial-gradient(circle,#fff3b0_0%,#e8c35a_70%)] p-2 text-center font-serif text-[9px] font-bold uppercase leading-tight text-[#5a4300] shadow-[2px_2px_0_#000]"
            style={{ rotate: `${(i % 2 ? 1 : -1) * (4 + i * 2)}deg` }}
          >
            {s}
          </div>
        ))}
        <Img slot={popnukeGifs.shieldBlue} width={70} />
      </div>
    </Box>
  )
}

/** A fake screenshot: POPNUKE's control panel, as a little Win95 window. */
function Screenshot() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <div className="win-raised w-64 max-w-full p-0.5 text-xs">
        <div className="bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">POPNUKE Control Panel</div>
        <div className="space-y-1 bg-win p-2">
          <p>Status: <b className="text-green-700">PROTECTED</b></p>
          <p>Pop-ups nuked today: <b>9,999</b></p>
          <label className="flex items-center gap-1">
            Nuke level:
            <input type="range" disabled value={100} readOnly className="flex-1" />
            MAX
          </label>
          <p className="text-[10px] text-gray-600">Fig. 1: what you will see (nothing).</p>
        </div>
      </div>
      <p className="text-sm">
        Screenshot taken on a real computer.<sup>†</sup>
        <br />
        <span className="text-[10px] text-gray-600">† Daniel’s.</span>
      </p>
    </div>
  )
}

function Reviews() {
  return (
    <Box title="User reviews">
      <div className="flex flex-col gap-3 sm:flex-row">
        <ul className="flex-1 space-y-2">
          {REVIEWS.map((r) => (
            <li key={r.who} className="border-b border-dashed border-gray-400 pb-1">
              <p className="flex items-center gap-2 text-sm font-bold">
                {r.who} <Stars n={r.stars} />
              </p>
              <p className="text-sm italic">“{r.text}”</p>
            </li>
          ))}
        </ul>
        {/* The spokes-Daniel, live in 3D. */}
        <figure className="flex shrink-0 flex-col items-center">
          <Viewer3D spec={POPNUKE_3D.spokesDaniel} size="150px" res={100} className="bg-[radial-gradient(circle,#ffeaa0_0%,#fffdf0_70%)]" />
          <figcaption className="text-center text-[10px]">Daniel Cheng, CEO<br />(drag him around)</figcaption>
        </figure>
      </div>
    </Box>
  )
}

function DownloadPanel({ onDownload }: { onDownload: () => void }) {
  const { installed, blocked, uninstall } = usePopnuke()
  const popups = usePopups()
  const [confirming, setConfirming] = useState(false)
  return (
    <Box title={installed ? 'Your copy of POPNUKE' : 'Download'}>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Viewer3D spec={POPNUKE_3D.box} size="150px" res={100} className="bg-[radial-gradient(circle,#3d1466_0%,#0c0018_75%)]" />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          {installed ? (
            <>
              <p className="font-impact text-2xl text-green-700">INSTALLED ✓</p>
              <p>
                Pop-ups nuked so far: <b data-testid="popnuke-page-blocked">{blocked}</b>
              </p>
              <button type="button" onClick={() => setConfirming(true)} data-testid="popnuke-uninstall" className="win-raised px-3 py-1 text-sm">
                Uninstall POPNUKE…
              </button>
            </>
          ) : (
            <>
              <p className="font-bold">Free download (1.44 MB). Installs in seconds. Mostly.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <button type="button" onClick={onDownload} data-testid="popnuke-install" aria-label="Download and install POPNUKE">
                  <Img slot={popnukeGifs.dowloadHere} width={130} />
                </button>
                <button type="button" onClick={onDownload} aria-label="Cut the crap and just download it">
                  <Img slot={popnukeGifs.cutTheCrap} width={130} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {confirming && (
        <Win95Window
          title="Uninstall POPNUKE"
          icon={icons.warning}
          onClose={() => setConfirming(false)}
          testId="popnuke-confirm"
          className="fixed left-1/2 top-1/3 z-[80] w-[min(340px,calc(100vw-16px))] -translate-x-1/2"
          bodyClassName="bg-win p-3"
        >
          <p className="text-sm">Are you sure? POPNUKE protects you from 99.9% of pop-ups. The pop-ups know you’re thinking about it.</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              data-testid="popnuke-confirm-yes"
              className="win-raised px-3"
              onClick={() => {
                setConfirming(false)
                uninstall()
                popups.burst(3, 'welcome-back') // they were waiting
              }}
            >
              Yes, uninstall
            </button>
            <button type="button" className="win-raised px-3" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </div>
        </Win95Window>
      )}
    </Box>
  )
}

type Step = 'eula' | 'installing' | 'done'

/** The POPNUKE Setup Wizard: read the whole EULA, sell your soul, watch the progress bar stall at 99%. */
function SetupWizard({ onClose }: { onClose: () => void }) {
  const { install } = usePopnuke()
  const [step, setStep] = useState<Step>('eula')
  const [read, setRead] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    if (step !== 'installing') return
    let p = 0
    let stalled = 0
    const t = window.setInterval(() => {
      if (p < 99) p = Math.min(99, p + 4)
      else if (++stalled > 20) p = 100 // ~2s stuck at 99%, then done
      setPct(p)
      if (p === 100) {
        window.clearInterval(t)
        setStep('done')
      }
    }, 100)
    return () => window.clearInterval(t)
  }, [step])

  const log = INSTALL_LOG.slice(0, Math.min(INSTALL_LOG.length, Math.floor(pct / 14) + 1))
  return (
    <Win95Window
      title="POPNUKE Setup Wizard"
      icon={popnukeGifs.shieldRadiation}
      onClose={onClose}
      testId="popnuke-setup"
      className="fixed left-1/2 top-[10%] z-[80] w-[min(460px,calc(100vw-16px))] -translate-x-1/2"
      bodyClassName="bg-win p-3 text-sm"
    >
      {step === 'eula' && (
        <div className="space-y-2">
          <p className="font-bold">Please read the End User Licence Agreement. All of it.</p>
          <pre
            data-testid="setup-eula"
            onScroll={(e) => {
              const el = e.currentTarget
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setRead(true)
            }}
            className="win-sunken h-40 overflow-y-auto overflow-x-hidden whitespace-pre-wrap bg-white p-2 font-mono text-[11px]"
          >
            {EULA}
          </pre>
          <label className={`flex items-center gap-2 ${read ? '' : 'opacity-50'}`}>
            <input type="checkbox" disabled={!read} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} data-testid="setup-agree" />I agree to give Daniel Cheng my soul
          </label>
          {!read && <p className="text-[11px] text-red-700">Scroll to the bottom of the agreement to continue.</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="win-raised px-3" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="win-raised px-3 font-bold disabled:opacity-50" disabled={!read || !agreed} data-testid="setup-next" onClick={() => setStep('installing')}>
              Next &gt;
            </button>
          </div>
        </div>
      )}
      {step === 'installing' && (
        <div className="space-y-2">
          <p className="font-bold">Installing POPNUKE…</p>
          <div className="win-sunken h-5 bg-white" role="progressbar" aria-valuenow={pct} aria-label="Install progress" data-testid="setup-progress">
            <div className="h-full bg-[repeating-linear-gradient(90deg,#000080_0_10px,transparent_10px_12px)]" style={{ width: `${pct}%` }} />
          </div>
          <ul className="win-sunken h-24 overflow-hidden bg-black p-1 font-mono text-[11px] text-lime">
            {log.map((l) => (
              <li key={l}>{l}</li>
            ))}
            {pct === 99 && <li className="animate-blink text-yellow-300">Please do not unplug your computer.</li>}
          </ul>
        </div>
      )}
      {step === 'done' && (
        <div className="space-y-2 text-center">
          <Img slot={popnukeGifs.trefoilGlow} width={60} className="mx-auto" />
          <p className="font-impact text-2xl text-green-700">Installation complete!</p>
          <p>POPNUKE is now protecting you from pop-ups. Your soul has been received.</p>
          <button
            type="button"
            className="win-raised px-4 font-bold"
            data-testid="setup-finish"
            onClick={() => {
              install()
              onClose()
            }}
          >
            Finish
          </button>
        </div>
      )}
    </Win95Window>
  )
}
