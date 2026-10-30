import type { SfxName, SfxOptions } from '../audio/synth'

// Something wants out. Once the site is possessed, it starts knocking: faint and far off at first, then closer, then
// on the glass, until the glass gives. It escalates over one sitting (counting only time spent on the loud pages,
// with the tab open) and only ever plays out once: afterwards it just knocks, now and then. Nothing here flashes:
// the cracks appear and stay, the glass shakes in a few chunky steps.

export type Cue = {
  /** Seconds of possessed time (on loud pages) before it happens. */
  at: number
  sounds: [SfxName, SfxOptions?][]
  /** Cracks across the screen after this (each hit adds one; the shatter fills it). */
  cracks?: number
  shake?: boolean
  shatter?: boolean
}

export const SCRIPT: Cue[] = [
  { at: 120, sounds: [['knock', { gain: 0.15, pan: -0.8 }]] },
  { at: 155, sounds: [['knock', { gain: 0.18, pan: 0.7 }]] },
  { at: 215, sounds: [['knock', { gain: 0.26, pan: -0.3 }], ['creak', { gain: 0.5, pan: 0.4 }]] },
  { at: 300, sounds: [['knock', { gain: 0.42, pan: 0.2 }], ['breathing', { gain: 0.18, pan: -0.2 }]] },
  { at: 335, sounds: [['knock', { gain: 0.55 }], ['scratch', { gain: 0.6, pan: 0.3 }]] },
  { at: 420, sounds: [['thump', { gain: 0.55, pan: -0.2 }], ['scratch', { gain: 0.8 }]] },
  { at: 480, sounds: [['glass-hit', { gain: 0.6 }], ['crack', { gain: 0.5 }]], cracks: 1, shake: true },
  { at: 540, sounds: [['glass-hit', { gain: 0.7 }], ['crack', { gain: 0.6 }], ['breathing', { gain: 0.35 }]], cracks: 2, shake: true },
  { at: 600, sounds: [['glass-hit', { gain: 0.8 }], ['crack', { gain: 0.7 }], ['whisper', { gain: 0.8, pan: -0.5 }]], cracks: 3, shake: true },
  { at: 640, sounds: [['glass-hit', { gain: 0.9 }], ['crack', { gain: 0.8 }]], cracks: 4, shake: true },
  { at: 690, sounds: [['glass-hit', { gain: 1 }], ['crack', { gain: 0.9 }], ['heartbeat', { gain: 0.8 }]], cracks: 5, shake: true },
  { at: 760, sounds: [['thump', { gain: 1 }], ['glass-hit', { gain: 1 }], ['crack', { gain: 1 }]], cracks: 6, shake: true },
  { at: 800, sounds: [['shatter', { gain: 1 }], ['breathing', { gain: 0.5, pan: -0.3 }]], cracks: 6, shatter: true },
]

/** The cues that fall due as possessed time goes from `before` to `now` seconds. */
export const dueCues = (before: number, now: number, script: readonly Cue[] = SCRIPT) => script.filter((c) => c.at > before && c.at <= now)

/** How many cracks the glass has at `seconds` (it remembers them for the rest of the sitting). */
export const cracksAt = (seconds: number, script: readonly Cue[] = SCRIPT) =>
  script.reduce((n, c) => (c.at <= seconds && c.cracks ? Math.max(n, c.cracks) : n), 0)

/** When it has all played out, it only knocks now and then: about every 3–6 minutes. */
export const AFTER_KNOCK: [number, number] = [180, 360]

export const HAUNT_KEY = 'hauntSeconds' // this sitting (sessionStorage)
export const HAUNT_DONE_KEY = 'hauntingDone' // ever (localStorage)
export const HAUNT_END = SCRIPT[SCRIPT.length - 1].at
