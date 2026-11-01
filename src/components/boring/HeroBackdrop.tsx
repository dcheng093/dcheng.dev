import { useEffect, useRef, useState } from 'react'

const canWebGL = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

/**
 * The hero's world: the still (public/boring/hero.webp) at once, then the same scene live (heroScene.ts) fading in
 * over it, drifting, its spheres bobbing, leaning towards the pointer. Its own small renderer, loaded only here; it
 * sleeps while the hero is off screen or the tab is hidden. No WebGL: the still stays.
 */
export function HeroBackdrop() {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}
    const start = async () => {
      if (cancelled || !canWebGL()) return
      const [THREE, { buildHeroScene }] = await Promise.all([import('three'), import('./heroScene')])
      const el = canvas.current
      const host = box.current
      if (cancelled || !el || !host) return
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      const scene = new THREE.Scene()
      const { camera, update } = buildHeroScene(scene, renderer, host.clientWidth / Math.max(1, host.clientHeight), 48)
      const fit = () => {
        const w = host.clientWidth
        const h = host.clientHeight
        renderer.setSize(w, h, false)
        camera.aspect = w / Math.max(1, h)
        camera.updateProjectionMatrix()
      }
      fit()
      const ro = new ResizeObserver(fit)
      ro.observe(host)

      // The pointer, -1..1 across the window; the camera follows it slowly.
      const target = { x: 0, y: 0 }
      const pointer = { x: 0, y: 0 }
      const onMove = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth) * 2 - 1
        target.y = (e.clientY / window.innerHeight) * 2 - 1
      }
      window.addEventListener('pointermove', onMove, { passive: true })

      let onScreen = true
      const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting))
      io.observe(host)

      let frame = 0
      let last = performance.now()
      let t = 0
      let first = true
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop)
        const dt = Math.min((now - last) / 1000, 0.1)
        last = now
        if (!onScreen || document.hidden) return
        t += dt
        pointer.x += (target.x - pointer.x) * Math.min(1, dt * 2)
        pointer.y += (target.y - pointer.y) * Math.min(1, dt * 2)
        update(t, pointer)
        renderer.render(scene, camera)
        if (first) {
          first = false
          setLive(true)
        }
      }
      frame = requestAnimationFrame(loop)

      cleanup = () => {
        cancelAnimationFrame(frame)
        ro.disconnect()
        io.disconnect()
        window.removeEventListener('pointermove', onMove)
        scene.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>
          mesh.geometry?.dispose()
          const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
          for (const m of mats) {
            ;(m as InstanceType<typeof THREE.MeshBasicMaterial>).map?.dispose()
            m.dispose()
          }
        })
        scene.environment?.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
      }
    }
    // Only once the hero's intro has played (building the scene stalls the page for a moment, which would stutter the
    // paint swipes and the writing), then at the next idle moment. The still covers the wait.
    let idle = 0
    const wait = window.setTimeout(() => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(() => void start(), { timeout: 1500 }) : window.setTimeout(() => void start(), 0)
    }, 2600)
    return () => {
      cancelled = true
      window.clearTimeout(wait)
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      cleanup()
    }
  }, [])

  return (
    <div ref={box} aria-hidden className="absolute inset-0 -z-20">
      <img src="/boring/hero.webp" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      <canvas ref={canvas} className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}
