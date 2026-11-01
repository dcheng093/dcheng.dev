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
const { camera } = buildHeroScene(scene, renderer, W / H)

declare global {
  interface Window {
    __heroReady?: boolean
  }
}
renderer.render(scene, camera)
window.__heroReady = true
