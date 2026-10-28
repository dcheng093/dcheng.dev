import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSfx } from '../../audio/audioContext'
import { legendary, rollLegendary, sceneFor } from '../../content/objects'
import { useStored } from '../../hooks/useLocalStorage'
import type { PageMood } from '../../lib/personality'
import { randomRoute } from '../../lib/sitemap'
import { drive, setPageMood, setPageObstacles } from '../../three/interact'
import { SIZE_PX, type ObjSpec, type WorldId } from '../../three/pageScenes'
import { pageObstacles, place } from '../../three/space'
import { ObjectWindow } from './ObjectWindow'

// Real browsers have this; jsdom (unit tests) doesn't, so the 3D code is never even downloaded there.
const canWebGL = () => typeof window !== 'undefined' && 'WebGL2RenderingContext' in window
const isPhone = () => typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 639px)').matches

/**
 * This page's 3D, layered BEHIND the content: the page's background is lifted onto a backdrop at the very
 * back, then (optionally) a TextureTown world, then the objects, then the page itself on top. Anchored objects
 * sit in the margins; drifters roam the screen. Clicking one opens its info window. Nothing on Home.
 */
export function Page3D({ crashed = false }: { crashed?: boolean }) {
  const { pathname, search } = useLocation()
  const key = crashed ? 'bsod' : pathname
  const scene = sceneFor(key)
  // A rare legendary might turn up (or be summoned with ?summon=goose).
  const guest = useMemo(() => {
    const summoned = new URLSearchParams(search).get('summon')
    return summoned ? legendary(summoned) : crashed ? undefined : rollLegendary(pathname)
  }, [pathname, search, crashed])
  const [open, setOpen] = useState<ObjSpec | null>(null)
  const [found, setFound] = useStored<Record<string, string>>('legendaries', {})
  const [phone] = useState(isPhone)

  const objects = useMemo(
    () => [...(scene?.objects ?? []), ...(guest ? [guest] : [])].filter((o) => !phone || o.role === 'drifter'),
    [scene, guest, phone],
  )
  const enabled = canWebGL() && objects.length > 0
  const { backdrop, fixedZ } = useLiftedBackground(key, enabled && !!scene && !scene.world)
  // Full-screen pages (the crash screen) sit at their own z-index above the site's floating UI; everything 3D
  // must stack just under them, or the now-transparent page would show the chat button through it.
  const layerZ = fixedZ === null ? undefined : { zIndex: fixedZ - 1 }
  const pageLayer = useRef<HTMLDivElement>(null)
  const screenLayer = useRef<HTMLDivElement>(null)
  const layout = useFreeSpaceLayout(key, enabled, objects, [pageLayer, screenLayer, backdrop])

  if (!canWebGL() || (!scene && !guest)) return null
  const onOpen = (spec: ObjSpec) => {
    setOpen(spec)
    if (spec.rarity === 'legendary' && !found[spec.id]) setFound((f) => ({ ...f, [spec.id]: new Date().toISOString() }))
  }
  // Drifters, plus any anchor that had no room in the margins at this window size.
  const drifters = layout ? objects.filter((o) => o.role === 'drifter' || layout.demoted.includes(o.id)) : []
  const driftSize = (o: ObjSpec) => Math.round(Math.min(SIZE_PX[o.size], window.innerWidth * 0.3))
  return (
    <>
      <div ref={backdrop} aria-hidden className="pointer-events-none absolute inset-0 -z-30" />
      {scene?.world && <World3D key={`${key}-world`} id={scene.world} markPage />}
      <div ref={pageLayer} aria-hidden data-testid="objects-page" className="pointer-events-none absolute inset-0 -z-10 min-h-screen overflow-hidden" style={layerZ}>
        {layout &&
          objects.map((o, i) => {
            const at = layout.anchors[o.id]
            return at ? <Obj key={`${key}-${o.id}-${at.size}`} spec={o} size={at.size} at={at} seed={i * 31 + key.length} mood={scene?.mood} onOpen={onOpen} /> : null
          })}
      </div>
      <div ref={screenLayer} aria-hidden data-testid="objects-screen" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={layerZ}>
        {drifters.map((o, i) => (
          <Obj key={`${key}-${o.id}`} spec={{ ...o, role: 'drifter' }} size={driftSize(o)} seed={i * 53 + key.length + 7} mood={scene?.mood} onOpen={onOpen} />
        ))}
      </div>
      {open && <ObjectWindow key={open.id} spec={open} onClose={() => setOpen(null)} />}
    </>
  )
}

