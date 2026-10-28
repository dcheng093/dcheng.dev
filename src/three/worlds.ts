import * as THREE from 'three'
import { mulberry32 } from '../lib/random'
import { TEX, type TexName } from './pageScenes'
import { keyedTexture } from './procTextures'
import { buildShape } from './shapes'
import { disposeScene, fitWorld, register, texture } from './stage'

// The shrine worlds built from Daniel's newer texture pack: a horse meadow, a painted chiikawa dream and a
// battlestation in space. Same rules as every world: quarter resolution, one shared renderer, slow and calm.

type Drift = (t: number) => void

function backdrop(name: TexName) {
  const t = new THREE.TextureLoader().load(TEX[name])
  t.colorSpace = THREE.SRGBColorSpace
  t.magFilter = THREE.NearestFilter
  return t
}

const lambert = (name: TexName, repeat = 1, extra: THREE.MeshLambertMaterialParameters = {}) =>
  new THREE.MeshLambertMaterial({ map: texture(TEX[name], repeat), ...extra })

/** Gently rolling ground: a plane with sine hills. */
function hills(size: number, material: THREE.Material, height: number) {
  const geo = new THREE.PlaneGeometry(size, size, 48, 48)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, (Math.sin(x * 0.12) + Math.cos(y * 0.09) + Math.sin((x + y) * 0.05)) * height)
  }
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, material)
  m.rotation.x = -Math.PI / 2
  return m
}

function meadow(scene: THREE.Scene, rng: () => number, drifting: Drift[]) {
  scene.background = backdrop('wispySky')
  scene.fog = new THREE.Fog(0xcfe6ff, 18, 75)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8a3a, 1.6))
  const sun = new THREE.DirectionalLight(0xfff2cc, 1.4)
  sun.position.set(6, 10, 4)
  scene.add(sun)

  const ground = hills(160, lambert('grass', 24), 1.2)
  ground.position.y = -1.5
  scene.add(ground)

  // Trees: the tree-on-black photo with its black keyed out, as billboards.
  const treeMat = new THREE.SpriteMaterial({ map: keyedTexture(TEX.tree, 'black'), alphaTest: 0.3, transparent: true })
  for (let i = 0; i < 16; i++) {
    const a = rng() * Math.PI * 2
    const r = 12 + rng() * 26
    const s = 5 + rng() * 4
    const tree = new THREE.Sprite(treeMat)
    tree.scale.set(s, s, 1)
    tree.position.set(Math.cos(a) * r, s / 2 - 1.6, Math.sin(a) * r)
    scene.add(tree)
  }

  // A giant golden horseshoe (for luck), with hay bales lying about.
  const shoe = buildShape('horseshoe', 'goldMetal')
  shoe.scale.setScalar(3.4)
  shoe.position.y = 4
  scene.add(shoe)
  drifting.push((t) => (shoe.rotation.y = t * 0.3))
  for (let i = 0; i < 5; i++) {
    const bale = buildShape('hayBale')
    const a = (i / 5) * Math.PI * 2 + 0.4
    bale.scale.setScalar(1.6)
    bale.position.set(Math.cos(a) * 9, -0.6, Math.sin(a) * 9)
    bale.rotation.y = a
    scene.add(bale)
  }
  // Clouds drifting overhead.
  for (let i = 0; i < 6; i++) {
    const cloud = buildShape('cloud')
    const y = 10 + rng() * 6
    const z = -20 + rng() * 40
    cloud.scale.setScalar(3 + rng() * 2)
    scene.add(cloud)
    const speed = 0.6 + rng()
    const x0 = rng() * 60 - 30
    drifting.push((t) => cloud.position.set(((x0 + t * speed + 30) % 60) - 30, y, z))
  }
  return { radius: 22, height: 5, look: 3 }
}

