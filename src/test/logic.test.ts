/// <reference types="node" />
import { describe, expect, it, vi } from 'vitest'
import { POPUP_CAP, isSpecial, initialPopupState, popupReducer, type PopupState } from '../components/popups/popupState'
import { pickAd, pickAds, pickAdsIncluding } from '../components/ads/pickAd'
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
import { Chiptune, SYNTH_SONGS } from '../audio/synth'
import { fileLabel, findTrack, MIXES } from '../audio/tracks'
import { MusicPlayer } from '../audio/music'
import { PAGE_SONGS, pageSong } from '../audio/pageSongs'
import { addHighScore, hit as aimHit, miss as aimMiss, newRound, spawn as spawnTarget, summary, targetScale, TARGET_MS } from '../lib/aim'
import { buy, click as boil, cost, newKettle, perSecond, shouldWhistle, tick, UPGRADES } from '../lib/kettleClicker'
import { dailyBrew, fortuneFor } from '../lib/oracle'
import { fortunes } from '../content/fortunes'
import { desktopReducer, type DesktopState } from '../lib/desktop'
import { collect, progress } from '../lib/stickers'
import { stickers } from '../content/stickers'
import { frameStyle, timing, type BlinkieOpts } from '../lib/blinkie'
import { DREAM_TEXTURES, PAGE_3D, sceneFor, TEXTURES } from '../three/pageScenes'
import { existsSync } from 'node:fs'

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

  it('pickAdsIncluding always includes the pinned ad, in every slot over many seeds', () => {
    const slots = new Set<number>()
    for (let seed = 0; seed < 60; seed++) {
      const got = pickAdsIncluding('skyscraper', 3, 'trust-me', mulberry32(seed))
      expect(got).toHaveLength(3)
      expect(new Set(got.map((a) => a.id)).size).toBe(3)
      expect(got.every((a) => a.formats.includes('skyscraper'))).toBe(true)
      slots.add(got.findIndex((a) => a.id === 'trust-me'))
    }
    expect([...slots].sort()).toEqual([0, 1, 2])
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

describe('music', () => {
  it('has the original four mixes first, then the new songs, with unique ids', () => {
    expect(MIXES.slice(0, 4).map((m) => m.label)).toEqual(['System Default', 'Dial-Up Remix', 'Elevator (Going Down)', 'Nightcore Daniel'])
    expect(MIXES.length).toBeGreaterThanOrEqual(10)
    expect(new Set(MIXES.map((m) => m.id)).size).toBe(MIXES.length)
  })

  it.each(SYNTH_SONGS.map((s) => [s.label, s] as const))('%s has lead, bass and drums of one length', (_, song) => {
    expect(song.bass).toHaveLength(song.lead.length)
    expect(song.drums).toHaveLength(song.lead.length)
    expect(song.drums).toMatch(/^[ksh-]+$/)
    expect(song.lead.some((n) => n !== null)).toBe(true)
  })

  it('labels dropped-in files from their names', () => {
    expect(fileLabel('../music/daniel-theme_v2.mp3')).toBe('Daniel Theme V2')
    expect(fileLabel('kettle.ogg')).toBe('Kettle')
  })

  it('falls back to the first track for unknown or stale ids', () => {
    expect(findTrack('file:deleted-song.mp3')).toBe(MIXES[0])
    expect(findTrack('lofi-debug').label).toBe('Lo-Fi Beats to Debug To')
  })

  it('the player starts the chosen synth song and falls back for unknown ids', () => {
    const start = vi.spyOn(Chiptune.prototype, 'start').mockImplementation(() => {})
    const player = new MusicPlayer({} as AudioContext, {} as AudioNode)
    player.start('kettle-blues')
    expect(start).toHaveBeenLastCalledWith(SYNTH_SONGS.find((s) => s.id === 'kettle-blues'))
    player.start('nope')
    expect(start).toHaveBeenLastCalledWith(SYNTH_SONGS[0])
    start.mockRestore()
  })
})

describe('page songs', () => {
  it.each(WEBRING.filter((p) => p !== '/radio'))('%s has a theme song that exists', (path) => {
    const id = pageSong(path)
    expect(id).toBeDefined()
    expect(MIXES.some((m) => m.id === id)).toBe(true)
  })

  it('/radio has none (you pick there), and paths are matched case- and slash-insensitively', () => {
    expect(pageSong('/radio')).toBeUndefined()
    expect(pageSong('/Dealership/')).toBe(PAGE_SONGS['/dealership'])
    expect(pageSong('/nope')).toBeUndefined()
  })

  it('has at least 15 songs, the five new ones included', () => {
    expect(MIXES.length).toBeGreaterThanOrEqual(15)
    for (const id of ['insert-coin', 'pixel-pusher', 'steam-prophecy', 'startup-funk', 'sticker-pop']) expect(findTrack(id).id).toBe(id)
  })
})

describe('aim trainer', () => {
  it('scores hits, misses, accuracy and reaction time', () => {
    const rng = mulberry32(1)
    let s = spawnTarget(newRound(), 0, rng)
    s = aimHit(s, 300, rng)
    s = aimHit(s, 700, rng) // second target was born at 300
    s = aimMiss(s, 900, rng)
    const r = summary(s)
    expect([s.hits, s.misses, r.shots, r.accuracy, r.avgMs]).toEqual([2, 1, 3, 67, 350])
    expect(r.score).toBe(2 * 100 + 67 * 5 + (1000 - 350))
  })

  it('targets stay inside the play area and shrink to nothing', () => {
    const rng = mulberry32(9)
    for (let i = 0; i < 50; i++) {
      const t = spawnTarget(newRound(), 0, rng).target!
      expect(t.x).toBeGreaterThanOrEqual(0.08)
      expect(t.x).toBeLessThanOrEqual(0.92)
      expect(t.y).toBeGreaterThanOrEqual(0.1)
      expect(t.y).toBeLessThanOrEqual(0.9)
    }
    const t = spawnTarget(newRound(), 1000, rng).target!
    expect(targetScale(t, 1000)).toBe(1)
    expect(targetScale(t, 1000 + TARGET_MS)).toBe(0)
  })

  it('keeps a top-5 table, best first, with 3-letter names', () => {
    let table = [10, 50, 30, 20, 40].reduce((t, n, i) => addHighScore(t, 'ab' + i, n), [] as ReturnType<typeof addHighScore>)
    table = addHighScore(table, 'z', 45)
    expect(table.map((h) => h.score)).toEqual([50, 45, 40, 30, 20])
    expect(table[1].name).toBe('Z--')
    expect(table[0].name).toBe('AB1')
  })
})

describe('kettle clicker', () => {
  it('clicks, buys and ticks', () => {
    let s = newKettle()
    for (let i = 0; i < 15; i++) s = boil(s)
    expect(buy(s, 'element').owned.element).toBe(1)
    s = buy(s, 'element')
    expect(s.degrees).toBe(0)
    expect(buy(s, 'element')).toBe(s) // can't afford a second
    expect(perSecond(s)).toBe(0.5)
    s = tick(s, 10)
    expect(s.degrees).toBe(5)
    expect(s.total).toBe(20)
  })

  it('prices rise 15% per copy and it whistles once at 100°', () => {
    expect(cost(UPGRADES[0], 0)).toBe(15)
    expect(cost(UPGRADES[0], 1)).toBe(18)
    const hot = { ...newKettle(), total: 100 }
    expect(shouldWhistle(hot)).toBe(true)
    expect(shouldWhistle({ ...hot, whistled: true })).toBe(false)
  })
})

describe('magic kettle oracle', () => {
  const day = new Date(2026, 9, 28)
  it('gives the same answer to the same question on the same day, ignoring case and punctuation', () => {
    expect(fortuneFor('Will I pass?', day, fortunes)).toBe(fortuneFor('  will i PASS ', day, fortunes))
    expect(fortunes).toContain(fortuneFor('anything', day, fortunes))
  })
  it('spreads answers around and changes the daily brew day to day', () => {
    const answers = new Set(Array.from({ length: 60 }, (_, i) => fortuneFor(`question ${i}`, day, fortunes)))
    expect(answers.size).toBeGreaterThan(15)
    const brews = new Set(Array.from({ length: 14 }, (_, i) => dailyBrew(new Date(2026, 9, i + 1), fortunes)))
    expect(brews.size).toBeGreaterThan(5)
  })
})

describe('desktop window manager', () => {
  const open = (s: DesktopState, id: 'computer' | 'bin' | 'notepad') => desktopReducer(s, { type: 'open', id, x: 0, y: 0 })
  it('opens, focuses, minimises and closes', () => {
    let s = open(open(open({ windows: [] }, 'computer'), 'bin'), 'notepad')
    expect(s.windows.map((w) => w.id)).toEqual(['computer', 'bin', 'notepad'])
    s = desktopReducer(s, { type: 'focus', id: 'computer' })
    expect(s.windows.at(-1)!.id).toBe('computer')
    s = open(s, 'bin') // reopening brings it forward instead of duplicating
    expect(s.windows.map((w) => w.id)).toEqual(['notepad', 'computer', 'bin'])
    s = desktopReducer(s, { type: 'close', id: 'computer' })
    expect(s.windows.map((w) => w.id)).toEqual(['notepad', 'bin'])
  })
  it('taskbar buttons minimise the front window and restore minimised ones', () => {
    let s = open(open({ windows: [] }, 'computer'), 'bin')
    s = desktopReducer(s, { type: 'taskbar', id: 'bin' })
    expect(s.windows.find((w) => w.id === 'bin')!.minimised).toBe(true)
    s = desktopReducer(s, { type: 'taskbar', id: 'bin' })
    expect(s.windows.at(-1)).toMatchObject({ id: 'bin', minimised: false })
    s = desktopReducer(s, { type: 'taskbar', id: 'computer' }) // behind: comes forward
    expect(s.windows.at(-1)!.id).toBe('computer')
  })
})

describe('sticker hunt', () => {
  it('collects each sticker once and tracks completion', () => {
    let have: string[] = []
    have = collect(collect(have, 'shiba'), 'shiba')
    expect(have).toEqual(['shiba'])
    expect(progress(have, stickers)).toEqual({ found: 1, total: stickers.length, complete: false })
    expect(progress(stickers.map((s) => s.id), stickers).complete).toBe(true)
  })
  it('hides at most one sticker per page, never on the sticker book, only on real pages', () => {
    const pages = stickers.map((s) => s.page)
    expect(new Set(pages).size).toBe(pages.length)
    expect(pages).not.toContain('/stickers')
    for (const p of pages) expect(WEBRING).toContain(p)
  })
})

describe('blinkie maker', () => {
  const base: BlinkieOpts = { text: 'HI', size: 'blinkie', font: 'pixel', fg: '#fff', bg: '#000', effect: 'blink' }
  it('blinks by swapping colours, slower than the 3Hz flash threshold', () => {
    expect(frameStyle(base, 0, 20)).toMatchObject({ fg: '#fff', bg: '#000', x: 65 })
    expect(frameStyle(base, 1, 20)).toMatchObject({ fg: '#000', bg: '#fff' })
    expect(1000 / timing('blink').delay).toBeLessThan(3)
  })
  it('scrolls from off the right edge to off the left', () => {
    const o = { ...base, effect: 'scroll' as const }
    expect(frameStyle(o, 0, 40).x).toBe(150)
    expect(frameStyle(o, timing('scroll').frames, 40).x).toBe(-40)
  })
  it('sparkles land inside the image', () => {
    const o = { ...base, size: 'button' as const, effect: 'sparkle' as const }
    for (let i = 0; i < timing('sparkle').frames; i++)
      for (const [x, y] of frameStyle(o, i, 10).sparkles) {
        expect(x).toBeLessThan(88)
        expect(y).toBeLessThan(31)
      }
  })
})

describe('3D pages', () => {
  it('only decorates real pages, never Home, and keeps full worlds rare', () => {
    for (const path of Object.keys(PAGE_3D)) expect(WEBRING).toContain(path)
    expect(sceneFor('/')).toBeUndefined()
    const worlds = Object.values(PAGE_3D).filter((s) => s.world)
    expect(worlds.length).toBeLessThanOrEqual(3)
    for (const s of Object.values(PAGE_3D)) expect(s.spinners.length).toBeLessThanOrEqual(3)
  })
  it('every texture exists in public/ (page worlds, spinners and the enter gate dream)', () => {
    for (const url of [...Object.values(TEXTURES), ...Object.values(DREAM_TEXTURES)]) expect(existsSync(`public${url}`), url).toBe(true)
  })
})
