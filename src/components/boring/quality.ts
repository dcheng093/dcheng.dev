// How much world this device gets. "lite": phones and small or modest machines (no water reflections, no ripples,
// fewer clouds, a plain pixel ratio). "full": everything. The pixel ratio then adapts to the frame rate as it runs.

export type Tier = 'lite' | 'full'

export type DeviceHints = { coarse: boolean; width: number; memory?: number; cores?: number }

export function pickTier({ coarse, width, memory, cores }: DeviceHints): Tier {
  if (coarse || width < 900) return 'lite'
  if (memory !== undefined && memory <= 4) return 'lite'
  if (cores !== undefined && cores <= 4) return 'lite'
  return 'full'
}

export const deviceHints = (): DeviceHints => ({
  coarse: typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches,
  width: window.innerWidth,
  memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
  cores: navigator.hardwareConcurrency,
})

export const QUALITY = {
  lite: { maxRatio: 1, reflections: false, ripples: false, clouds: 8 },
  full: { maxRatio: 1.25, reflections: true, ripples: true, clouds: 16 },
} as const

/** The pixel-ratio steps the renderer moves between as the frame rate drops or recovers. */
export const RATIO_STEPS = [0.75, 1, 1.25] as const

/** Given the average frame time (ms) of the last sample, the next step index (down if slow, up if there's headroom). */
export function adaptStep(step: number, frameMs: number, top: number) {
  if (frameMs > 1000 / 45 && step > 0) return step - 1
  if (frameMs < 1000 / 58 && step < top) return step + 1
  return step
}
