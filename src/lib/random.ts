export type Rng = () => number

export const pick = <T>(items: readonly T[], rng: Rng = Math.random): T =>
  items[Math.floor(rng() * items.length)]

export const randInt = (min: number, max: number, rng: Rng = Math.random) =>
  Math.floor(rng() * (max - min + 1)) + min

export const shuffle = <T>(items: readonly T[], rng: Rng = Math.random): T[] => {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Deterministic PRNG for tests and stable-per-render layouts. */
export const mulberry32 = (seed: number): Rng => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
