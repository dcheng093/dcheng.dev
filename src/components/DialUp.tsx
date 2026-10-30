import { useEffect, useRef, useState } from 'react'
import { assets } from '../content/assets'
import { LOAD_MS, VISITED_KEY, WIPE_MS, arrival, statusLine } from '../lib/dialup'
import { Img } from './media/Img'

/**
 * The site on a 56k modem, on purpose: the first time a page is opened in a visit it arrives blank and paints in
 * top to bottom in fits and starts, with a status bar and an hourglass, and its pictures come down a few lines at a
 * time. After that it's "cached": going back to it, the Win95 blinds sweep off it instead. A refresh empties the
 * cache (main.tsx). Scrolling is never laggy.
 */

/** When the current page started "loading", and for how long (for pictures to wait their turn). */
let current: { start: number; ms: number } | null = null

function visited(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(VISITED_KEY) ?? '[]')
  } catch {
    return []
  }
}

function remember(path: string) {
  const seen = visited()
  try {
    if (!seen.includes(path)) sessionStorage.setItem(VISITED_KEY, JSON.stringify([...seen, path]))
  } catch {
    // Private mode: every visit is a first visit.
  }
}

/** Mount with a new `key` on every page change. */
export function PageLoad({ path, belowTaskbar = false }: { path: string; belowTaskbar?: boolean }) {
  const [mode] = useState(() => arrival(visited().includes(path)))
  return mode === 'dialup' ? <DialUpLoad path={path} /> : <CachedLoad belowTaskbar={belowTaskbar} />
}

/**
 * A page already seen this visit: straight from the "cache", the Win95-blue blinds sweep off it. They stop short of
 * the taskbar (top-11 = Taskbar's h-11), so it never disappears; pages without one get the whole screen.
 */
function CachedLoad({ belowTaskbar }: { belowTaskbar: boolean }) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    // The animation ending is the real signal; this catches browsers (and tests) that never run it.
    const fallback = window.setTimeout(() => setDone(true), WIPE_MS + 400)
    return () => window.clearTimeout(fallback)
  }, [])
  if (done) return null
  return (
    <div
      aria-hidden
      data-testid="page-wipe"
      onAnimationEnd={() => setDone(true)}
      className={`pointer-events-none fixed inset-x-0 bottom-0 ${belowTaskbar ? 'top-11' : 'top-0'} z-[95] animate-page-wipe bg-[repeating-linear-gradient(90deg,#000080_0_14px,#1084d0_14px_28px)]`}
    />
  )
}

function DialUpLoad({ path }: { path: string }) {
  const ms = LOAD_MS
  const [done, setDone] = useState(false)
  const status = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const start = performance.now()
    remember(path)
    current = { start, ms }
    html.dataset.loading = ''
    let raf = 0
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / ms)
      if (status.current) status.current.textContent = statusLine(path, p)
      if (bar.current) bar.current.style.width = `${Math.round(p * 100)}%`
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // The overlay's animation ending is the real signal; this catches browsers (and tests) that never run it.
    const fallback = window.setTimeout(() => setDone(true), ms + 400)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
      delete html.dataset.loading
      current = null
    }
  }, [ms, path])

  useEffect(() => {
    if (!done) return
    delete document.documentElement.dataset.loading
    current = null
  }, [done])

  if (done) return null
  return (
    <>
      {/* The not-yet-painted page: white, uncovered top to bottom in jerks (index.css: dialup). */}
      <div
        aria-hidden
        data-testid="page-load"
        onAnimationEnd={() => setDone(true)}
        className="pointer-events-none fixed inset-x-0 bottom-0 top-0 z-[44] animate-dialup bg-white"
        style={{ animationDuration: `${ms}ms` }}
      />
      <div
        aria-hidden
        data-testid="status-bar"
        data-no-rot=""
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[51] flex h-5 items-center gap-1 border-t border-white bg-win px-1 font-[Tahoma,sans-serif] text-[11px] text-black shadow-[0_-1px_0_#808080]"
      >
        <Img slot={assets.globe} width={14} />
        <span ref={status} className="min-w-0 flex-1 truncate">
          {statusLine(path, 0)}
        </span>
        <span className="win-sunken h-3 w-24 shrink-0 bg-white max-sm:w-12">
          <span ref={bar} className="block h-full w-0 bg-win-title" />
        </span>
      </div>
    </>
  )
}

// Each picture file "downloads" once per session, like a browser cache: when its download started (ms, with any
// wait for the page to paint down to it). Copies seen while it's still coming down come down in step with it.
const downloads = new Map<string, number>()
const SCAN_MS = 480

/**
 * While a page is loading over dial-up, its pictures come down a few lines at a time (interlaced-GIF style), each
 * waiting until the page has painted down to it. Pictures scrolled to afterwards, or on a cached page, show whole.
 */
export function ScanIn() {
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main || typeof IntersectionObserver === 'undefined' || !('animate' in Element.prototype)) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const img = e.target as HTMLImageElement
        io.unobserve(img)
        const src = img.getAttribute('src')
        if (!src) continue
        const now = performance.now()
        const started = downloads.get(src)
        if (started !== undefined && now >= started + SCAN_MS) continue // cached
        if (started === undefined && !current) continue // not loading: scrolling never lags
        const waitForPaint = current ? Math.max(0, current.start + current.ms * Math.min(1, Math.max(0, e.boundingClientRect.top / window.innerHeight)) - now) : 0
        if (started === undefined) downloads.set(src, now + waitForPaint)
        // A copy of one already on its way joins it part-way through (a negative delay).
        const delay = (started ?? now + waitForPaint) - now
        img.style.maskImage = 'repeating-linear-gradient(to bottom, #000 0 var(--scan), transparent var(--scan) 6px)'
        const anim = img.animate(
          [
            { '--scan': '0px', easing: 'step-end' },
            { '--scan': '1px', easing: 'step-end' },
            { '--scan': '3px', easing: 'step-end' },
            { '--scan': '6px' },
          ],
          { duration: SCAN_MS, delay, fill: 'backwards' },
        )
        const clear = () => img.style.removeProperty('mask-image')
        anim.onfinish = clear
        anim.oncancel = clear
      }
    })
    const watch = (root: ParentNode) => root.querySelectorAll('img').forEach((img) => io.observe(img))
    watch(main)
    const mo = new MutationObserver((records) => {
      for (const r of records)
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) io.observe(n)
          else if (n instanceof Element) watch(n)
        })
    })
    mo.observe(main, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
  return null
}
