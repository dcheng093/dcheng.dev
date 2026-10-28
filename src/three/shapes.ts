import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js'
import { voxelWord } from '../lib/voxelFont'
import { HEADS, PHOTOS } from './heads'
import { TEX, type ShapeId, type TexRef } from './pageScenes'
import { keyedTexture, procTexture, type ProcId } from './procTextures'
import { texture } from './stage'

// Low-poly builders for every 3D object on the site. Each fits roughly inside a unit sphere (radius ~1) so any
// of them can be shown at any size. Textures come from Daniel's packs (TEX) or are drawn in code ('proc:…').

export function resolveTex(ref: TexRef, repeat = 1): THREE.Texture {
  return ref.startsWith('proc:') ? procTexture(ref.slice(5) as ProcId) : texture(TEX[ref as keyof typeof TEX], repeat)
}

type MatOpts = THREE.MeshLambertMaterialParameters
const M = (ref: TexRef, extra: MatOpts = {}, repeat = 1) => new THREE.MeshLambertMaterial({ map: resolveTex(ref, repeat), ...extra })
const C = (color: THREE.ColorRepresentation, extra: MatOpts = {}) => new THREE.MeshLambertMaterial({ color, ...extra })
const glow = (color: THREE.ColorRepresentation) => new THREE.MeshBasicMaterial({ color })

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  m.rotation.set(rx, ry, rz)
  return m
}
const group = (...children: THREE.Object3D[]) => new THREE.Group().add(...children)
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d)
const cyl = (rt: number, rb: number, h: number, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg)
const ball = (r: number, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h)

/** A small canvas drawn by hand, used once (dice pips, numbers, labels). */
function drawn(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  draw(canvas.getContext('2d')!, size)
  const t = new THREE.CanvasTexture(canvas)
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function extruded(points: [number, number][], depth: number, mat: THREE.Material) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 })
  geo.center()
  return new THREE.Mesh(geo, mat)
}

const heartPoints = (): [number, number][] =>
  Array.from({ length: 40 }, (_, i) => {
    const t = (i / 40) * Math.PI * 2
    return [(16 * Math.sin(t) ** 3) / 17, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]
  })

const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.22], [0.75, 0.22], [0.25, 0.5], [0.75, 0.5], [0.25, 0.78], [0.75, 0.78]],
}

/** A flat textured plane, both sides, with transparency (cut-outs, the goose, billboards). */
const card = (map: THREE.Texture, w: number, h: number) =>
  new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }))

function voxels(pixels: [number, number][], w: number, h: number, mat: THREE.Material, width = 2.1) {
  const s = width / w
  const im = new THREE.InstancedMesh(box(s * 0.95, s * 0.95, s * 1.6), mat, pixels.length)
  const m = new THREE.Matrix4()
  pixels.forEach(([x, y], i) => im.setMatrixAt(i, m.makeTranslation((x - (w - 1) / 2) * s, ((h - 1) / 2 - y) * s, 0)))
  return group(im)
}

const HEART_BITMAP = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']

type Extra = { text?: string; photo?: number }

