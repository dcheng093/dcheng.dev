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
import { PROC_TEXTURES, TEX } from '../three/pageScenes'
import { ambush, shouldShowAd, AD_AFTER_CLOSES } from '../lib/popnuke'
import { LEGENDARIES, PAGE_3D, rollLegendary, sceneFor } from '../content/objects'
import { moodOffset, poke, restingBody, step, type Personality } from '../lib/personality'
import { hasGlyph, voxelWord } from '../lib/voxelFont'
import { bounce, clampOffset, contains, isFree, nearestFree, place, MIN_SIZE } from '../three/space'
import { shrines } from '../content/shrines'
import { existsSync } from 'node:fs'
import { govern } from '../three/stage'
import { DEFAULT_SETTINGS, chaosScale, danielPick, danielSwap, mergeSettings } from '../lib/settings'

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
  const shrinePaths = shrines.map((s) => `/shrine/${s.slug}`)
  const IN_SCOPE = [...WEBRING.filter((p) => p !== '/'), ...shrinePaths.filter((p) => !WEBRING.includes(p)), 'bsod']
  const DANIEL = new Set(['photoCube', 'head', 'portrait'])

  it.each(IN_SCOPE)('%s has 3-5 objects, 1-2 drifters and a photo of Daniel', (key) => {
    const scene = sceneFor(key)
    expect(scene, key).toBeDefined()
    const { objects } = scene!
    expect(objects.length).toBeGreaterThanOrEqual(3)
    expect(objects.length).toBeLessThanOrEqual(5)
    const drifters = objects.filter((o) => o.role === 'drifter').length
    expect(drifters).toBeGreaterThanOrEqual(1)
    expect(drifters).toBeLessThanOrEqual(2)
    for (const o of objects) if (o.role === 'anchor') expect(o.spot, o.id).toBeDefined()
    expect(objects.some((o) => DANIEL.has(o.shape)), `${key} needs a Daniel photo object`).toBe(true)
  })

  it('never decorates Home, and keeps full worlds to six pages', () => {
    expect(sceneFor('/')).toBeUndefined()
    expect(Object.values(PAGE_3D).filter((s) => s.world).length).toBe(6)
  })

  it('object ids are unique, with names, lore and a made-of line', () => {
    const all = [...Object.values(PAGE_3D).flatMap((s) => s.objects), ...LEGENDARIES]
    expect(new Set(all.map((o) => o.id)).size).toBe(all.length)
    for (const o of all) {
      expect(o.name.length, o.id).toBeGreaterThan(0)
      expect(o.lore.length, o.id).toBeGreaterThan(10)
      expect(o.madeOf.length, o.id).toBeGreaterThan(0)
      if (o.tex) expect(o.tex.startsWith('proc:') ? PROC_TEXTURES.includes(o.tex.slice(5) as never) : o.tex in TEX, `${o.id} texture ${o.tex}`).toBe(true)
      if (o.shape === 'text') for (const ch of o.text ?? '') expect(hasGlyph(ch), `${o.id}: ${ch}`).toBe(true)
    }
  })

  it('every image texture exists in public/', () => {
    for (const url of Object.values(TEX)) expect(existsSync(`public${url}`), url).toBe(true)
  })

  it('a legendary turns up about 5% of the time, and never on Home or the gag pages', () => {
    const rng = mulberry32(42)
    let hits = 0
    for (let i = 0; i < 20000; i++) if (rollLegendary('/casino', rng)) hits++
    expect(hits / 20000).toBeGreaterThan(0.04)
    expect(hits / 20000).toBeLessThan(0.06)
    for (const p of ['/', '/boring', '/leave', '/legendary/goose']) expect(rollLegendary(p, () => 0)).toBeUndefined()
    expect(LEGENDARIES.map((l) => l.id)).toEqual(['beef', 'planet-daniel', 'goose'])
  })
})

