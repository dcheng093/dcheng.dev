import { useEffect, useRef, useState, type RefObject } from 'react'

/** Counts up every `ms` while `active`; holds its place while paused. For the text demos (a few DOM updates a second). */
export function useTicks(active: boolean, ms: number) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setTick((t) => t + 1), ms)
    return () => window.clearInterval(id)
  }, [active, ms])
  return tick
}

/**
 * Draws on a canvas every animation frame while `active`, sized to its box at the device's pixel ratio.
 * `draw` gets the context (in CSS pixels), the box size and the seconds it has been running (paused time excluded).
 */
export function useCanvasLoop(
  ref: RefObject<HTMLCanvasElement | null>,
  active: boolean,
  draw: (g: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void,
) {
  const drawRef = useRef(draw)
  const time = useRef(0)
  useEffect(() => {
    drawRef.current = draw
  })
  useEffect(() => {
    const canvas = ref.current
    const g = canvas?.getContext('2d')
    if (!canvas || !g) return
    let w = 0
    let h = 0
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawRef.current(g, w, h, time.current, 0)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    fit()
    if (!active) return () => ro.disconnect()
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      // A long gap (a hidden tab) shouldn't fast-forward the animation.
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      time.current += dt
      drawRef.current(g, w, h, time.current, dt)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [ref, active])
}
