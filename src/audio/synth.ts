// Tiny WebAudio chiptune + SFX. Songs are step patterns; real audio files go through src/audio/tracks.ts.

type Steps = (number | null)[]

/**
 * One loop. `lead`/`bass` are semitones above A3 per sixteenth step (null is a rest); `drums` has one character
 * per step: k kick, s snare, h hat, - rest. All three must be the same length (any length: 48 steps is a 3/4 waltz).
 */
export type SynthSong = {
  id: string
  label: string
  bpm: number
  lead: Steps
  bass: Steps
  drums: string
  leadWave: OscillatorType
  bassWave: OscillatorType
  transpose: number
  /** Fraction of a step to delay every off-beat sixteenth by (0.33 is a heavy shuffle). */
  swing?: number
  /** Hold notes through the rests that follow them instead of plucking. */
  legato?: boolean
  /** Not in the jukebox's list until the visitor has reached a sealed page. */
  hidden?: boolean
}

const _ = null

// The original System Default melody, shared by the four remixes.
const THEME_LEAD: Steps = [
  12, _, 15, 17, 19, _, 17, 15, 12, _, 10, 12, 15, _, _, _,
  12, _, 15, 17, 19, 22, 24, _, 22, 19, 17, 15, 17, _, 12, _,
]
const THEME_BASS: Steps = [
  0, _, 0, _, 7, _, 7, _, 5, _, 5, _, 3, _, 3, _,
  0, _, 0, _, 7, _, 7, _, 10, _, 10, _, 7, _, 5, _,
]
const THEME_DRUMS = 'k---'.repeat(8)
const theme = { lead: THEME_LEAD, bass: THEME_BASS, drums: THEME_DRUMS }

