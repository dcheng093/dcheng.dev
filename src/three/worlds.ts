import * as THREE from 'three'
import { mulberry32 } from '../lib/random'
import { hash } from '../lib/uncorrupted'
import { TEX, type TexName } from './pageScenes'
import { HEADS } from './heads'
import { keyedTexture } from './procTextures'
import { buildShape } from './shapes'
import { disposeScene, face, fitWorld, register, texture } from './stage'

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

/** The void behind the congregation: black overhead, a bruise of violet at the horizon, black underfoot. */
function voidSky() {
  const c = document.createElement('canvas')
  c.width = 2
  c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 64)
  grad.addColorStop(0, '#000000')
  grad.addColorStop(0.45, '#14042a')
  grad.addColorStop(0.62, '#2a0a3a')
  grad.addColorStop(1, '#040006')
  g.fillStyle = grad
  g.fillRect(0, 0, 2, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** A soft oval mask: pictures fade out at their edges instead of hanging in the dark as rectangles. */
function softEdge() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 6, 32, 32, 32)
  grad.addColorStop(0, '#fff')
  grad.addColorStop(0.55, '#bbb')
  grad.addColorStop(1, '#000')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/** A flat triangle outline, for the sigil. */
function triangle(radius: number, turn: number, material: THREE.LineBasicMaterial) {
  const pts = [0, 1, 2].map((i) => {
    const a = turn + (i / 3) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)
  })
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), material)
}

/**
 * THE CONGREGATION, behind the sealed page: a ring of black monoliths with candles, an eye in the sky that blinks,
 * a slow vortex overhead, CRTs with nothing on, and Daniel's faces just out of sight in the fog. Built from the
 * fractal pack. Nothing flashes: every glow breathes slower than once a second, and the blink is one slow squash.
 */
