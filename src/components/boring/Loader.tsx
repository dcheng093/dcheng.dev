import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { portfolio } from '../../content/portfolio'
import { getProgress, markReady, reportProgress, resetBoot } from './boot'

const MIN_SECONDS = 1.2
const MAX_SECONDS = 4.5
const WIPE_MS = 900

/**
 * The arrival: a near-black curtain with the name spelling itself out and a counter, 000 to 100, that follows the
 * world actually loading behind it (boot.ts: fonts, then three.js, then textures, then the first frame). It eases so it
 * never jumps, takes at least a moment, and stops waiting after a few seconds. At 100 it wipes upward and the page is
 * ready: the world dives through the clouds and the hero's entrances play. Skipped on a jump to a section (#sitemap).
 */
export function Loader() {
  const [skip] = useState(() => typeof window !== 'undefined' && !!window.location.hash)
  const [phase, setPhase] = useState<'count' | 'wipe' | 'gone'>(skip ? 'gone' : 'count')
  const count = useRef<HTMLSpanElement>(null)
  const root = useRef<HTMLDivElement>(null)

  // Before anything else on the page starts: a fresh count (layout effects run before the world's own effect).
  useLayoutEffect(() => {
    resetBoot()
    if (skip) return markReady()
    void document.fonts?.ready.then(() => reportProgress(0.2))
  }, [skip])

  useEffect(() => {
    if (phase !== 'count') return
    const t0 = performance.now()
    let last = t0
    let shown = 0
    let frame = 0
    const tick = (now: number) => {
      const elapsed = (now - t0) / 1000
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const goal = elapsed > MAX_SECONDS ? 100 : Math.min(getProgress() * 100, (elapsed / MIN_SECONDS) * 100)
      shown = Math.min(100, shown + Math.max(0, goal - shown) * Math.min(1, dt * 7) + (goal > shown ? dt * 8 : 0))
      if (count.current) count.current.textContent = String(Math.floor(shown)).padStart(3, '0')
      root.current?.style.setProperty('--p', String(shown / 100))
      if (shown >= 99.5) {
        if (count.current) count.current.textContent = '100'
        markReady()
        setPhase('wipe')
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase])

  useEffect(() => {
    if (phase !== 'wipe') return
    const id = window.setTimeout(() => setPhase('gone'), WIPE_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  if (phase === 'gone') return null
  return (
    <div
      ref={root}
      aria-hidden
      data-testid="boring-loader"
      className={`boring-loader fixed inset-0 z-[100] flex flex-col justify-between bg-[#050507] px-5 py-6 text-[#f4f1ea] sm:px-10 sm:py-8 ${phase === 'wipe' ? 'is-wiping pointer-events-none' : ''}`}
    >
      <p className="font-display text-lg font-bold tracking-[-0.03em]">
        {[...portfolio.name].map((ch, i) => (
          <span key={i} className="loader-letter inline-block whitespace-pre" style={{ '--i': i } as CSSProperties}>
            {ch}
          </span>
        ))}
        <span className="text-[var(--accent)]">.</span>
      </p>
      <div className="flex items-end justify-between gap-6">
        <p className="font-serif-ed max-w-xs text-xl leading-tight text-[#f4f1ea]/60 sm:text-2xl">{portfolio.tagline}</p>
        <span ref={count} className="font-display text-[clamp(5rem,18vw,14rem)] font-bold leading-[0.8] tracking-[-0.05em] tabular-nums">
          000
        </span>
      </div>
      <span aria-hidden className="loader-bar absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--accent)]" />
    </div>
  )
}
