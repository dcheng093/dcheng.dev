// The boring site's hero backdrop as a still (public/boring/hero.webp): the picture shown instantly while the live
// scene (src/components/boring/heroScene.ts, the same world) loads, and for anyone without WebGL.
import * as THREE from 'three'
import { buildHeroScene } from '../../src/components/boring/heroScene'

const W = 1920
const H = 1080
const canvas = document.querySelector<HTMLCanvasElement>('#shot')!
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(1)
renderer.setSize(W, H, false)
const scene = new THREE.Scene()
const { camera, update } = await buildHeroScene(scene, renderer, W / H, 'full')
// The arrival's resting shot: at the top of the page, the dive over, a little way into the water's drift.
update(6, { index: 0, pointer: { x: 0, y: 0 }, dive: 1 })

declare global {
  interface Window {
    __heroReady?: boolean
  }
}
renderer.render(scene, camera)
window.__heroReady = true