export const SYNTH_SONGS: SynthSong[] = [
  { id: 'system-default', label: 'System Default', bpm: 132, ...theme, leadWave: 'square', bassWave: 'triangle', transpose: 0 },
  { id: 'dial-up', label: 'Dial-Up Remix', bpm: 104, ...theme, leadWave: 'sawtooth', bassWave: 'square', transpose: -5 },
  { id: 'elevator', label: 'Elevator (Going Down)', bpm: 84, ...theme, leadWave: 'sine', bassWave: 'sine', transpose: 0 },
  { id: 'nightcore', label: 'Nightcore Daniel', bpm: 176, ...theme, leadWave: 'square', bassWave: 'square', transpose: 12 },
  {
    id: 'kettle-blues',
    label: 'Kettle Boil Blues',
    bpm: 92,
    swing: 0.33,
    legato: true,
    leadWave: 'triangle',
    bassWave: 'square',
    transpose: 0,
    lead: [
      12, _, 15, _, 17, 18, 19, _, 15, _, 12, _, _, _, 10, 12,
      12, _, 15, _, 17, _, 15, 12, 10, _, 7, _, 10, _, 12, _,
    ],
    bass: [
      0, _, 4, _, 7, _, 9, _, 10, _, 9, _, 7, _, 4, _,
      5, _, 9, _, 12, _, 14, _, 7, _, 11, _, 12, _, 7, _,
    ],
    drums: 'k-h-s-h-k-h-s-h-k-h-s-h-k-h-s-hh',
  },
  {
    id: 'segfault-sonata',
    label: 'Segfault Sonata',
    bpm: 120,
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    transpose: 0,
    lead: [
      24, _, 23, _, 21, _, 19, _, 17, _, 16, _, 14, _, 12, _,
      12, 15, 19, 24, _, 22, 19, 15, 14, _, _, 13, 12, _, _, _,
    ],
    bass: [
      0, _, 0, _, 0, _, 0, _, -4, _, -4, _, -4, _, -4, _,
      -7, _, -7, _, -5, _, -5, _, -5, _, -5, _, 0, _, _, _,
    ],
    drums: 'k---s---k-k-s---k---s---k-k-s-ss',
  },
  {
    id: 'dealership-jingle',
    label: 'Dealership Jingle',
    bpm: 150,
    leadWave: 'square',
    bassWave: 'triangle',
    transpose: 0,
    lead: [
      12, _, 16, _, 19, _, 16, _, 21, _, 19, 16, _, _, _, _,
      14, _, 17, _, 21, _, 17, _, 19, 19, _, 16, 12, _, _, _,
    ],
    bass: [
      0, _, 7, _, 0, _, 7, _, 5, _, 12, _, 5, _, 12, _,
      2, _, 9, _, 2, _, 9, _, 7, _, 14, _, 7, _, 7, _,
    ],
    drums: 'k-h-s-h-'.repeat(4),
  },
  {
    id: 'norminette-nightmare',
    label: 'Norminette Nightmare',
    bpm: 168,
    leadWave: 'square',
    bassWave: 'sawtooth',
    transpose: 0,
    lead: [
      12, 15, 19, 24, 19, 15, 12, 15, 8, 12, 15, 20, 15, 12, 8, 12,
      10, 14, 17, 22, 17, 14, 10, 14, 11, 14, 17, 23, 20, 17, 14, 11,
    ],
    bass: [
      0, _, 0, 0, 0, _, 0, 0, -4, _, -4, -4, -4, _, -4, -4,
      -2, _, -2, -2, -2, _, -2, -2, -1, _, -1, -1, -1, _, -1, -1,
    ],
    drums: 'khhhshhh'.repeat(4),
  },
  {
    id: 'guestbook-waltz',
    label: 'Guestbook Waltz',
    bpm: 108,
    legato: true,
    leadWave: 'sine',
    bassWave: 'triangle',
    transpose: 0,
    // 3/4: four bars of twelve sixteenths, oom-pah-pah in the bass.
    lead: [
      16, _, _, _, _, _, 14, _, 12, _, _, _,
      11, _, _, _, 14, _, _, _, 19, _, _, _,
      17, _, _, _, _, _, 21, _, 19, _, 17, _,
      16, _, _, _, _, _, _, _, _, _, _, _,
    ],
    bass: [
      0, _, _, _, 7, _, _, _, 7, _, _, _,
      -5, _, _, _, 2, _, _, _, 2, _, _, _,
      -7, _, _, _, 0, _, _, _, 0, _, _, _,
      -5, _, _, _, 2, _, _, _, 0, _, _, _,
    ],
    drums: 'k---h---h---'.repeat(4),
  },
  {
    id: 'lofi-debug',
    label: 'Lo-Fi Beats to Debug To',
    bpm: 78,
    swing: 0.2,
    legato: true,
    leadWave: 'triangle',
    bassWave: 'sine',
    transpose: 0,
    lead: [
      _, _, 19, _, 17, _, 15, _, 12, _, _, _, _, _, _, _,
      _, _, 17, _, 15, _, 12, _, 10, _, 12, _, _, _, _, _,
    ],
    bass: [
      0, _, _, _, _, _, 0, _, 3, _, _, _, _, _, _, _,
      -7, _, _, _, _, _, -7, _, -2, _, _, _, -5, _, _, _,
    ],
    drums: 'k-----h-s-----h-k-k---h-s-----h-',
  },
  {
    id: 'insert-coin',
    label: 'Insert Coin',
    bpm: 144,
    leadWave: 'square',
    bassWave: 'triangle',
    transpose: 0,
    lead: [
      12, 16, 19, 24, 19, 16, 12, _, 14, 17, 21, 26, 21, 17, 14, _,
      16, 19, 23, 28, 23, 19, 16, _, 24, _, 21, _, 19, _, 16, _,
    ],
    bass: [
      0, _, 0, _, 0, _, 0, _, 2, _, 2, _, 2, _, 2, _,
      4, _, 4, _, 4, _, 4, _, 7, _, 7, _, -5, _, -5, _,
    ],
    drums: 'k-h-s-h-k-hhs-h-k-h-s-h-k-s-s-ss',
  },
  {
    id: 'pixel-pusher',
    label: 'Pixel Pusher',
    bpm: 126,
    leadWave: 'square',
    bassWave: 'square',
    transpose: 0,
    lead: [
      19, _, 19, 21, _, 19, 16, _, 14, _, 16, _, 12, _, _, _,
      19, _, 19, 21, _, 24, 23, _, 21, _, 19, _, 16, _, _, _,
    ],
    bass: [
      0, _, 12, _, 0, _, 12, _, 5, _, 17, _, 5, _, 17, _,
      0, _, 12, _, 0, _, 12, _, 7, _, 19, _, 7, _, 19, _,
    ],
    drums: 'k-h-s-hhk-h-s-h-'.repeat(2),
  },
  {
    id: 'steam-prophecy',
    label: 'Steam Prophecy',
    bpm: 72,
    legato: true,
    leadWave: 'sine',
    bassWave: 'triangle',
    transpose: 0,
    // A harmonic minor: the G# (11) is what makes it sound like a fortune teller.
    lead: [
      12, _, _, _, 15, _, 14, _, 12, _, 11, _, 12, _, _, _,
      17, _, _, _, 15, _, 14, _, 15, _, _, _, 11, _, _, _,
    ],
    bass: [
      0, _, _, _, _, _, _, _, -4, _, _, _, _, _, _, _,
      -7, _, _, _, _, _, _, _, -5, _, _, _, -1, _, _, _,
    ],
    drums: 'k-------h-------k-------h---h---',
  },
  {
    id: 'startup-funk',
    label: 'Startup Funk',
    bpm: 110,
    swing: 0.15,
    leadWave: 'sawtooth',
    bassWave: 'square',
    transpose: 0,
    lead: [
      _, _, 24, _, _, 22, _, 19, _, _, 17, _, 19, _, _, _,
      _, _, 24, _, _, 22, _, 19, 22, _, 24, _, 27, _, 24, _,
    ],
    bass: [
      0, _, 0, 12, _, 0, 10, _, 0, _, 0, 12, _, 7, _, 10,
      5, _, 5, 17, _, 5, 15, _, 7, _, 7, 19, _, 7, 10, _,
    ],
    drums: 'k--hs-hkk-h-s-h-'.repeat(2),
  },
  {
    id: 'sticker-pop',
    label: 'Sticker Pop',
    bpm: 138,
    leadWave: 'triangle',
    bassWave: 'square',
    transpose: 0,
    lead: [
      24, _, 21, _, 16, _, 21, _, 23, _, 19, _, 16, _, 19, _,
      21, _, 17, _, 14, _, 17, _, 19, 21, 23, 24, _, _, _, _,
    ],
    bass: [
      0, _, _, 7, 0, _, _, 7, 4, _, _, 11, 4, _, _, 11,
      5, _, _, 12, 5, _, _, 12, 7, _, _, 14, 7, _, 7, _,
    ],
    drums: 'k-h-s-h-'.repeat(4),
  },
  {
    id: 'nuke-it',
    label: 'NUKE IT (Shareware Jingle)',
    bpm: 150,
    leadWave: 'square',
    bassWave: 'sawtooth',
    transpose: 0,
    // An installer-wizard jingle: bright, pushy, and over before you can close it.
    lead: [
      12, _, 16, 19, 24, _, 19, _, 21, _, 19, 16, 19, _, _, _,
      12, _, 16, 19, 24, _, 26, _, 28, _, 26, 24, 24, _, _, _,
    ],
    bass: [
      0, _, 12, _, 0, _, 12, _, 5, _, 17, _, 7, _, 19, _,
      0, _, 12, _, 0, _, 12, _, 5, _, 7, _, 0, _, 0, _,
    ],
    drums: 'k-h-s-h-k-hks-h-'.repeat(2),
  },
  {
    id: 'hymn',
    label: 'Hymn (Do Not Play)',
    hidden: true,
    bpm: 52,
    legato: true,
    leadWave: 'triangle',
    bassWave: 'sine',
    transpose: 0,
    // Sung by the congregation on the sealed page: slow harmonic minor, held like an organ, no drums. It leans on the
    // G# and never quite resolves.
    lead: [
      12, _, _, _, 11, _, _, _, 8, _, _, _, 7, _, _, _,
      12, _, _, _, 15, _, _, _, 13, _, _, _, 11, _, _, _,
    ],
    bass: [
      0, _, _, _, _, _, _, _, -4, _, _, _, _, _, _, _,
      -7, _, _, _, _, _, _, _, -5, _, _, _, -1, _, _, _,
    ],
    drums: '-'.repeat(32),
  },
]

