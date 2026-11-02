// The boring site's world: a calm landscape at the end of the day. Rolling hills and a still lake under layered
// mountain ranges, low clouds (Daniel's cloud photos, keyed), the sun going down as the reader scrolls until it's
// night (stars, and a constellation that reads "42"), then dawn. The camera flies one path through it, tied to the
// scroll. Built by the live page (World.tsx) and by the still render (scripts/boring-hero: public/boring/hero.webp,
// shown while this loads). It never touches src/three/stage.ts: possession can't reach it. Textures are optional
// (worldTextures.ts): anything not supplied is drawn here in code.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { Water } from 'three/addons/objects/Water.js'
import { keyframe } from './flight'
import { QUALITY, type Tier } from './quality'
import { worldTexture, worldTextures, type WorldSlot } from './worldTextures'

/** The flight's waypoints, one per part of the page, in order (Place ids, place.ts). */
export const WAYPOINTS = ['intro', 'about', 'stack', 'intra', 'work', 'contact'] as const

type V3 = [number, number, number]
// Where the camera is and what it looks at, at each waypoint: dusk over the lake; low across the water, the sun off
// to the right of the text; high above the clouds; night under the 42; the dark before dawn; dawn along the mountains.
const CAM: V3[] = [[0, 3, 18], [-20, 2.5, -58], [0, 44, 22], [0, 0.5, 10], [-14, 3, -52], [40, 10, -20]]
const LOOK: V3[] = [[0, 7, -80], [-78, 5, -190], [0, 18, -120], [0, 90, -200], [-34, 6, -190], [-30, 10, -170]]
// …and how the world is lit there. The sun sinks through the chapters, is gone by the 42, and rises again at Contact.
const KEYS = {
  sky: [0xffffff, 0xffd8ea, 0xc9d2ff, 0x3a3a70, 0x4a3c7c, 0xffe6f2],
  fog: [0x2e2170, 0x3a2058, 0x241a5c, 0x0c0a22, 0x181236, 0x5a4482],
  sunY: [6, 3.5, 1.5, -26, -9, 5],
  sun: [1.6, 2, 1.5, 0.25, 0.45, 2.2],
  glow: [1, 1.25, 0.9, 0.05, 0.3, 1.2],
  stars: [0.35, 0.2, 0.45, 1, 0.8, 0.1],
  c42: [0, 0, 0, 1, 0.15, 0],
  birds: [0, 1, 0, 0, 0, 1],
}
// The cloud dive: where the camera starts on arrival, up in the clouds, looking down towards the lake.
const DIVE_CAM: V3 = [0, 58, 40]
const DIVE_LOOK: V3 = [0, 24, -70]
const SUN_XZ = [-34, -190] as const
const WATER_Y = -4.6

// The lake: its middle and its half-size on the ground.
const LAKE = { x: -20, z: -100, w: 220, d: 112 }

/** The ground's height at (x, z): rolling hills, falling away into the lake's basin. The camera never flies lower. */
export const terrain = (x: number, z: number) => {
  const hills = (Math.sin(x * 0.045 + 1) + Math.cos(-z * 0.038 + 2) + Math.sin((x + z) * 0.021)) * 3.2 - 6
  const basin = Math.exp(-(((x - LAKE.x) / (LAKE.w * 0.55)) ** 2) - ((z - LAKE.z) / (LAKE.d * 0.6)) ** 2)
  return hills - basin * 9
}

const canvasTexture = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, colour = true) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  if (colour) t.colorSpace = THREE.SRGBColorSpace
  return t
}

function load(url: string | undefined, colour = true): Promise<THREE.Texture | null> {
  if (!url) return Promise.resolve(null)
  return new Promise((done) =>
    new THREE.TextureLoader().load(
      url,
      (t) => {
        if (colour) t.colorSpace = THREE.SRGBColorSpace
        done(t)
      },
      undefined,
      () => done(null),
    ),
  )
}
const supplied = (slot: WorldSlot, colour = true) => load(worldTexture(slot), colour)

/** Night at the top, violet at the horizon, a blush of pink just above it. */
const gradientSky = () =>
  canvasTexture(4, 512, (g) => {
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
  })

const glowTexture = (inner: string) =>
  canvasTexture(256, 256, (g) => {
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, inner)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
  })