function cult(scene: THREE.Scene, rng: () => number, drifting: Drift[]) {
  scene.background = voidSky()
  scene.fog = new THREE.FogExp2(0x0a0014, 0.045)
  scene.add(new THREE.AmbientLight(0x6a4a8a, 0.5))
  const soft = softEdge()
  const altar = new THREE.PointLight(0xff2a2a, 6, 30, 1.5)
  altar.position.set(0, 1.2, 0)
  scene.add(altar)
  drifting.push((t) => (altar.intensity = 5 + Math.sin(t * 1.1) * 1.5))

  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 40), lambert('darkMarble', 18))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.5
  scene.add(floor)

  // Seven monoliths facing in, a candle at the foot of each.
  const slab = lambert('blackMetal', 1, { emissive: 0x110018 })
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7, 0.5), slab)
    m.position.set(Math.cos(a) * 9, 2, Math.sin(a) * 9)
    m.lookAt(0, 2, 0)
    scene.add(m)
    const candle = buildShape('candle')
    candle.scale.setScalar(0.9)
    candle.position.set(Math.cos(a) * 7.8, -1, Math.sin(a) * 7.8)
    scene.add(candle)
  }

  // The Eye Above. Breathes; every nine seconds it blinks, in four chunky frames.
  const eye = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture(TEX.fractalEye), alphaMap: soft, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.9, fog: false, depthWrite: false }))
  eye.position.set(0, 16, 0)
  scene.add(eye)
  const BLINK = [0.45, 0.06, 0.45]
  drifting.push((t) => {
    const p = t % 9
    const squash = p < 0.6 ? BLINK[Math.floor((p / 0.6) * BLINK.length)] : 1 + Math.sin(t * 0.5) * 0.03
    eye.scale.set(16, 10.7 * squash, 1)
  })
  // Another one, further off, half lost in the fog. Always watching.
  const far = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture(TEX.fractalEye2), alphaMap: soft, transparent: true, opacity: 0.8, depthWrite: false }))
  far.scale.set(26, 17, 1)
  far.position.set(-14, 9, -34)
  scene.add(far)

  // A vortex turning overhead, and the sigil beneath it.
  const vortex = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 54),
    new THREE.MeshBasicMaterial({ map: texture(TEX.vortex), alphaMap: soft, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.5, fog: false, depthWrite: false, side: THREE.DoubleSide }),
  )
  vortex.rotation.x = Math.PI / 2
  vortex.position.y = 26
  scene.add(vortex)
  drifting.push((t) => (vortex.rotation.z = t * 0.03))
  const gold = new THREE.LineBasicMaterial({ color: 0xffd84a, fog: false, transparent: true, opacity: 0.85 })
  const up = triangle(6, Math.PI / 2, gold)
  const down = triangle(6, -Math.PI / 2, gold)
  for (const tri of [up, down]) {
    tri.rotation.x = Math.PI / 2
    tri.position.y = 21
    scene.add(tri)
  }
  drifting.push((t) => {
    up.rotation.z = t * 0.1
    down.rotation.z = -t * 0.1
  })

  // The broadcast: CRTs with nothing on. Their black screens are cut out, so you see the void through them.
  const tv = new THREE.SpriteMaterial({ map: keyedTexture(TEX.crt, 'black'), transparent: true, alphaTest: 0.2 })
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Sprite(tv)
    s.scale.set(2.4, 2.3, 1)
    scene.add(s)
    const a = (i / 5) * Math.PI * 2
    const r = 4.5 + rng() * 3
    const y = 3 + rng() * 6
    const phase = rng() * 6
    drifting.push((t) => {
      const aa = a - t * 0.06
      s.position.set(Math.cos(aa) * r, y + Math.sin(t * 0.4 + phase) * 0.5, Math.sin(aa) * r)
    })
  }

  // Faces in the fog: Daniel, out where you can only nearly see him.
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: face(HEADS[i % HEADS.length]), transparent: true, opacity: 0.18, depthWrite: false }))
    const a = (i / 6) * Math.PI * 2 + rng()
    const r = 22 + rng() * 8
    const y = 1 + rng() * 3
    s.scale.setScalar(4 + rng() * 2)
    s.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
    scene.add(s)
    const phase = rng() * 6
    drifting.push((t) => (s.position.y = y + Math.sin(t * 0.25 + phase) * 0.6))
  }

  // The dome: a golden lattice holding all of it in.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(45, 24, 16),
    new THREE.MeshBasicMaterial({ map: texture(TEX.lattice, 6), side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.16, fog: false, depthWrite: false }),
  )
  scene.add(dome)
  drifting.push((t) => (dome.rotation.y = -t * 0.01))

  // Star dust, and a few of the twinkle stars hung in the dark.
  const DUST = 220
  const pos = new Float32Array(DUST * 3)
  for (let i = 0; i < DUST; i++) pos.set([(rng() - 0.5) * 60, rng() * 24 - 1, (rng() - 0.5) * 60], i * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcfb8ff, size: 0.18, transparent: true, opacity: 0.7 }))
  scene.add(dust)
  drifting.push((t) => (dust.rotation.y = t * 0.02))
  const starMat = new THREE.SpriteMaterial({ map: texture(TEX.nightStars), alphaMap: soft, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.6, fog: false, depthWrite: false })
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(starMat)
    s.scale.set(5, 9, 1)
    const a = rng() * Math.PI * 2
    s.position.set(Math.cos(a) * 32, 10 + rng() * 10, Math.sin(a) * 32)
    scene.add(s)
  }
  return { radius: 15, height: 1.2, look: 9 }
}

/**
 * INSIDE, the world every page's 3D turns into once the site is possessed: you are in a chamber of living flesh
 * (Daniel's PBR flesh set: colour, normal, roughness, ambient occlusion, height), veins running over it, eyes set into
 * the walls, something at the centre that beats, and a dead sky (a corridor of meat, or a red graveyard) where the
 * ceiling should be. Everything moves slowly: the breathing is under one beat a second, the eyes close in steps.
 */
