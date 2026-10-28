import * as THREE from 'three'

/**
 * Every 3D thing on a page shares ONE WebGL renderer (browsers allow only a handful of contexts, and each costs
 * memory). Each view renders at a deliberately low resolution into a corner of that renderer, then gets copied
 * into its own little 2D canvas, which CSS scales up pixelated: cheap, and it looks like an old 3D GIF.
 */
export type View = {
  scene: THREE.Scene
  camera: THREE.Camera
  /** The on-page canvas; its width/height attributes are the render resolution. */
  target: HTMLCanvasElement
  update?: (seconds: number, dt: number) => void
  visible: boolean
}

const FRAME_MS = 1000 / 30

let renderer: THREE.WebGLRenderer | null | undefined
const views = new Set<View>()
const ctx2d = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>()
let raf = 0
let last = 0

/** Null when WebGL isn't available; never throws or logs. */
function getRenderer() {
  if (renderer !== undefined) return renderer
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, powerPreference: 'low-power' })
  renderer = gl ? new THREE.WebGLRenderer({ canvas, context: gl, antialias: false, alpha: true }) : null
  if (renderer) {
    renderer.setPixelRatio(1)
    renderer.setScissorTest(true)
    renderer.outputColorSpace = THREE.SRGBColorSpace
  }
  return renderer
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  if (document.hidden || now - last < FRAME_MS) return
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
  last = now
  const r = renderer
  if (!r) return
  // Grow the shared canvas to fit the largest visible view; views render bottom-left and are copied out.
  let w = 1
  let h = 1
  for (const v of views) {
    if (!v.visible) continue
    w = Math.max(w, v.target.width)
    h = Math.max(h, v.target.height)
  }
  const size = r.getSize(new THREE.Vector2())
  if (size.x < w || size.y < h) r.setSize(Math.max(size.x, w), Math.max(size.y, h), false)
  const fullH = r.domElement.height
  for (const v of views) {
    if (!v.visible) continue
    const { width, height } = v.target
    v.update?.(now / 1000, dt)
    r.setViewport(0, 0, width, height)
    r.setScissor(0, 0, width, height)
    r.setClearColor(0x000000, 0)
    r.clear()
    r.render(v.scene, v.camera)
    let c = ctx2d.get(v.target)
    if (!c) {
      c = v.target.getContext('2d')!
      c.imageSmoothingEnabled = false
      ctx2d.set(v.target, c)
    }
    c.clearRect(0, 0, width, height)
    c.drawImage(r.domElement, 0, fullH - height, width, height, 0, 0, width, height)
  }
}

/**
 * Sizes a full-screen world canvas: a quarter of the screen's width, but never more than 360 pixels across,
 * so a big monitor doesn't cost more than a laptop. CSS scales it back up, pixelated.
 */
export function fitWorld(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera) {
  const w = Math.max(120, Math.min(360, Math.round(window.innerWidth / 4)))
  canvas.width = w
  canvas.height = Math.max(90, Math.round((w * window.innerHeight) / window.innerWidth))
  camera.aspect = canvas.width / canvas.height
  camera.updateProjectionMatrix()
}

/** Adds a view to the shared loop. Returns an unregister function, or null if there's no WebGL. */
export function register(view: View): (() => void) | null {
  if (!getRenderer()) return null
  views.add(view)
  // Only draw what's on screen.
  const io = new IntersectionObserver(([e]) => (view.visible = e.isIntersecting), { rootMargin: '100px' })
  io.observe(view.target)
  if (!raf) {
    last = 0
    raf = requestAnimationFrame(frame)
  }
  return () => {
    io.disconnect()
    views.delete(view)
    if (views.size === 0) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

const loader = new THREE.TextureLoader()
const textures = new Map<string, THREE.Texture>()

/** Tiled, nearest-neighbour textures (crunchy on purpose), shared and cached by URL. */
export function texture(url: string, repeat = 1) {
  const key = `${url}|${repeat}`
  let t = textures.get(key)
  if (!t) {
    t = loader.load(url)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.magFilter = THREE.NearestFilter
    t.minFilter = THREE.NearestMipmapNearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    t.repeat.set(repeat, repeat)
    textures.set(key, t)
  }
  return t
}

/** Frees a scene's geometries and materials (textures are shared and cached, so they stay). */
export function disposeScene(scene: THREE.Object3D) {
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh
    mesh.geometry?.dispose()
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    for (const m of mats) {
      // Canvas-drawn textures (dice pips, CD shine) belong to one mesh; GIF textures are shared.
      const map = (m as THREE.MeshLambertMaterial).map
      if (map instanceof THREE.CanvasTexture) map.dispose()
      m.dispose()
    }
  })
}
