// How much world this device gets. "lite": phones, small or modest machines, and any machine drawing WebGL without a
// GPU (no water reflections, no ripples, fewer clouds, a plain pixel ratio). "full": everything. The pixel ratio then
// adapts to the frame rate as it runs.

export type Tier = 'lite' | 'full'

export type DeviceHints = { coarse: boolean; width: number; memory?: number; cores?: number; software?: boolean }

/**
 * Whether WebGL is being drawn by the CPU (hardware acceleration off, or no usable GPU driver): Chrome's SwiftShader,
 * Mesa's llvmpipe/softpipe, Windows' Basic Render Driver. `name` is the renderer the context reports.
 */
export const isSoftwareRenderer = (name: string) => /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(name)

export function pickTier({ coarse, width, memory, cores, software }: DeviceHints): Tier {
  if (software) return 'lite'
  if (coarse || width < 900) return 'lite'
  if (memory !== undefined && memory <= 4) return 'lite'
  if (cores !== undefined && cores <= 4) return 'lite'
  return 'full'
}

export const deviceHints = (software = false): DeviceHints => ({
  coarse: typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches,
  width: window.innerWidth,
  memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
  cores: navigator.hardwareConcurrency,
  software,
})

export const QUALITY = {
  lite: { maxRatio: 1, reflections: false, ripples: false, clouds: 8 },
  full: { maxRatio: 1.25, reflections: true, ripples: true, clouds: 16 },
} as const

/**
 * The pixel-ratio steps the renderer moves between as the frame rate drops or recovers. The canvas is stretched to the
 * window, so a low step only draws fewer pixels (softer, never smaller). A GPU only drops below 0.75 if it's struggling.
 */
export const RATIO_STEPS = [0.35, 0.5, 0.75, 1, 1.25] as const

/** Where a software renderer starts: cheap enough to move smoothly straight away, rather than stepping down for 20s. */
export const SOFTWARE_RATIO = 0.5

/** The sharpest step allowed: the highest one at or under `ceiling` (the tier's limit and the screen's own ratio). */
export const topStep = (ceiling: number) => RATIO_STEPS.reduce((best, r, i) => (r <= ceiling ? i : best), 0)

/** The step to start at: the top, or for a software renderer no higher than SOFTWARE_RATIO. */
export const startStep = (top: number, software: boolean) => (software ? Math.min(top, RATIO_STEPS.indexOf(SOFTWARE_RATIO)) : top)

/** Given the average frame time (ms) of the last sample, the next step index (down if slow, up if there's headroom). */
export function adaptStep(step: number, frameMs: number, top: number) {
  if (frameMs > 1000 / 45 && step > 0) return step - 1
  if (frameMs < 1000 / 58 && step < top) return step + 1
  return step
}
