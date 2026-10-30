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
  /** One of the possessed site's songs: the only ones listed (and played) while the site is possessed. */
  possessed?: boolean
  /** Only for those who reached the end of the hunt (it plays through the ending, then stays in their jukebox). */
  finisher?: boolean
  /** Extra colour, mostly for the possessed songs. All optional; a song without it sounds exactly as before. */
  fx?: {
    /** 0..1: how much of it is heard in a long, dark room. */
    reverb?: number
    /** Cents: every lead note is doubled this far sharp, out of tune with itself. */
    chorus?: number
    /** Cents: the lead's pitch drifts this far from note to note, like a tape stretching. */
    drift?: number
    /** The lead rings like a music box (a quiet bell an octave and a fifth up, decaying fast). */
    musicBox?: boolean
    /** Semitones held under the whole song, very quietly. */
    drone?: number[]
  }
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

  // ——— The song with a name: the answer to the nameless one. Only for those who reached the end. Original. ———
  {
    id: 'daybreak',
    label: 'Daybreak (The Song With A Name)',
    finisher: true,
    bpm: 76,
    legato: true,
    leadWave: 'triangle',
    bassWave: 'sine',
    transpose: 3,
    fx: { musicBox: true, reverb: 0.45, drone: [-12, -5] },
    // A music box that's found its key: rising, major, resolving every time. The light after the descent.
    lead: [
      12, _, 16, _, 19, _, 24, _, 23, _, 19, _, 16, _, 14, _,
      12, _, 16, _, 19, _, 21, _, 19, _, _, _, _, _, _, _,
      9, _, 12, _, 16, _, 21, _, 19, _, 16, _, 14, _, 12, _,
      11, _, 14, _, 19, _, 17, _, 16, _, _, _, 12, _, _, _,
    ],
    bass: [
      0, _, _, _, 7, _, _, _, 12, _, _, _, 7, _, _, _,
      5, _, _, _, 9, _, _, _, 12, _, _, _, _, _, _, _,
      -3, _, _, _, 4, _, _, _, 9, _, _, _, 4, _, _, _,
      -5, _, _, _, 2, _, _, _, 7, _, _, _, 0, _, _, _,
    ],
    drums: 'k-------h-------k-------h-------'.repeat(2),
  },

  // ——— The possessed site's songs (only these play, and only these are listed, while it's possessed). Original. ———
  {
    id: 'p-lullaby',
    label: 'Lullaby For The Thing Under The Bed',
    possessed: true,
    bpm: 72,
    leadWave: 'sine',
    bassWave: 'sine',
    transpose: 0,
    fx: { musicBox: true, chorus: 14, reverb: 0.5 },
    // A music box running down a whole-tone scale: no key to come home to.
    lead: [
      24, _, 22, _, 20, _, 18, _, 16, _, _, _, 18, _, _, _,
      24, _, 22, _, 20, _, 18, _, 14, _, _, _, _, _, _, _,
    ],
    bass: [
      0, _, _, _, _, _, _, _, -2, _, _, _, _, _, _, _,
      -4, _, _, _, _, _, _, _, -6, _, _, _, _, _, _, _,
    ],
    drums: 'b' + '-'.repeat(15) + 'b' + '-'.repeat(15),
  },
  {
    id: 'p-heartbeat',
    label: 'Heartbeat (Not Yours)',
    possessed: true,
    bpm: 56,
    leadWave: 'triangle',
    bassWave: 'sine',
    transpose: 0,
    fx: { drone: [-24, -23], reverb: 0.4, drift: 20 },
    lead: [
      _, _, _, _, _, _, _, _, 13, _, _, _, 12, _, _, _,
      _, _, _, _, _, _, _, _, 13, _, _, _, _, _, 11, _,
    ],
    bass: [
      0, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
      1, _, _, _, _, _, _, _, _, _, _, _, 0, _, _, _,
    ],
    drums: 'H-------H-------H-------H---H---',
  },
  {
    id: 'p-carousel',
    label: 'Carousel In An Empty Lot',
    possessed: true,
    bpm: 100,
    leadWave: 'triangle',
    bassWave: 'square',
    transpose: -2,
    fx: { chorus: 35, drift: 25, reverb: 0.3 },
    // A waltz (24 steps, oom-pah-pah) whose organ is a fraction out of tune and getting worse.
    lead: [
      12, _, 15, _, 14, _, 12, _, _, _, 11, _,
      12, _, 15, _, 18, _, 17, _, _, _, _, _,
    ],
    bass: [
      0, _, 7, _, 7, _, -5, _, 7, _, 7, _,
      0, _, 7, _, 7, _, -7, _, 6, _, 6, _,
    ],
    drums: 'k-h-h-k-h-h-k-h-h-k-h-h-',
  },
  {
    id: 'p-static-hymn',
    label: 'Static Hymn',
    possessed: true,
    bpm: 44,
    legato: true,
    leadWave: 'triangle',
    bassWave: 'sine',
    transpose: 0,
    fx: { drone: [-24, -18], reverb: 0.7, chorus: 20 },
    // An organ holding tritones over a tritone drone, and the static between stations.
    lead: [
      6, _, _, _, _, _, _, _, 5, _, _, _, _, _, _, _,
      0, _, _, _, _, _, _, _, 1, _, _, _, _, _, _, _,
    ],
    bass: [
      -12, _, _, _, _, _, _, _, -6, _, _, _, _, _, _, _,
      -12, _, _, _, _, _, _, _, -11, _, _, _, _, _, _, _,
    ],
    drums: 'x-------b-------x-------b-------',
  },
  {
    id: 'p-knocking',
    label: 'Something Knocks In Seven',
    possessed: true,
    bpm: 84,
    leadWave: 'sine',
    bassWave: 'square',
    transpose: -5,
    fx: { drift: 30, reverb: 0.35 },
    // Seven beats to the bar, so it never lands where you expect; the knocks come off the beat.
    lead: [
      _, _, _, _, _, _, _, _, _, _, _, _, 15, _,
      _, _, _, _, _, _, 14, _, _, _, _, _, _, _,
    ],
    bass: [
      0, _, 0, _, 3, _, _, 0, _, 0, _, 1, _, _,
      -2, _, -2, _, 1, _, _, -2, _, -2, _, -1, _, _,
    ],
    drums: '--k--k-----k----k--k-----k--',
  },
  {
    id: 'p-music-box',
    label: 'Music Box (Wound Backwards)',
    possessed: true,
    bpm: 66,
    leadWave: 'sine',
    bassWave: 'sine',
    transpose: 0,
    fx: { musicBox: true, chorus: 10, reverb: 0.55 },
    lead: [
      19, _, 17, _, 15, _, 14, _, 15, _, 17, _, 12, _, _, _,
      19, _, 20, _, 19, _, 17, _, 14, _, _, _, _, _, _, _,
    ],
    bass: [
      0, _, _, _, _, _, _, _, -4, _, _, _, _, _, _, _,
      -7, _, _, _, _, _, _, _, -5, _, _, _, _, _, _, _,
    ],
    drums: 'c' + '-'.repeat(31),
  },
  {
    id: 'p-quiet',
    label: 'It Is Quiet Down Here',
    possessed: true,
    bpm: 40,
    leadWave: 'sine',
    bassWave: 'sine',
    transpose: 0,
    fx: { drone: [-24, -17], reverb: 0.85 },
    // Almost nothing. That's the point.
    lead: [
      _, _, _, _, _, _, _, _, _, _, _, _, 27, _, _, _,
      _, _, _, _, _, _, _, _, _, _, _, _, 26, _, _, _,
    ],
    bass: [
      -12, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
      _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
    ],
    drums: '-'.repeat(16) + 'b' + '-'.repeat(15),
  },
  {
    id: 'p-procession',
    label: 'Procession For The Unbaptized',
    possessed: true,
    bpm: 60,
    legato: true,
    leadWave: 'triangle',
    bassWave: 'square',
    transpose: -3,
    fx: { reverb: 0.45, chorus: 12 },
    // A slow march. Somebody at the back is carrying a chain.
    lead: [
      12, _, 12, _, 13, _, 12, _, 10, _, _, _, 12, _, _, _,
      12, _, 12, _, 13, _, 15, _, 13, _, _, _, 12, _, _, _,
    ],
    bass: [
      0, _, _, _, 0, _, _, _, -2, _, _, _, -2, _, _, _,
      -4, _, _, _, -4, _, _, _, -5, _, _, _, -5, _, _, _,
    ],
    drums: 'k---k---k---k-c-k---k---k---k---',
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
  // ——— the possessed kit ———
  if (kind === 'H') {
    // A heartbeat: lub, dub.
    for (const [dt, v] of [[0, 0.3], [0.17, 0.2]]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.setValueAtTime(62, at + dt)
      osc.frequency.exponentialRampToValueAtTime(34, at + dt + 0.14)
      gain.gain.setValueAtTime(v, at + dt)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dt + 0.18)
      osc.connect(gain).connect(dest)
      osc.start(at + dt)
      osc.stop(at + dt + 0.2)
    }
    return
  }
  if (kind === 'x' || kind === 'b') {
    // x: metal dragged over something. b: a breath, close to the microphone.
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    const dur = kind === 'x' ? 0.45 : 0.9
    src.buffer = noise(ctx)
    filter.type = kind === 'x' ? 'bandpass' : 'lowpass'
    filter.Q.value = kind === 'x' ? 8 : 0.7
    filter.frequency.setValueAtTime(kind === 'x' ? 3200 : 500, at)
    filter.frequency.exponentialRampToValueAtTime(kind === 'x' ? 700 : 900, at + dur)
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.linearRampToValueAtTime(kind === 'x' ? 0.07 : 0.09, at + dur * 0.4)
    gain.gain.linearRampToValueAtTime(0.0001, at + dur)
    src.connect(filter).connect(gain).connect(dest)
    src.start(at, (at * 7) % 0.5)
    src.stop(at + dur + 0.02)
    return
  }
  if (kind === 'c') {
    // A chain, or a bell nobody is ringing: two notes that don't belong together.
    blip(ctx, dest, 'square', 1240, at, 0.5, 0.025)
    blip(ctx, dest, 'square', 1718, at, 0.35, 0.02)
    return
  }
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

