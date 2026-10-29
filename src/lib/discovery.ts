import { LEGENDARIES, PAGE_3D } from '../content/objects'
import type { ObjSpec } from '../three/pageScenes'
import { readStored, writeStored } from '../hooks/useLocalStorage'
import { WEBRING } from './sitemap'

/**
 * The Object Dex's bookkeeping, plus the clock and visit counter the time-gated secrets hang off.
 * `found` maps an object id to when this browser first clicked it.
 */
export type Found = Record<string, string>
export const DEX_KEY = 'dex'

/** One Dex slot: the object and the page it lives on (a route, 'bsod' for the crash screen, 'anywhere' for legendaries). */
export type DexEntry = { spec: ObjSpec; page: string }

/** The specimens only (not every object on the site), in the order of the ring, legendaries last. */
export const DEX: DexEntry[] = [
  ...WEBRING.flatMap((page) => (PAGE_3D[page]?.objects ?? []).filter((spec) => spec.specimen).map((spec) => ({ spec, page }))),
  ...LEGENDARIES.map((spec) => ({ spec, page: 'anywhere' })),
]

export const isSpecimen = (spec: ObjSpec) => !!spec.specimen

/** Never overwrites the first sighting. */
export const recordFind = (found: Found, id: string, now: Date): Found => (found[id] ? found : { ...found, [id]: now.toISOString() })

/** Legendaries caught before the Dex existed live under their own key; they count too. */
export const readDex = (): Found => ({ ...readStored<Found>('legendaries', {}), ...readStored<Found>(DEX_KEY, {}) })

export function dexProgress(found: Found, all: readonly DexEntry[] = DEX) {
  const n = all.filter((e) => found[e.spec.id]).length
  return { found: n, total: all.length, pct: Math.floor((n / all.length) * 100), complete: n === all.length }
}

/** 10pm to 5am on the visitor's own clock. */
export const isNight = (d: Date) => d.getHours() >= 22 || d.getHours() < 5

/** "10-31": the key the calendar and dated desktop files use. */
export const monthDay = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const VISITS_KEY = 'visits'

/** Counts this browser session as a visit, once (a refresh is the same visit). Returns the visit number. */
export function countVisit(): number {
  const visits = readStored(VISITS_KEY, 0)
  if (readStored('visitCounted', false, 'session')) return Math.max(1, visits)
  writeStored('visitCounted', true, 'session')
  writeStored(VISITS_KEY, visits + 1)
  return visits + 1
}