/** Builds a shape, skinned with `tex` where it makes sense (each shape has a sensible default). */
export function buildShape(shape: ShapeId, tex?: TexRef, extra: Extra = {}): THREE.Object3D {
  const t = (fallback: TexRef) => tex ?? fallback
  const photo = extra.photo ?? 0
  switch (shape) {
    // ——— the originals ———
    case 'dice': {
      const faces = [3, 4, 1, 6, 2, 5].map((n) =>
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
    case 'teapot':
      return new THREE.Mesh(new TeapotGeometry(0.55, 5), M(t('marble')))
    case 'crystal':
      return group(
        mesh(ball(0.62, 18, 12), M(t('blobs'), { transparent: true, opacity: 0.88, emissive: 0x401060 }), 0, 0.2),
        mesh(cyl(0.32, 0.5, 0.35, 12), C(0xc9a227), 0, -0.55),
      )
    case 'cd':
      return new THREE.Mesh(new THREE.RingGeometry(0.14, 0.95, 40), M(t('cd'), { side: THREE.DoubleSide }))
    case 'floppy':
      return group(
        mesh(box(1.1, 1.1, 0.08), C(0x1b2a6b)),
        mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshLambertMaterial({ map: drawn(64, (c, s) => {
          c.fillStyle = '#fff'
          c.fillRect(0, 0, s, s)
          c.fillStyle = '#c00'
          c.font = 'bold 13px monospace'
          c.fillText('DANIEL', 6, s * 0.42)
          c.fillText('.EXE', 6, s * 0.72)
        }) }), 0, -0.2, 0.045),
        mesh(box(0.5, 0.32, 0.1), C(0xb8b8c0), 0, 0.38),
      )
    case 'coin': {
      const face = new THREE.MeshLambertMaterial({ map: drawn(64, (c, s) => {
        c.fillStyle = '#e8b923'
        c.fillRect(0, 0, s, s)
        c.fillStyle = '#9a6b00'
        c.font = 'bold 40px serif'
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        c.fillText('D', s / 2, s / 2 + 2)
      }) })
      return group(mesh(cyl(0.85, 0.85, 0.14, 28), [C(0xc9961a), face, face], 0, 0, 0, Math.PI / 2))
    }
    case 'knot':
      return new THREE.Mesh(new THREE.TorusKnotGeometry(0.52, 0.19, 80, 10), M(t('streaks'), {}, 3))
    case 'gem':
      return new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), M(t('triangles'), { flatShading: true }))
    case 'donut':
      return new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.28, 12, 24), M(t('graph'), {}, 2))
    case 'star': {
      const pts: [number, number][] = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? 0.38 : 0.9
        const a = (i / 10) * Math.PI * 2 + Math.PI / 2
        return [Math.cos(a) * r, Math.sin(a) * r]
      })
      return extruded(pts, 0.25, M(t('blobs')))
    }
    case 'octa':
      return new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), M(t('steel'), { flatShading: true }))

    // ——— Daniel himself ———
    case 'photoCube':
      return new THREE.Mesh(
        box(1.15, 1.15, 1.15),
        Array.from({ length: 6 }, (_, i) => new THREE.MeshLambertMaterial({ map: texture(PHOTOS[(photo + i) % PHOTOS.length], 1, true) })),
      )
    case 'head':
      return card(texture(HEADS[photo % HEADS.length]), 1.9, 1.9)
    case 'portrait': {
      const gold = M(t('goldMetal'))
      return group(
        mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshLambertMaterial({ map: texture(PHOTOS[photo % PHOTOS.length]) }), 0, 0, 0.06),
        mesh(box(1.5, 0.2, 0.18), gold, 0, 0.8),
        mesh(box(1.5, 0.2, 0.18), gold, 0, -0.8),
        mesh(box(0.2, 1.8, 0.18), gold, 0.65),
        mesh(box(0.2, 1.8, 0.18), gold, -0.65),
        mesh(box(1.3, 1.6, 0.06), C(0x3a2410), 0, 0, -0.03),
      )
    }

    // ——— money, prizes, shopping ———
    case 'car': {
      const wheel = C(0x111111)
      const wheels = [-0.55, 0.55].flatMap((x) => [-0.42, 0.42].map((z) => mesh(cyl(0.22, 0.22, 0.14, 12), wheel, x, -0.32, z, Math.PI / 2)))
      return group(
        mesh(box(1.7, 0.45, 0.85), M(t('proc:caution'), { color: 0xff4444 })),
        mesh(box(0.9, 0.38, 0.75), C(0xd8f0ff), -0.08, 0.4),
        ...wheels,
      )
    }
    case 'trophy': {
      const gold = M(t('goldMetal'))
      const profile = [[0, 0], [0.55, 0.05], [0.6, 0.6], [0.35, 0.95], [0.12, 1.05], [0.12, 1.35], [0.4, 1.45], [0.42, 1.6], [0, 1.6]].map(([x, y]) => new THREE.Vector2(x, y))
      const cup = mesh(new THREE.LatheGeometry(profile.reverse(), 16), gold, 0, -0.85)
      cup.scale.y = -1
      cup.position.y = 0.75
      return group(cup, mesh(new THREE.TorusGeometry(0.28, 0.06, 6, 12, Math.PI), gold, 0.62, 0.45, 0, 0, 0, -Math.PI / 2), mesh(new THREE.TorusGeometry(0.28, 0.06, 6, 12, Math.PI), gold, -0.62, 0.45, 0, 0, 0, Math.PI / 2))
    }
    case 'gift':
      return group(
        mesh(box(1.1, 0.9, 1.1), M(t('proc:giftWrap'))),
        mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 12), C(0xffd400), -0.18, 0.55, 0, 0, Math.PI / 2, 0.6),
        mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 12), C(0xffd400), 0.18, 0.55, 0, 0, Math.PI / 2, -0.6),
      )
    case 'coinStack': {
      const gold = C(0xe8b923)
      return group(...Array.from({ length: 6 }, (_, i) => mesh(cyl(0.6, 0.6, 0.12, 20), gold, Math.sin(i * 2) * 0.06, -0.5 + i * 0.16, Math.cos(i * 2) * 0.06)))
    }
    case 'cash':
      return group(...Array.from({ length: 5 }, (_, i) => mesh(box(1.6, 0.06, 0.7), M(t('dollars')), Math.sin(i) * 0.05, -0.2 + i * 0.09, 0, 0, i * 0.1)))
    case 'creditCard':
      return mesh(box(1.6, 1.0, 0.04), M(t('proc:creditCard')))
    case 'receipt':
      return mesh(box(0.75, 1.7, 0.02), M(t('proc:receipt')), 0, 0, 0, 0.1, 0, 0.08)
    case 'barcode':
      return mesh(box(1.5, 0.9, 0.12), [C(0xffffff), C(0xffffff), C(0xffffff), C(0xffffff), M(t('proc:barcode')), M(t('proc:barcode'))])
    case 'playingCard':
      return mesh(box(0.95, 1.35, 0.03), M(t('proc:card')))
    case 'pokerChip': {
      const face = M(t('proc:chip'))
      return mesh(cyl(0.8, 0.8, 0.16, 28), [C(0xb00020), face, face], 0, 0, 0, Math.PI / 2)
    }

    // ——— desk & stationery ———
    case 'clipboard':
      return group(
        mesh(box(1.1, 1.5, 0.06), M('proc:wood')),
        mesh(new THREE.PlaneGeometry(0.9, 1.15), M(t('proc:paper')), 0, -0.08, 0.04),
        mesh(box(0.5, 0.18, 0.1), C(0xb8b8c0), 0, 0.68, 0.05),
      )
    case 'checkbox':
      return mesh(box(1, 1, 1), M(t('proc:checkbox')))
    case 'pencil':
      return group(
        mesh(cyl(0.12, 0.12, 1.5, 6), C(0xf2c200), 0, 0, 0),
        mesh(new THREE.ConeGeometry(0.12, 0.35, 6), M('proc:wood'), 0, -0.92, 0, Math.PI),
        mesh(cyl(0.12, 0.12, 0.2, 6), C(0xff8fb1), 0, 0.85),
      ).rotateZ(0.8)
    case 'book':
      return group(
        mesh(box(0.8, 1.1, 0.05), C(0x8b1a1a), -0.4, 0, 0, 0, 0.35),
        mesh(box(0.8, 1.1, 0.05), C(0x8b1a1a), 0.4, 0, 0, 0, -0.35),
        mesh(box(0.74, 1.0, 0.12), M(t('proc:paper')), -0.38, 0, 0.07, 0, 0.35),
        mesh(box(0.74, 1.0, 0.12), M(t('proc:paper')), 0.38, 0, 0.07, 0, -0.35),
      )
    case 'quill': {
      const feather = mesh(ball(0.5, 10, 8), C(0xfafafa), 0, 0.35)
      feather.scale.set(0.35, 1.3, 0.08)
      return group(feather, mesh(cyl(0.025, 0.04, 1.6, 6), C(0xd9c9a3), 0, -0.1)).rotateZ(-0.6)
    }
    case 'envelope':
      return group(
        mesh(box(1.5, 1, 0.06), C(0xfff6e6)),
        mesh(new THREE.ConeGeometry(0.75, 0.55, 3), C(0xf0e2c6), 0, 0.22, 0.05, Math.PI / 2, 0, Math.PI),
        mesh(ball(0.12, 10, 8), C(0xc0102a), 0, 0.02, 0.1),
      )
    case 'cone':
      return group(
        mesh(new THREE.ConeGeometry(0.55, 1.4, 16), C(0xff6a00), 0, 0.1),
        mesh(cyl(0.29, 0.36, 0.22, 16), C(0xffffff), 0, 0.12),
        mesh(box(1.2, 0.12, 1.2), C(0x222222), 0, -0.62),
      )
    case 'hardHat':
      return group(
        mesh(new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), C(0xffd000), 0, -0.2),
        mesh(cyl(0.95, 0.95, 0.06, 20), C(0xffd000), 0, -0.2),
        mesh(box(0.12, 0.7, 0.9), C(0xf2c000), 0, 0.15),
      )
    case 'bricks': {
      const m = M(t('proc:bricks'))
      return group(...[[-0.42, -0.3], [0.42, -0.3], [0, 0.18], [-0.84, 0.18], [0.84, 0.18], [0.42, 0.66]].map(([x, y]) => mesh(box(0.8, 0.44, 0.5), m, x * 0.75, y)))
    }
    case 'magnifier':
      return group(
        mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 24), C(0x333333), 0, 0.25),
        mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshLambertMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }), 0, 0.25),
        mesh(cyl(0.08, 0.1, 0.8, 8), M('proc:wood'), 0.45, -0.5, 0, 0, 0, 0.75),
      )
    case 'shield':
      return extruded([[0, 1], [0.8, 0.75], [0.75, -0.1], [0, -1], [-0.75, -0.1], [-0.8, 0.75]], 0.2, M(t('purpleMetal')))
    case 'virus': {
      const spikeMat = C(0x66ff99, { emissive: 0x114422 })
      const dirs = new THREE.IcosahedronGeometry(1, 0).getAttribute('position')
      const spikes: THREE.Object3D[] = []
      const seen = new Set<string>()
      for (let i = 0; i < dirs.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(dirs, i).normalize()
        const key = v.toArray().map((n) => n.toFixed(2)).join()
        if (seen.has(key)) continue
        seen.add(key)
        const spike = mesh(new THREE.ConeGeometry(0.1, 0.4, 6), spikeMat)
        spike.position.copy(v.clone().multiplyScalar(0.72))
        spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v)
        spikes.push(spike)
      }
      return group(mesh(ball(0.6), M(t('plasma'))), ...spikes)
    }

    // ——— tech ———
    case 'laptop':
      return group(
        mesh(box(1.5, 0.08, 1), M('proc:keycaps'), 0, -0.4, 0.2),
        mesh(box(1.5, 1, 0.06), C(0x2a2a2a), 0, 0.1, -0.3, -0.25),
        mesh(new THREE.PlaneGeometry(1.35, 0.85), M(t('kaleidoscope')), 0, 0.1, -0.265, -0.25),
      )
    case 'monitor':
      return group(
        mesh(box(1.4, 1.1, 0.9), C(0xd8d0b8), 0, 0.15, -0.2),
        mesh(new THREE.PlaneGeometry(1.1, 0.8), M(t('kaleidoscope'), { emissive: 0x222222 }), 0, 0.17, 0.26),
        mesh(box(0.6, 0.12, 0.5), C(0xc8c0a8), 0, -0.48, -0.1),
      )
    case 'keyboard':
      return mesh(box(1.8, 0.14, 0.7), [C(0x333333), C(0x333333), M(t('proc:keycaps')), C(0x333333), C(0x333333), C(0x333333)], 0, 0, 0, 0.5)
    case 'mouse': {
      const body = mesh(ball(0.5, 16, 12), C(0xe0e0e0))
      body.scale.set(0.75, 0.45, 1.1)
      return group(body, mesh(cyl(0.06, 0.06, 0.1, 8), C(0x444444), 0, 0.22, -0.2, 0, 0, Math.PI / 2))
    }
    case 'headset': {
      const m = M(t('purpleMetal'))
      return group(
        mesh(new THREE.TorusGeometry(0.7, 0.08, 8, 24, Math.PI), m, 0, -0.05),
        mesh(cyl(0.3, 0.3, 0.22, 16), C(0x222222), 0.72, -0.2, 0, 0, 0, Math.PI / 2),
        mesh(cyl(0.3, 0.3, 0.22, 16), C(0x222222), -0.72, -0.2, 0, 0, 0, Math.PI / 2),
      )
    }
    case 'mousepad':
      return mesh(box(1.7, 0.05, 1.3), [C(0x111111), C(0x111111), M(t('kaleidoscope')), C(0x111111), C(0x111111), C(0x111111)], 0, 0, 0, 0.6)
    case 'joystick':
      return group(
        mesh(box(1.1, 0.35, 0.8), C(0x222222), 0, -0.55),
        mesh(cyl(0.06, 0.06, 0.8, 8), C(0x999999), 0, -0.05, 0, 0.2),
        mesh(ball(0.22), C(0xe0102a), 0, 0.4, 0.08),
        mesh(cyl(0.1, 0.1, 0.08, 12), C(0xffd400), 0.35, -0.34, 0.15),
      )
    case 'cassette':
      return mesh(box(1.6, 1, 0.2), [C(0x1d1d1d), C(0x1d1d1d), C(0x1d1d1d), C(0x1d1d1d), M(t('proc:cassette')), M(t('proc:cassette'))])
    case 'vinyl': {
      const face = M(t('proc:vinyl'))
      return mesh(cyl(0.95, 0.95, 0.04, 32), [C(0x0a0a0a), face, face], 0, 0, 0, Math.PI / 2)
    }
    case 'note': {
      const black = C(0x111111, { emissive: 0x220022 })
      const head = mesh(ball(0.32), black, -0.2, -0.55)
      head.scale.set(1.3, 1, 0.8)
      return group(head, mesh(cyl(0.05, 0.05, 1.3, 6), black, 0.17, 0.08), mesh(box(0.45, 0.14, 0.08), black, 0.38, 0.62, 0, 0, 0, -0.4))
    }

    // ——— mystic & craft ———
    case 'tarot':
      return mesh(box(0.9, 1.45, 0.03), M(t('proc:tarot')))
    case 'eye': {
      const iris = mesh(new THREE.CircleGeometry(0.32, 20), C(0x2e7bd6), 0, 0, 0.71)
      const pupil = mesh(new THREE.CircleGeometry(0.15, 16), C(0x000000), 0, 0, 0.72)
      const shine = mesh(new THREE.CircleGeometry(0.05, 8), glow(0xffffff), -0.08, 0.1, 0.73)
      return group(mesh(ball(0.72, 20, 14), C(0xf6f2ea)), iris, pupil, shine)
    }
    case 'candle':
      return group(
        mesh(cyl(0.28, 0.3, 1.3, 14), C(0xf3ead2), 0, -0.25),
        mesh(cyl(0.02, 0.02, 0.15, 4), C(0x222222), 0, 0.47),
        mesh(new THREE.ConeGeometry(0.12, 0.35, 10), glow(0xffa420), 0, 0.7),
      )
    case 'moon':
      return mesh(ball(0.85, 18, 12), M(t('crackedStone'), { emissive: 0x1a1a30 }))
    case 'palette': {
      const blobs = ['#e0102a', '#ffd400', '#1e90ff', '#22b14c', '#ff66cc'].map((c, i) => {
        const a = 0.4 + i * 0.55
        return mesh(ball(0.12, 8, 6), C(c), Math.cos(a) * 0.55, Math.sin(a) * 0.4, 0.12)
      })
      const board = mesh(cyl(0.95, 0.95, 0.08, 20), M('proc:wood'), 0, 0, 0, Math.PI / 2)
      board.scale.set(1, 1, 0.75)
      return group(board, ...blobs, mesh(cyl(0.16, 0.16, 0.1, 12), C(0x000000), -0.45, -0.3, 0, Math.PI / 2))
    }
    case 'voxelHeart': {
      const pixels: [number, number][] = []
      HEART_BITMAP.forEach((row, y) => [...row].forEach((ch, x) => ch === '#' && pixels.push([x, y])))
      return voxels(pixels, 7, 6, M(t('tieDyeSpiral')), 1.8)
    }

    // ——— everyday ———
    case 'door':
      return group(
        mesh(box(0.95, 1.75, 0.12), M('proc:wood')),
        mesh(ball(0.07, 8, 6), C(0xd4a72c), 0.33, 0, 0.1),
        mesh(box(1.1, 0.08, 0.16), C(0x5a3a1a), 0, 0.9),
      )
    case 'suitcase':
      return group(
        mesh(new RoundedBoxGeometry(1.5, 1, 0.45, 2, 0.08), M(t('proc:wood'), { color: 0xa0522d })),
        mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 12, Math.PI), C(0x222222), 0, 0.5),
        mesh(box(0.08, 1.02, 0.47), C(0x6b3e1e), -0.4),
        mesh(box(0.08, 1.02, 0.47), C(0x6b3e1e), 0.4),
      )
    case 'sadFace': {
      const face = M(t('proc:sad'))
      return mesh(cyl(0.85, 0.85, 0.15, 28), [C(0xe8b92a), face, face], 0, 0, 0, Math.PI / 2, Math.PI / 2)
    }
    case 'mug': {
      const profile = [[0.45, -0.55], [0.5, 0.55], [0.44, 0.55], [0.4, -0.48], [0, -0.48]].map(([x, y]) => new THREE.Vector2(x, y))
      return group(
        mesh(new THREE.LatheGeometry(profile, 18), M(t('proc:enamel'), { side: THREE.DoubleSide, color: 0xffe8f0 })),
        mesh(new THREE.TorusGeometry(0.25, 0.07, 8, 14), C(0xffe8f0), 0.52, 0),
        mesh(new THREE.CircleGeometry(0.44, 16), C(0x5a3010), 0, 0.42, 0, -Math.PI / 2),
      )
    }
    case 'teaBag':
      return group(
        mesh(box(0.8, 0.9, 0.14), C(0xf0e6d0)),
        mesh(cyl(0.01, 0.01, 0.8, 4), C(0xffffff), 0, 0.85),
        mesh(box(0.35, 0.3, 0.02), C(0xd0102a), 0, 1.3),
      ).translateY(-0.3)
    case 'sugarCube':
      return mesh(box(0.9, 0.9, 0.9), M(t('proc:enamel'), { color: 0xffffff }))

    // ——— horses & teeth ———
    case 'horseshoe':
      return mesh(new THREE.TorusGeometry(0.65, 0.15, 8, 20, Math.PI * 1.45), M(t('steel')), 0, 0, 0, 0, 0, -Math.PI * 0.22 + Math.PI)
    case 'carrot': {
      const leaf = C(0x2f9e2f)
      return group(
        mesh(new THREE.ConeGeometry(0.28, 1.4, 10), C(0xff7a1a), 0, -0.2, 0, Math.PI),
        mesh(new THREE.ConeGeometry(0.06, 0.45, 5), leaf, -0.08, 0.7, 0, 0, 0, 0.3),
        mesh(new THREE.ConeGeometry(0.06, 0.5, 5), leaf, 0.06, 0.72, 0, 0, 0, -0.3),
      ).rotateZ(0.6)
    }
    case 'hayBale':
      return mesh(cyl(0.7, 0.7, 1.1, 14), M(t('proc:hay'), {}, 2), 0, 0, 0, 0, 0, Math.PI / 2)
    case 'tooth': {
      const enamel = M(t('proc:enamel'))
      const crown = mesh(new RoundedBoxGeometry(1, 0.8, 0.8, 3, 0.25), enamel, 0, 0.25)
      const roots = [-0.25, 0.25].map((x) => mesh(new THREE.ConeGeometry(0.2, 0.8, 8), enamel, x, -0.45, 0, Math.PI))
      return group(crown, ...roots)
    }
    case 'toothbrush':
      return group(
        mesh(box(0.18, 1.7, 0.14), C(0x29a8e0), 0, -0.1),
        mesh(box(0.22, 0.45, 0.22), C(0xffffff), 0, 0.62, 0.15),
      ).rotateZ(0.7)
    case 'dentures': {
      const gum = C(0xff8fa8)
      const tooth = M('proc:enamel')
      const teeth = (y: number) => Array.from({ length: 7 }, (_, i) => {
        const a = Math.PI * (0.15 + (i / 6) * 0.7)
        return mesh(box(0.16, 0.22, 0.12), tooth, Math.cos(a) * 0.6, y, Math.sin(a) * 0.4)
      })
      return group(
        mesh(new THREE.TorusGeometry(0.6, 0.12, 8, 18, Math.PI), gum, 0, 0.32, 0, Math.PI / 2),
        mesh(new THREE.TorusGeometry(0.6, 0.12, 8, 18, Math.PI), gum, 0, -0.32, 0, Math.PI / 2),
        ...teeth(0.14),
        ...teeth(-0.14),
      ).rotateX(0.4)
    }
    case 'mouthwash':
      return group(
        mesh(cyl(0.4, 0.45, 1.3, 14), new THREE.MeshLambertMaterial({ color: 0x18c8c0, transparent: true, opacity: 0.8 }), 0, -0.1),
        mesh(cyl(0.22, 0.22, 0.3, 12), C(0xffffff), 0, 0.7),
      )

    // ——— code shrines ———
    case 'skull': {
      const bone = M('proc:enamel', { color: 0xf0ead8 })
      const hole = C(0x000000)
      return group(
        mesh(ball(0.7, 16, 12), bone, 0, 0.15),
        mesh(box(0.7, 0.35, 0.6), bone, 0, -0.45, 0.1),
        mesh(ball(0.16, 8, 6), hole, -0.25, 0.15, 0.58),
        mesh(ball(0.16, 8, 6), hole, 0.25, 0.15, 0.58),
        mesh(new THREE.ConeGeometry(0.08, 0.16, 3), hole, 0, -0.08, 0.64, Math.PI),
      )
    }
    case 'normSlab':
      return mesh(box(1.5, 1.2, 0.15), [C(0x111111), C(0x111111), C(0x111111), C(0x111111), M(t('proc:code')), C(0x111111)])
    case 'redX': {
      const red = C(0xe0102a, { emissive: 0x330000 })
      return group(mesh(box(1.7, 0.35, 0.3), red, 0, 0, 0, 0, 0, Math.PI / 4), mesh(box(1.7, 0.35, 0.3), red, 0, 0, 0, 0, 0, -Math.PI / 4))
    }
    case 'warning':
      return group(
        extruded([[0, 0.95], [1, -0.75], [-1, -0.75]], 0.18, C(0xffd000)),
        mesh(box(0.14, 0.6, 0.1), C(0x111111), 0, 0.12, 0.2),
        mesh(box(0.14, 0.14, 0.1), C(0x111111), 0, -0.45, 0.2),
      )
    case 'numberStack':
      return group(
        ...[5, 2, 8, 1].map((n, i) =>
          mesh(box(0.55, 0.42, 0.55), new THREE.MeshLambertMaterial({ map: drawn(32, (c, s) => {
            c.fillStyle = `hsl(${n * 40} 80% 60%)`
            c.fillRect(0, 0, s, s)
            c.fillStyle = '#000'
            c.font = 'bold 22px monospace'
            c.fillText(String(n), 9, 24)
          }) }), 0, -0.66 + i * 0.44),
        ),
      )
    case 'arrows': {
      const up: [number, number][] = [[0, 0.6], [0.4, 0.15], [0.15, 0.15], [0.15, -0.6], [-0.15, -0.6], [-0.15, 0.15], [-0.4, 0.15]]
      const a = extruded(up, 0.15, C(0x22b14c))
      const b = extruded(up, 0.15, C(0xe0102a))
      a.position.x = -0.45
      b.position.x = 0.45
      b.rotation.z = Math.PI
      return group(a, b)
    }

    // ——— abstract & cosmic ———
    case 'heart':
      return extruded(heartPoints(), 0.3, M(t('tieDyeCircle')))
    case 'cloud': {
      const white = M(t('puffySky'), { color: 0xffffff, emissive: 0x333333 })
      return group(...[[0, 0.1, 0.45], [-0.45, -0.05, 0.35], [0.45, -0.05, 0.38], [0.2, 0.35, 0.3], [-0.2, 0.3, 0.3]].map(([x, y, r]) => mesh(ball(r, 12, 10), white, x, y)))
    }
    case 'globe':
      return group(
        mesh(ball(0.75, 24, 16), M(t('earth'))),
        mesh(new THREE.TorusGeometry(0.85, 0.035, 6, 30, Math.PI), C(0xc9a227), 0, 0, 0, 0, 0, Math.PI / 2 + 0.4),
        mesh(cyl(0.3, 0.4, 0.12, 14), M('worldMap'), 0, -0.98),
      )

    // ——— legendaries ———
    case 'beef':
      return group(
        mesh(new RoundedBoxGeometry(1.6, 0.4, 1.1, 2, 0.15), M(t('beef'))),
        mesh(cyl(0.07, 0.07, 0.9, 8), C(0xf4efe2), 0, 0.02, 0, 0, 0, Math.PI / 2),
        mesh(ball(0.12, 8, 6), C(0xf4efe2), -0.48, 0.02),
        mesh(ball(0.12, 8, 6), C(0xf4efe2), 0.48, 0.02),
      )
    case 'goose':
      return card(keyedTexture(TEX.goose, 'white'), 2, 1.5)
    case 'planet': {
      const moon = card(texture(HEADS[0]), 0.6, 0.6)
      moon.position.set(1.05, 0.15, 0)
      const orbit = group(moon)
      orbit.userData.orbit = true // spun by the object driver
      return group(mesh(ball(0.72, 24, 16), M(t('earth'))), orbit)
    }

    // ——— POPNUKE ———
    case 'nukeLogo':
      return nukeLogo()
    case 'softwareBox':
      return softwareBox()
    case 'popupPane':
      return popupPane(photo)

    // ——— chunky voxel words ———
    case 'text': {
      const { pixels, width } = voxelWord(extra.text ?? 'DANIEL')
      return voxels(pixels, width, 7, M(t('goldMetal')), Math.min(2.4, 0.42 * width))
    }
  }
}

