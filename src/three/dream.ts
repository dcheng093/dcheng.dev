import * as THREE from 'three'
import { mulberry32 } from '../lib/random'
import { DREAM_TEXTURES as T } from './pageScenes'
import { disposeScene, fitWorld, register, texture } from './stage'

/**
 * The enter gate's dream, de Chirico by way of GeoCities: an avenue of drowned columns runs across a twilight
 * sea towards a giant ghost David on the horizon, haloed by a lightning ring, while a CD sets into the water.
 * Palazzo facades, gold islands, iridescent orbs and upside-down pyramids float overhead; motes rise.
 * The camera drifts gently down the avenue (no orbit), so the title always sits in open sky. Nothing flashes.
 */
export function mountDream(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene()
  const { drifting, water } = buildDream(scene)
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 140)
  const resize = () => fitWorld(canvas, camera)
  resize()
  window.addEventListener('resize', resize)

  const stop = register({
    scene,
    camera,
    target: canvas,
    visible: true,
    update: (t) => {
      // Drifting, not orbiting: a slow sway down the avenue, gazing up at David.
      camera.position.set(Math.sin(t * 0.05) * 3, 3.5 + Math.sin(t * 0.13) * 0.6, 22 + Math.sin(t * 0.03) * 3)
      camera.lookAt(Math.sin(t * 0.04) * 1.5, 9, -30)
      for (const f of drifting) f(t)
    },
  })
  if (!stop) {
    window.removeEventListener('resize', resize)
    water.dispose()
    disposeScene(scene)
    return null
  }
  return () => {
    stop()
    window.removeEventListener('resize', resize)
    water.dispose()
    ;(scene.background as THREE.Texture).dispose()
    disposeScene(scene)
  }
}

/**
 * Fills a scene with the dream. Returns what moves (call each with the time in seconds) and the sea's own texture,
 * for the caller to dispose. Used by the enter gate (above) and by the link preview's renderer (scripts/og).
 */