describe('object personalities', () => {
  const run = (p: Personality, cursor: { dx: number; dy: number } | null, frames = 60) => {
    let b = restingBody()
    for (let i = 0; i < frames; i++) b = step(p, b, cursor, i / 30, 1 / 30, () => 0.5)
    return b
  }
  it('shy objects back away from the cursor; curious ones lean in', () => {
    expect(run('shy', { dx: 40, dy: 0 }).ox).toBeLessThan(-20)
    expect(run('curious', { dx: 40, dy: 0 }).ox).toBeGreaterThan(5)
  })
  it('watchers turn to face the cursor and stop spinning; excitable ones spin faster', () => {
    const w = run('watcher', { dx: 200, dy: 0 })
    expect(w.yaw).toBeGreaterThan(0.5)
    expect(Math.abs(w.spinRate)).toBeLessThan(0.1)
    expect(run('excitable', { dx: 10, dy: 0 }).spinRate).toBeGreaterThan(run('excitable', null).spinRate * 3)
  })
  it('lazy objects barely react; a flung object springs back home', () => {
    expect(Math.abs(run('lazy', { dx: 10, dy: 0 }).ox)).toBeLessThan(1)
    const { body, reaction } = poke('dramatic', restingBody(), { dx: 30, dy: 0 })
    expect(reaction).toBe('fling')
    expect(body.vx).toBeLessThan(0) // flung away from the click
    let b = body
    for (let i = 0; i < 300; i++) b = step('dramatic', b, null, i / 30, 1 / 30)
    expect(Math.hypot(b.ox, b.oy)).toBeLessThan(5)
  })
  it('crashed pages glitch and sad pages droop until you hover stay', () => {
    expect(moodOffset('crashed', 0.05, 0, false)).toMatchObject({ frozen: true, glitch: true })
    expect(moodOffset('sad', 1, 0, false).dy).toBeGreaterThan(10)
    expect(moodOffset('sad', 1, 0, true).dy).toBeLessThanOrEqual(0)
  })
})

describe('voxel font', () => {
  it('lays out words with a gap between letters', () => {
    const one = voxelWord('I')
    const two = voxelWord('II')
    expect(one.width).toBe(5)
    expect(two.width).toBe(11)
    expect(two.pixels.length).toBe(one.pixels.length * 2)
    for (const w of ['SALE', '£££', '404', '?', 'SEGFAULT']) expect(voxelWord(w).pixels.length).toBeGreaterThan(5)
  })
})

describe('free space for 3D objects', () => {
  const screen = { x: 0, y: 0, w: 1000, h: 800 }
  const content = { x: 200, y: 0, w: 600, h: 800 } // a centred column, leaving 200px margins

  it('keeps an object exactly where it was meant to be when that spot is clear', () => {
    expect(nearestFree(100, 400, 150, screen, [content])).toEqual({ x: 25, y: 325, w: 150, h: 150 })
  })

  it('moves an object out from behind content to the nearest clear spot, fully inside the window', () => {
    const spot = nearestFree(260, 400, 150, screen, [content])!
    expect(isFree(spot, screen, [content])).toBe(true)
    expect(spot.x + spot.w).toBeLessThanOrEqual(200)
    expect(Math.abs(spot.y + 75 - 400)).toBeLessThan(40) // slid sideways, not off somewhere random
  })

  it('never places anything poking out of the window', () => {
    const spot = nearestFree(990, 790, 150, screen, [])!
    expect(contains(screen, spot)).toBe(true)
  })

  it('shrinks to fit a narrow margin, and gives up (drift instead) when even the smallest size has no room', () => {
    const narrow = { x: 120, y: 0, w: 760, h: 800 } // 120px margins
    const spot = place(60, 400, 168, screen, [narrow])!
    expect(spot.w).toBeLessThan(168)
    expect(spot.w).toBeLessThanOrEqual(120)
    expect(place(500, 400, 168, screen, [{ x: MIN_SIZE / 2, y: 0, w: 1000, h: 800 }])).toBeNull()
  })

  it('drifters bounce off content and the window edge instead of passing behind or out', () => {
    let r = { x: 150, y: 100, w: 40, h: 40 }
    let vx = 300
    let vy = 0
    let turns = 0
    for (let i = 0; i < 60; i++) {
      const n = bounce(r, vx, vy, 1 / 30, screen, [content])
      if (Math.sign(n.vx) !== Math.sign(vx)) turns++
      r = { ...r, x: n.x, y: n.y }
      vx = n.vx
      vy = n.vy
      expect(isFree(r, screen, [content])).toBe(true)
    }
    expect(turns).toBeGreaterThanOrEqual(2) // off the column, then off the window's left edge
  })

  it('a personality nudge is cut short rather than pushing an object behind something', () => {
    const home = { x: 100, y: 100, w: 80, h: 80 }
    const cut = clampOffset(home, 60, 0, screen, [content]) // 60px right would be behind the column
    expect(cut.dx).toBeLessThan(20)
    expect(isFree({ ...home, x: home.x + cut.dx }, screen, [content])).toBe(true)
    expect(clampOffset(home, -40, 0, screen, [content])).toEqual({ dx: -40, dy: 0 })
    expect(clampOffset(home, 0, 300, screen, [content]).dy).toBe(300) // straight down the clear margin: fine
    expect(clampOffset(home, 0, 700, screen, [content]).dy).toBeLessThan(700) // off the bottom of the window: cut short
  })
})

