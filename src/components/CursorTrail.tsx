import { useEffect, useRef } from 'react'
import { sparkles } from '../content/assets'
import { chaosScale } from '../lib/settings'
import { useSettings } from './settings/settingsState'
import { usePossessed } from '../lib/possession'

const POOL = 14
const EYE = {
  src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12"><path d="M1 6Q10-3 19 6Q10 15 1 6Z" fill="#000" stroke="#d8d0e0"/><circle cx="10" cy="6" r="3" fill="#b00"/><circle cx="10" cy="6" r="1.2" fill="#000"/></svg>')}`,
  w: 20,
}
const SPACING_MS = 30

/** Sparkle trail behind a mouse pointer. Pooled DOM nodes, no React re-renders. Off for touch. */
export function CursorTrail() {
  const root = useRef<HTMLDivElement>(null)
  // Chaos dial: no trail when calm, a longer, denser one at MAXIMUM.
  const trail = chaosScale(useSettings().settings.chaos).trail
  // Possessed, the trail is eyes. They follow you.
  const possessed = usePossessed()
  useEffect(() => {
    const host = root.current
    if (!host || !trail || !window.matchMedia?.('(pointer: fine)').matches) return
    const pool = Math.round(POOL * trail)
    const nodes = Array.from({ length: pool }, () => {
      const s = document.createElement('img')
      s.alt = ''
      s.draggable = false
      s.className = 'pointer-events-none fixed z-[90] select-none opacity-0 [image-rendering:pixelated]'
      host.appendChild(s)
      return s
    })
    let i = 0
    let last = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.timeStamp - last < SPACING_MS / trail) return
      last = e.timeStamp
      const s = nodes[i++ % pool]
      const sparkle = possessed ? EYE : sparkles[i % sparkles.length]
      if (!s.src.endsWith(sparkle.src)) s.src = sparkle.src
      s.style.left = `${e.clientX + 6}px`
      s.style.top = `${e.clientY + 6}px`
      s.style.width = `${Math.min(sparkle.w, 14 + (i % 3) * 6)}px`
      s.classList.remove('animate-trail')
      void s.offsetWidth // restart the animation
      s.classList.add('animate-trail')
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      nodes.forEach((n) => n.remove())
    }
  }, [trail, possessed])
  return <div ref={root} aria-hidden />
}
