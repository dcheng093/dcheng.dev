/// <reference types="node" />
import { describe, expect, it, vi } from 'vitest'
import { POPUP_CAP, isSpecial, initialPopupState, popupReducer, type PopupState } from '../components/popups/popupState'
import { pickAd, pickAds } from '../components/ads/pickAd'
import { ads } from '../content/ads'
import { pickReply } from '../content/chatScript'
import { nextHitCount } from '../lib/hitCounter'
import { mulberry32 } from '../lib/random'
import { WEBRING, neighbour, randomRoute } from '../lib/sitemap'
import { mergeEntries, pageIndex, pageNumbers, PER_PAGE } from '../lib/guestbook'
import { guestbookSeed } from '../content/guestbookSeed'
import { readStored, writeStored } from '../hooks/useLocalStorage'
import { assets, blinkies, buttons88, cursors, dividers, icons, kawaii, sparkles, type Slot } from '../content/assets'
import { readFileSync } from 'node:fs'
import { payout, spinReels } from '../lib/slots'
import { CONFETTI_MAX, CONFETTI_MIN, confettiCount, throwConfetti } from '../lib/confetti'

const spawn = (s: PopupState, variant: 'normal' | 'multiply' | 'dodge' = 'normal') =>
  popupReducer(s, { type: 'spawn', content: 'millionth', variant, fx: 0.5, fy: 0.5 })

describe('popupReducer', () => {
  it('closing a multiply popup spawns two in its place', () => {
    const s1 = spawn(initialPopupState, 'multiply')
    const s2 = popupReducer(s1, { type: 'close', key: s1.popups[0].key, rng: mulberry32(1) })
    expect(s2.popups).toHaveLength(2)
    expect(s2.popups.every((p) => p.variant === 'normal')).toBe(true)
  })

  it('closing a normal popup just closes it', () => {
    const s1 = spawn(initialPopupState)
    expect(popupReducer(s1, { type: 'close', key: s1.popups[0].key }).popups).toHaveLength(0)
  })

  it('never exceeds the cap, even when multiplying', () => {
    let s = initialPopupState
    for (let i = 0; i < 20; i++) s = spawn(s, 'multiply')
    expect(s.popups).toHaveLength(POPUP_CAP)
    for (let i = 0; i < 10; i++) s = popupReducer(s, { type: 'close', key: s.popups[0].key, rng: mulberry32(i) })
    expect(s.popups.length).toBeLessThanOrEqual(POPUP_CAP)
  })

  it('keys stay unique', () => {
    let s = initialPopupState
    for (let i = 0; i < 5; i++) s = spawn(s, 'multiply')
    s = popupReducer(s, { type: 'close', key: 1 })
    const keys = s.popups.map((p) => p.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('ads', () => {
  it('every ad has a unique id and at least one format', () => {
    expect(new Set(ads.map((a) => a.id)).size).toBe(ads.length)
    expect(ads.every((a) => a.formats.length > 0)).toBe(true)
  })

  it('route targets point at real pages', () => {
    const routeTargets = ads.map((a) => a.to).filter((t) => t.startsWith('/'))
    for (const t of routeTargets) expect(WEBRING).toContain(t)
  })

  it('popup targets open a popup that exists', () => {
    const popupTargets = ads.map((a) => a.to).filter((t) => t.startsWith('popup:'))
    for (const t of popupTargets) expect(isSpecial(t.slice('popup:'.length))).toBe(true)
  })

  it('pickAd respects format and kind', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 50; i++) {
      const ad = pickAd('skyscraper', { kind: 'surreal', rng })
      expect(ad.formats).toContain('skyscraper')
      expect(ad.kind).toBe('surreal')
    }
  })

  it('pickAds returns n ads of the format', () => {
    const got = pickAds('button', 8, mulberry32(3))
    expect(got).toHaveLength(8)
    expect(got.every((a) => a.formats.includes('button'))).toBe(true)
  })
})

describe('slots', () => {
  it('never lines up three of a kind, but often nearly does', () => {
    const rng = mulberry32(5)
    let nearMisses = 0
    for (let i = 0; i < 500; i++) {
      const [a, b, c] = spinReels(rng)
      expect(a === b && b === c).toBe(false)
      if (payout([a, b, c], 50)) nearMisses++
    }
    expect(nearMisses).toBeGreaterThan(100)
  })
})

describe('sitemap', () => {
  it('randomRoute never returns the excluded route and always a real one', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const r = randomRoute('/dealership', rng)
      expect(r).not.toBe('/dealership')
      expect(WEBRING).toContain(r)
    }
  })

  it('webring wraps around', () => {
    expect(neighbour(WEBRING[WEBRING.length - 1], 1)).toBe(WEBRING[0])
    expect(neighbour(WEBRING[0], -1)).toBe(WEBRING[WEBRING.length - 1])
    expect(neighbour('/nowhere', 1)).toBe(WEBRING[0])
  })
})

describe('chat', () => {
  it('answers keywords from their bucket', () => {
    expect(['neigh', 'THE HORSES CANNOT STOP. THEY WILL NEVER STOP.']).toContain(pickReply('do you like horses'))
  })
  it('always says something', () => {
    expect(pickReply('qwertyuiop', mulberry32(9)).length).toBeGreaterThan(0)
  })
  it('does not treat words ending in c as code talk', () => {
    const rng = mulberry32(1)
    expect(pickReply('music', rng)).not.toMatch(/segmentation|semicolon|norminette/)
  })
})

describe('hit counter', () => {
  it('is monotonic', () => {
    const now = Date.UTC(2026, 9, 28)
    const a = nextHitCount(0, now)
    const b = nextHitCount(a, now)
    const c = nextHitCount(b, now - 10_000_000)
    expect(b).toBeGreaterThan(a)
    expect(c).toBeGreaterThan(b)
  })
})

describe('guestbook paging', () => {
  it('skips page 3 but still covers every entry', () => {
    expect(pageNumbers(1)).toEqual([1])
    expect(pageNumbers(11)).toEqual([1, 2, 4])
    expect(pageNumbers(30)).toEqual([1, 2, 4, 5, 6, 7])
    const labels = pageNumbers(23)
    expect(labels).not.toContain(3)
    expect(labels.map(pageIndex)).toEqual([0, 1, 2, 3, 4])
    expect(labels.length).toBe(Math.ceil(23 / PER_PAGE))
  })

  it('puts the visitor’s entries above the seeded ones', () => {
    const mine = [{ id: 'x', name: 'me', from: 'here', date: 'now', message: 'hi', foundVia: 'webring' }]
    const merged = mergeEntries(mine)
    expect(merged[0].id).toBe('x')
    expect(merged).toHaveLength(guestbookSeed.length + 1)
  })
})

describe('web storage helpers', () => {
  it('fall back gracefully when storage throws', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    expect(readStored('k', 'fallback')).toBe('fallback')
    expect(() => writeStored('k', 1)).not.toThrow()
    get.mockRestore()
    set.mockRestore()
  })

  it('fall back on corrupt JSON', () => {
    localStorage.setItem('bad', '{nope')
    expect(readStored('bad', 5)).toBe(5)
  })
})

