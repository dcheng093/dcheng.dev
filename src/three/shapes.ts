import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js'
import { DREAM_TEXTURES, TEXTURES, type ShapeId, type TextureId } from './pageScenes'
import { texture } from './stage'

/** A small canvas drawn by hand, used as a texture (dice pips, CD shine, labels). */
function drawn(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  draw(canvas.getContext('2d')!, size)
  const t = new THREE.CanvasTexture(canvas)
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const skin = (id: TextureId, repeat = 1, extra: THREE.MeshLambertMaterialParameters = {}) =>
  new THREE.MeshLambertMaterial({ map: texture(TEXTURES[id], repeat), ...extra })

const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.22], [0.75, 0.22], [0.25, 0.5], [0.75, 0.5], [0.25, 0.78], [0.75, 0.78]],
}

function dice() {
  // Box faces go +x -x +y -y +z -z; opposite faces add up to 7 like a real die.
  const faces = [3, 4, 1, 6, 2, 5].map(
    (n) =>
      new THREE.MeshLambertMaterial({
        map: drawn(32, (c, s) => {
          c.fillStyle = '#c4001a'
          c.fillRect(0, 0, s, s)
          c.fillStyle = '#fff'
          for (const [x, y] of PIPS[n]) {
            c.beginPath()
            c.arc(x * s, y * s, s * 0.09, 0, Math.PI * 2)
            c.fill()
          }
        }),
      }),
  )
  return new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.1, 1.1, 2, 0.12), faces)
}

function crystal(tex: TextureId) {
  const g = new THREE.Group()
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 12), skin(tex, 1, { transparent: true, opacity: 0.88, emissive: 0x401060 }))
  ball.position.y = 0.2
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.5, 0.35, 12), new THREE.MeshLambertMaterial({ color: 0xc9a227 }))
  stand.position.y = -0.55
  g.add(ball, stand)
  return g
}

function cd() {
  // Daniel's CD photo: a ring's planar UVs line it up as a real disc.
  return new THREE.Mesh(new THREE.RingGeometry(0.14, 0.95, 40), new THREE.MeshLambertMaterial({ map: texture(DREAM_TEXTURES.cd), side: THREE.DoubleSide }))
}

function floppy() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.08), new THREE.MeshLambertMaterial({ color: 0x1b2a6b }))
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.5),
    new THREE.MeshLambertMaterial({
      map: drawn(64, (c, s) => {
        c.fillStyle = '#fff'
        c.fillRect(0, 0, s, s)
        c.fillStyle = '#c00'
        c.font = 'bold 13px monospace'
        c.fillText('DANIEL', 6, s * 0.42)
        c.fillText('.EXE', 6, s * 0.72)
      }),
    }),
  )
  label.position.set(0, -0.2, 0.045)
  const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.1), new THREE.MeshLambertMaterial({ color: 0xb8b8c0 }))
  shutter.position.y = 0.38
  g.add(body, label, shutter)
  return g
}

function coin() {
  const face = new THREE.MeshLambertMaterial({
    map: drawn(64, (c, s) => {
      c.fillStyle = '#e8b923'
      c.fillRect(0, 0, s, s)
      c.fillStyle = '#9a6b00'
      c.font = 'bold 40px serif'
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText('D', s / 2, s / 2 + 2)
    }),
  })
  const rim = new THREE.MeshLambertMaterial({ color: 0xc9961a })
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.14, 28), [rim, face, face])
  m.rotation.x = Math.PI / 2
  return new THREE.Group().add(m)
}

function star(tex: TextureId) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.38 : 0.9
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 })
  geo.center()
  return new THREE.Mesh(geo, skin(tex))
}

/** Builds one of the shapes, skinned with a texture from the pool where it makes sense. */
export function buildShape(shape: ShapeId, tex: TextureId): THREE.Object3D {
  switch (shape) {
    case 'dice':
      return dice()
    case 'teapot':
      return new THREE.Mesh(new TeapotGeometry(0.55, 5), skin(tex))
    case 'crystal':
      return crystal(tex)
    case 'cd':
      return cd()
    case 'floppy':
      return floppy()
    case 'coin':
      return coin()
    case 'knot':
      return new THREE.Mesh(new THREE.TorusKnotGeometry(0.52, 0.19, 80, 10), skin(tex, 3))
    case 'gem':
      return new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), skin(tex, 1, { flatShading: true }))
    case 'donut':
      return new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.28, 12, 24), skin(tex, 2))
    case 'star':
      return star(tex)
    case 'octa':
      return new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), skin(tex, 1, { flatShading: true }))
  }
}