/** A long, dark room to put a song in: two seconds of decaying noise as an impulse response. */
const rooms = new WeakMap<BaseAudioContext, AudioBuffer>()
function room(ctx: AudioContext) {
  let buf = rooms.get(ctx)
  if (!buf) {
    const len = Math.round(ctx.sampleRate * 2.4)
    buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6
    }
    rooms.set(ctx, buf)
  }
  return buf
}

export class Chiptune {
  private timer: number | null = null
  private step = 0
  private nextAt = 0
  private ctx: AudioContext
  private dest: AudioNode
  /** The current song's own signal chain (its room, its drone), torn down when it stops. */
  private teardown: (() => void) | null = null

  constructor(ctx: AudioContext, dest: AudioNode) {
    this.ctx = ctx
    this.dest = dest
  }

  /** Where this song's notes go: straight out, or through its room; plus its drone, if it has one. */
  private chain(song: SynthSong): AudioNode {
    const fx = song.fx
    if (!fx?.reverb && !fx?.drone?.length) return this.dest
    const ctx = this.ctx
    const input = ctx.createGain()
    const nodes: AudioNode[] = [input]
    input.connect(this.dest)
    if (fx.reverb) {
      const conv = ctx.createConvolver()
      conv.buffer = room(ctx)
      const wet = ctx.createGain()
      wet.gain.value = fx.reverb
      input.connect(conv).connect(wet).connect(this.dest)
      nodes.push(conv, wet)
    }
    const oscs: OscillatorNode[] = []
    if (fx.drone?.length) {
      const hum = ctx.createGain()
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 420
      hum.gain.setValueAtTime(0.0001, ctx.currentTime)
      hum.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 3)
      hum.connect(lp).connect(input)
      nodes.push(hum, lp)
      for (const semi of fx.drone) {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = freq(semi + song.transpose)
        o.detune.value = (semi % 3) * 4
        o.connect(hum)
        o.start()
        oscs.push(o)
      }
    }
    this.teardown = () => {
      oscs.forEach((o) => o.stop())
      nodes.forEach((n) => n.disconnect())
    }
    return input
  }

  start(song: SynthSong) {
    this.stop()
    const stepDur = 60 / song.bpm / 4
    const swing = (song.swing ?? 0) * stepDur
    this.nextAt = this.ctx.currentTime + 0.05
    const out = this.chain(song)
    const fx = song.fx ?? {}
    const lead = (f: number, at: number, dur: number, i: number) => {
      const bent = fx.drift ? f * 2 ** ((Math.sin(i * 0.7) * fx.drift) / 1200) : f
      blip(this.ctx, out, song.leadWave, bent, at, dur, 0.06)
      if (fx.chorus) blip(this.ctx, out, song.leadWave, bent * 2 ** (fx.chorus / 1200), at, dur, 0.04)
      if (fx.musicBox) blip(this.ctx, out, 'sine', bent * 3, at, Math.min(dur, 0.5), 0.025)
    }
    // Lookahead scheduler: wake every 25ms, queue anything due in the next 120ms.
    this.timer = window.setInterval(() => {
      while (this.nextAt < this.ctx.currentTime + 0.12) {
        const i = this.step % song.lead.length
        const at = this.nextAt + (i % 2 ? swing : 0)
        const note = song.lead[i]
        const bass = song.bass[i]
        const leadDur = song.legato ? stepDur * held(song.lead, i) * 0.9 : stepDur * 0.9
        const bassDur = song.legato ? stepDur * held(song.bass, i) * 0.9 : stepDur * 1.8
        if (note != null) lead(freq(note + song.transpose), at, leadDur, i)
        if (bass != null) blip(this.ctx, out, song.bassWave, freq(bass + song.transpose - 12), at, bassDur, 0.09)
        hit(this.ctx, out, song.drums[i], at)
        this.nextAt += stepDur
        this.step++
      }
    }, 25)
  }

  stop() {
    if (this.timer != null) window.clearInterval(this.timer)
    this.timer = null
    this.step = 0
    this.teardown?.()
    this.teardown = null
  }
}

