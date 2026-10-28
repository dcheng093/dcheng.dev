/**
 * The Daniel Control Panel's settings: what a visitor can change about the whole site. Pure (no React, no DOM);
 * the provider stores them and the site reads them.
 */

export const THEMES = [
  { id: 'classic', label: 'Classic', blurb: 'The site as Daniel intended. God help us.' },
  { id: 'night', label: 'Night Shift', blurb: 'Dim and warm: the monitor at 2am, when the best websites are made.' },
  { id: 'crt', label: 'CRT Hacker', blurb: 'Green phosphor and scanlines. You are now in the mainframe.' },
  { id: 'vapor', label: 'Vaporwave', blurb: 'Pink, teal and a grid to the horizon. A E S T H E T I C.' },
] as const
export type ThemeId = (typeof THEMES)[number]['id']

export const CURSORS = [
  { id: 'page', label: 'Page default' },
  { id: 'daniel', label: "Daniel's head" },
  { id: 'hourglass', label: 'Busy (hourglass)' },
  { id: 'fist', label: 'Fist' },
  { id: 'horse', label: 'Horse' },
  { id: 'skull', label: 'Skull' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'moneyBag', label: 'Money bag' },
] as const
export type CursorId = (typeof CURSORS)[number]['id']

export const CHAOS_LEVELS = [
  { id: 'calm', label: 'Calm', blurb: 'Fewer GIFs, pop-ups half as often, no sparkle trail. Still not calm.' },
  { id: 'normal', label: 'Normal', blurb: 'The factory setting. Already too much.' },
  { id: 'max', label: 'MAXIMUM', blurb: 'Twice the GIFs, twice the pop-ups, a longer trail, bigger bursts. You asked for this.' },
] as const
export type Chaos = (typeof CHAOS_LEVELS)[number]['id']

export type Settings = {
  theme: ThemeId
  comicSans: boolean
  cursor: CursorId
  /** Daniel Density: the percentage of the site's images replaced with photos of Daniel. */
  density: number
  chaos: Chaos
  /** Music and sound-effect levels (0–1), under the master volume slider. */
  music: number
  sfx: number
}

export const DEFAULT_SETTINGS: Settings = { theme: 'classic', comicSans: false, cursor: 'page', density: 0, chaos: 'normal', music: 1, sfx: 1 }

const oneOf = <T extends string>(list: readonly { id: T }[], v: unknown, fallback: T): T => (list.some((x) => x.id === v) ? (v as T) : fallback)
const unit = (v: unknown, fallback: number, max = 1) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(0, v)) : fallback)

/** Whatever was stored (older versions, hand-edited storage), as valid settings: anything unknown gets its default. */
export function mergeSettings(stored: unknown): Settings {
  const s = (stored && typeof stored === 'object' ? stored : {}) as Record<string, unknown>
  const d = DEFAULT_SETTINGS
  return {
    theme: oneOf(THEMES, s.theme, d.theme),
    comicSans: typeof s.comicSans === 'boolean' ? s.comicSans : d.comicSans,
    cursor: oneOf(CURSORS, s.cursor, d.cursor),
    density: Math.round(unit(s.density, d.density, 100)),
    chaos: oneOf(CHAOS_LEVELS, s.chaos, d.chaos),
    music: unit(s.music, d.music),
    sfx: unit(s.sfx, d.sfx),
  }
}

/**
 * How much of each kind of mess a chaos level gets, as multipliers of today's amounts: `normal` is exactly the
 * site as it was. `ambushRate` > 1 means pop-ups come more often.
 */
export type ChaosScale = { confetti: number; ambushRate: number; trail: number; burst: number }
const CHAOS: Record<Chaos, ChaosScale> = {
  calm: { confetti: 0.3, ambushRate: 0.5, trail: 0, burst: 0.5 },
  normal: { confetti: 1, ambushRate: 1, trail: 1, burst: 1 },
  max: { confetti: 2, ambushRate: 2, trail: 2, burst: 2 },
}
export const chaosScale = (c: Chaos): ChaosScale => CHAOS[c]

/** A small stable string hash (FNV-1a), so the same image on the same spot always makes the same choice. */
export function hash(s: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Daniel Density: whether the image `src` at spot `key` becomes a photo of Daniel. 0 never, 100 always. */
export const danielSwap = (src: string, key: string, density: number) => density > 0 && hash(`${src}|${key}`) % 100 < density

/** Which Daniel photo (index into `pool`) replaces it: stable per image, spread over the whole pool. */
export const danielPick = (src: string, key: string, pool: number) => hash(`${key}|${src}|pick`) % pool