function flesh(scene: THREE.Scene, rng: () => number, drifting: Drift[]) {
  scene.userData.untinted = true // already the colour of the inside of something; no extra red over it
  const skies = [TEX.skyCorridor, TEX.skyGraveyard, TEX.skyChurch]
  scene.background = texture(skies[Math.floor(rng() * skies.length)])
  scene.fog = new THREE.FogExp2(0x1a0000, 0.018)
  scene.add(new THREE.AmbientLight(0xa05050, 1.1))
  scene.add(new THREE.HemisphereLight(0xffb0a0, 0x2a0000, 1.2))
  const pulse = new THREE.PointLight(0xff4a3a, 60, 50, 1.4)
  pulse.position.set(0, 2, 0)
  scene.add(pulse)

  const skin = (repeat: number, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const maps = [TEX.fleshSkin, TEX.fleshNormal, TEX.fleshRough, TEX.fleshAo, TEX.fleshHeight].map((url) => texture(url, repeat))
    // Data maps aren't colours.
    for (const m of maps.slice(1)) m.colorSpace = THREE.NoColorSpace
    const [map, normalMap, roughnessMap, aoMap, displacementMap] = maps
    return new THREE.MeshStandardMaterial({ map, normalMap, roughnessMap, aoMap, displacementMap, displacementScale: 0.9, metalness: 0, ...extra })
  }

  // The chamber: a sphere you're inside, its walls pushed in and out by the height map. Open at the top to the sky.
  const walls = new THREE.Mesh(new THREE.SphereGeometry(24, 48, 32, 0, Math.PI * 2, Math.PI * 0.22, Math.PI * 0.78), skin(6, { side: THREE.BackSide }))
  scene.add(walls)
  drifting.push((t) => walls.scale.setScalar(1 + Math.sin(t * 0.7) * 0.012))

  // The thing at the centre. It beats (a heartbeat's double thump, slowed right down).
  const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 5), skin(2, { emissive: 0x2a0000 }))
  heart.position.y = 1.2
  scene.add(heart)
  drifting.push((t) => {
    const p = (t * 0.8) % 1
    const beat = p < 0.12 ? Math.sin((p / 0.12) * Math.PI) * 0.06 : p > 0.2 && p < 0.3 ? Math.sin(((p - 0.2) / 0.1) * Math.PI) * 0.035 : 0
    heart.scale.setScalar(1 + beat)
    pulse.intensity = 55 + beat * 240
  })

  // Veins: thick dark tubes from the heart out to the walls.
  const vein = skin(1, { color: 0x7a1010, emissive: 0x180000 })
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rng() * 0.4
    const out = new THREE.Vector3(Math.cos(a) * 21, -2 + rng() * 14, Math.sin(a) * 21)
    const mid = new THREE.Vector3(Math.cos(a + 0.4) * 9, 4 + rng() * 6, Math.sin(a + 0.4) * 9)
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.2, 0), mid, out])
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.18 + rng() * 0.22, 6), vein))
  }

  // Eyes in the walls, looking in. Each closes now and then, in three chunky frames, at its own time.
  const soft = softEdge()
  const eyes = [TEX.stillEyes, TEX.stillFace, TEX.stillMouth, TEX.stillScream, TEX.stillSkull, TEX.stillLetterEye, TEX.stillBloodEyes]
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rng() * 0.3
    const y = 1 + rng() * 12
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture(eyes[i % eyes.length]), alphaMap: soft, transparent: true, opacity: 0.85, depthWrite: false }))
    const size = 3 + rng() * 3
    s.position.set(Math.cos(a) * 19, y, Math.sin(a) * 19)
    scene.add(s)
    const every = 6 + rng() * 9
    const shut = [0.5, 0.08, 0.5]
    drifting.push((t) => {
      const p = (t + i * 1.7) % every
      s.scale.set(size, size * (p < 0.45 ? shut[Math.floor((p / 0.45) * shut.length)] : 0.66), 1)
    })
  }

  // Motes of something, drifting up.
  const n = 120
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) pos.set([(rng() - 0.5) * 30, rng() * 18 - 2, (rng() - 0.5) * 30], i * 3)
  const motes = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), new THREE.PointsMaterial({ color: 0xc04030, size: 0.12, transparent: true, opacity: 0.6, depthWrite: false }))
  scene.add(motes)
  drifting.push((t) => (motes.position.y = (t * 0.3) % 4))
  return { radius: 12, height: 2, look: 6 }
}

const BUILDERS = { meadow, painted, space, cult, flesh }

export function mountCustomWorld(canvas: HTMLCanvasElement, id: keyof typeof BUILDERS) {
  const scene = new THREE.Scene()
  const drifting: Drift[] = []
  // The flesh world turns up on many pages, so it's seeded by the page: each gets its own sky and its own eyes.
  const seed = id === 'flesh' ? hash(location.pathname) : id.length * 7919
  const cam = BUILDERS[id](scene, mulberry32(seed), drifting)
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