export function buildDream(scene: THREE.Scene) {
  const rng = mulberry32(42)
  scene.background = skyGradient()
  scene.fog = new THREE.Fog(0xd9a6d6, 14, 70)
  scene.add(new THREE.AmbientLight(0xffe6ff, 1.3))
  const moon = new THREE.DirectionalLight(0xffd6f0, 1.4)
  moon.position.set(-4, 8, 6)
  scene.add(moon)

  const lambert = (url: string, repeat = 1, extra: THREE.MeshLambertMaterialParameters = {}) =>
    new THREE.MeshLambertMaterial({ map: texture(url, repeat), ...extra })
  // Black-background pictures (David, the x-ray, lightning) glow when added rather than painted.
  const ghost = (url: string, opacity = 1) =>
    new THREE.MeshBasicMaterial({ map: texture(url), blending: THREE.AdditiveBlending, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, fog: false })
  const drifting: ((t: number) => void)[] = []

  // The sea: its own texture instance, so scrolling it doesn't move the shared cached one.
  const water = new THREE.TextureLoader().load(T.ocean)
  water.wrapS = water.wrapT = THREE.RepeatWrapping
  water.repeat.set(16, 16)
  water.magFilter = THREE.NearestFilter
  water.colorSpace = THREE.SRGBColorSpace
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({ map: water, color: 0xe8c8ff }))
  sea.rotation.x = -Math.PI / 2
  scene.add(sea)
  drifting.push((t) => water.offset.set(t * 0.01, t * 0.006))

  // Giant ghost David looming on the horizon, glowing out of his black background. Off to the left: the
  // middle of the view belongs to the gate's title and button.
  const DAVID_X = -11
  const david = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture(T.david), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }))
  david.scale.set(34, 34, 1)
  scene.add(david)
  drifting.push((t) => david.position.set(DAVID_X, 14 + Math.sin(t * 0.35) * 0.8, -42))

  // His halo: a slowly turning ring of lightning.
  const halo = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.3, 10, 48), ghost(T.lightning, 0.9))
  scene.add(halo)
  drifting.push((t) => {
    halo.position.set(DAVID_X + 0.6, 26.5 + Math.sin(t * 0.35) * 0.8, -41)
    halo.rotation.set(Math.PI / 2.4 + Math.sin(t * 0.2) * 0.1, 0, t * 0.2)
  })

  // A CD for a setting sun, half sunk into the sea off to the right.
  const sun = new THREE.Mesh(new THREE.RingGeometry(1.4, 11, 64), new THREE.MeshBasicMaterial({ map: texture(T.cd), side: THREE.DoubleSide, fog: false }))
  sun.position.set(34, 3, -60)
  sun.lookAt(0, 3, 20)
  scene.add(sun)
  drifting.push(() => sun.rotateZ(0.002))

  // An avenue of drowned columns, two rows receding into the fog towards David.
  const stone = [T.stoneWall, T.stones, T.crackedStone]
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1
    const z = 10 - Math.floor(i / 2) * 7
    const h = rng() > 0.3 ? 8 + rng() * 2 : 2.5 + rng() * 3 // a few snapped off
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, h, 12), lambert(stone[i % 3], 1))
    col.position.set(side * (6.5 + rng()), h / 2 - 0.5, z)
    col.rotation.z = (rng() - 0.5) * 0.08 // not quite upright, like in a dream
    scene.add(col)
    if (h > 8) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), lambert(stone[(i + 1) % 3]))
      cap.position.set(col.position.x, h - 0.3, col.position.z)
      scene.add(cap)
    }
  }

  // Half-remembered buildings drifting in the sky, off to the sides.
  for (const [url, x, y, z, tilt] of [
    [T.palazzo, -17, 10, -14, 0.25],
    [T.warehouse, 18, 12, -10, -0.3],
    [T.palazzo, -11, 16, -30, 0.15],
  ] as const) {
    const facade = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 6), new THREE.MeshLambertMaterial({ map: texture(url), side: THREE.DoubleSide, transparent: true, opacity: 0.92 }))
    facade.position.set(x, y, z)
    facade.rotation.z = tilt
    scene.add(facade)
    const phase = rng() * 6
    drifting.push((t) => {
      facade.position.y = y + Math.sin(t * 0.3 + phase) * 0.8
      facade.rotation.y = Math.sin(t * 0.1 + phase) * 0.6
    })
  }

  // Floating gold islands, each with a column stub, flanking the avenue.
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 ? 1 : -1) * (12 + rng() * 4)
    const z = -4 - i * 7
    const y = 5 + rng() * 5
    const island = new THREE.Group()
    const rock = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.6, 7), lambert(i % 2 ? T.gold : T.goldTopo))
    rock.rotation.x = Math.PI // point down
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.4, 8), lambert(T.stoneWall))
    stub.position.y = 2
    island.add(rock, stub)
    island.position.set(x, y, z)
    scene.add(island)
    const phase = rng() * 6
    drifting.push((t) => {
      island.position.y = y + Math.sin(t * 0.45 + phase) * 0.6
      island.rotation.y = t * 0.08 + phase
    })
  }

  // Iridescent orbs.
  const orbSkins = [T.oil, T.rainbowOil, T.psychedelic, T.plasma, T.swirls]
  for (let i = 0; i < 9; i++) {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.5 + rng() * 0.9, 16, 12), lambert(orbSkins[i % orbSkins.length], 1, { emissive: 0x301040 }))
    // Scattered either side of the avenue, keeping the middle of the view clear for the title.
    const x = (i % 2 ? 1 : -1) * (5 + rng() * 14)
    const y = 2 + rng() * 11
    const z = 8 - rng() * 40
    orb.position.set(x, y, z)
    scene.add(orb)
    const phase = rng() * 6
    drifting.push((t) => {
      orb.position.y = y + Math.sin(t * 0.6 + phase) * 0.7
      orb.rotation.y = t * 0.3 + phase
    })
  }

  // Upside-down Sierpinski pyramids hanging in the sky.
  for (const [x, y, z, s] of [
    [14, 15, -6, 1.4],
    [-8, 19, -22, 1],
    [9, 21, -26, 0.8],
  ] as const) {
    const pyr = new THREE.Mesh(new THREE.ConeGeometry(1.6 * s, 2.4 * s, 4), lambert(T.pyramids))
    pyr.position.set(x, y, z)
    pyr.rotation.x = Math.PI
    scene.add(pyr)
    drifting.push((t) => (pyr.rotation.y = t * 0.15 * s))
  }

  // A faint x-ray drifting far off.
  const xray = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), ghost(T.xray, 0.35))
  xray.position.set(-24, 9, -34)
  scene.add(xray)
  drifting.push((t) => {
    xray.position.y = 9 + Math.sin(t * 0.2) * 1.5
    xray.lookAt(0, 4, 20)
  })

  // Motes of light rising from the water.
  const MOTES = 150
  const positions = new Float32Array(MOTES * 3)
  for (let i = 0; i < MOTES; i++) positions.set([(rng() - 0.5) * 50, rng() * 22, 14 - rng() * 60], i * 3)
  const motesGeo = new THREE.BufferGeometry()
  motesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const motes = new THREE.Points(motesGeo, new THREE.PointsMaterial({ color: 0xffe0ff, size: 0.18, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }))
  scene.add(motes)
  drifting.push((t) => (motes.position.y = (t * 0.4) % 4 - 2))
  return { drifting, water }
}

/** Twilight: deep indigo overhead, through violet and pink, to a peach glow on the horizon. */
function skyGradient() {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#120a3a')
  grad.addColorStop(0.35, '#4a2a8a')
  grad.addColorStop(0.62, '#b05aa8')
  grad.addColorStop(0.8, '#f0a0c0')
  grad.addColorStop(1, '#ffd2b0')
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
