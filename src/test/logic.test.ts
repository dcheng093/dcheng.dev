/// <reference types="node" />
import { describe, expect, it, vi } from 'vitest'
import { POPUP_CAP, isSpecial, initialPopupState, popupReducer, type PopupState } from '../components/popups/popupState'
import { pickAd, pickAds, pickAdsIncluding, pickAmbush } from '../components/ads/pickAd'
import { ads } from '../content/ads'
import { pickReply } from '../content/chatScript'
import { nextHitCount } from '../lib/hitCounter'
import { mulberry32 } from '../lib/random'
import { WEBRING, neighbour, randomRoute } from '../lib/sitemap'
import { mergeEntries, pageIndex, pageNumbers, PER_PAGE } from '../lib/guestbook'
import { guestbookSeed } from '../content/guestbookSeed'
import { readStored, writeStored } from '../hooks/useLocalStorage'
import { assets, blinkies, buttons88, cursors, dividers, icons, kawaii, possessedGifs, sparkles, type Slot } from '../content/assets'
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
import { existsSync, readdirSync, statSync } from 'node:fs'
import { govern } from '../three/stage'
import { EMBLEM_CLEARANCE } from '../three/popnuke'
import { arrival, statusLine } from '../lib/dialup'
import { QUESTIONS, SURVEY } from '../content/survey'
import { claimedTotal, fleeGivesUp, possess, questionNumber, resultRows } from '../lib/survey'
import { DEFAULT_SETTINGS, chaosScale, danielPick, danielSwap, mergeSettings } from '../lib/settings'
import { countVisit, DEX, dexProgress, isNight, monthDay, readDex, recordFind, VISITS_KEY } from '../lib/discovery'
import { graft, listDir, locksIn, walk, type FsContext } from '../lib/desktop'
import { DEX_MILESTONES, FILESYSTEM, MAIL_VISITS, type FsNode } from '../content/desktop'
import { makeSeal, normalise, openSeal } from '../lib/seal'
import { openLock, openPage, SEALED, type SealedPage } from '../lib/hunt'
import { baptize, descend, descendedOf, heardAt, isPossessed, possess as possessVisitor, SCARE_EVENT, summonScare, markScared } from '../lib/possession'
import { certificateLines, took } from '../components/ending/certificate'
import { visibleMixes } from '../audio/tracks'
import { routes } from '../routes'
import { underlayFor, UNDERLAYS } from '../lib/possessedArt'
import { hasRuneStrokes } from '../lib/runes'
import { POSSESSED_COPY } from '../content/possessed'
import { possessedText, rotText } from '../lib/rot'
import { possessedPageSong } from '../audio/pageSongs'
import { cracksAt, dueCues, HAUNT_DONE_KEY, HAUNT_END, SCRIPT } from '../lib/haunting'
import { SPONSOR_ID } from '../content/ads'
import { visitNote } from '../lib/visitNote'

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
  const supplied = new Set(
    Object.keys(import.meta.glob(['../../public/me/*', '../../public/gifs/*', '../../public/possessed/*', '../../public/ads/*', '../../public/sfx/*'])).map((p) => p.replace('../../public', '')),
  )
  const groups = [assets, kawaii, icons, cursors, sparkles, dividers, blinkies, buttons88, possessedGifs]
  const slots = groups.flatMap((g) => Object.values(g)).flat().filter((s): s is Slot => /^\/(me|gifs)\//.test(s.src))
  // Read from disk: Vitest blanks stylesheet imports, even ?raw ones.
  const css = readFileSync('src/index.css', 'utf8')
  const tiles = [...css.matchAll(/url\('(\/(?:gifs|possessed)\/[^']+)'\)/g)].map((m) => m[1])
  // The sponsor's art, and the haunting's recordings.
  const sponsorArt = ads.flatMap((a) => (a.kind === 'sponsor' ? [a.img as Slot, ...Object.values(a.art ?? {})] : [])).map((s) => s.src)
  const recordings = ['/sfx/glass-shatter.mp3', '/sfx/breathing.mp3']

  it.each([...new Set([...slots.map((s) => s.src), ...tiles, ...sponsorArt, ...recordings])].map((src) => [src]))('%s exists in public/ with exactly that name', (src) => {
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
    expect(song.drums).toMatch(/^[kshHxbc-]+$/)
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
    // Synth songs are never warped (the possessed site has its own); only Daniel's recordings are.
    player.start('nope', true)
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

describe('dial-up', () => {
  it('a page loads over dial-up the first time this visit, and comes from the cache under the blinds after that', () => {
    expect(arrival(false)).toBe('dialup')
    expect(arrival(true)).toBe('wipe')
  })

  it('the status bar contacts the host, opens the page counting up (never 100% early), then says Done', () => {
    expect(statusLine('/casino', 0)).toMatch(/^Contacting host/)
    expect(statusLine('/casino', 0.15)).toMatch(/Waiting for reply/)
    expect(statusLine('/casino', 0.37)).toBe('Opening page /casino… 37%')
    expect(statusLine('/casino', 0.999)).toBe('Opening page /casino… 99%')
    expect(statusLine('/casino', 1)).toBe('Document: Done')
  })
})

describe('the survey', () => {
  const questions = SURVEY.filter((s) => s.kind !== 'interrupt')
  it('is about a hundred questions (it says 3), in every format, each with its own id', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(100)
    expect(questions).toHaveLength(QUESTIONS.length)
    expect(new Set(SURVEY.map((s) => s.id)).size).toBe(SURVEY.length)
    expect(new Set(SURVEY.map((s) => s.kind))).toEqual(new Set(['choice', 'scale', 'checks', 'text', 'select', 'flee', 'interrupt']))
    // It's all about Daniel: in the question, or in every possible answer to it.
    const about = (q: (typeof QUESTIONS)[number]) => JSON.stringify(q).includes('Daniel') || ['scale', 'text'].includes(q.kind)
    expect(QUESTIONS.filter(about).length).toBeGreaterThanOrEqual(90)
  })

  it('is interrupted after every 10th question (never after the last), taking turns', () => {
    const interrupts = SURVEY.flatMap((s, i) => (s.kind === 'interrupt' ? [{ at: questionNumber(SURVEY, i) - 1, variant: s.variant }] : []))
    expect(interrupts.map((x) => x.at)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90])
    expect(interrupts.slice(0, 3).map((x) => x.variant)).toEqual(['expired', 'captcha', 'ad'])
    expect(SURVEY[SURVEY.length - 1].kind).not.toBe('interrupt')
  })

  it('question 4 is about fruit (the strawberry sticker says so)', () => {
    expect(questions[3].q).toMatch(/fruit/i)
  })

  it('always claims you are on the last of 3', () => {
    expect([1, 2, 3, 4, 57].map(claimedTotal)).toEqual([3, 3, 3, 4, 57])
  })

  it('the possessed text box spells Daniel whatever you type, and No gives up running after 3 escapes', () => {
    expect(possess(0)).toBe('')
    expect(possess(3)).toBe('Dan')
    expect(possess(10)).toBe('Daniel Dan')
    expect([0, 1, 2, 3].map(fleeGivesUp)).toEqual([false, false, false, true])
  })

  it('results: everyone else is 100% pro-Daniel; you are shown as you answered', () => {
    const rows = resultRows({ rate: '10', like: 'Yes' })
    expect(rows.find((r) => r.id === 'rate')).toMatchObject({ you: '10', everyone: '10', agree: true })
    expect(rows.find((r) => r.id === 'like')).toMatchObject({ you: 'Yes', everyone: 'Definitely yes', agree: false })
    expect(rows.find((r) => r.id === 'forever')!.you).toBe('(no answer)')
    // Every headline is a real question, and "everyone"'s answer is one you could give.
    for (const r of rows) {
      const q = QUESTIONS.find((x) => x.id === r.id)!
      const choices = q.kind === 'choice' ? q.a : q.kind === 'flee' ? [q.yes] : ['10']
      expect(choices).toContain(r.everyone)
    }
  })
})

describe('POPNUKE demo', () => {
  it('the pop-ups shatter well in front of the spinning emblem, never inside it', () => {
    expect(EMBLEM_CLEARANCE).toBeGreaterThan(0.75) // more than half a pop-up pane
  })
})

describe('the Object Dex', () => {
  it('keeps the first sighting', () => {
    const first = recordFind({}, 'goose', new Date('2026-01-01T00:00:00Z'))
    expect(recordFind(first, 'goose', new Date('2026-06-01T00:00:00Z'))).toBe(first)
    expect(first.goose).toBe('2026-01-01T00:00:00.000Z')
  })

  it('counts legendaries caught before the Dex existed', () => {
    localStorage.clear()
    writeStored('legendaries', { beef: 'then' })
    writeStored('dex', { 'dice-a': 'now' })
    expect(readDex()).toEqual({ beef: 'then', 'dice-a': 'now' })
    localStorage.clear()
  })

  it('counts progress, rounding down', () => {
    const half = Object.fromEntries(DEX.slice(0, Math.floor(DEX.length / 2)).map((e) => [e.spec.id, 'x']))
    const p = dexProgress(half)
    expect(p.total).toBe(DEX.length)
    expect(p.pct).toBe(Math.floor((p.found / p.total) * 100))
    expect(p.complete).toBe(false)
    expect(dexProgress(Object.fromEntries(DEX.map((e) => [e.spec.id, 'x']))).complete).toBe(true)
  })

  it('lists only the specimens, once each: about a third of the objects, legendaries and night owls included', () => {
    const ids = DEX.map((e) => e.spec.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(expect.arrayContaining(['goose', 'guest-moon']))
    expect(DEX.filter((e) => e.spec.when === 'night')).toHaveLength(7)
    expect(DEX.length).toBeGreaterThanOrEqual(30)
    expect(DEX.length).toBeLessThanOrEqual(45)
    const everything = Object.values(PAGE_3D).flatMap((s) => s.objects).length + LEGENDARIES.length
    expect(DEX.length / everything).toBeLessThan(0.4)
  })

  it('every page of the ring with objects has exactly one day specimen, a drifter (so phones can catch it)', () => {
    for (const page of WEBRING.filter((p) => PAGE_3D[p])) {
      const day = PAGE_3D[page].objects.filter((o) => o.specimen && o.when !== 'night')
      expect(day, page).toHaveLength(1)
      expect(day[0].role, page).toBe('drifter')
    }
    // Specimens only live on the ring (in the Dex's order), never on the crash screen.
    expect(PAGE_3D.bsod.objects.some((o) => o.specimen)).toBe(false)
  })

  it('day specimens carry an Elder Futhark rune, night owls a digit, legendaries nothing', () => {
    for (const { spec } of DEX) {
      if (spec.rarity === 'legendary') expect(spec.specimen, spec.id).toEqual({})
      else if (spec.when === 'night') expect(spec.specimen?.digit, spec.id).toMatch(/^\d$/)
      else {
        expect(spec.specimen?.glyph, spec.id).toMatch(/^[\u16A0-\u16F8]$/)
        // Drawn by the Dex (fonts can't be trusted with runes), so it must be one it knows how to draw.
        expect(hasRuneStrokes(spec.specimen!.glyph!), spec.id).toBe(true)
      }
    }
  })

  it('night objects never push a page past 5 objects or 2 drifters', () => {
    for (const [page, scene] of Object.entries(PAGE_3D)) {
      expect(scene.objects.length, page).toBeLessThanOrEqual(5)
      expect(scene.objects.filter((o) => o.role === 'drifter').length, page).toBeLessThanOrEqual(2)
      for (const o of scene.objects.filter((o) => o.when === 'night')) expect([o.role, o.rarity], o.id).toEqual(['drifter', 'rare'])
    }
  })
})

describe('the clock and return visits', () => {
  const at = (h: number, m: number) => new Date(2026, 9, 29, h, m)

  it('night is 10pm to 5am', () => {
    expect(isNight(at(21, 59))).toBe(false)
    expect(isNight(at(22, 0))).toBe(true)
    expect(isNight(at(4, 59))).toBe(true)
    expect(isNight(at(5, 0))).toBe(false)
  })

  it('dates are MM-DD', () => {
    expect(monthDay(new Date(2026, 9, 31))).toBe('10-31')
    expect(monthDay(new Date(2027, 0, 1))).toBe('01-01')
  })

  it('a browser session counts as one visit', () => {
    localStorage.clear()
    sessionStorage.clear()
    expect(countVisit()).toBe(1)
    expect(countVisit()).toBe(1)
    sessionStorage.clear() // a new session
    expect(countVisit()).toBe(2)
    expect(readStored(VISITS_KEY, 0)).toBe(2)
    localStorage.clear()
    sessionStorage.clear()
  })

  it('the note announces new mail and special days, and nothing else', () => {
    expect(visitNote(1, '06-15')).toBeNull()
    expect(visitNote(MAIL_VISITS[1], '06-15')?.text).toMatch(`visit #${MAIL_VISITS[1]}`)
    expect(visitNote(4, '06-15')).toBeNull()
    expect(visitNote(4, '10-31')?.text).toMatch(/HALLOWEEN/)
  })
})

describe("Daniel's filesystem", () => {
  const day: FsContext = { showHidden: false, visit: 1, night: false, today: '06-15' }
  const all: FsContext = { showHidden: true, visit: 99, night: true, today: '10-31' }
  const names = (path: string[], ctx: FsContext) => listDir(walk(FILESYSTEM, path, ctx)!, ctx).map((n) => n.name)

  it('hides hidden, later-visit, night-only and other-day files', () => {
    expect(names(['C:'], day)).not.toContain('.secret')
    expect(names(['C:'], { ...day, showHidden: true })).toContain('.secret')
    expect(names(['C:', 'MAIL'], day)).toEqual(['letter_01.txt'])
    expect(names(['C:', 'MAIL'], { ...day, visit: 3 })).toEqual(['letter_01.txt', 'letter_02.txt', 'letter_03.txt'])
    expect(names(['C:'], day)).not.toContain('NIGHT')
    expect(names(['C:'], { ...day, night: true })).toContain('NIGHT')
    expect(names(['C:', 'EVENTS'], day)).toEqual(['nothing_today.txt'])
    expect(names(['C:', 'EVENTS'], { ...day, today: '10-31' })).toContain('halloween.txt')
  })

  it("walks paths, and a folder that's gone (night ended) can't be walked into", () => {
    expect(walk(FILESYSTEM, ['C:', 'SCHOOL', '42'], day)?.kind).toBe('folder')
    expect(walk(FILESYSTEM, ['C:', 'NIGHT'], day)).toBeUndefined()
    expect(walk(FILESYSTEM, ['Z:'], day)).toBeUndefined()
  })

  it('locked folders are empty stubs: what is inside them is sealed, not in the code', () => {
    const locks = locksIn(FILESYSTEM)
    expect(locks.map((l) => l.seal).sort()).toEqual(Object.keys(SEALED.locks).sort())
    for (const { path } of locks) expect(walk(FILESYSTEM, path.split('\\'), all)?.children, path).toEqual([])
  })

  it('every Dex milestone hints at a real locked folder', () => {
    for (const m of DEX_MILESTONES) expect(walk(FILESYSTEM, m.folder.split('\\'), all)?.lock, m.folder).toBeDefined()
  })

  it('opened folders are grafted into the tree by path', () => {
    const files: FsNode[] = [{ name: 'inside.txt', kind: 'txt', text: 'hi' }]
    const tree = graft(FILESYSTEM, { 'C:\\GAMES\\ranked': files })
    expect(walk(tree, ['C:', 'GAMES', 'ranked'], all)?.children).toEqual(files)
    expect(walk(tree, ['C:', 'DANIEL'], all)?.children).toEqual([])
  })

  it('pulling the plug closes every window', () => {
    const open = desktopReducer({ windows: [] }, { type: 'open', id: 'notepad', x: 0, y: 0 })
    expect(desktopReducer(open, { type: 'reset' }).windows).toEqual([])
  })
})

describe('sealing', () => {
  it('ignores case, spacing and a trailing slash in answers', () => {
    expect(normalise('  Open   SESAME ')).toBe('open sesame')
    expect(normalise('/Somewhere/')).toBe('/somewhere')
    expect(normalise('/')).toBe('/')
  })

  it('a seal opens with its answer and nothing else', async () => {
    const seal = await makeSeal({ ok: 1 }, 'Open Sesame')
    expect(await openSeal(seal, '  open   sesame ')).toEqual({ ok: 1 })
    expect(await openSeal(seal, 'open sesame!')).toBeNull()
    expect(JSON.stringify(seal)).not.toContain('"ok":1')
  })

  it('locked folders and pages open by their answer and address', async () => {
    const files: FsNode[] = [{ name: 'a.txt', kind: 'txt', text: 'x' }]
    const locks = { box: await makeSeal(files, 'key') }
    expect(await openLock('box', 'KEY', locks)).toEqual(files)
    expect(await openLock('box', 'nope', locks)).toBeNull()
    expect(await openLock('missing', 'key', locks)).toBeNull()
    const page: SealedPage = { title: 'HELLO', sections: [] }
    const pages = [await makeSeal(page, '/test-shrine')]
    expect(await openPage('/Test-Shrine/', pages)).toEqual(page)
    expect(await openPage('/test-shrine-2', pages)).toBeNull()
  })

  it('no secret page is a route, a ring stop, a theme song or a legendary roll', () => {
    const paths = routes[0].children!.map((r) => r.path)
    expect(paths.filter((p) => p && !['*', 'legendary/:id', 'boring'].includes(p) && !WEBRING.includes(`/${p}`) && !p.includes(':'))).toEqual([])
    expect(rollLegendary('/somewhere-unknown', () => 0)).toBeUndefined()
    expect(rollLegendary('/scan', () => 0)).toBeDefined()
    expect(DEX.every((e) => e.page === 'anywhere' || WEBRING.includes(e.page))).toBe(true)
  })

  it('the hymn exists, but only joins the jukebox once a sealed page has been reached', () => {
    expect(SYNTH_SONGS.find((s) => s.id === 'hymn')?.hidden).toBe(true)
    expect(visibleMixes(false).some((t) => t.id === 'hymn')).toBe(false)
    expect(visibleMixes(true).some((t) => t.id === 'hymn')).toBe(true)
  })
})

describe('possession', () => {
  it('reaching a sealed page marks the visitor (the first time is kept) and the site turns, until baptized', () => {
    expect(isPossessed()).toBe(false)
    possessVisitor(new Date('2026-10-29T03:00:00Z'))
    possessVisitor(new Date('2026-11-01T03:00:00Z'))
    expect(isPossessed()).toBe(true)
    expect(heardAt()).toBe('2026-10-29T03:00:00.000Z')
    baptize()
    expect(isPossessed()).toBe(false)
    expect(heardAt()).toBe('2026-10-29T03:00:00.000Z')
  })

  it('the jump scare answers once, ever, and only while possessed', () => {
    const scared = vi.fn()
    window.addEventListener(SCARE_EVENT, scared)
    expect(summonScare()).toBe(false)
    possessVisitor()
    expect(summonScare()).toBe(true)
    markScared()
    expect(summonScare()).toBe(false)
    expect(scared).toHaveBeenCalledTimes(1)
    window.removeEventListener(SCARE_EVENT, scared)
  })

  it('descending marks them for good, with their name; the possession lifts and the haunting is over', () => {
    expect(descendedOf()).toBeNull()
    possessVisitor()
    descend('Tester', new Date('2026-11-02T10:00:00Z'))
    expect(descendedOf()).toEqual({ at: '2026-11-02T10:00:00.000Z', name: 'Tester' })
    expect(descendedOf()).toBe(descendedOf()) // a stable snapshot for useSyncExternalStore
    expect(isPossessed()).toBe(false)
    expect(readStored(HAUNT_DONE_KEY, false)).toBe(true)
  })
})

describe('the link preview', () => {
  const html = readFileSync('index.html', 'utf8')
  const meta = (attr: string, name: string) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1]

  it('points chat apps at a real 1200×630 picture, by absolute URL, as a large card', async () => {
    const image = meta('property', 'og:image')!
    expect(image).toMatch(/^https:\/\/www\.dcheng\.dev\//)
    const file = `public${new URL(image).pathname}`
    expect(existsSync(file), file).toBe(true)
    const { default: sharp } = await import('sharp')
    const { width, height } = await sharp(file).metadata()
    expect([width, height]).toEqual([1200, 630])
    expect([meta('property', 'og:image:width'), meta('property', 'og:image:height')]).toEqual(['1200', '630'])
    expect(meta('name', 'twitter:image')).toBe(image)
    expect(meta('name', 'twitter:card')).toBe('summary_large_image')
    expect(meta('property', 'og:title')).toBe(html.match(/<title>([^<]+)<\/title>/)![1].replace(/&#39;|'/g, "'"))
  })
})

describe('the ending', () => {
  it('only finishers hear the song with a name, possessed or not', () => {
    const daybreak = SYNTH_SONGS.find((s) => s.id === 'daybreak')!
    expect(daybreak.finisher).toBe(true)
    for (const possessed of [false, true]) {
      expect(visibleMixes(true, possessed).some((t) => t.id === 'daybreak')).toBe(false)
      expect(visibleMixes(true, possessed, true).some((t) => t.id === 'daybreak')).toBe(true)
    }
  })

  it('says how long the descent took, in the two largest units', () => {
    expect(took('2026-10-29T03:00:00Z', '2026-10-29T03:12:00Z')).toBe('12 minutes')
    expect(took('2026-10-29T03:00:00Z', '2026-10-29T04:01:00Z')).toBe('1 hour, 1 minute')
    expect(took('2026-10-29T03:00:00Z', '2026-11-01T07:30:00Z')).toBe('3 days, 4 hours')
    expect(took('2026-10-29T03:00:00Z', '2026-10-29T02:00:00Z')).toBe('0 minutes')
  })

  it('the certificate records the descent, and copes with not knowing when it began', () => {
    const base = { name: 'Tester', finished: '2026-11-02T10:00:00Z', visits: 9, dex: { found: 12, total: 38 } }
    const full = certificateLines({ ...base, heard: '2026-10-29T03:00:00Z' })
    expect(full.name).toBe('Tester')
    expect(full.facts.join('\n')).toMatch(/It took: 4 days, 7 hours/)
    expect(full.facts.join('\n')).toContain('Visits: 9')
    expect(full.facts.join('\n')).toContain('12 of 38')
    const unknown = certificateLines({ ...base, heard: null })
    expect(unknown.facts.some((f) => f.startsWith('It took'))).toBe(false)
    expect(unknown.facts[0]).toMatch(/a night they remember/)
  })
})

describe('the possessed site: text', () => {
  it('rots the same text the same way every time, keeps lengths, and makes every number 666', () => {
    const line = 'Twenty-five lines. Four parameters. Five variables. No for loops. These are the commandments.'
    expect(rotText(line)).toBe(rotText(line))
    expect(rotText('Visit 42 times, pay £1,068/mo on 10/31')).toMatch(/666 times.*666\/mo on 666/)
    // Words become runs of the same length (only the occasional trailing sentence adds more).
    const words = 'Daniel Cheng keeps lots of mice and keyboards on his desk at home'
    expect(rotText(words).split(' ').map((w) => w.length)).toEqual(words.split(' ').map((w) => w.length))
    expect(rotText('ok')).toBe('ok')
  })

  it('uses a hand-written line when there is one, keeping the spacing around it', () => {
    const [normal, possessed] = Object.entries(POSSESSED_COPY)[0]
    expect(possessedText(`  ${normal} `)).toBe(`  ${possessed} `)
    expect(possessedText('   ')).toBe('   ')
    expect(possessedText('★ ✦ ★')).toBe('★ ✦ ★')
  })

  it('every hand-written line still matches some text in the source (so edits do not orphan them)', () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = `${dir}/${f}`
        return statSync(p).isDirectory() ? (f === 'test' ? [] : files(p)) : /\.tsx?$/.test(f) && !p.endsWith('content/possessed.ts') ? [p] : []
      })
    const source = files('src')
      .map((f) => readFileSync(f, 'utf8'))
      .join('\n')
      .replace(/\\'/g, "'")
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
    const orphans = Object.keys(POSSESSED_COPY).filter((k) => !source.includes(k))
    expect(orphans).toEqual([])
  })
})

describe('the possessed site: music', () => {
  it('lists only its own songs (plus the hymn and the recordings) while possessed, and never them otherwise', () => {
    const possessed = visibleMixes(true, true)
    expect(possessed.length).toBeGreaterThanOrEqual(9)
    expect(possessed.every((t) => t.kind === 'file' || t.song.possessed || t.id === 'hymn')).toBe(true)
    expect(visibleMixes(true).some((t) => t.kind === 'synth' && t.song.possessed)).toBe(false)
  })

  it('gives every page of the ring a possessed song that exists', () => {
    const ids = new Set(SYNTH_SONGS.filter((s) => s.possessed).map((s) => s.id))
    expect(ids.size).toBeGreaterThanOrEqual(8)
    for (const page of WEBRING) expect(ids.has(possessedPageSong(page)), page).toBe(true)
    expect(possessedPageSong('/nowhere')).toBe('p-quiet')
  })
})

describe('the haunting', () => {
  it('plays out between 12 and 15 minutes in, in order, getting worse, ending in the shatter', () => {
    expect(SCRIPT.map((c) => c.at)).toEqual([...SCRIPT.map((c) => c.at)].sort((a, b) => a - b))
    expect(SCRIPT[0].at).toBeGreaterThanOrEqual(60)
    expect(HAUNT_END).toBeGreaterThanOrEqual(12 * 60)
    expect(HAUNT_END).toBeLessThanOrEqual(15 * 60)
    expect(SCRIPT.at(-1)?.shatter).toBe(true)
    expect(SCRIPT.filter((c) => c.shatter)).toHaveLength(1)
  })

  it('hands out each cue once as time passes, and the cracks only ever grow', () => {
    let seen = 0
    for (let t = 0; t < HAUNT_END + 5; t++) seen += dueCues(t, t + 1).length
    expect(seen).toBe(SCRIPT.length)
    let last = 0
    for (let t = 0; t <= HAUNT_END; t += 10) {
      expect(cracksAt(t)).toBeGreaterThanOrEqual(last)
      last = cracksAt(t)
    }
    expect(cracksAt(0)).toBe(0)
    expect(last).toBeGreaterThan(3)
  })
})

describe('the sponsor (Gulag Games)', () => {
  const sponsor = ads.find((a) => a.id === SPONSOR_ID)!

  it('is a real link out, with art for every format it runs in', () => {
    expect(sponsor.to).toBe('https://gulaggames.com/')
    expect(sponsor.kind).toBe('sponsor')
    expect(sponsor.formats).toEqual(expect.arrayContaining(['leaderboard', 'banner', 'popup']))
  })

  it('gets about a quarter of open slots and pop-ups, never two pop-ups in a row, never a row of joke ads', () => {
    const rng = mulberry32(42)
    let picks = 0
    for (let i = 0; i < 4000; i++) if (pickAd('banner', { rng }).id === SPONSOR_ID) picks++
    expect(picks / 4000).toBeGreaterThan(0.2)
    expect(picks / 4000).toBeLessThan(0.33)
    expect(pickAd('banner', { kind: 'surreal', rng: () => 0 }).id).not.toBe(SPONSOR_ID)
    let last: string | null = null
    let ambushes = 0
    for (let i = 0; i < 4000; i++) {
      const next = pickAmbush(['millionth', 'more-ram', SPONSOR_ID], last, rng)
      if (next === SPONSOR_ID) {
        expect(last).not.toBe(SPONSOR_ID)
        ambushes++
      }
      last = next
    }
    expect(ambushes / 4000).toBeGreaterThan(0.15)
    expect(pickAds('button125', 30, rng).some((a) => a.id === SPONSOR_ID)).toBe(false)
  })
})

describe('the possessed site: what lies under the pages', () => {
  it('every underlay exists, and neighbouring pages of the ring never share one', () => {
    for (const r of UNDERLAYS) expect(existsSync(`public${r.src}`), r.src).toBe(true)
    for (let i = 1; i < WEBRING.length; i++) expect(underlayFor(WEBRING[i]), WEBRING[i]).not.toBe(underlayFor(WEBRING[i - 1]))
    expect(underlayFor('/casino')).toBe(underlayFor('/Casino/'))
  })

  it('no one texture is under most of the site', () => {
    const counts = new Map<string, number>()
    for (const page of WEBRING) counts.set(underlayFor(page).src, (counts.get(underlayFor(page).src) ?? 0) + 1)
    expect(counts.size).toBe(Math.min(UNDERLAYS.length, WEBRING.length))
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(2)
  })

  it("Home's bands and the landing gate each rot into a different texture", () => {
    const css = readFileSync('src/index.css', 'utf8')
    const home = ['sky', 'pink-twinkles', 'stars', 'blue-swirl', 'blue-flowers', 'green-grid', 'lava-lamps', 'brick', 'flames', 'smileys', 'town', 'nebula']
    const rot = home.map((t) => css.match(new RegExp(`\\.tile-${t} \\{ --rot: url\\('([^']+)'\\)`))?.[1])
    expect(rot.every(Boolean)).toBe(true)
    expect(new Set(rot).size).toBe(home.length)
  })
})