type Layout = { anchors: Record<string, { x: number; y: number; size: number }>; demoted: string[] }

/**
 * Measures the page (every box, image, control and line of text, plus the webring) and finds each margin
 * object a spot where it's fully visible: its intended spot if that's clear, else the nearest clear spot,
 * shrinking if needed, or handing it over to drift if the margins have no room at all. Re-measures when the
 * window resizes or the page's content changes. Also hands the obstacle map to the objects' brains.
 */
function useFreeSpaceLayout(key: string, enabled: boolean, objects: ObjSpec[], own: RefObject<HTMLElement | null>[]) {
  const [layout, setLayout] = useState<Layout | null>(null)
  useEffect(() => {
    const main = document.querySelector('main')
    if (!enabled || !main) return
    const anchors = objects.filter((o) => o.role === 'anchor' && o.spot)
    let last = ''
    const measure = () => {
      const root = main.firstElementChild
      if (!root) return
      const webring = document.querySelector('nav[aria-label="Webring"]')
      const skip = own.map((r) => r.current).filter((e): e is HTMLElement => !!e)
      if (skip.includes(root as HTMLElement)) return
      const obstacles = pageObstacles([root, ...(webring ? [webring] : [])], skip)
      const mr = main.getBoundingClientRect()
      const top = mr.top + window.scrollY
      const left = mr.left + window.scrollX
      const w = document.documentElement.clientWidth
      const h = Math.max(mr.height, window.innerHeight)
      const bounds = { x: 0, y: top, w, h }
      const next: Layout = { anchors: {}, demoted: [] }
      for (const o of anchors) {
        const cx = (parseFloat(o.spot!.left) / 100) * w
        const cy = top + (parseFloat(o.spot!.top) / 100) * h
        const spot = place(cx, cy, SIZE_PX[o.size], bounds, obstacles)
        if (!spot) {
          next.demoted.push(o.id)
          continue
        }
        next.anchors[o.id] = { x: Math.round(spot.x - left), y: Math.round(spot.y - top), size: spot.w }
        obstacles.push({ x: spot.x - 6, y: spot.y - 6, w: spot.w + 12, h: spot.h + 12 }) // no stacking, drifters steer round it
      }
      setPageObstacles(obstacles)
      const json = JSON.stringify(next)
      if (json !== last) {
        last = json
        setLayout(next)
      }
    }
    let timer = 0
    const soon = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 250)
    }
    const first = requestAnimationFrame(measure)
    // Re-measure when the window resizes, the page's size changes (images loading), or its content changes.
    const ro = new ResizeObserver(soon)
    ro.observe(main)
    // Only the page itself counts (not the GIF confetti or our own layers, which change all the time).
    const mo = new MutationObserver((records) => {
      const root = main.firstElementChild
      if (records.some((r) => r.target === main || root?.contains(r.target))) soon()
    })
    mo.observe(main, { childList: true, subtree: true })
    window.addEventListener('resize', soon)
    return () => {
      cancelAnimationFrame(first)
      window.clearTimeout(timer)
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', soon)
      setPageObstacles([])
      setLayout(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `own` refs are stable; objects change with key
  }, [key, enabled, objects])
  return layout
}

/**
 * Moves the page root's own background (tile, gradient, colour) onto a backdrop behind everything and makes
 * the root transparent, so objects can float between the background and the content. Restores on leave.
 */
