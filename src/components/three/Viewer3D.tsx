import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { ObjSpec } from '../../three/pageScenes'
import { loadThree } from '../../lib/loadThree'

/** A live 3D view of one object that you can drag to turn (it slowly turns by itself otherwise). */
export function Viewer3D({ spec, size, res = 150, className = '', onClick }: { spec: ObjSpec; size: string; res?: number; className?: string; onClick?: () => void }) {
  const view = useRef<HTMLCanvasElement>(null)
  const turn = useRef({ yaw: 0, pitch: 0, active: false, lastX: 0, lastY: 0, moved: 0 })

  useEffect(() => {
    let cleanup: (() => void) | null = null
    let cancelled = false
    void loadThree().then((three) => {
      if (cancelled || !view.current) return
      cleanup = three.mountViewer(view.current, spec, () => turn.current)
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [spec])

  const down = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    Object.assign(turn.current, { active: true, lastX: e.clientX, lastY: e.clientY, moved: 0 })
  }
  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const t = turn.current
    if (!t.active) return
    t.yaw += (e.clientX - t.lastX) * 0.012
    t.pitch = Math.max(-1.2, Math.min(1.2, t.pitch + (e.clientY - t.lastY) * 0.012))
    t.moved += Math.abs(e.clientX - t.lastX) + Math.abs(e.clientY - t.lastY)
    t.lastX = e.clientX
    t.lastY = e.clientY
  }
  const up = () => {
    const t = turn.current
    t.active = false
    if (t.moved < 4) onClick?.() // a tap, not a drag
  }

  return (
    <canvas
      ref={view}
      width={res}
      height={res}
      aria-label={`3D view of ${spec.name}. Drag to turn it.`}
      data-testid="object-viewer"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      className={`aspect-square shrink-0 cursor-grab touch-none [image-rendering:pixelated] active:cursor-grabbing ${className}`}
      style={{ width: size }}
    />
  )
}