describe('image slots', () => {
  // Lazy glob: only the file names are needed, matched case-sensitively like the production server.
  const supplied = new Set(Object.keys(import.meta.glob(['../../public/me/*', '../../public/gifs/*'])).map((p) => p.replace('../../public', '')))
  const groups = [assets, kawaii, icons, cursors, sparkles, dividers, blinkies, buttons88]
  const slots = groups.flatMap((g) => Object.values(g)).flat().filter((s): s is Slot => /^\/(me|gifs)\//.test(s.src))
  // Read from disk: Vitest blanks stylesheet imports, even ?raw ones.
  const css = readFileSync('src/index.css', 'utf8')
  const tiles = [...css.matchAll(/url\('(\/gifs\/[^']+)'\)/g)].map((m) => m[1])

  it.each([...new Set([...slots.map((s) => s.src), ...tiles])].map((src) => [src]))('%s exists in public/ with exactly that name', (src) => {
    expect(supplied).toContain(src)
  })

  it('finds the GIF background tiles in the stylesheet', () => {
    expect(tiles.length).toBeGreaterThan(20)
  })

  it('keeps cursors within the 32×32 browsers allow', () => {
    for (const c of Object.values(cursors)) expect(Math.max(c.w, c.h)).toBeLessThanOrEqual(32)
  })
})

describe('gif confetti', () => {
  it('scales with page area within bounds', () => {
    expect(confettiCount(0, 0)).toBe(CONFETTI_MIN)
    expect(confettiCount(1440, 900)).toBe(10)
    expect(confettiCount(1440, 100_000)).toBe(CONFETTI_MAX)
  })

  it('throws only kawaii GIFs, on the page, and never upscales big ones', () => {
    const kinds = new Set(Object.values(kawaii))
    for (const p of throwConfetti(200, mulberry32(7))) {
      expect(kinds).toContain(p.slot)
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThan(96)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThan(98)
      if (p.slot.w > 100) expect(p.scale).toBe(1)
    }
  })
})
