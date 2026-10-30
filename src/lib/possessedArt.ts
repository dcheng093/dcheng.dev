import { WEBRING } from './sitemap'
import { hash } from './uncorrupted'

/** A texture from public/possessed/ and the size it tiles at. */
export type Rot = { src: string; size: number }
const t = (name: string, size = 512): Rot => ({ src: `/possessed/${name}.webp`, size })

/**
 * What lies under the pages of the possessed site (every page's own background is see-through then, so the 3D can
 * float behind it). Each page gets its own; the eye-hole flesh is just one among them, not the whole site's floor.
 */
export const UNDERLAYS: Rot[] = [
  t('smear'), t('rust-wall'), t('rust-blood'), t('glitch'), t('faces-wall'), t('clawing'), t('cells'), t('veins'),
  t('nerve'), t('rot-red'), t('rot-ruin'), t('rot-grid'), t('rot-burn'), t('flesh-holes', 640), t('holes-static', 461),
  t('glyphs'), t('question', 360), t('flesh'),
]

/**
 * The texture under a page. Pages of the ring take them in turn (so neighbours never match, and every texture gets
 * used); anywhere else, by its address. The same page always looks the same.
 */
export function underlayFor(pathname: string, pool: readonly Rot[] = UNDERLAYS): Rot {
  const path = pathname.toLowerCase().replace(/\/+$/, '') || '/'
  const ring = WEBRING.indexOf(path)
  return pool[(ring >= 0 ? ring : hash(path)) % pool.length]
}
