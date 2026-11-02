import { afterEach, describe, expect, it } from 'vitest'
import { getProgress, isReady, markReady, reportProgress, resetBoot } from '../components/boring/boot'
import { flightIndex, keyframe } from '../components/boring/flight'
import { WAYPOINTS } from '../components/boring/heroScene'
import { adaptStep, pickTier, QUALITY, RATIO_STEPS } from '../components/boring/quality'
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
