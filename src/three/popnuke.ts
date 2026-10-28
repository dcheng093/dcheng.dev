import * as THREE from 'three'
import { mulberry32 } from '../lib/random'
import { buildShape } from './shapes'
import { disposeScene, register } from './stage'

/**
 * POPNUKE's product demo, driven by scrolling (progress 0 → 1), so scrolling back up rewinds it.
 *   0 – 0.6  pop-up windows fly in from all sides at the spinning emblem and shatter on impact
 *   0.6 – 1  the camera swings over to the retail box; the lid flips open and the product rises out, glowing
 * Quarter-resolution and on the shared renderer, like every other 3D thing on the site.
 */
const PANES = 10
const SCRUB_S = 0.12
const SHARDS = 6

// The emblem sits well behind where the pop-ups shatter: it spins, so its ring sweeps a whole depth range, and a
// pane flying into that range would cut straight through it. Scaled up so it looks the same size from the camera
// (which starts 9 units away; the emblem is now 12).
const EMBLEM_Z = -3
const EMBLEM_SCALE = 2
const EMBLEM_RADIUS = 1.07 // nukeLogo's outer ring (shapes.ts), unscaled
const IMPACT = new THREE.Vector3(0, 0, 0.6)
/** How far in front of the spinning emblem's nearest reach the pop-ups shatter (world units). */
export const EMBLEM_CLEARANCE = IMPACT.z - (EMBLEM_Z + EMBLEM_RADIUS * EMBLEM_SCALE)

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smooth = (x: number) => x * x * (3 - 2 * x)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function mountPopnukeHero(canvas: HTMLCanvasElement, progress: () => number) {
  const rng = mulberry32(3000)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0c0018)
  scene.add(new THREE.AmbientLight(0xffffff, 1.2))
  const key = new THREE.DirectionalLight(0xfff0c0, 1.6)
  key.position.set(3, 4, 6)
  scene.add(key)

  // Stars, for that late-90s "technology" feeling.
  const starPos = new Float32Array(400 * 3)
  for (let i = 0; i < 400; i++) starPos.set([(rng() - 0.5) * 60, (rng() - 0.5) * 40, -10 - rng() * 30], i * 3)
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 })))

  const emblem = buildShape('nukeLogo')
  emblem.position.z = EMBLEM_Z
  emblem.scale.setScalar(EMBLEM_SCALE)
  scene.add(emblem)

  // The incoming pop-ups: each has a start point, an impact moment, and a set of shards for afterwards.
  const panes = Array.from({ length: PANES }, (_, i) => {
    const a = (i / PANES) * Math.PI * 2 + rng() * 0.4
    const from = new THREE.Vector3(Math.cos(a) * 11, Math.sin(a) * 7, -2 + rng() * 4)
    const hit = 0.06 + (i / PANES) * 0.48 // staggered impacts across 0–0.6
    const pane = buildShape('popupPane', undefined, { photo: i })
    pane.scale.setScalar(0.9)
    scene.add(pane)
    const shards = Array.from({ length: SHARDS }, () => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.03), new THREE.MeshLambertMaterial({ color: rng() > 0.5 ? 0xc0c0c0 : 0x1084d0, transparent: true }))
      // Outwards and towards the viewer, never back into the emblem.
      const dir = new THREE.Vector3(rng() - 0.5, rng() - 0.5, 0.1 + rng() * 0.7).normalize()
      scene.add(s)
      return { s, dir, spin: new THREE.Vector3(rng() * 8, rng() * 8, rng() * 8) }
    })
    return { pane, from, hit, shards }
  })

  // The retail box, off to the right, with a lid hinged at its back edge.
  const boxGroup = new THREE.Group()
  boxGroup.position.set(5, -0.4, 0)
  const body = buildShape('softwareBox')
  boxGroup.add(body)
  const hinge = new THREE.Group()
  hinge.position.set(0, 0.875, -0.225)
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.06, 0.47), new THREE.MeshLambertMaterial({ color: 0x1a0033 }))
  lid.position.set(0, 0.03, 0.225)
  hinge.add(lid)
  boxGroup.add(hinge)
  const prize = buildShape('nukeLogo')
  prize.scale.setScalar(0.32)
  boxGroup.add(prize)
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softGlow(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }))
  glow.scale.set(2.4, 2.4, 1)
  boxGroup.add(glow)
  scene.add(boxGroup)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  const resize = () => {
    // A quarter of the canvas's on-screen pixels, scaled up pixelated by CSS.
    const w = Math.max(160, Math.min(400, Math.round(canvas.clientWidth / 4)))
    canvas.width = w
    canvas.height = Math.max(90, Math.round((w * canvas.clientHeight) / Math.max(1, canvas.clientWidth)))
    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const look = new THREE.Vector3()
  // The demo eases after the scroll position rather than jumping with it (one wheel notch is a big jump):
  // a short exponential follow, like GSAP's `scrub`.
  let p = clamp01(progress())
  const stop = register({
    scene,
    camera,
    target: canvas,
    visible: true,
    update: (t, dt) => {
      p += (clamp01(progress()) - p) * (1 - Math.exp(-dt / SCRUB_S))
      emblem.rotation.set(Math.sin(t * 0.7) * 0.25, t * 0.9, 0)

      for (const { pane, from, hit, shards } of panes) {
        const fly = clamp01(p / hit) // 0 → 1 as it approaches
        const after = clamp01((p - hit) / 0.12) // 0 → 1 as its shards fly off
        pane.visible = p < hit
        pane.position.copy(from).lerp(IMPACT, smooth(fly))
        pane.rotation.set(Math.sin(t + hit * 9) * 0.3, (1 - fly) * 2, Math.sin(t * 1.3 + hit) * 0.2)
        for (const { s, dir, spin } of shards) {
          s.visible = p >= hit && after < 1
          s.position.copy(dir).multiplyScalar(0.6 + after * 5).add(IMPACT)
          s.rotation.set(spin.x * after, spin.y * after, spin.z * after)
          ;(s.material as THREE.MeshLambertMaterial).opacity = 1 - after
        }
      }

      // The reveal.
      const swing = smooth(clamp01((p - 0.6) / 0.2))
      const open = smooth(clamp01((p - 0.78) / 0.15))
      hinge.rotation.x = -open * 1.9
      boxGroup.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.15 + swing * 0.3
      prize.position.y = 0.2 + open * 1.4
      prize.rotation.y = t * 2
      prize.visible = open > 0.02
      glow.position.y = 0.6 + open * 0.8
      glow.material.opacity = open * 0.85

      camera.position.set(lerp(0, 6.8, swing), lerp(0.3, 1.6, swing), lerp(9, 4.6, swing))
      look.set(lerp(0, 5, swing), lerp(0, 0.4, swing), 0)
      camera.lookAt(look)
    },
  })
  if (!stop) {
    ro.disconnect()
    disposeScene(scene)
    return null
  }
  return () => {
    stop()
    ro.disconnect()
    disposeScene(scene)
  }
}

/** A soft round glow (a sprite with no texture would be a hard-edged square). */
function softGlow() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,240,150,1)')
  grad.addColorStop(0.4, 'rgba(255,210,60,0.5)')
  grad.addColorStop(1, 'rgba(255,200,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}
