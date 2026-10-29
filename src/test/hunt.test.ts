import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { DEX } from '../lib/discovery'
import { openLock, openPage, SEALED } from '../lib/hunt'
import { walk, type FsContext } from '../lib/desktop'
import { FILESYSTEM } from '../content/desktop'
import { sceneFor } from '../content/objects'

// The real hunt, checked end to end against the plaintext in secrets/ (gitignored). Wherever that folder isn't
// (a fresh clone, CI), this whole file is skipped: the answers only exist on Daniel's machine.
const SECRETS = resolve(__dirname, '../../secrets/hunt.mjs')
const here = existsSync(SECRETS)

type Hunt = {
  vigenere: (text: string, key: string, decrypt?: boolean) => string
  SHRINE_PATH: string
  SONG_NAME: string
  THRESHOLD_PLAIN: string
  HIDDEN_TRACK_ANSWER: string
  BOOK: [string, number, string][]
  RECYCLED_ANSWER: string
  RUNE_KEY: string
  RECYCLED_PLAIN: string
  NIGHT_NUMBER: string
  DANIEL_ANSWER: string
  FINAL_PHRASE: string
  REPLAY_ANSWER: string
  BONUS_ANSWER: string
  LOCKS: Record<string, { answer: string; children: unknown[] }>
}
const load = async () => (await import(/* @vite-ignore */ SECRETS)) as Hunt

/** Elder Futhark, as the solver would transliterate it. */
const FUTHARK: Record<string, string> = {
  ᚠ: 'F', ᚢ: 'U', ᚦ: 'TH', ᚨ: 'A', ᚱ: 'R', ᚲ: 'K', ᚷ: 'G', ᚹ: 'W', ᚺ: 'H', ᚾ: 'N', ᛁ: 'I', ᛃ: 'J', ᛇ: 'EI', ᛈ: 'P', ᛉ: 'Z',
  ᛊ: 'S', ᛏ: 'T', ᛒ: 'B', ᛖ: 'E', ᛗ: 'M', ᛚ: 'L', ᛜ: 'NG', ᛞ: 'D', ᛟ: 'O',
}
const everything: FsContext = { showHidden: true, visit: 1, night: false, today: '06-15' }
const lettersOnly = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '')
const atbash = (s: string) => s.replace(/[a-z]/g, (c) => String.fromCharCode(219 - c.charCodeAt(0)))