export type SfxName =
  | 'click' | 'hover' | 'ding' | 'error' | 'coin' | 'honk' | 'startup' | 'shutdown' | 'chord' | 'tada' | 'beep' | 'disk'
  | 'sting' | 'splash' | 'choir'
  // The haunting (src/lib/haunting.ts): synthesized...
  | 'knock' | 'thump' | 'glass-hit' | 'crack' | 'scratch' | 'creak' | 'whisper' | 'heartbeat'
  // ...and recorded (public/sfx/, CC0).
  | 'shatter' | 'breathing'

/** How loud, and from where (-1 left .. 1 right). */
export type SfxOptions = { gain?: number; pan?: number }

const RECORDINGS: Partial<Record<SfxName, string>> = { shatter: '/sfx/glass-shatter.mp3', breathing: '/sfx/breathing.mp3' }
const recorded = new WeakMap<BaseAudioContext, Map<string, Promise<AudioBuffer | null>>>()
function recording(ctx: AudioContext, url: string) {
  let cache = recorded.get(ctx)
  if (!cache) recorded.set(ctx, (cache = new Map()))
  let job = cache.get(url)
  if (!job) {
    job = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .catch(() => null)
    cache.set(url, job)
  }
  return job
}

/** A short burst of filtered noise. */
function burst(ctx: AudioContext, dest: AudioNode, at: number, dur: number, vol: number, type: BiquadFilterType, f: number, q = 1) {
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  src.buffer = noise(ctx)
  filter.type = type
  filter.frequency.value = f
  filter.Q.value = q
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  src.connect(filter).connect(gain).connect(dest)
  src.start(at, Math.random() * 0.5)
  src.stop(at + dur + 0.02)
}