function painted(scene: THREE.Scene, rng: () => number, drifting: Drift[]) {
  scene.background = backdrop('painting')
  scene.fog = new THREE.Fog(0xffd6ec, 16, 60)
  scene.add(new THREE.AmbientLight(0xfff0ff, 1.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(-4, 8, 6)
  scene.add(sun)

  const ground = hills(120, lambert('tieDyeSpiral', 8), 0.8)
  ground.position.y = -1.6
  scene.add(ground)

  // A giant tie-dye heart, slowly turning.
  const heart = buildShape('heart', 'tieDyeCircle')
  heart.scale.setScalar(4.2)
  heart.position.y = 4
  scene.add(heart)
  drifting.push((t) => {
    heart.rotation.y = t * 0.35
    heart.position.y = 4 + Math.sin(t * 0.6) * 0.4
  })

  const skins: TexName[] = ['tieDye', 'tieDyeSpiral', 'tieDyeCircle']
  for (let i = 0; i < 10; i++) {
    const isHeart = i % 2 === 0
    const o = isHeart ? buildShape('heart', skins[i % 3]) : buildShape('cloud')
    const a = rng() * Math.PI * 2
    const r = 7 + rng() * 14
    const y = 2 + rng() * 8
    o.scale.setScalar(isHeart ? 1 + rng() * 1.2 : 2 + rng() * 1.5)
    o.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
    scene.add(o)
    const phase = rng() * 6
    drifting.push((t) => {
      o.position.y = y + Math.sin(t * 0.5 + phase) * 0.8
      o.rotation.y = t * 0.2 + phase
    })
  }
  return { radius: 20, height: 4, look: 3.5 }
}

function space(scene: THREE.Scene, rng: () => number, drifting: Drift[]) {
  scene.background = backdrop('galaxy')
  scene.add(new THREE.AmbientLight(0xccd8ff, 1.1))
  const sun = new THREE.DirectionalLight(0xffffff, 1.8)
  sun.position.set(10, 6, 8)
  scene.add(sun)

  // The Earth, huge, below.
  const earth = new THREE.Mesh(new THREE.SphereGeometry(14, 40, 28), lambert('earth'))
  earth.position.set(0, -18, -6)
  scene.add(earth)
  drifting.push((t) => (earth.rotation.y = t * 0.03))

  // Cosmic clouds glowing out of their black.
  const cosmic = new THREE.SpriteMaterial({ map: texture(TEX.cosmic), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false })
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Sprite(cosmic)
    s.scale.set(18, 12, 1)
    s.position.set((rng() - 0.5) * 50, 4 + rng() * 14, -20 - rng() * 20)
    scene.add(s)
  }

  // A giant CRT showing the kaleidoscope, with brushed-metal hardware floating around it.
  const crt = buildShape('monitor', 'kaleidoscope')
  crt.scale.setScalar(3.2)
  crt.position.y = 3
  scene.add(crt)
  drifting.push((t) => {
    crt.rotation.y = Math.sin(t * 0.2) * 0.6
    crt.position.y = 3 + Math.sin(t * 0.4) * 0.5
  })
  const kit: [Parameters<typeof buildShape>[0], TexName][] = [
    ['keyboard', 'bronze'],
    ['mouse', 'copper'],
    ['headset', 'goldMetal'],
    ['keyboard', 'purpleMetal'],
    ['mousepad', 'kaleidoscope'],
    ['floppy', 'bronze'],
    ['mouse', 'goldMetal'],
    ['headset', 'copper'],
  ]
  kit.forEach(([shape, tex], i) => {
    const o = buildShape(shape, tex)
    const a = (i / kit.length) * Math.PI * 2
    const r = 8 + rng() * 6
    const y = 1 + rng() * 7
    o.scale.setScalar(1.4 + rng())
    scene.add(o)
    const phase = rng() * 6
    drifting.push((t) => {
      const aa = a + t * 0.05
      o.position.set(Math.cos(aa) * r, y + Math.sin(t * 0.7 + phase) * 0.6, Math.sin(aa) * r)
      o.rotation.set(t * 0.3 + phase, t * 0.4, 0)
    })
  })
  const STARS = 300
  const pos = new Float32Array(STARS * 3)
  for (let i = 0; i < STARS; i++) pos.set([(rng() - 0.5) * 120, rng() * 60 - 10, (rng() - 0.5) * 120], i * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 })))
  return { radius: 18, height: 4, look: 2.5 }
}

const BUILDERS = { meadow, painted, space }

export function mountCustomWorld(canvas: HTMLCanvasElement, id: keyof typeof BUILDERS) {
  const scene = new THREE.Scene()
  const drifting: Drift[] = []
  const cam = BUILDERS[id](scene, mulberry32(id.length * 7919), drifting)
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 160)
  const resize = () => fitWorld(canvas, camera)
  resize()
  window.addEventListener('resize', resize)
  const stop = register({
    scene,
    camera,
    target: canvas,
    visible: true,
    update: (t) => {
      const a = t * 0.04
      camera.position.set(Math.cos(a) * cam.radius, cam.height + Math.sin(t * 0.13) * 0.5, Math.sin(a) * cam.radius)
      camera.lookAt(0, cam.look, 0)
      for (const d of drifting) d(t)
    },
  })
  const background = scene.background as THREE.Texture
  if (!stop) {
    window.removeEventListener('resize', resize)
    background.dispose()
    disposeScene(scene)
    return null
  }
  return () => {
    stop()
    window.removeEventListener('resize', resize)
    background.dispose()
    disposeScene(scene)
  }
}