describe.skipIf(!here)('the hunt (from secrets/)', () => {
  it('1. the nameless track is named in base64, and its name is the song name', async () => {
    const h = await load()
    const tracks = readdirSync(resolve(__dirname, '../music'))
    const file = tracks.find((f) => f.endsWith('.mp3') && Buffer.from(f.replace(/\.mp3$/, ''), 'base64').toString() === h.SONG_NAME)
    expect(file).toBeDefined()
  })

  it('2. the shrine opens at its address (however it is typed) and nowhere else', async () => {
    const h = await load()
    const page = await openPage(h.SHRINE_PATH.toUpperCase() + '/')
    expect(page?.title).toBeTruthy()
    expect(await openPage(h.SHRINE_PATH + '0')).toBeNull()
    // Its cipher, keyed with the song's name, says the HIDDEN TRACK answer.
    const armour = page!.sections.flatMap((s) => s.armour ?? []).filter((l) => !l.startsWith('-----')).join(' ')
    expect(lettersOnly(h.vigenere(armour, h.SONG_NAME, true))).toContain(lettersOnly(h.HIDDEN_TRACK_ANSWER))
  })

  it('every locked folder opens with its answer, and only that', async () => {
    const h = await load()
    for (const [id, lock] of Object.entries(h.LOCKS)) {
      expect(await openLock(id, lock.answer), id).toEqual(lock.children)
      expect(await openLock(id, `${lock.answer}x`), id).toBeNull()
    }
    expect(Object.keys(h.LOCKS).sort()).toEqual(Object.keys(SEALED.locks).sort())
  })

  it("3. the book cipher's references are the live desktop files' words, and spell RECYCLED's answer", async () => {
    const h = await load()
    const words = h.BOOK.map(([path, n]) => {
      const file = walk(FILESYSTEM, path.split('\\'), everything)
      expect(file?.text, path).toBeDefined()
      return file!.text!.match(/[A-Za-z]+/g)![n - 1].toLowerCase()
    })
    expect(words.join(' ')).toBe(h.RECYCLED_ANSWER)
    expect(walk(FILESYSTEM, ['E:', 'RECYCLED'], everything)?.hidden).toBe(true)
  })

  it("4. the day specimens' runes, in the ring's order, are RECYCLED's key; its cipher names the last door", async () => {
    const h = await load()
    const runes = DEX.filter((e) => e.spec.specimen?.glyph).map((e) => FUTHARK[e.spec.specimen!.glyph!])
    expect(runes.join('')).toBe(h.RUNE_KEY)
    const sealed = (await openLock('recycled', h.RECYCLED_ANSWER)) as { text: string }[]
    const cipher = sealed[0].text.split('\n').filter((l) => /^[A-Z .,]+$/.test(l)).join(' ')
    const plain = h.vigenere(cipher, h.RUNE_KEY, true)
    expect(lettersOnly(plain)).toBe(lettersOnly(h.RECYCLED_PLAIN))
    expect(plain).toContain(h.DANIEL_ANSWER.split(' ')[0].toUpperCase())
  })

  it("5–6. the night owls' digits, in the ring's order, are the number; the last door wants the word and the number", async () => {
    const h = await load()
    expect(DEX.filter((e) => e.spec.specimen?.digit).map((e) => e.spec.specimen!.digit).join('')).toBe(h.NIGHT_NUMBER)
    expect(h.DANIEL_ANSWER).toBe(`${h.RECYCLED_PLAIN.match(/WORD (\w+)/)![1].toLowerCase()} ${h.NIGHT_NUMBER}`)
    const bottom = JSON.stringify(await openLock('daniel', h.DANIEL_ANSWER))
    expect(bottom).toContain(h.FINAL_PHRASE)
    expect(bottom).toContain('README.txt')
  })

  it('side branches: the binary on /scan, the Atbash hint, the bytes after the replay, the spectrogram file', async () => {
    const h = await load()
    const lore = sceneFor('/scan')!.objects.find((o) => o.id === 'binary-knot')!.lore
    const binary = lore.match(/[01]{8}/g)!.map((b) => String.fromCharCode(parseInt(b, 2))).join('')
    expect(await openLock('ranked', binary)).not.toBeNull()
    expect(atbash(walk(FILESYSTEM, ['C:', 'MY DOCUMENTS', 'private'], everything)!.lock!.hint)).toMatch(/melon/)
    expect(readFileSync(resolve(__dirname, '../../public/me/replay_001.jpg')).toString('latin1')).toMatch(new RegExp(`${h.REPLAY_ANSWER}\\n$`))
    expect(statSync(resolve(__dirname, '../../public/me/track_3_raw.wav')).size).toBeGreaterThan(44)
  })

  it("nothing that's sealed is sitting in plain text in the code", async () => {
    const h = await load()
    const readme = (h.LOCKS.daniel.children as { name: string; text?: string }[]).find((c) => c.name === 'README.txt')!.text!
    const needles = [h.SHRINE_PATH, h.HIDDEN_TRACK_ANSWER, h.DANIEL_ANSWER, h.FINAL_PHRASE, h.RUNE_KEY, h.SONG_NAME, readme.slice(40, 120)]
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f)
        return statSync(p).isDirectory() ? (f === 'test' || f === 'sealed' ? [] : files(p)) : /\.(tsx?|css|json)$/.test(f) ? [p] : []
      })
    for (const file of [...files(resolve(__dirname, '..')), resolve(__dirname, '../../index.html')]) {
      const text = readFileSync(file, 'utf8').toLowerCase()
      for (const n of needles) expect(text.includes(n.toLowerCase()), `${n} in ${file}`).toBe(false)
    }
  })
})