describe('POPNUKE', () => {
  it('its ad shows after the visitor has closed 3 pop-ups, once, and never once installed', () => {
    expect(AD_AFTER_CLOSES).toBe(3)
    expect(shouldShowAd(2, false, false)).toBe(false)
    expect(shouldShowAd(3, false, false)).toBe(true)
    expect(shouldShowAd(9, true, false)).toBe(false) // it has had its turn (it's in the rotation now)
    expect(shouldShowAd(9, false, true)).toBe(false)
  })
  it('blocks every ambush pop-up while installed', () => {
    expect(ambush(true, 0, false)).toBe('blocked')
    expect(ambush(true, 5, false)).toBe('blocked')
    expect(ambush(false, 3, false)).toBe('popnuke-ad')
    expect(ambush(false, 1, false)).toBe('normal')
    expect(ambush(false, 5, true)).toBe('normal')
  })
})

describe('Control Panel settings', () => {
  it('fills anything missing or invalid with the defaults', () => {
    expect(mergeSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings({ theme: 'crt', density: 250, chaos: 'apocalypse', music: -1, comicSans: 'yes' })).toEqual({ ...DEFAULT_SETTINGS, theme: 'crt', density: 100, music: 0 })
  })

  it('"normal" chaos is the site exactly as it was', () => {
    expect(chaosScale('normal')).toEqual({ confetti: 1, ambushRate: 1, trail: 1, burst: 1 })
    expect(chaosScale('calm').confetti).toBeLessThan(1)
    expect(chaosScale('max').ambushRate).toBeGreaterThan(1)
  })

  it('Daniel Density: never at 0, always at 100, about right in between, and stable', () => {
    const keys = Array.from({ length: 1000 }, (_, i) => `:r${i}:`)
    expect(keys.some((k) => danielSwap('/gifs/a.gif', k, 0))).toBe(false)
    expect(keys.every((k) => danielSwap('/gifs/a.gif', k, 100))).toBe(true)
    const half = keys.filter((k) => danielSwap('/gifs/a.gif', k, 50)).length
    expect(half).toBeGreaterThan(400)
    expect(half).toBeLessThan(600)
    expect(keys.map((k) => danielSwap('/gifs/b.gif', k, 30))).toEqual(keys.map((k) => danielSwap('/gifs/b.gif', k, 30)))
    expect(new Set(keys.map((k) => danielPick('/gifs/a.gif', k, 26))).size).toBe(26)
  })
})

describe('3D frame governor', () => {
  const run = (frames: number[], start = { frameMs: 1000 / 60, work: 0 }) => frames.reduce((s, w) => govern(s, w), start)
  it('stays at 60fps while frames are light, even through a one-off spike (a shader compiling)', () => {
    expect(run([...Array(60).fill(6), 400, ...Array(30).fill(6)]).frameMs).toBeCloseTo(1000 / 60)
  })
  it('drops to 30fps when frames stay heavy, and comes back once they are light again', () => {
    const slow = run(Array(60).fill(14))
    expect(slow.frameMs).toBeCloseTo(1000 / 30)
    expect(run(Array(60).fill(9), slow).frameMs).toBeCloseTo(1000 / 30) // in between: no flip-flopping
    expect(run(Array(60).fill(5), slow).frameMs).toBeCloseTo(1000 / 60)
  })
})
