import * as THREE from 'three'
import { mulberry32 } from '../lib/random'
import type { Pose } from './interact'
import { TEXTURES, type ObjSpec, type TextureId, type WorldId } from './pageScenes'
import { buildShape } from './shapes'
import { disposeScene, fitWorld, register, texture } from './stage'
import { mountCustomWorld } from './worlds'

// Everything three.js-heavy is reached through this module, which pages load with import() so three.js
// only downloads where there's 3D.

export function lit(scene: THREE.Scene, ambient = 1.1, sun = 1.6) {
  scene.add(new THREE.AmbientLight(0xffffff, ambient))
  const light = new THREE.DirectionalLight(0xffffff, sun)
  light.position.set(2, 3, 4)
  scene.add(light)
}

/** A soft additive glow disc, for legendaries. */
function halo() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 4, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,230,140,0.9)')
  grad.addColorStop(1, 'rgba(255,200,60,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
  sprite.scale.set(2.4, 2.4, 1)
  sprite.material.opacity = 0.7
  sprite.position.z = -0.8
  return sprite
}

function objectScene(spec: ObjSpec) {
  const scene = new THREE.Scene()
  lit(scene)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20)
  camera.position.z = 3.6
  const obj = buildShape(spec.shape, spec.tex, { text: spec.text, photo: spec.photo })
  const pivot = new THREE.Group().add(obj)
  scene.add(pivot)
  if (spec.rarity === 'legendary') scene.add(halo())
  // Some shapes animate a part of themselves (Planet Daniel's moon).
  const orbits: THREE.Object3D[] = []
  obj.traverse((o) => o.userData.orbit && orbits.push(o))
  return { scene, camera, pivot, orbits }
}

/**
 * A page object: the model is posed every frame by its behaviour driver (src/three/interact.ts).
 * Returns cleanup, or null without WebGL.
 */
export function mountObject(canvas: HTMLCanvasElement, spec: ObjSpec, frame: (t: number, dt: number) => Pose) {
  const { scene, camera, pivot, orbits } = objectScene(spec)
  const stop = register({
    scene,
    camera,
    target: canvas,
    visible: true,
    update: (t, dt) => {
      const p = frame(t, dt)
      // Crashed objects (the BSOD) don't turn at all; everyone else spins, tilts and flips with their mood.
      const spin = p.frozen ? 0.6 : p.spin
      pivot.rotation.set(Math.sin(spin * 0.6) * 0.35 + p.pitch + p.flip, spin + p.yaw, 0)
      pivot.position.y = p.frozen ? 0 : Math.sin(t * 1.6 + spec.id.length) * 0.07
      for (const o of orbits) o.rotation.y = t * 0.9
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

/** The info window's big view: drag to turn it, otherwise it slowly turns by itself. */
export function mountViewer(canvas: HTMLCanvasElement, spec: ObjSpec, drag: () => { yaw: number; pitch: number; active: boolean }) {
  const { scene, camera, pivot, orbits } = objectScene(spec)
  let auto = 0
  const stop = register({
    scene,
    camera,
    target: canvas,
    visible: true,
    update: (t, dt) => {
      const d = drag()
      if (!d.active) auto += dt * 0.6
      pivot.rotation.set(d.pitch, d.yaw + auto, 0)
      for (const o of orbits) o.rotation.y = t * 0.9
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

const WORLDS: Record<'mystic' | 'neon' | 'glitch', World> = {
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
  if (id === 'meadow' || id === 'painted' || id === 'space') return mountCustomWorld(canvas, id)
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

