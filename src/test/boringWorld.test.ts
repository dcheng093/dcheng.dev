import { afterEach, describe, expect, it } from 'vitest'
import { getProgress, isReady, markReady, reportProgress, resetBoot } from '../components/boring/boot'
import { flightIndex, keyframe } from '../components/boring/flight'
import { WAYPOINTS } from '../components/boring/heroScene'
import { adaptStep, isSoftwareRenderer, pickTier, QUALITY, RATIO_STEPS, SOFTWARE_RATIO, startStep, topStep } from '../components/boring/quality'
import { worldTexture, worldTextures } from '../components/boring/worldTextures'
import { portfolio } from '../content/portfolio'

describe('the /boring world flight (flight.ts)', () => {
  const anchors = [0, 800, 2000, 3500]

  it('reaches each waypoint exactly at its anchor', () => {
    anchors.forEach((a, i) => expect(flightIndex(anchors, a)).toBe(i))
  })

  it('moves forward as the page scrolls, and holds before the first and past the last', () => {
    let prev = -1
    for (let y = -200; y <= 4000; y += 37) {
      const i = flightIndex(anchors, y)
      expect(i).toBeGreaterThanOrEqual(prev)
      prev = i
    }
    expect(flightIndex(anchors, -50)).toBe(0)
    expect(flightIndex(anchors, 9999)).toBe(anchors.length - 1)
    expect(flightIndex(anchors, 400)).toBeCloseTo(0.5)
  })

  it('eases keyframes through each waypoint without overshooting', () => {
    const values = [6, 3.5, 1.5, -26]
    values.forEach((v, i) => expect(keyframe(values, i)).toBe(v))
    expect(keyframe(values, 2.5)).toBeCloseTo((1.5 - 26) / 2)
    for (let i = 0; i <= 3; i += 0.05) {
      const lo = Math.floor(i)
      const hi = Math.min(3, lo + 1)
      expect(keyframe(values, i)).toBeGreaterThanOrEqual(Math.min(values[lo], values[hi]) - 1e-9)
      expect(keyframe(values, i)).toBeLessThanOrEqual(Math.max(values[lo], values[hi]) + 1e-9)
    }
  })

  it('has a waypoint for the hero and for every chapter, in page order', () => {
    expect([...WAYPOINTS]).toEqual(['intro', ...portfolio.chapters.map((c) => c.id)])
  })
})

describe('the /boring world quality (quality.ts)', () => {
  it('gives phones and modest machines the lite world', () => {
    expect(pickTier({ coarse: true, width: 1400 })).toBe('lite')
    expect(pickTier({ coarse: false, width: 600 })).toBe('lite')
    expect(pickTier({ coarse: false, width: 1400, memory: 4 })).toBe('lite')
    expect(pickTier({ coarse: false, width: 1400, cores: 4 })).toBe('lite')
    expect(pickTier({ coarse: false, width: 1400, memory: 8, cores: 8 })).toBe('full')
    expect(pickTier({ coarse: false, width: 1400 })).toBe('full')
    expect(QUALITY.lite.reflections).toBe(false)
    expect(QUALITY.full.ripples).toBe(true)
  })

  it('steps the pixel ratio down when frames run slow and back up when there is room', () => {
    const top = RATIO_STEPS.length - 1
    expect(adaptStep(top, 30, top)).toBe(top - 1)
    expect(adaptStep(0, 30, top)).toBe(0)
    expect(adaptStep(1, 10, top)).toBe(2)
    expect(adaptStep(top, 10, top)).toBe(top)
    expect(adaptStep(1, 18, top)).toBe(1)
  })

  it('knows a CPU drawing WebGL from a GPU', () => {
    for (const cpu of ['ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)', 'llvmpipe (LLVM 15.0.7, 256 bits)', 'Microsoft Basic Render Driver'])
      expect(isSoftwareRenderer(cpu)).toBe(true)
    for (const gpu of ['ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0, D3D11)', 'Apple M2', 'ANGLE (Intel, Intel(R) UHD Graphics 620, OpenGL 4.6)', ''])
      expect(isSoftwareRenderer(gpu)).toBe(false)
  })

  it('gives a software renderer the lite world, however big the machine', () => {
    expect(pickTier({ coarse: false, width: 1920, memory: 16, cores: 16, software: true })).toBe('lite')
    expect(pickTier({ coarse: false, width: 1920, memory: 16, cores: 16, software: false })).toBe('full')
  })

  it('starts a GPU as sharp as allowed and a software renderer cheap', () => {
    expect(RATIO_STEPS[topStep(1.25)]).toBe(1.25)
    expect(RATIO_STEPS[topStep(1)]).toBe(1)
    expect(startStep(topStep(1.25), false)).toBe(topStep(1.25))
    expect(RATIO_STEPS[startStep(topStep(1), true)]).toBe(SOFTWARE_RATIO)
    // A GPU never starts below 0.75 (only a struggling one adapts down past it).
    expect(RATIO_STEPS[topStep(1)]).toBeGreaterThanOrEqual(0.75)
  })
})

describe('the /boring world textures (src/world-textures/)', () => {
  it("finds Daniel's cloud set in order, and the lake's normal map", () => {
    const clouds = worldTextures('clouds')
    expect(clouds.length).toBeGreaterThanOrEqual(1)
    expect(clouds.every((u) => /clouds-\d+/.test(u))).toBe(true)
    expect(worldTexture('water-normal')).toMatch(/water-normal/)
    expect(worldTextures('nothing-by-this-name')).toEqual([])
  })
})

describe('the /boring arrival (boot.ts)', () => {
  afterEach(resetBoot)

  it('only ever counts up, and starts again on a fresh visit', () => {
    reportProgress(0.5)
    reportProgress(0.2)
    expect(getProgress()).toBe(0.5)
    reportProgress(3)
    expect(getProgress()).toBe(1)
    markReady()
    expect(isReady()).toBe(true)
    resetBoot()
    expect(getProgress()).toBe(0)
    expect(isReady()).toBe(false)
  })
})
