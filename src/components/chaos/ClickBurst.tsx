import { useEffect, useRef } from 'react'
import { burstAt } from '../../lib/burst'

/** A little sparkle burst wherever a link or button is pressed. DOM nodes, no re-renders, like CursorTrail. */
export function ClickBurst() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = root.current
    if (!host) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('a,button,[role="button"]')) return
      burstAt(e.clientX, e.clientY, host)
    }
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      host.replaceChildren()
    }
  }, [])
  return <div ref={root} aria-hidden />
}