const freq = (semi: number) => 220 * 2 ** (semi / 12)

function blip(ctx: AudioContext, dest: AudioNode, type: OscillatorType, f: number, at: number, dur: number, vol: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(f, at)
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(gain).connect(dest)
  osc.start(at)
  osc.stop(at + dur + 0.02)
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>()
function noise(ctx: AudioContext) {
  let buf = noiseBuffers.get(ctx)
  if (!buf) {
    buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    noiseBuffers.set(ctx, buf)
  }
  return buf
}

function hit(ctx: AudioContext, dest: AudioNode, kind: string, at: number) {
  if (kind === 'k') {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(150, at)
    osc.frequency.exponentialRampToValueAtTime(40, at + 0.12)
    gain.gain.setValueAtTime(0.25, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.15)
    osc.connect(gain).connect(dest)
    osc.start(at)
    osc.stop(at + 0.17)
    return
  }
  if (kind !== 's' && kind !== 'h') return
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  const dur = kind === 's' ? 0.12 : 0.03
  src.buffer = noise(ctx)
  filter.type = 'highpass'
  filter.frequency.value = kind === 's' ? 1000 : 7000
  gain.gain.setValueAtTime(kind === 's' ? 0.12 : 0.05, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  src.connect(filter).connect(gain).connect(dest)
  src.start(at)
  src.stop(at + dur + 0.02)
}

/** How many steps a note at `i` rings for: itself plus the rests after it (capped, so pads don't drone). */
const held = (steps: Steps, i: number) => {
  let n = 1
  while (n < 6 && steps[(i + n) % steps.length] === null) n++
  return n
}

export class Chiptune {
  private timer: number | null = null
  private step = 0
  private nextAt = 0
  private ctx: AudioContext
  private dest: AudioNode

  constructor(ctx: AudioContext, dest: AudioNode) {
    this.ctx = ctx
    this.dest = dest
  }

  /** `warped`: the possessed site's version: slower, a fourth lower, and slightly out of tune with itself. */
  start(song: SynthSong, warped = false) {
    this.stop()
    const bpm = warped ? song.bpm * 0.7 : song.bpm
    const down = warped ? -5 : 0
    const sour = warped ? 0.987 : 1
    const stepDur = 60 / bpm / 4
    const swing = (song.swing ?? 0) * stepDur
    this.nextAt = this.ctx.currentTime + 0.05
    // Lookahead scheduler: wake every 25ms, queue anything due in the next 120ms.
    this.timer = window.setInterval(() => {
      while (this.nextAt < this.ctx.currentTime + 0.12) {
        const i = this.step % song.lead.length
        const at = this.nextAt + (i % 2 ? swing : 0)
        const lead = song.lead[i]
        const bass = song.bass[i]
        const leadDur = song.legato ? stepDur * held(song.lead, i) * 0.9 : stepDur * 0.9
        const bassDur = song.legato ? stepDur * held(song.bass, i) * 0.9 : stepDur * 1.8
        if (lead != null) blip(this.ctx, this.dest, song.leadWave, freq(lead + song.transpose + down) * sour, at, leadDur, 0.06)
        if (bass != null) blip(this.ctx, this.dest, song.bassWave, freq(bass + song.transpose + down - 12), at, bassDur, 0.09)
        hit(this.ctx, this.dest, song.drums[i], at)
        this.nextAt += stepDur
        this.step++
      }
    }, 25)
  }

  stop() {
    if (this.timer != null) window.clearInterval(this.timer)
    this.timer = null
    this.step = 0
  }
}

export type SfxName = 'click' | 'hover' | 'ding' | 'error' | 'coin' | 'honk' | 'startup' | 'shutdown' | 'chord' | 'tada' | 'beep' | 'disk' | 'sting' | 'splash' | 'choir'

/** A note that fades in and out slowly instead of plucking: for voices. */
function swell(ctx: AudioContext, dest: AudioNode, type: OscillatorType, f: number, at: number, dur: number, vol: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(f, at)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.linearRampToValueAtTime(vol, at + dur * 0.35)
  gain.gain.linearRampToValueAtTime(0.0001, at + dur)
  osc.connect(gain).connect(dest)
  osc.start(at)
  osc.stop(at + dur + 0.02)
}

/** Filtered noise with its own envelope (sweeping the filter from `from` to `to` Hz). */
function wash(ctx: AudioContext, dest: AudioNode, at: number, dur: number, vol: number, from: number, to: number, type: BiquadFilterType = 'lowpass') {
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  src.buffer = noise(ctx)
  src.loop = true
  filter.type = type
  filter.frequency.setValueAtTime(from, at)
  filter.frequency.exponentialRampToValueAtTime(to, at + dur)
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  src.connect(filter).connect(gain).connect(dest)
  src.start(at)
  src.stop(at + dur + 0.02)
}

/** The possessed site's hum: two low sines a few Hz apart, beating slowly. Returns a stop function. */
export function drone(ctx: AudioContext, dest: AudioNode) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4)
  gain.connect(dest)
  const oscs = [55, 58.3, 82.4].map((f) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.connect(gain)
    o.start()
    return o
  })
  return () => {
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.5)
    oscs.forEach((o) => o.stop(ctx.currentTime + 1.6))
  }
}