/** A drawn cloud, for when no cloud photos were supplied. */
const drawnCloud = () =>
  canvasTexture(256, 128, (g) => {
    for (const [x, y, r] of [[70, 80, 40], [110, 64, 50], [160, 72, 42], [196, 86, 30], [128, 92, 46]]) {
      const grad = g.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255,255,255,0.85)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grad
      g.fillRect(0, 0, 256, 128)
    }
  })

/** Gentle tileable ripples as a normal map, for when no water texture was supplied. */
const drawnRipples = () =>
  canvasTexture(
    128,
    128,
    (g) => {
      const N = 128
      const waves = [[3, 1, 0.3], [1, 4, 1.7], [5, -2, 2.9], [-2, 6, 4.1]]
      const height = (x: number, y: number) => waves.reduce((h, [kx, ky, p]) => h + Math.sin(((kx * x + ky * y) / N) * Math.PI * 2 + p) / Math.hypot(kx, ky), 0)
      const img = g.createImageData(N, N)
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const n = new THREE.Vector3(-(height(x + 1, y) - height(x - 1, y)) * 6, -(height(x, y + 1) - height(x, y - 1)) * 6, 1).normalize()
          img.data.set([(n.x * 0.5 + 0.5) * 255, (n.y * 0.5 + 0.5) * 255, (n.z * 0.5 + 0.5) * 255, 255], (y * N + x) * 4)
        }
      g.putImageData(img, 0, 0)
    },
    false,
  )

/** The ground near the camera: terrain() as a mesh. */
function ground(size: number, material: THREE.Material) {
  const geo = new THREE.PlaneGeometry(size, size, 120, 120)
  const pos = geo.getAttribute('position')
  // Laid flat (rotated a quarter turn back), the plane's own y runs along world -z.
  for (let i = 0; i < pos.count; i++) pos.setZ(i, terrain(pos.getX(i), -pos.getY(i)))
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, material)
  m.rotation.x = -Math.PI / 2
  return m
}

const ridgeNoise = (x: number, seed: number) =>
  Math.sin(x * 0.011 + seed) * 0.5 + Math.sin(x * 0.027 + seed * 1.7) * 0.28 + Math.sin(x * 0.063 + seed * 2.3) * 0.14 + Math.abs(Math.sin(x * 0.13 + seed * 3.1)) * 0.08

/** A mountain range: a long band of terrain whose peaks follow a ridgeline, falling away front and back. */
function range(width: number, depth: number, peak: number, color: number, seed: number) {
  const geo = new THREE.PlaneGeometry(width, depth, 160, 14)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const v = pos.getY(i) / depth + 0.5
    const bell = Math.sin(Math.PI * Math.min(1, Math.max(0, v))) ** 1.4
    pos.setZ(i, Math.max(0, 0.35 + ridgeNoise(x, seed)) * peak * bell)
  }
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true }))
  m.rotation.x = -Math.PI / 2
  return m
}

function silhouette(map: THREE.Texture, height: number) {
  const img = map.image as { width: number; height: number }
  return new THREE.Mesh(new THREE.PlaneGeometry((height * img.width) / img.height, height), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false }))
}

// "42" as strokes on a small grid (x right, y up): the constellation's stars sit on these points, its lines join them.
const FOUR = [[1.7, 3.6], [0, 1.2], [2.4, 1.2]]
const FOUR_STEM = [[1.7, 3.6], [1.7, -0.8]]
const TWO = [[3.2, 2.7], [3.8, 3.4], [4.8, 3.5], [5.4, 2.9], [5.3, 2.1], [3.3, -0.6], [5.6, -0.6]]

// The lake's ripples where it's touched: expanding rings that bend the surface (patched into three's Water shader).
const RIPPLES = 8
const RIPPLE_GLSL = `
          for ( int i = 0; i < ${RIPPLES}; i ++ ) {
            vec3 r = ripples[ i ];
            float age = rippleClock - r.z;
            if ( age < 0.0 || age > 2.6 ) continue;
            vec2 d = worldPosition.xz - r.xy;
            float dist = length( d );
            float front = age * 7.0;
            float ring = sin( ( dist - front ) * 1.4 ) * smoothstep( front + 3.0, front, dist ) * smoothstep( 0.0, 2.0, dist + 0.5 );
            surfaceNormal.xz += ( d / max( dist, 0.001 ) ) * ring * 0.55 * ( 1.0 - age / 2.6 ) * exp( -dist * 0.035 );
          }
          surfaceNormal = normalize( surfaceNormal );`