function useLiftedBackground(key: string, active: boolean) {
  const backdrop = useRef<HTMLDivElement>(null)
  const [fixedZ, setFixedZ] = useState<number | null>(null)
  useEffect(() => {
    const main = document.querySelector('main')
    if (!active || !main) return
    let root: HTMLElement | null = null
    let saved = ''
    const restore = () => {
      if (root) root.style.background = saved
      root = null
      if (backdrop.current) backdrop.current.removeAttribute('style')
    }
    const lift = () => {
      const first = main.firstElementChild as HTMLElement | null
      if (!first || first === root || first === backdrop.current || !backdrop.current) return
      restore()
      root = first
      saved = first.style.background
      const cs = getComputedStyle(first)
      const b = backdrop.current.style
      b.backgroundColor = cs.backgroundColor
      b.backgroundImage = cs.backgroundImage
      b.backgroundRepeat = cs.backgroundRepeat
      b.backgroundPosition = cs.backgroundPosition
      b.backgroundSize = cs.backgroundSize
      // Full-screen pages (the crash screen) are fixed, so their backdrop is too, just under their z-index.
      const fixed = cs.position === 'fixed'
      const z = fixed ? Number.parseInt(cs.zIndex, 10) || 1 : null
      b.position = fixed ? 'fixed' : 'absolute'
      if (z !== null) b.zIndex = String(z - 2)
      setFixedZ(z)
      first.style.background = 'transparent'
    }
    lift()
    // Lazy pages arrive a moment after navigation.
    const mo = new MutationObserver(lift)
    mo.observe(main, { childList: true })
    return () => {
      mo.disconnect()
      restore()
      setFixedZ(null)
    }
  }, [key, active])
  return { backdrop, fixedZ }
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

function Obj({ spec, size, at, seed, mood, onOpen }: { spec: ObjSpec; size: number; at?: { x: number; y: number }; seed: number; mood?: PageMood; onOpen: (spec: ObjSpec) => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sfx = useSfx()
  const wrap = useRef<HTMLDivElement>(null)
  const res = Math.round(size / 1.7) // chunky: each rendered pixel is ~1.7 screen pixels
  const canvas = useMount((c, three) => {
    if (!wrap.current) return null
    setPageMood(mood)
    const brain = drive(wrap.current, c, spec, size, { seed, onOpen, onSecret: () => navigate(randomRoute(pathname)), sfx })
    const stop = three.mountObject(c, spec, brain.frame)
    if (!stop) {
      brain.cleanup()
      return null
    }
    return () => {
      stop()
      brain.cleanup()
    }
  })
  return (
    <div ref={wrap} className="absolute left-0 top-0" style={at ? { left: at.x, top: at.y, width: size, height: size } : undefined}>
      <canvas
        ref={canvas}
        width={res}
        height={res}
        data-testid="object-3d"
        data-object={spec.id}
        className={`block transition-opacity duration-[180ms] ease-out [image-rendering:pixelated] ${spec.rarity === 'legendary' ? 'animate-legend' : ''}`}
        // Hidden until its brain's first frame has found it somewhere visible.
        style={{ width: size, height: size, opacity: 0 }}
      />
    </div>
  )
}

/**
 * A full-screen 3D world: a page's TextureTown backdrop (fixed behind the page), or the enter gate's dream.
 * `markPage` makes the page's own tile step aside so the world shows through; the gate doesn't need that.
 */
export function World3D({ id, markPage = false, className = 'fixed inset-0 -z-20' }: { id: WorldId | 'dream'; markPage?: boolean; className?: string }) {
  const canvas = useMount(
    (c, three) => (id === 'dream' ? three.mountDream(c) : three.mountWorld(c, id)),
    markPage ? (ok) => (ok ? document.documentElement.setAttribute('data-world', id) : document.documentElement.removeAttribute('data-world')) : undefined,
  )
  if (!canWebGL()) return null
  return <canvas ref={canvas} aria-hidden data-testid="world-3d" className={`pointer-events-none h-full w-full [image-rendering:pixelated] ${className}`} />
}
