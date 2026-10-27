import { ads as allAds, type Ad, type AdFormat, type AdKind } from '../../content/ads'
import { pick, shuffle, type Rng } from '../../lib/random'

export function pickAd(format: AdFormat, opts: { kind?: AdKind; exclude?: string[]; rng?: Rng; pool?: Ad[] } = {}): Ad {
  const pool = opts.pool ?? allAds
  const fits = pool.filter((a) => a.formats.includes(format) && (!opts.kind || a.kind === opts.kind))
  const fresh = fits.filter((a) => !opts.exclude?.includes(a.id))
  return pick(fresh.length ? fresh : fits, opts.rng)
}

/** n distinct ads for a format (repeats only if the pool runs dry). */
export function pickAds(format: AdFormat, n: number, rng: Rng = Math.random): Ad[] {
  const fits = shuffle(allAds.filter((a) => a.formats.includes(format)), rng)
  return Array.from({ length: n }, (_, i) => fits[i % fits.length])
}
