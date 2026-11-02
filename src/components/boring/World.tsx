import { useEffect, useRef, useState } from 'react'
import { isReady, reportProgress } from './boot'
import { flightIndex } from './flight'
import { setPlace, usePlace, type Place } from './place'
import { adaptStep, deviceHints, pickTier, QUALITY, RATIO_STEPS } from './quality'

const canWebGL = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

// Without WebGL: a gradient per chapter in the same colours, cross-fading as you go.
const FALLBACK: Record<Place, string> = {
  intro: 'linear-gradient(#07061a, #2e2170 55%, #120e2c)',
  about: 'linear-gradient(#0b0820, #4a2a66 55%, #1a0f2a)',
  stack: 'linear-gradient(#0d0f2a, #3a3f88 55%, #141433)',
  intra: 'linear-gradient(#020208, #12102e 55%, #05040c)',
  work: 'linear-gradient(#120818, #6a2a58 55%, #1a0a1e)',
  contact: 'linear-gradient(#1a1430, #8a6aa8 55%, #2a1e40)',
}

const DIVE_SECONDS = 3.5

/**
 * The world behind the whole page: one fixed canvas with the landscape (heroScene.ts). Its camera flies one path as
 * the reader scrolls, each chapter's waypoint reached as that chapter's title comes up, and the time of day goes with
 * it; on arrival it dives down through the clouds as the intro loader lifts (boot.ts). Moving the pointer over the
 * lake ripples it. Its own renderer, never src/three/stage.ts, so possession can't reach it. It's built behind the
 * loader, which counts its progress; the still (public/boring/hero.webp) covers until the first frame. The pixel ratio
 * follows the frame rate (quality.ts); it sleeps in a hidden tab.
 */
export function World() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)
  const place = usePlace()

  // Which chapter is mid-screen (the sidebar, the bar and the fallback follow it).
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-place]')]
    if (!sections.length || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setPlace(e.target.getAttribute('data-place') as Place)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    for (const s of sections) io.observe(s)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}
    const start = async () => {
      if (!canWebGL()) return reportProgress(1)
      const [THREE, { buildHeroScene, WAYPOINTS }] = await Promise.all([import('three'), import('./heroScene')])
      const el = canvas.current
      if (cancelled || !el) return
      reportProgress(0.5)
      const tier = pickTier(deviceHints())
      const quality = QUALITY[tier]
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: tier === 'full', powerPreference: tier === 'full' ? 'high-performance' : 'low-power' })
      // The pixel ratio: as sharp as this tier allows (and the screen has), stepped down if frames run slow.
      const ceiling = Math.min(quality.maxRatio, Math.max(1, window.devicePixelRatio || 1))
      const top = RATIO_STEPS.reduce((best, r, i) => (r <= ceiling ? i : best), 0)
      let step = top
      renderer.setPixelRatio(RATIO_STEPS[step])
      const scene = new THREE.Scene()
      const { camera, update, touch } = await buildHeroScene(scene, renderer, window.innerWidth / Math.max(1, window.innerHeight), tier)
      if (cancelled) return renderer.dispose()
      reportProgress(0.8)

      // Where each waypoint is reached: as its section's top comes up past 40% of the screen (the hero's at the top).
      let anchors: number[] = []
      const measure = () => {
        const vh = window.innerHeight
        anchors = WAYPOINTS.map((id, i) => {
          const s = document.querySelector<HTMLElement>(`[data-place="${id}"]`)
          if (!s || i === 0) return 0
          return Math.max(0, s.getBoundingClientRect().top + window.scrollY - vh * 0.4)
        })
        for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1)
      }
      const fit = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false)
        camera.aspect = window.innerWidth / Math.max(1, window.innerHeight)
        camera.updateProjectionMatrix()
        measure()
      }
      fit()
      window.addEventListener('resize', fit)
      // Panels opening, fonts arriving, images loading: the page's height changes, so the anchors move.
      const grow = new ResizeObserver(measure)
      grow.observe(document.body)

      // The pointer, -1..1 across the window; the camera leans after it slowly. Over the lake, it ripples the water.
      const target = { x: 0, y: 0 }
      const pointer = { x: 0, y: 0 }
      let t = 0
      let lastRipple = 0
      const ripple = (e: PointerEvent, force: boolean) => {
        if (!force && t - lastRipple < 0.14) return
        if (touch((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, t)) lastRipple = t
      }
      const onMove = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth) * 2 - 1
        target.y = (e.clientY / window.innerHeight) * 2 - 1
        ripple(e, false)
      }
      const onDown = (e: PointerEvent) => ripple(e, true)
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })

      // The arrival's dive plays once, when the loader lifts, if the page opened at the top; else it's skipped.
      let dive = window.scrollY > window.innerHeight * 0.5 ? 1 : 0
      let index = flightIndex(anchors, window.scrollY)

      let frame = 0
      let last = performance.now()
      let first = true
      let sampleFrom = 3
      let frames = 0
      let spent = 0
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop)
        const dt = Math.min((now - last) / 1000, 0.1)
        last = now
        if (document.hidden) return
        t += dt
        pointer.x += (target.x - pointer.x) * Math.min(1, dt * 2)
        pointer.y += (target.y - pointer.y) * Math.min(1, dt * 2)
        // Lenis already smooths the scroll; a little more so the camera glides rather than tracks.
        index += (flightIndex(anchors, window.scrollY) - index) * Math.min(1, dt * 5)
        if (dive < 1 && isReady()) dive = Math.min(1, dive + dt / DIVE_SECONDS)
        update(t, { index, pointer, dive })
        renderer.render(scene, camera)
        if (first) {
          first = false
          setLive(true)
          reportProgress(1)
        }
        // Every few seconds: if frames ran slow, a step down in sharpness; if there was room, a step back up.
        if (t > sampleFrom) {
          frames++
          spent += dt
          if (spent > 1.5) {
            const next = adaptStep(step, (spent / frames) * 1000, top)
            if (next !== step) {
              step = next
              renderer.setPixelRatio(RATIO_STEPS[step])
              renderer.setSize(window.innerWidth, window.innerHeight, false)
            }
            sampleFrom = t + 5
            frames = spent = 0
          }
        }
      }
      frame = requestAnimationFrame(loop)
      if (import.meta.env.DEV) Object.assign(window, { __boringWorld: { camera, get index() { return index }, get dive() { return dive }, get ratio() { return RATIO_STEPS[step] }, tier } })

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', fit)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerdown', onDown)
        grow.disconnect()
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
    void start()
    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 transition-[background] duration-1000" style={{ background: FALLBACK[place] }}>
      <img src="/boring/hero.webp" alt="" fetchPriority="high" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${place === 'intro' && !live ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={canvas} className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`} />
      {/* A soft vignette so the giant titles always read. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050507cc_100%)]" />
    </div>
  )
}
