import * as THREE from 'three'
import { mulberry32 } from '../lib/random'
import { TEXTURES, type SpinnerSpec, type TextureId, type WorldId } from './pageScenes'
import { buildShape } from './shapes'
import { disposeScene, fitWorld, register, texture } from './stage'

// Everything three.js-heavy is reached through this module, which pages load with import() so three.js
// only downloads where there's 3D.

const POOL = Object.keys(TEXTURES) as TextureId[]

function lit(scene: THREE.Scene, ambient = 1.1, sun = 1.6) {
  scene.add(new THREE.AmbientLight(0xffffff, ambient))
  const light = new THREE.DirectionalLight(0xffffff, sun)
  light.position.set(2, 3, 4)
  scene.add(light)
}

/** A spinning, bobbing object in its own little canvas. Returns cleanup, or null without WebGL. */
export function mountSpinner(canvas: HTMLCanvasElement, spec: SpinnerSpec, seed: number) {
  const scene = new THREE.Scene()
  lit(scene)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20)
  camera.position.z = 3.6
  const tex = spec.texture ?? POOL[Math.floor(mulberry32(seed)() * POOL.length)]
  const obj = buildShape(spec.shape, tex)
  scene.add(obj)
  const phase = seed % 7
  const stop = register({
    scene,
    camera,
    target: canvas,
    visible: true,
    update: (t) => {
      obj.rotation.y = t * 1.1 + phase
      obj.rotation.x = Math.sin(t * 0.7 + phase) * 0.5
      obj.position.y = Math.sin(t * 1.6 + phase) * 0.08
    },
  })
  if (!stop) {
    disposeScene(scene)
    return null
  }
  return () => {
    stop()
    disposeScene(scene)
  }
}

type World = { sky: number; fog: number; textures: TextureId[]; centre: Parameters<typeof buildShape>[0] }

const WORLDS: Record<WorldId, World> = {
  mystic: { sky: 0x1a0630, fog: 0x2a0a4a, textures: ['blobs', 'orbs', 'nebula', 'marble'], centre: 'crystal' },
  neon: { sky: 0x05001c, fog: 0x14003c, textures: ['streaks', 'carpet', 'triangles', 'lava', 'swirls'], centre: 'coin' },
  glitch: { sky: 0x160000, fog: 0x340000, textures: ['streaks', 'binary', 'static', 'steel', 'lightning'], centre: 'knot' },
}

const PROPS: ((rng: () => number) => THREE.BufferGeometry)[] = [
  (r) => new THREE.BoxGeometry(1 + r(), 2 + r() * 4, 1 + r()),
  (r) => new THREE.CylinderGeometry(0.6 + r() * 0.5, 0.8 + r() * 0.5, 2 + r() * 3, 10),
  () => new THREE.SphereGeometry(1, 12, 8),
  () => new THREE.ConeGeometry(1, 2.4, 8),
  () => new THREE.TorusGeometry(1, 0.35, 8, 18),
  () => new THREE.TorusKnotGeometry(0.8, 0.28, 60, 8),
  () => new THREE.IcosahedronGeometry(1.1, 0),
]

/**
 * A TextureTown-style world behind the page: a fogged ring of chunky primitives, each skinned with a random
 * texture, around a giant centrepiece, with the camera slowly orbiting. Rendered at a quarter resolution.
 */
export function mountWorld(canvas: HTMLCanvasElement, id: WorldId) {
  const w = WORLDS[id]
  const rng = mulberry32(id.length * 9973)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(w.sky)
  scene.fog = new THREE.Fog(w.fog, 6, 34)
  lit(scene, 1.2, 1.4)
  const pick = () => w.textures[Math.floor(rng() * w.textures.length)]
  const mat = () => new THREE.MeshLambertMaterial({ map: texture(TEXTURES[pick()]) })

  const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 24), new THREE.MeshLambertMaterial({ map: texture(TEXTURES[pick()], 14) }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.4
  scene.add(ground)

  const centre = buildShape(w.centre, pick())
  centre.scale.setScalar(2.4)
  centre.position.y = 1.2
  scene.add(centre)

  const floaters: { o: THREE.Object3D; phase: number; base: number }[] = []
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rng() * 0.3
    const r = 5 + rng() * 6 // inside the camera's orbit, so nothing ever fills the lens
    const m = new THREE.Mesh(PROPS[Math.floor(rng() * PROPS.length)](rng), mat())
    const floats = rng() > 0.55
    const base = floats ? 1.5 + rng() * 3 : -0.2 // standing props sink a little into the ground
    m.position.set(Math.cos(a) * r, base, Math.sin(a) * r)
    m.rotation.y = rng() * Math.PI
    scene.add(m)
    if (floats) floaters.push({ o: m, phase: rng() * 6, base })
  }

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 80)
  const resize = () => fitWorld(canvas, camera)
  resize()
  window.addEventListener('resize', resize)

  const stop = register({
    scene,
    camera,
    target: canvas,
    visible: true,
    update: (t) => {
      const angle = t * 0.05
      camera.position.set(Math.cos(angle) * 14, 3.2, Math.sin(angle) * 14)
      camera.lookAt(0, 1, 0)
      centre.rotation.y = t * 0.4
      for (const f of floaters) {
        f.o.position.y = f.base + Math.sin(t * 0.8 + f.phase) * 0.4
        f.o.rotation.y += 0.004
      }
    },
  })
  if (!stop) {
    window.removeEventListener('resize', resize)
    disposeScene(scene)
    return null
  }
  return () => {
    stop()
    window.removeEventListener('resize', resize)
    disposeScene(scene)
  }
}


export { mountDream } from './dream'
