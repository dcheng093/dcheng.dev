// The link preview's 3D: the enter gate's dream (src/three/dream.ts), drawn once at full resolution with its own
// renderer (the site's shared one draws worlds at a quarter of the screen). The shot looks down the avenue of
// drowned columns towards ghost David, whose place in the middle Daniel's face takes.
// The camera can be nudged from the URL (?cam=x,y,z&look=x,y,z&t=seconds&fov=degrees) while tuning the shot.
import * as THREE from 'three'
import { buildDream } from '../../src/three/dream'

const W = 1200
const H = 630
const params = new URLSearchParams(location.search)
const triple = (name: string, fallback: [number, number, number]) =>
  (params.get(name)?.split(',').map(Number) as [number, number, number] | undefined) ?? fallback

const canvas = document.querySelector<HTMLCanvasElement>('#scene')!
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(2)
renderer.setSize(W, H, false)
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
const { drifting } = buildDream(scene)
const camera = new THREE.PerspectiveCamera(Number(params.get('fov') ?? 60), W / H, 0.1, 140)
camera.position.set(...triple('cam', [-2, 3.5, 22]))
camera.lookAt(...triple('look', [-9, 14, -41]))
const t = Number(params.get('t') ?? 0)
for (const f of drifting) f(t)

declare global {
  interface Window {
    __ogReady?: boolean
  }
}
const draw = () => {
  renderer.render(scene, camera)
  window.__ogReady = true
}
// Every texture comes through the default loading manager (stage.ts `texture`, and the sea's own loader), so this
// fires once they're all in. If one never loads, og.mjs times out rather than shooting a half-drawn card.
THREE.DefaultLoadingManager.onLoad = draw
