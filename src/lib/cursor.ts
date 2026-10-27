import type { Slot } from '../content/assets'

/** Old-web custom cursor from a small GIF (first frame only; keep it 32×32 or under). Falls back to the arrow. */
export const gifCursor = (slot: Slot, hotspot: readonly [number, number] = [2, 2]) => `url("${slot.src}") ${hotspot[0]} ${hotspot[1]}, auto`
