import { ads as allAds, SPONSOR_ID, type Ad, type AdFormat, type AdKind } from '../../content/ads'
import { pick, shuffle, type Rng } from '../../lib/random'

/** How often a random ad slot (or pop-up) goes to the sponsor, when it fits. */
export const SPONSOR_SHARE = 0.25

export function pickAd(format: AdFormat, opts: { kind?: AdKind; exclude?: string[]; rng?: Rng; pool?: Ad[] } = {}): Ad {
  const pool = opts.pool ?? allAds
  // A slot open to any kind of ad goes to the sponsor about a quarter of the time.
  const sponsor = pool.find((a) => a.id === SPONSOR_ID && a.formats.includes(format) && !opts.exclude?.includes(a.id))
  if (sponsor && !opts.kind && (opts.rng ?? Math.random)() < SPONSOR_SHARE) return sponsor
  const fits = pool.filter((a) => a.formats.includes(format) && (!opts.kind || a.kind === opts.kind))
  const fresh = fits.filter((a) => !opts.exclude?.includes(a.id))
  return pick(fresh.length ? fresh : fits, opts.rng)
}

/** n distinct ads for a format (repeats only if the pool runs dry), skipping any ids in `exclude`. */
export function pickAds(format: AdFormat, n: number, rng: Rng = Math.random, exclude: readonly string[] = []): Ad[] {
  // Rows of joke ads stay joke ads; the sponsor has its own pinned places.
  const fits = shuffle(allAds.filter((a) => a.formats.includes(format) && !exclude.includes(a.id) && a.kind !== 'sponsor'), rng)
  return Array.from({ length: n }, (_, i) => fits[i % fits.length])
}

/**
 * The next pop-up ambush: the sponsor about a quarter of the time, but never twice in a row; otherwise anything in the
 * pool (which may itself include the sponsor's id, so it's filtered out after a sponsor turn).
 */
export function pickAmbush(pool: readonly string[], last: string | null, rng: Rng = Math.random): string {
  if (last !== SPONSOR_ID && rng() < SPONSOR_SHARE) return SPONSOR_ID
  const rest = pool.filter((id) => id !== SPONSOR_ID)
  return pick(rest, rng)
}

/** Like pickAds, but `must` is always one of the n, in a random position among them. */
export function pickAdsIncluding(format: AdFormat, n: number, must: string, rng: Rng = Math.random): Ad[] {
  const pinned = allAds.find((a) => a.id === must && a.formats.includes(format))
  if (!pinned) return pickAds(format, n, rng)
  const others = shuffle(allAds.filter((a) => a.formats.includes(format) && a.id !== must && a.kind !== 'sponsor'), rng)
  return shuffle([pinned, ...others.slice(0, n - 1)], rng)
}
