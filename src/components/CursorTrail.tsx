import { useEffect, useRef } from 'react'

const GLYPHS = ['✦', '★', '✧', '♥', '✶', '☆']
const COLORS = ['#ff0', '#f0f', '#0ff', '#f80', '#0f0', '#fff']
const POOL = 14

/** Sparkle trail behind a mouse pointer. Pooled DOM nodes, no React re-renders. Off for touch. */
export function CursorTrail() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = root.current
    if (!host || !window.matchMedia?.('(pointer: fine)').matches) return
    const nodes = Array.from({ length: POOL }, () => {
      const s = document.createElement('span')
      s.className = 'pointer-events-none fixed z-[90] select-none font-bold opacity-0'
      host.appendChild(s)
      return s
    })
    let i = 0
    let last = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.timeStamp - last < 30) return
      last = e.timeStamp
      const s = nodes[i++ % POOL]
      s.textContent = GLYPHS[i % GLYPHS.length]
      s.style.color = COLORS[(i * 7) % COLORS.length]
      s.style.left = `${e.clientX + 6}px`
      s.style.top = `${e.clientY + 6}px`
      s.style.fontSize = `${10 + (i % 4) * 4}px`
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