/** One knuckle on a door: a woody tock and the door's low answer. */
function knuckle(ctx: AudioContext, dest: AudioNode, at: number, vol: number) {
  burst(ctx, dest, at, 0.05, vol * 0.6, 'bandpass', 950, 3)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.setValueAtTime(150, at)
  osc.frequency.exponentialRampToValueAtTime(85, at + 0.08)
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12)
  osc.connect(gain).connect(dest)
  osc.start(at)
  osc.stop(at + 0.14)
}

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

export function playSfx(ctx: AudioContext, out: AudioNode, name: SfxName, opts: SfxOptions = {}) {
  const t = ctx.currentTime
  // Quieter, or further to one side: through its own gain and panner.
  let dest = out
  if (opts.gain !== undefined || opts.pan !== undefined) {
    const gain = ctx.createGain()
    gain.gain.value = opts.gain ?? 1
    const pan = ctx.createStereoPanner()
    pan.pan.value = opts.pan ?? 0
    gain.connect(pan).connect(out)
    dest = gain
    window.setTimeout(() => gain.disconnect(), 8000)
  }
  const url = RECORDINGS[name]
  if (url) {
    void recording(ctx, url).then((buf) => {
      if (!buf) return
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(dest)
      src.start()
    })
    return
  }
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
    // ——— The haunting ———
    case 'knock': // knock... knock.
      knuckle(ctx, dest, t, 0.5)
      return knuckle(ctx, dest, t + 0.26, 0.45)
    case 'thump': // something heavy against a door
      burst(ctx, dest, t, 0.3, 0.5, 'lowpass', 260)
      knuckle(ctx, dest, t, 0.9)
      return blip(ctx, dest, 'sine', 48, t, 0.45, 0.3)
    case 'glass-hit': { // a fist on a window: the thud, then the pane rattling in its frame
      burst(ctx, dest, t, 0.25, 0.45, 'lowpass', 400)
      knuckle(ctx, dest, t, 0.7)
      for (const [f, dt] of [[2900, 0.01], [3620, 0.03], [4410, 0.02], [5230, 0.05]]) blip(ctx, dest, 'sine', f, t + dt, 0.35, 0.02)
      for (let i = 0; i < 6; i++) burst(ctx, dest, t + 0.05 + i * 0.04, 0.03, 0.08, 'highpass', 4500)
      return
    }
    case 'crack': // the pane giving, a little
      burst(ctx, dest, t, 0.01, 0.6, 'highpass', 6000)
      for (let i = 0; i < 12; i++) burst(ctx, dest, t + Math.random() * 0.25, 0.012, 0.15, 'bandpass', 4000 + Math.random() * 3000, 4)
      return
    case 'scratch': { // nails, slowly, on the other side
      const src = ctx.createBufferSource()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      const lfo = ctx.createOscillator()
      const depth = ctx.createGain()
      src.buffer = noise(ctx)
      src.loop = true
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1500, t)
      filter.frequency.linearRampToValueAtTime(2400, t + 1.3)
      filter.Q.value = 6
      lfo.frequency.value = 11
      depth.gain.value = 0.07
      gain.gain.value = 0.07
      lfo.connect(depth).connect(gain.gain)
      src.connect(filter).connect(gain).connect(dest)
      src.start(t)
      lfo.start(t)
      src.stop(t + 1.4)
      lfo.stop(t + 1.4)
      return
    }
    case 'creak': { // a door, or a floorboard, taking weight
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(80, t)
      osc.frequency.linearRampToValueAtTime(140, t + 0.6)
      osc.frequency.linearRampToValueAtTime(95, t + 1.4)
      filter.type = 'bandpass'
      filter.frequency.value = 620
      filter.Q.value = 12
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.06, t + 0.2)
      gain.gain.linearRampToValueAtTime(0.0001, t + 1.4)
      osc.connect(filter).connect(gain).connect(dest)
      osc.start(t)
      osc.stop(t + 1.45)
      return
    }
    case 'whisper': // breath shaped like words, too quiet to make out
      for (let i = 0; i < 7; i++) burst(ctx, dest, t + i * 0.19 + Math.random() * 0.05, 0.16, 0.05, 'bandpass', 2600 + Math.random() * 1600, 2)
      return
    case 'heartbeat':
      return hit(ctx, dest, 'H', t)
    case 'choir': // surfacing: a held major chord that swells in, like voices
      ;[0, 4, 7, 12, 16, 19].forEach((s, i) => swell(ctx, dest, i % 2 ? 'triangle' : 'sine', freq(s + 3), t + i * 0.12, 3.6, 0.035))
      return swell(ctx, dest, 'sine', freq(27), t + 0.9, 2.8, 0.02)
  }
}
