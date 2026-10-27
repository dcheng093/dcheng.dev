import { useEffect, useRef } from 'react'

/** Calls `fn` repeatedly with a fresh random delay in [minMs, maxMs] each time. Pass null to pause. */
export function useRandomInterval(fn: () => void, minMs: number | null, maxMs: number | null) {
  const saved = useRef(fn)
  useEffect(() => {
    saved.current = fn
  })
  useEffect(() => {
    if (minMs == null || maxMs == null) return
    let id: number
    const tick = () => {
      id = window.setTimeout(() => {
        saved.current()
        tick()
      }, minMs + Math.random() * (maxMs - minMs))
    }
    tick()
    return () => window.clearTimeout(id)
  }, [minMs, maxMs])
}