// ——— POPNUKE, the pop-up blocker ———

/** The radiation sign in 3D: black blades raised on both faces of a yellow disc, with a gold rim. */
function nukeLogo() {
  const blade = (a: number) => {
    const shape = new THREE.Shape()
    const r0 = 0.2
    const r1 = 0.82
    const a0 = a - Math.PI / 6
    const a1 = a + Math.PI / 6
    shape.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0)
    shape.absarc(0, 0, r1, a0, a1, false)
    shape.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0)
    shape.absarc(0, 0, r0, a1, a0, true)
    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false, curveSegments: 10 })
  }
  const black = C(0x111111, { emissive: 0x111111 })
  const g = group(mesh(cyl(1, 1, 0.16, 32), C(0xffd400, { emissive: 0x332200 }), 0, 0, 0, Math.PI / 2))
  for (const side of [1, -1])
    for (const a of [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3]) {
      const m = mesh(blade(a), black, 0, 0, side > 0 ? 0.08 : -0.18)
      g.add(m)
    }
  g.add(mesh(cyl(0.13, 0.13, 0.36, 16), black, 0, 0, 0, Math.PI / 2))
  g.add(mesh(new THREE.TorusGeometry(1, 0.07, 8, 40), M('goldMetal')))
  return g
}

function boxFace(draw: (c: CanvasRenderingContext2D, s: number) => void) {
  return new THREE.MeshLambertMaterial({ map: drawn(128, draw) })
}

