import { useEffect, useRef } from 'react'
import { sparkles } from '../content/assets'

const POOL = 14

/** Sparkle trail behind a mouse pointer. Pooled DOM nodes, no React re-renders. Off for touch. */
export function CursorTrail() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = root.current
    if (!host || !window.matchMedia?.('(pointer: fine)').matches) return
    const nodes = Array.from({ length: POOL }, () => {
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
      if (e.pointerType !== 'mouse' || e.timeStamp - last < 30) return
      last = e.timeStamp
      const s = nodes[i++ % POOL]
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
  }, [])
  return <div ref={root} aria-hidden />
}
