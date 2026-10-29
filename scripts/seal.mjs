// npm run seal: encrypts the hunt (secrets/hunt.mjs, gitignored) into src/sealed/hunt.json, and builds the two
// side-branch puzzle files in public/me/. Each sealed thing is AES-GCM under a key derived from its answer with
// PBKDF2, exactly as src/lib/seal.ts opens it. Re-run after editing anything in secrets/.
import { webcrypto as crypto } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SECRETS = resolve(ROOT, 'secrets/hunt.mjs')
const ITERATIONS = 200_000 // must match SEAL_ITERATIONS in src/lib/seal.ts

if (!existsSync(SECRETS)) {
  console.error('secrets/hunt.mjs is missing: nothing to seal. (It is gitignored; restore it from your backup.)')
  process.exit(1)
}
const hunt = await import(pathToFileURL(SECRETS).href)

const normalise = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/(.)\/+$/, '$1')
const b64 = (buf) => Buffer.from(buf).toString('base64')

async function seal(value, answer) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalise(answer)), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt'])
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(value)))
  return { salt: b64(salt), iv: b64(iv), data: b64(data) }
}

// ——— Sanity checks: each cipher really decodes to what its answer needs ———
const fail = (msg) => {
  console.error(`seal: ${msg}`)
  process.exit(1)
}
const { vigenere } = hunt
if (!vigenere(vigenere(hunt.THRESHOLD_PLAIN, hunt.SONG_NAME), hunt.SONG_NAME, true).includes(hunt.HIDDEN_TRACK_ANSWER.toUpperCase()))
  fail('the shrine cipher does not decode to the HIDDEN TRACK answer')
if (hunt.BOOK.map(([, , w]) => w).join(' ') !== normalise(hunt.RECYCLED_ANSWER)) fail('the book cipher words do not spell the RECYCLED answer')
if (!hunt.RECYCLED_PLAIN.includes(hunt.DANIEL_ANSWER.split(' ')[0].toUpperCase())) fail('the RECYCLED cipher does not name the final word')
if (Buffer.from(hunt.SONG_NAME).toString('base64') !== 'RXBpcGhhbnkgaXMgdXBvbiB5b3U=') fail('SONG_NAME is not what the track file name decodes to')

// ——— Seal ———
const out = {
  pages: [await seal({ ...hunt.SHRINE }, hunt.SHRINE_PATH)],
  locks: Object.fromEntries(await Promise.all(Object.entries(hunt.LOCKS).map(async ([id, l]) => [id, await seal(l.children, l.answer)]))),
}
writeFileSync(resolve(ROOT, 'src/sealed/hunt.json'), `${JSON.stringify(out, null, 1)}\n`)

// ——— Side branch: a replay that keeps talking after the picture ends ———
const photo = readFileSync(resolve(ROOT, 'public/me/HOBBY-3.jpg'))
writeFileSync(resolve(ROOT, 'public/me/replay_001.jpg'), Buffer.concat([photo, Buffer.from(`\n\n--- REPLAY 001 ---\nround 13. 1v4. down to the last second.\nwhat won it: ${hunt.REPLAY_ANSWER}\n`)]))

// ——— Side branch: track 3, with its answer drawn into the spectrogram ———
const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'], D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'], J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'], V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'], X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'], Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
}
const word = hunt.BONUS_ANSWER.toUpperCase()
const columns = [...word].flatMap((ch) => {
  const g = FONT[ch] ?? fail(`no spectrogram letter for "${ch}"`)
  return [...[0, 1, 2, 3, 4].map((x) => g.map((row) => row[x] === '1')), Array(7).fill(false)]
})
const RATE = 22050
const COL = 0.16 // seconds per pixel column
const TOP = 8000 // Hz, the glyph's top row
const BAND = 600 // Hz per pixel row
const n = Math.round(columns.length * COL * RATE) + RATE // plus a second of drone at the end
const pcm = new Float32Array(n)
for (let c = 0; c < columns.length; c++) {
  const start = Math.round(c * COL * RATE)
  const len = Math.round(COL * RATE)
  columns[c].forEach((on, row) => {
    if (!on) return
    // A few tones per row so each pixel reads as a solid block, not a hairline.
    for (let t = 0; t < 5; t++) {
      const f = TOP - row * BAND - t * (BAND / 5)
      for (let i = 0; i < len; i++) {
        const env = Math.sin((Math.PI * i) / len) ** 0.5
        pcm[start + i] += Math.sin((2 * Math.PI * f * (start + i)) / RATE) * env
      }
    }
  })
}
// What it sounds like: a low, stuttering drone (track 3 skips), under the hiss of the letters.
for (let i = 0; i < n; i++) {
  const skip = Math.floor(i / (RATE * 0.37)) % 3 === 2 ? 0 : 1
  pcm[i] += 3 * skip * Math.sin((2 * Math.PI * 55 * i) / RATE) * Math.min(1, i / RATE, (n - i) / RATE)
}
const peak = pcm.reduce((m, v) => Math.max(m, Math.abs(v)), 0)
const wav = Buffer.alloc(44 + n * 2)
wav.write('RIFF', 0)
wav.writeUInt32LE(36 + n * 2, 4)
wav.write('WAVEfmt ', 8)
wav.writeUInt32LE(16, 16)
wav.writeUInt16LE(1, 20) // PCM
wav.writeUInt16LE(1, 22) // mono
wav.writeUInt32LE(RATE, 24)
wav.writeUInt32LE(RATE * 2, 28)
wav.writeUInt16LE(2, 32)
wav.writeUInt16LE(16, 34)
wav.write('data', 36)
wav.writeUInt32LE(n * 2, 40)
for (let i = 0; i < n; i++) wav.writeInt16LE(Math.round((pcm[i] / peak) * 0.8 * 32767), 44 + i * 2)
writeFileSync(resolve(ROOT, 'public/me/track_3_raw.wav'), wav)

console.log(`sealed ${out.pages.length} page(s) and ${Object.keys(out.locks).length} folders into src/sealed/hunt.json`)
console.log('wrote public/me/replay_001.jpg and public/me/track_3_raw.wav')