/** A 1999 boxed-software package: front art, spines, and a back full of promises. */
function softwareBox() {
  const trefoil = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    c.fillStyle = '#ffd400'
    c.beginPath()
    c.arc(x, y, r, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#111'
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3
      c.beginPath()
      c.moveTo(x, y)
      c.arc(x, y, r * 0.85, a - Math.PI / 6, a + Math.PI / 6)
      c.fill()
    }
    c.fillStyle = '#ffd400'
    c.beginPath()
    c.arc(x, y, r * 0.22, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#111'
    c.beginPath()
    c.arc(x, y, r * 0.14, 0, Math.PI * 2)
    c.fill()
  }
  const front = boxFace((c, s) => {
    const g = c.createLinearGradient(0, 0, 0, s)
    g.addColorStop(0, '#1a0033')
    g.addColorStop(1, '#000')
    c.fillStyle = g
    c.fillRect(0, 0, s, s)
    trefoil(c, s / 2, s * 0.42, s * 0.24)
    c.fillStyle = '#ffd400'
    c.font = 'bold 20px Impact, sans-serif'
    c.textAlign = 'center'
    c.fillText('POPNUKE', s / 2, s * 0.13)
    c.font = 'bold 9px sans-serif'
    c.fillStyle = '#fff'
    c.fillText('3000 PROFESSIONAL EDITION', s / 2, s * 0.21)
    c.fillStyle = '#ff3b3b'
    c.font = 'bold 10px sans-serif'
    c.fillText('KILLS ALL POP-UPS*', s / 2, s * 0.78)
    c.fillStyle = '#aaa'
    c.font = '7px sans-serif'
    c.fillText('Daniel Cheng Software Ltd.', s / 2, s * 0.92)
    c.fillStyle = '#e0102a' // the NEW! starburst
    c.beginPath()
    for (let i = 0; i < 16; i++) {
      const r = i % 2 ? 9 : 15
      const a = (i / 16) * Math.PI * 2
      c.lineTo(s * 0.84 + Math.cos(a) * r, s * 0.3 + Math.sin(a) * r)
    }
    c.fill()
    c.fillStyle = '#fff'
    c.font = 'bold 8px sans-serif'
    c.fillText('NEW!', s * 0.84, s * 0.32)
  })
  const back = boxFace((c, s) => {
    c.fillStyle = '#ffd400'
    c.fillRect(0, 0, s, s)
    c.fillStyle = '#111'
    c.font = 'bold 11px sans-serif'
    c.fillText('FEATURES:', 8, 18)
    c.font = '9px sans-serif'
    ;['✓ Nukes pop-ups', '✓ Nukes viruses', '✓ Free (your soul)', '✓ 1.44 MB', '✗ Nukes horses'].forEach((t, i) => c.fillText(t, 10, 36 + i * 15))
    c.font = 'bold 8px sans-serif'
    c.fillText('REAL NO VIRUS 2004', 10, s - 12)
  })
  const spine = boxFace((c, s) => {
    c.fillStyle = '#1a0033'
    c.fillRect(0, 0, s, s)
    c.save()
    c.translate(s / 2, s / 2)
    c.rotate(-Math.PI / 2)
    c.fillStyle = '#ffd400'
    c.font = 'bold 16px Impact, sans-serif'
    c.textAlign = 'center'
    c.fillText('POPNUKE 3000', 0, 6)
    c.restore()
  })
  const plain = C(0x1a0033)
  return mesh(box(1.3, 1.75, 0.45), [spine, spine, plain, plain, front, back])
}

