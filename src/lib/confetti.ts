import { kawaii, type Slot } from '../content/assets'
import { pick, randInt, type Rng } from './random'

export type ConfettiPiece = { slot: Slot; x: number; y: number; scale: number; tilt: number; anim: string; delay: number; driftX: number; driftY: number }

/** Page area (px²) per scattered GIF, and the bounds on how many one page gets. */
export const CONFETTI_AREA = 130_000
export const CONFETTI_MIN = 6
export const CONFETTI_MAX = 90

const ANIMS = ['', '', 'animate-wobble', 'animate-boing', 'animate-jank-x', 'animate-pulse-scale', 'animate-drift', 'animate-spin-z']
const SCALES = [1, 1, 1, 1.5, 2]

/** How many GIFs a page of this size gets: denser on bigger pages, never empty, never absurd. */
export const confettiCount = (width: number, height: number) =>
  Math.min(CONFETTI_MAX, Math.max(CONFETTI_MIN, Math.round((width * height) / CONFETTI_AREA)))

/** Throw `n` kawaii GIFs at random spots (x/y in % of the page). Big GIFs never get scaled up. */
export function throwConfetti(n: number, rng: Rng = Math.random): ConfettiPiece[] {
  const slots = Object.values(kawaii)
  return Array.from({ length: n }, () => {
    const slot = pick(slots, rng)
    return {
      slot,
      x: rng() * 96,
      y: rng() * 98,
      scale: slot.w > 100 ? 1 : pick(SCALES, rng),
      tilt: randInt(-15, 15, rng),
      anim: pick(ANIMS, rng),
      delay: -rng() * 3,
      driftX: randInt(-80, 80, rng),
      driftY: randInt(-50, 50, rng),
    }
  })
}
