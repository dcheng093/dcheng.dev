import { useEffect, useRef, useState, type AnimationEvent } from 'react'

const FALLBACK_MS = 300

/**
 * A window that eases shut (animate-pop-out) before it's really closed. `onDone` runs when the closing animation
 * ends, or after a short fallback where animations don't run (jsdom), whichever comes first, and only once.
 */
export function useClosing(onDone: (() => void) | undefined) {
  const [closing, setClosing] = useState(false)
  const done = useRef(false)
  const latest = useRef(onDone)
  useEffect(() => {
    latest.current = onDone
  })
  const finish = () => {
    if (done.current) return
    done.current = true
    latest.current?.()
  }
  useEffect(() => {
    if (!closing) return
    const t = window.setTimeout(finish, FALLBACK_MS)
    return () => window.clearTimeout(t)
  }, [closing])
  return {
    closing,
    close: () => setClosing(true),
    /** Spread onto the window: only its own pop-out counts, not animations bubbling up from inside it. */
    onAnimationEnd: (e: AnimationEvent) => {
      if (closing && e.target === e.currentTarget) finish()
    },
  }
}
