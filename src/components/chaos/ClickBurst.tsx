import { useEffect, useRef } from 'react'
import { sparkles } from '../../content/assets'

const PARTICLES = 6

/** A little sparkle burst wherever a link or button is pressed. DOM nodes, no re-renders, like CursorTrail. */
export function ClickBurst() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = root.current
    if (!host) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('a,button,[role="button"]')) return
      for (let i = 0; i < PARTICLES; i++) {
        const angle = (Math.PI * 2 * i) / PARTICLES + Math.random() * 0.6
        const dist = 28 + Math.random() * 22
        const sparkle = sparkles[(i + Math.floor(Math.random() * sparkles.length)) % sparkles.length]
        const s = document.createElement('img')
        s.src = sparkle.src
        s.alt = ''
        s.width = 14
        s.className = 'pointer-events-none fixed z-[91] -translate-x-1/2 -translate-y-1/2 animate-burst [image-rendering:pixelated]'
        s.style.left = `${e.clientX}px`
        s.style.top = `${e.clientY}px`
        s.style.setProperty('--bx', `${Math.cos(angle) * dist}px`)
        s.style.setProperty('--by', `${Math.sin(angle) * dist}px`)
        s.addEventListener('animationend', () => s.remove())
        host.appendChild(s)
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      host.replaceChildren()
    }
  }, [])
  return <div ref={root} aria-hidden />
}
