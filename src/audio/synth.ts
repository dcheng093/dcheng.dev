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

  start(song: SynthSong) {
    this.stop()
    const stepDur = 60 / song.bpm / 4
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
        if (lead != null) blip(this.ctx, this.dest, song.leadWave, freq(lead + song.transpose), at, leadDur, 0.06)
        if (bass != null) blip(this.ctx, this.dest, song.bassWave, freq(bass + song.transpose - 12), at, bassDur, 0.09)
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

export type SfxName = 'click' | 'hover' | 'ding' | 'error' | 'coin'

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
  }
}
