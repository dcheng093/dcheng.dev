import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { Img } from '../media/Img'
import { CONFETTI_MAX, confettiCount, throwConfetti } from '../../lib/confetti'

/**
 * Kawaii GIFs strewn over the whole page at random spots, on top of the content but under popups and
 * the chat. Clicks pass straight through. Every route change throws a fresh handful.
 * Must sit inside a positioned container that spans the page (RootLayout's <main>).
 */
export function GifConfetti() {
  const { pathname } = useLocation()
  return <ConfettiLayer key={pathname} />
}

function ConfettiLayer() {
  const ref = useRef<HTMLDivElement>(null)
  const [pieces] = useState(() => throwConfetti(CONFETTI_MAX))
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setCount(confettiCount(el.clientWidth, el.clientHeight))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} data-testid="gif-confetti" aria-hidden className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {pieces.slice(0, count).map((p, i) => (
        <Img
          key={i}
          slot={p.slot}
          width={Math.round(p.slot.w * p.scale)}
          className={`absolute ${p.anim}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            rotate: `${p.tilt}deg`,
            animationDelay: `${p.delay}s`,
            ['--drift-x' as string]: `${p.driftX}px`,
            ['--drift-y' as string]: `${p.driftY}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
