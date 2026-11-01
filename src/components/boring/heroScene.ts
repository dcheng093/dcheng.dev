// The boring site's hero world: a calm, faintly surreal dusk. Low violet hills under fog, a pale sun on the horizon,
// polished spheres hanging in the air, a lone arch in the distance and dust drifting up. Built by the live hero
// (HeroBackdrop.tsx) and by the still render (scripts/boring-hero: public/boring/hero.webp, shown while this loads),
// so both are the same picture. It never touches src/three/stage.ts: possession can't reach it.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export const CAMERA = { position: [0, 3, 18] as const, look: [0, 7, -80] as const, fov: 50 }

function sky() {
  // Night at the top, violet at the horizon, a blush of pink just above it.
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 512
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#05040f')
  grad.addColorStop(0.32, '#140f3a')
  grad.addColorStop(0.47, '#3a2a8a')
  grad.addColorStop(0.5, '#a978e8')
  grad.addColorStop(0.515, '#f2a6d0')
  grad.addColorStop(0.53, '#3a2a8a')
  grad.addColorStop(1, '#0a0820')
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 512)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function glow(color: string, size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, color)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }))
  s.scale.set(size, size, 1)
  return s
}

/** Low-poly hills, rolling away into the fog. */
function hills(size: number, height: number, color: number, seed: number) {
  const geo = new THREE.PlaneGeometry(size, size, 90, 90)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, (Math.sin(x * 0.045 + seed) + Math.cos(y * 0.038 + seed * 2) + Math.sin((x - y) * 0.021)) * height)
  }
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, flatShading: true }))
  m.rotation.x = -Math.PI / 2
  return m
}

/**
 * Fills `scene` and returns the camera plus `update(t, pointer)`, which moves the world to time `t` (seconds) with the
 * camera leaning towards `pointer` (-1..1 on each axis). At t = 0 with the pointer centred it's the still render.
 */
export function buildHeroScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer, aspect: number, segments = 90) {
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  scene.fog = new THREE.Fog(0x2e2170, 45, 210)
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(400, 32, 32), new THREE.MeshBasicMaterial({ map: sky(), side: THREE.BackSide, fog: false })))

  // Polished things need something to reflect: a soft studio, tinted by the lights below.
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55
  pmrem.dispose()

  scene.add(new THREE.HemisphereLight(0x9a86ff, 0x080418, 0.6))
  const sunLight = new THREE.DirectionalLight(0xffc6e6, 1.6)
  sunLight.position.set(-40, 12, -120)
  scene.add(sunLight)
  const rim = new THREE.DirectionalLight(0x5a8cff, 1.2)
  rim.position.set(60, 40, 40)
  scene.add(rim)

  const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({ color: 0xffe2f0, fog: false }))
  sun.position.set(-34, 6, -190)
  scene.add(sun)
  const halo = glow('rgba(255,170,220,0.55)', 120)
  halo.position.copy(sun.position)
  scene.add(halo)

  const near = hills(400, 3.2, 0x150f36, 1)
  near.position.y = -6
  scene.add(near)
  const far = hills(600, 7, 0x241a5c, 4)
  far.position.set(0, -10, -170)
  scene.add(far)

  // Floating spheres: chrome, frosted glass, one matte. Each bobs on its own slow beat.
  const spheres: [number, number, number, number, THREE.MeshStandardMaterialParameters][] = [
    [-3, 12, -30, 3.2, { color: 0xffffff, metalness: 1, roughness: 0.08 }],
    [-14, 17, -52, 2, { color: 0xb8a6ff, metalness: 0.2, roughness: 0.35, emissive: 0x2a1060 }],
    [-30, 15, -60, 2.6, { color: 0xffffff, metalness: 1, roughness: 0.12 }],
    [5, 22, -70, 1.3, { color: 0xffb6dc, metalness: 0.1, roughness: 0.6, emissive: 0x3a1030 }],
    [36, 5, -40, 1.1, { color: 0xffffff, metalness: 1, roughness: 0.05 }],
    [-12, 6, -36, 0.8, { color: 0x9ad0ff, metalness: 0.4, roughness: 0.25, emissive: 0x102040 }],
  ]
  const floaters = spheres.map(([x, y, z, r, mat], i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, segments >= 90 ? 64 : 40, segments >= 90 ? 48 : 30), new THREE.MeshStandardMaterial(mat))
    s.position.set(x, y, z)
    scene.add(s)
    return { s, y, phase: i * 1.7, speed: 0.35 + (i % 3) * 0.12 }
  })

  // A lone arch on the far hill, and a few thin columns, half in the fog.
  const stone = new THREE.MeshStandardMaterial({ color: 0x8a78d8, roughness: 0.7 })
  const arch = new THREE.Mesh(new THREE.TorusGeometry(10, 1.4, 16, 64, Math.PI), stone)
  arch.position.set(26, -2, -120)
  arch.rotation.y = -0.4
  scene.add(arch)
  for (const [x, z, h] of [[-48, -95, 26], [-56, -110, 18], [52, -88, 14]]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, h, 24), stone)
    col.position.set(x, h / 2 - 6, z)
    scene.add(col)
  }

  // Dust in the air, catching the light, drifting slowly up.
  const n = 500
  const pos = new Float32Array(n * 3)
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < n; i++) pos.set([(rnd() - 0.5) * 160, rnd() * 50 - 4, -rnd() * 140], i * 3)
  const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
    new THREE.PointsMaterial({ color: 0xe8dcff, size: 0.18, transparent: true, opacity: 0.6 }),
  )
  scene.add(dust)

  const camera = new THREE.PerspectiveCamera(CAMERA.fov, aspect, 0.1, 900)
  const look = new THREE.Vector3()
  const update = (t: number, pointer: { x: number; y: number }) => {
    // A slow drift sideways and up and down, plus a lean towards the pointer.
    camera.position.set(CAMERA.position[0] + Math.sin(t * 0.07) * 2.2 + pointer.x * 1.6, CAMERA.position[1] + Math.sin(t * 0.11) * 0.5 - pointer.y * 0.8, CAMERA.position[2])
    look.set(CAMERA.look[0] + pointer.x * 3, CAMERA.look[1] - pointer.y * 1.5, CAMERA.look[2])
    camera.lookAt(look)
    for (const f of floaters) f.s.position.y = f.y + (t ? Math.sin(t * f.speed + f.phase) * 0.6 : 0)
    dust.position.y = (t * 0.25) % 6
    halo.material.opacity = 1 - (t ? (Math.sin(t * 0.4) + 1) * 0.12 : 0)
  }
  update(0, { x: 0, y: 0 })
  return { camera, update }
}