export type FlightState = {
  /** Where along the flight (waypoint index with a fraction: flight.ts). */
  index: number
  /** -1..1 each way; the camera leans towards it. */
  pointer: { x: number; y: number }
  /** The arrival's cloud dive, 0 (in the clouds) to 1 (done). */
  dive: number
}

/**
 * Fills `scene`; returns the camera, `update(t, state)` and `touch(ndcX, ndcY, t)` (a ripple on the lake where that
 * screen point meets it). Waits for the supplied textures.
 */
export async function buildHeroScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer, aspect: number, tier: Tier = 'full') {
  const quality = QUALITY[tier]
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  const cloudUrls = worldTextures('clouds')
  const [skyMap, farMap, nearMap, waterMap, groundMap, ...cloudMaps] = await Promise.all([
    supplied('sky'),
    supplied('mountains-far'),
    supplied('mountains-near'),
    supplied('water-normal', false),
    supplied('ground'),
    ...cloudUrls.map((u) => load(u)),
  ])

  scene.fog = new THREE.Fog(0x2e2170, 45, 260)
  const fog = scene.fog as THREE.Fog
  const skyMat = new THREE.MeshBasicMaterial({ map: skyMap ?? gradientSky(), side: THREE.BackSide, fog: false })
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(420, 48, 32), skyMat))

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.5
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0x9a86ff, 0x080418, 0.6))
  const sunLight = new THREE.DirectionalLight(0xffc6e6, 1.6)
  scene.add(sunLight)
  const rim = new THREE.DirectionalLight(0x5a8cff, 1.1)
  rim.position.set(60, 40, 40)
  scene.add(rim)

  const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({ color: 0xffe2f0, fog: false }))
  // A flat disc: turned to face whichever camera draws it (the view, and the lake's mirror), so it stays round
  // instead of squashing into a tilting ellipse as the camera flies and sways.
  const viewer = new THREE.Vector3()
  sun.onBeforeRender = (_r, _s, cam) => {
    sun.lookAt(viewer.setFromMatrixPosition(cam.matrixWorld))
    sun.updateMatrixWorld()
  }
  scene.add(sun)
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,170,220,0.55)'), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }))
  halo.scale.set(120, 120, 1)
  scene.add(halo)

  // Mountain ranges layered back into the haze: supplied silhouettes if there are any, else drawn ridgelines.
  if (farMap) {
    const far = silhouette(farMap, 70)
    far.position.set(0, 18, -330)
    scene.add(far)
  } else {
    const far = range(900, 70, 70, 0x3a2c78, 2)
    far.position.set(0, -10, -330)
    scene.add(far)
  }
  if (nearMap) {
    const near = silhouette(nearMap, 45)
    near.position.set(20, 8, -250)
    scene.add(near)
  } else {
    const mid = range(800, 60, 42, 0x2a1f62, 5)
    mid.position.set(30, -10, -255)
    scene.add(mid)
    const front = range(700, 50, 26, 0x1d1648, 9)
    front.position.set(-40, -10, -205)
    scene.add(front)
  }

  if (groundMap) {
    groundMap.wrapS = groundMap.wrapT = THREE.RepeatWrapping
    groundMap.repeat.set(24, 24)
  }
  scene.add(ground(480, new THREE.MeshStandardMaterial({ color: groundMap ? 0x4a3f78 : 0x0d0a24, map: groundMap, roughness: 1, flatShading: true, envMapIntensity: 0 })))

  // The lake. Full: still water mirroring the sky and the sun, rippling where it's touched. Lite: a glossy sheet.
  const normals = waterMap ?? drawnRipples()
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping
  let water: Water | null = null
  let rippleUniforms: { ripples: { value: THREE.Vector3[] }; rippleClock: { value: number } } | null = null
  if (quality.reflections) {
    water = new Water(new THREE.PlaneGeometry(LAKE.w * 2, LAKE.d * 2), {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: normals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffd2ea,
      waterColor: 0x1a1240,
      distortionScale: 1.4,
      fog: true,
    })
    water.rotation.x = -Math.PI / 2
    water.position.set(LAKE.x, WATER_Y, LAKE.z)
    const mat = water.material as THREE.ShaderMaterial
    mat.uniforms.size.value = 2.2
    if (quality.ripples) {
      rippleUniforms = { ripples: { value: Array.from({ length: RIPPLES }, () => new THREE.Vector3(0, 0, -99)) }, rippleClock: { value: 0 } }
      Object.assign(mat.uniforms, rippleUniforms)
      mat.fragmentShader =
        `uniform vec3 ripples[ ${RIPPLES} ];\nuniform float rippleClock;\n` +
        mat.fragmentShader.replace('vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );', (line) => line + RIPPLE_GLSL)
      mat.needsUpdate = true
    }
    scene.add(water)
  } else {
    normals.repeat.set(8, 3)
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(LAKE.w * 2, LAKE.d * 2), new THREE.MeshStandardMaterial({ color: 0x241a52, roughness: 0.1, metalness: 0.9, normalMap: normals }))
    sheet.rotation.x = -Math.PI / 2
    sheet.position.set(LAKE.x, WATER_Y, LAKE.z)
    scene.add(sheet)
  }

  // Clouds: Daniel's, keyed from his photos (or drawn ones), in a layer the arrival dives down through.
  let seed = 11
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const maps = cloudMaps.filter((m): m is THREE.Texture => !!m)
  const cloudMats = (maps.length ? maps : [drawnCloud()]).map((map) => new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0.6, fog: true }))
  const clouds = Array.from({ length: quality.clouds }, (_, i) => {
    const mat = cloudMats[i % cloudMats.length]
    const s = new THREE.Sprite(mat)
    const img = mat.map!.image as { width: number; height: number }
    const w = 34 + rnd() * 46
    s.scale.set(w, (w * img.height) / img.width, 1)
    // Half sit around the dive's way down (overhead, out of sight once landed), half high over the far sky, clear of
    // the sun.
    const near = i % 2 === 0
    const c = { s, x: near ? (rnd() - 0.5) * 140 : (rnd() - 0.5) * 420, y: near ? 34 + rnd() * 28 : 30 + rnd() * 26, z: near ? 45 - rnd() * 85 : -110 - rnd() * 170, speed: 0.4 + rnd() * 0.8 }
    s.position.set(c.x, c.y, c.z)
    scene.add(s)
    return c
  })

  const starField = (count: number, size: number) => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2
      const e = 0.06 + rnd() * 1.4
      pos.set([Math.cos(a) * Math.cos(e) * 390, Math.sin(e) * 390, Math.sin(a) * Math.cos(e) * 390], i * 3)
    }
    const m = new THREE.PointsMaterial({ color: 0xf2ecff, size, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })
    scene.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), m))
    return m
  }
  const smallStars = starField(1300, 1.2)
  const brightStars = starField(200, 2.4)

  const c42 = new THREE.Group()
  const c42Stars = new THREE.PointsMaterial({ color: 0xffffff, size: 3.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })
  c42.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints([...FOUR, ...FOUR_STEM, ...TWO].map(([x, y]) => new THREE.Vector3(x, y, 0))), c42Stars))
  const c42Lines = new THREE.LineBasicMaterial({ color: 0xc9c1ff, transparent: true, opacity: 0, fog: false, depthWrite: false })
  for (const stroke of [FOUR, FOUR_STEM, TWO]) c42.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(stroke.map(([x, y]) => new THREE.Vector3(x, y, 0))), c42Lines))
  c42.scale.setScalar(15)
  c42.position.set(-42, 118, -276)
  c42.lookAt(0, 0, 10)
  scene.add(c42)

  const birdMat = new THREE.LineBasicMaterial({ color: 0x1a1030, transparent: true, opacity: 0, fog: false })
  const birds = Array.from({ length: 5 }, (_, i) => {
    const b = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1, 0.4, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0.4, 0)]), birdMat)
    scene.add(b)
    return { b, y: 12 + i * 1.6 + rnd() * 2, z: -90 - rnd() * 30, x0: rnd() * 200, speed: 3 + rnd() * 1.5, phase: rnd() * 6 }
  })

  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 900)
  const camPath = new THREE.CatmullRomCurve3(CAM.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
  const lookPath = new THREE.CatmullRomCurve3(LOOK.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
  const pos = new THREE.Vector3()
  const aim = new THREE.Vector3()
  const diveCam = new THREE.Vector3(...DIVE_CAM)
  const diveLook = new THREE.Vector3(...DIVE_LOOK)
  const colour = new THREE.Color()
  const colourB = new THREE.Color()
  const colourAt = (values: number[], index: number, out: THREE.Color) => {
    const i = Math.min(values.length - 1, Math.max(0, Math.floor(index)))
    const j = Math.min(values.length - 1, i + 1)
    const f = Math.min(1, Math.max(0, index - i))
    return out.set(values[i]).lerp(colourB.set(values[j]), f * f * (3 - 2 * f))
  }
  const sunDir = new THREE.Vector3()

  const update = (t: number, { index, pointer, dive }: FlightState) => {
    const u = index / (WAYPOINTS.length - 1)
    camPath.getPoint(u, pos)
    lookPath.getPoint(u, aim)
    // Arriving: from up in the clouds down to the path, easing out.
    if (dive < 1) {
      const e = 1 - (1 - dive) ** 3
      pos.lerpVectors(diveCam, pos, e)
      aim.lerpVectors(diveLook, aim, e)
    }
    pos.x += Math.sin(t * 0.07) * 2.2 + pointer.x * 1.6
    pos.y += Math.sin(t * 0.11) * 0.5 - pointer.y * 0.8
    pos.y = Math.max(pos.y, terrain(pos.x, pos.z) + 1.5, WATER_Y + 1.2)
    camera.position.copy(pos)
    camera.lookAt(aim.x + pointer.x * 3, aim.y - pointer.y * 1.5, aim.z)

    // The time of day, from the same place along the flight.
    skyMat.color.copy(colourAt(KEYS.sky, index, colour))
    const fogC = colourAt(KEYS.fog, index, new THREE.Color())
    fog.color.copy(fogC)
    const sunY = keyframe(KEYS.sunY, index)
    sun.position.set(SUN_XZ[0], sunY, SUN_XZ[1])
    // The glow sits a little behind the disc (away from the camera): at the same point, its plane would cut through
    // the disc's and light one half of it, a seam that swings around as the camera moves.
    halo.position.copy(sun.position).addScaledVector(sunDir.subVectors(sun.position, pos).normalize(), 6)
    sunDir.copy(sun.position).normalize()
    sunLight.position.copy(sunDir).multiplyScalar(100)
    sunLight.intensity = keyframe(KEYS.sun, index)
    halo.material.opacity = keyframe(KEYS.glow, index) * (1 - (t ? (Math.sin(t * 0.4) + 1) * 0.12 : 0))
    const stars = keyframe(KEYS.stars, index)
    smallStars.opacity = 0.8 * stars
    brightStars.opacity = stars * (0.75 + Math.sin(t * 1.7) * 0.25)
    const c = keyframe(KEYS.c42, index)
    c42Stars.opacity = c
    c42Lines.opacity = c * 0.45
    for (const m of cloudMats) m.color.copy(skyMat.color).lerp(fogC, 0.25)
    for (const cl of clouds) cl.s.position.x = ((cl.x + t * cl.speed + 210) % 420) - 210
    birdMat.opacity = keyframe(KEYS.birds, index) * 0.85
    for (const b of birds) {
      b.b.position.set(((b.x0 + t * b.speed) % 220) - 110, b.y + Math.sin(t * 0.5 + b.phase) * 0.6, b.z)
      const beat = Math.sin(t * 9 + b.phase) * Math.max(0, Math.sin(t * 0.8 + b.phase))
      b.b.scale.set(1.4, 1.4 * (1 + beat * 0.8), 1)
    }
    if (water) {
      const uniforms = (water.material as THREE.ShaderMaterial).uniforms
      uniforms.time.value = t * 0.35
      uniforms.sunDirection.value.copy(sunDir)
    }
    if (rippleUniforms) rippleUniforms.rippleClock.value = t
  }

  // Touching the lake: where the screen point's ray meets the water's plane, a ripple starts (oldest replaced).
  const ray = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -WATER_Y)
  const hit = new THREE.Vector3()
  const ndc = new THREE.Vector2()
  let next = 0
  const touch = (x: number, y: number, t: number) => {
    if (!rippleUniforms) return false
    ray.setFromCamera(ndc.set(x, y), camera)
    if (!ray.ray.intersectPlane(plane, hit)) return false
    // Only on the water itself.
    if (Math.abs(hit.x - LAKE.x) > LAKE.w || Math.abs(hit.z - LAKE.z) > LAKE.d) return false
    rippleUniforms.ripples.value[next].set(hit.x, hit.z, t)
    next = (next + 1) % RIPPLES
    return true
  }

  update(0, { index: 0, pointer: { x: 0, y: 0 }, dive: 1 })
  return { camera, update, touch }
}
