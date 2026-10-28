import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { sceneFor, type SpinnerSpec, type WorldId } from '../../three/pageScenes'

// Real browsers have this; jsdom (unit tests) doesn't, so the 3D code is never even downloaded there.
const canWebGL = () => typeof window !== 'undefined' && 'WebGL2RenderingContext' in window

/** This page's 3D: maybe a TextureTown world behind everything, plus spinning objects. Nothing on Home. */
export function Page3D() {
  const { pathname } = useLocation()
  const scene = sceneFor(pathname)
  if (!scene || !canWebGL()) return null
  return (
    <>
      {scene.world && <World3D key={`${pathname}-world`} id={scene.world} markPage />}
      {/* Clipped layer: a spinner near the edge can't make the page scroll sideways. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {scene.spinners.map((s, i) => (
          <Spinner key={`${pathname}-${i}`} spec={s} seed={i * 31 + pathname.length} />
        ))}
      </div>
    </>
  )
}

function useMount(mount: (canvas: HTMLCanvasElement, three: typeof import('../../three/mount')) => (() => void) | null, onMounted?: (ok: boolean) => void) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let cleanup: (() => void) | null = null
    let cancelled = false
    void import('../../three/mount').then((three) => {
      if (cancelled || !canvas.current) return
      cleanup = mount(canvas.current, three)
      onMounted?.(!!cleanup)
    })
    return () => {
      cancelled = true
      cleanup?.()
      onMounted?.(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mounts once per element; keys handle page changes
  }, [])
  return canvas
}

function Spinner({ spec, seed }: { spec: SpinnerSpec; seed: number }) {
  const size = spec.size ?? 110
  const res = Math.round(size / 1.7) // chunky: each rendered pixel is ~1.7 screen pixels
  const canvas = useMount((c, three) => three.mountSpinner(c, spec, seed))
  return (
    <canvas
      ref={canvas}
      width={res}
      height={res}
      aria-hidden
      data-testid="spinner-3d"
      className="absolute -translate-x-1/2 [image-rendering:pixelated]"
      style={{ top: spec.top, left: spec.left, width: `min(${size}px, 22vw)`, height: `min(${size}px, 22vw)` }}
    />
  )
}

/**
 * A full-screen 3D world: a page's TextureTown backdrop (fixed behind the page), or the enter gate's dream.
 * `markPage` makes the page's own tile step aside so the world shows through; the gate doesn't need that.
 */
export function World3D({ id, markPage = false, className = 'fixed inset-0 -z-10' }: { id: WorldId | 'dream'; markPage?: boolean; className?: string }) {
  const canvas = useMount(
    (c, three) => (id === 'dream' ? three.mountDream(c) : three.mountWorld(c, id)),
    markPage ? (ok) => (ok ? document.documentElement.setAttribute('data-world', id) : document.documentElement.removeAttribute('data-world')) : undefined,
  )
  if (!canWebGL()) return null
  return <canvas ref={canvas} aria-hidden data-testid="world-3d" className={`pointer-events-none h-full w-full [image-rendering:pixelated] ${className}`} />
}
