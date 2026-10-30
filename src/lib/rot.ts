import { POSSESSED_COPY } from '../content/possessed'
import { hash } from './uncorrupted'

// What possession does to the site's words, after the Username 666 page: words rot into "dddddddd" and
// "$r%IH%s%IH%", every number reads 666, and now and then a sentence keeps going where it shouldn't. Hand-written
// lines (src/content/possessed.ts) win over the automatic rot. Deterministic: the same text always rots the same way,
// so a page doesn't shimmer when React re-renders it.

const GLYPHS = '$r%IH%s%IH%'
const TRAILS = [
  'he is still in here',
  'do not look behind you',
  'it knows your name',
  'let me out',
  'it is wearing his face',
  'we are inside the walls',
  'you let it in',
  'it can hear you reading this',
]

/** One word, rotted: a run of d (or D, if it was shouting) or the glyph soup, the same length as the word. */
function rotWord(word: string, h: number) {
  if (h % 2) return (word === word.toUpperCase() ? 'D' : 'd').repeat(word.length)
  let out = ''
  for (let i = 0; i < word.length; i++) out += GLYPHS[(i + (h % GLYPHS.length)) % GLYPHS.length]
  return out
}

/** The automatic rot of a piece of text (no hand-written lines involved). */
export function rotText(text: string): string {
  const seed = hash(text)
  let n = 0
  const out = text
    // Every number is the same number.
    .replace(/\d+(?:[.,:/]\d+)*/g, '666')
    // About a quarter of the longer words go.
    .replace(/[A-Za-z][A-Za-z']{2,}/g, (w) => {
      const h = hash(`${seed}:${n++}:${w}`)
      return h % 100 < 25 ? rotWord(w, h >>> 8) : w
    })
  // Now and then, a sentence that doesn't end where it should.
  return text.length > 40 && seed % 8 === 0 ? `${out.replace(/[.!?]*\s*$/, '')}... ${TRAILS[(seed >>> 3) % TRAILS.length]}.` : out
}

/** What a piece of visible text says on the possessed site: its hand-written line if it has one, else its rot. */
export function possessedText(text: string): string {
  const core = text.trim()
  if (!core || !/[A-Za-z0-9]/.test(core)) return text
  const lead = text.slice(0, text.length - text.trimStart().length)
  const tail = text.slice(text.trimEnd().length)
  return lead + (POSSESSED_COPY[core] ?? rotText(core)) + tail
}
