import { pick, type Rng } from './random'

export const REEL = ['horse', 'kettle', 'tooth', 'smiley', 'floppy', 'cherry', 'diamond'] as const
export type Face = (typeof REEL)[number]

/** The house always wins: two of a kind is common, three of a kind never happens. */
export function spinReels(rng: Rng = Math.random): [Face, Face, Face] {
  const a = pick(REEL, rng)
  // Near-misses keep people playing, so the first two match half the time.
  const b = rng() < 0.5 ? a : pick(REEL, rng)
  const c = pick(a === b ? REEL.filter((f) => f !== a) : REEL, rng)
  return [a, b, c]
}

/** Two of a kind pays half the stake back, so the balance drains slowly instead of all at once. */
export const payout = ([a, b, c]: readonly Face[], stake: number) => (a === b || b === c || a === c ? stake / 2 : 0)