/** A few notes at once (or rolled, with `roll` seconds between them). */
const chord = (ctx: AudioContext, dest: AudioNode, type: OscillatorType, semis: number[], at: number, dur: number, vol: number, roll = 0) =>
  semis.forEach((s, i) => blip(ctx, dest, type, freq(s), at + i * roll, dur - i * roll, vol))

/** The hard disk seeking: a handful of short filtered-noise ticks at uneven gaps. */
function crunch(ctx: AudioContext, dest: AudioNode, at: number, ticks: number) {
  let t = at
  for (let i = 0; i < ticks; i++) {
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    src.buffer = noise(ctx)
    filter.type = 'bandpass'
    filter.frequency.value = 2400 + ((i * 977) % 1800)
    gain.gain.setValueAtTime(0.18, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025)
    src.connect(filter).connect(gain).connect(dest)
    src.start(t, (i * 0.13) % 0.8, 0.03)
    t += 0.03 + ((i * 7) % 5) * 0.018
  }
}

export function playSfx(ctx: AudioContext, dest: AudioNode, name: SfxName) {
  const t = ctx.currentTime
  switch (name) {
    case 'click':
      return blip(ctx, dest, 'square', 880, t, 0.04, 0.08)
    case 'hover':
      return blip(ctx, dest, 'triangle', 1320, t, 0.015, 0.03)
    case 'ding':
      blip(ctx, dest, 'sine', 1046, t, 0.15, 0.12)
      return blip(ctx, dest, 'sine', 1568, t + 0.12, 0.3, 0.12)
    case 'error':
      return blip(ctx, dest, 'sawtooth', 110, t, 0.25, 0.1)
    case 'coin':
      blip(ctx, dest, 'square', 988, t, 0.08, 0.08)
      return blip(ctx, dest, 'square', 1319, t + 0.08, 0.3, 0.08)
    case 'honk': // the goose
      blip(ctx, dest, 'sawtooth', 330, t, 0.16, 0.12)
      return blip(ctx, dest, 'sawtooth', 277, t + 0.18, 0.28, 0.12)
    // ——— Daniel 95 ———
    case 'startup': // a slow, shimmering rise into a big warm chord (Daniel's own; it only rhymes with 1995)
      chord(ctx, dest, 'triangle', [3, 10, 15, 19, 22], t, 1.2, 0.05, 0.14)
      chord(ctx, dest, 'sine', [-9, 3, 7, 10, 15, 22, 27], t + 0.75, 3.2, 0.045, 0.05)
      return blip(ctx, dest, 'sine', freq(34), t + 1.2, 2.4, 0.03)
    case 'shutdown': // the same chord, falling asleep
      chord(ctx, dest, 'triangle', [22, 19, 15, 10, 3], t, 1.6, 0.05, 0.22)
      return chord(ctx, dest, 'sine', [-9, -2, 3], t + 1.0, 1.8, 0.05)
    case 'chord': // the error chord
      return chord(ctx, dest, 'triangle', [7, 11, 14], t, 0.45, 0.08)
    case 'tada':
      chord(ctx, dest, 'square', [3, 7, 10], t, 0.12, 0.04, 0.04)
      return chord(ctx, dest, 'square', [15, 19, 22, 27], t + 0.16, 0.7, 0.04)
    case 'beep': // the BIOS POST beep: one short, all is well
      return blip(ctx, dest, 'square', 1000, t, 0.18, 0.06)
    case 'disk':
      return crunch(ctx, dest, t, 9)
    // ——— Possession and baptism ———
    case 'sting': // the jump scare: a burst of noise over a low cluster that should not be played together
      wash(ctx, dest, t, 0.9, 0.5, 6000, 300, 'bandpass')
      chord(ctx, dest, 'sawtooth', [-24, -23, -18, -13, -12], t, 1.6, 0.07)
      return blip(ctx, dest, 'square', freq(-30), t, 1.2, 0.12)
    case 'splash': // holy water, poured
      wash(ctx, dest, t, 1.4, 0.22, 3000, 200)
      return wash(ctx, dest, t + 0.25, 1.8, 0.12, 1200, 120)
    case 'choir': // surfacing: a held major chord that swells in, like voices
      ;[0, 4, 7, 12, 16, 19].forEach((s, i) => swell(ctx, dest, i % 2 ? 'triangle' : 'sine', freq(s + 3), t + i * 0.12, 3.6, 0.035))
      return swell(ctx, dest, 'sine', freq(27), t + 0.9, 2.8, 0.02)
  }
}
