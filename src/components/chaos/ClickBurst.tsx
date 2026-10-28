import { useEffect, useRef } from 'react'
import { PARTICLES, burstAt } from '../../lib/burst'
import { chaosScale } from '../../lib/settings'
import { useSettings } from '../settings/settingsState'

/** A little sparkle burst wherever a link or button is pressed. DOM nodes, no re-renders, like CursorTrail. */
export function ClickBurst() {
  const root = useRef<HTMLDivElement>(null)
  const scale = chaosScale(useSettings().settings.chaos).burst
  useEffect(() => {
    const host = root.current
    if (!host) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('a,button,[role="button"]')) return
      burstAt(e.clientX, e.clientY, host, Math.max(2, Math.round(PARTICLES * scale)), Math.sqrt(scale))
    }
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      host.replaceChildren()
    }
  }, [scale])
  return <div ref={root} aria-hidden />
}