/** A Win95 pop-up window (the enemy), drawn on a thin pane. `variant` picks the message. */
function popupPane(variant: number) {
  const messages = ['YOU WON!!!', 'VIRUS FOUND', 'HOT SINGLES', 'FREE iPOD', 'CLICK HERE', 'WARNING!!!']
  const msg = messages[variant % messages.length]
  const face = boxFace((c, s) => {
    c.fillStyle = '#c0c0c0'
    c.fillRect(0, 0, s, s)
    const g = c.createLinearGradient(0, 0, s, 0)
    g.addColorStop(0, '#000080')
    g.addColorStop(1, '#1084d0')
    c.fillStyle = g
    c.fillRect(3, 3, s - 6, 18)
    c.fillStyle = '#fff'
    c.font = 'bold 10px sans-serif'
    c.fillText('Pop-up.exe', 7, 16)
    c.fillStyle = '#c0c0c0'
    c.fillRect(s - 19, 6, 13, 12)
    c.fillStyle = '#000'
    c.fillText('×', s - 16, 16)
    c.fillStyle = '#e0102a'
    c.font = 'bold 15px Impact, sans-serif'
    c.textAlign = 'center'
    c.fillText(msg, s / 2, s * 0.5)
    c.fillStyle = '#d4d0c8'
    c.fillRect(s * 0.3, s * 0.68, s * 0.4, 18)
    c.fillStyle = '#000'
    c.font = '10px sans-serif'
    c.fillText('OK', s / 2, s * 0.68 + 13)
  })
  return mesh(box(1.5, 1.1, 0.04), [C(0xc0c0c0), C(0xc0c0c0), C(0xc0c0c0), C(0xc0c0c0), face, face])
}
