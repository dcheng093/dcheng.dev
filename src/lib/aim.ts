import type { Rng } from './random'

/** Aim Trainer 98: one round's bookkeeping, kept pure so it can be tested without a mouse. */
export const ROUND_MS = 30_000
export const TARGET_MS = 1_600 // a target shrinks to nothing over this long

export type Target = { id: number; x: number; y: number; bornAt: number }
export type AimState = { hits: number; misses: number; reactions: number[]; target: Target | null; nextId: number }

export const newRound = (): AimState => ({ hits: 0, misses: 0, reactions: [], target: null, nextId: 0 })

/** Position as a fraction of the play area, kept off the edges so the whole head stays visible. */
export const spawn = (s: AimState, now: number, rng: Rng): AimState => ({
  ...s,
  target: { id: s.nextId, x: 0.08 + rng() * 0.84, y: 0.1 + rng() * 0.8, bornAt: now },
  nextId: s.nextId + 1,
})

export const hit = (s: AimState, now: number, rng: Rng): AimState =>
  s.target ? spawn({ ...s, hits: s.hits + 1, reactions: [...s.reactions, now - s.target.bornAt] }, now, rng) : s

/** Clicking empty space, or letting a target shrink away, both count as a miss. */
export const miss = (s: AimState, now: number, rng: Rng): AimState => spawn({ ...s, misses: s.misses + 1 }, now, rng)

export const targetScale = (t: Target, now: number) => Math.max(0, 1 - (now - t.bornAt) / TARGET_MS)

export const summary = (s: AimState) => {
  const shots = s.hits + s.misses
  const accuracy = shots ? Math.round((s.hits / shots) * 100) : 0
  const avgMs = s.reactions.length ? Math.round(s.reactions.reduce((a, b) => a + b, 0) / s.reactions.length) : 0
  // Hits matter most; accuracy and speed break ties.
  const score = s.hits * 100 + accuracy * 5 + (avgMs ? Math.max(0, 1000 - avgMs) : 0)
  return { shots, accuracy, avgMs, score }
}

export type HighScore = { name: string; score: number }

/** Top five, best first. Names are three letters, arcade style. */
export const addHighScore = (table: HighScore[], name: string, score: number): HighScore[] =>
  [...table, { name: name.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(3, '-').slice(0, 3), score }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
