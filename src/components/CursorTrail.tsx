import { useEffect, useRef } from 'react'
import { sparkles } from '../content/assets'
import { chaosScale } from '../lib/settings'
import { useSettings } from './settings/settingsState'

const POOL = 14
const SPACING_MS = 30

/** Sparkle trail behind a mouse pointer. Pooled DOM nodes, no React re-renders. Off for touch. */
export function CursorTrail() {
  const root = useRef<HTMLDivElement>(null)
  // Chaos dial: no trail when calm, a longer, denser one at MAXIMUM.
  const trail = chaosScale(useSettings().settings.chaos).trail
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
      const sparkle = sparkles[i % sparkles.length]
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
  }, [trail])
  return <div ref={root} aria-hidden />
}
