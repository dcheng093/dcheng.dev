import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Pointer-capture dragging for a window's title bar. `onMove` gets the window's new top-left corner in px;
 * callers clamp/store it however they like. Presses on buttons inside the bar never start a drag.
 */
export function useDrag(onMove: (x: number, y: number) => void) {
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  return {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if ((e.target as HTMLElement).closest('button')) return
      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
      drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (drag.current) onMove(e.clientX - drag.current.dx, e.clientY - drag.current.dy)
    },
    onPointerUp: () => {
      drag.current = null
    },
  }
}

/** Keeps at least the title bar on screen. */
export const clampToViewport = (x: number, y: number, width: number) => ({
  x: Math.min(window.innerWidth - Math.min(width, 80), Math.max(0, x)),
  y: Math.min(window.innerHeight - 24, Math.max(0, y)),
})
