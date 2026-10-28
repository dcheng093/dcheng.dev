/**
 * How a 3D object behaves around the cursor. Pure maths so it can be unit-tested; the 3D code calls `step`
 * every frame. Personalities are never shown to visitors: you only feel them.
 */
export type Personality = 'shy' | 'curious' | 'excitable' | 'watcher' | 'lazy' | 'showoff' | 'nervous' | 'dramatic'
export type Reaction = 'boing' | 'burst' | 'fling' | 'secret'
/** Whole-page moods for the gag pages: everything crashed (BSOD) or everything sad (/leave). */
export type PageMood = 'crashed' | 'sad'

export const PERSONALITIES: readonly Personality[] = ['shy', 'curious', 'excitable', 'watcher', 'lazy', 'showoff', 'nervous', 'dramatic']

type Traits = { spin: number; reach: number; reaction: Reaction }
export const TRAITS: Record<Personality, Traits> = {
  shy: { spin: 0.9, reach: 170, reaction: 'burst' },
  curious: { spin: 0.7, reach: 220, reaction: 'boing' },
  excitable: { spin: 1.1, reach: 200, reaction: 'boing' },
  watcher: { spin: 0.4, reach: 400, reaction: 'fling' },
  lazy: { spin: 0.25, reach: 100, reaction: 'boing' },
  showoff: { spin: 1.3, reach: 160, reaction: 'fling' },
  nervous: { spin: 0.8, reach: 190, reaction: 'burst' },
  dramatic: { spin: 0.7, reach: 180, reaction: 'fling' },
}

export type Body = {
  /** Offset from the object's home spot, px. */
  ox: number
  oy: number
  /** Fling velocity, px/s. */
  vx: number
  vy: number
  /** Accumulated spin angle and how fast it's turning right now. */
  spin: number
  spinRate: number
  /** Head turn toward/away from the cursor, radians. */
  yaw: number
  pitch: number
  /** Extra rotation from a show-off flip or a click, radians, decaying to 0. */
  flip: number
  /** Squash for a boing, 0 = none. */
  squash: number
}

export const restingBody = (): Body => ({ ox: 0, oy: 0, vx: 0, vy: 0, spin: 0, spinRate: 0, yaw: 0, pitch: 0, flip: 0, squash: 0 })

/** Where the cursor is relative to the object's centre (px), or null if it's off the page. */
export type Cursor = { dx: number; dy: number } | null

const ease = (from: number, to: number, rate: number, dt: number) => from + (to - from) * Math.min(1, rate * dt)
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * One frame of behaviour. `t` is seconds (for periodic habits like flips), `rng` adds nervous jitter.
 * Returns a new Body; the input is not modified.
 */
export function step(p: Personality, b: Body, cursor: Cursor, t: number, dt: number, rng: () => number = Math.random): Body {
  const { spin, reach } = TRAITS[p]
  const dist = cursor ? Math.hypot(cursor.dx, cursor.dy) : Infinity
  const near = dist < reach ? 1 - dist / reach : 0 // 0 far … 1 touching
  const ux = cursor && dist > 0 ? cursor.dx / dist : 0
  const uy = cursor && dist > 0 ? cursor.dy / dist : 0

  let tx = 0 // where the object wants its offset to be
  let ty = 0
  let rate = spin
  let yaw = 0
  let pitch = 0
  switch (p) {
    case 'shy': // scoots away and spins nervously
      tx = -ux * near * 90
      ty = -uy * near * 90
      rate = spin * (1 + near * 3)
      break
    case 'curious': // leans in for a closer look
      tx = ux * near * 40
      ty = uy * near * 40
      rate = spin * (1 - near * 0.7)
      break
    case 'excitable':
      rate = spin * (1 + near * 6)
      break
    case 'watcher': // stops spinning and stares
      yaw = clamp((cursor?.dx ?? 0) / 250, -1.2, 1.2) * (cursor ? 1 : 0)
      pitch = clamp((cursor?.dy ?? 0) / 250, -0.8, 0.8) * (cursor ? 1 : 0)
      rate = spin * (dist < reach ? 0.1 : 1)
      break
    case 'lazy':
      rate = spin
      break
    case 'showoff': // a flip every few seconds, bigger when watched
      rate = spin * (1 + near)
      break
    case 'nervous':
      tx = (rng() - 0.5) * (3 + near * 14)
      ty = (rng() - 0.5) * (3 + near * 14)
      rate = spin * (1 + near * 2)
      break
    case 'dramatic': // leans away, faint swoon
      tx = -ux * near * 25
      ty = -uy * near * 25
      pitch = near * 0.5
      break
  }

  // Fling physics: a damped spring pulling the object back home.
  const k = 9
  const c = 4.5
  const vx = b.vx + (-k * b.ox - c * b.vx) * dt
  const vy = b.vy + (-k * b.oy - c * b.vy) * dt
  const flinging = Math.abs(b.vx) + Math.abs(b.vy) > 20
  const ox = flinging ? b.ox + vx * dt : ease(b.ox, tx, 6, dt)
  const oy = flinging ? b.oy + vy * dt : ease(b.oy, ty, 6, dt)

  const spinRate = ease(b.spinRate, rate, 4, dt)
  const showoffFlip = p === 'showoff' && t % 6 < dt ? Math.PI * 2 : 0
  return {
    ox,
    oy,
    vx: flinging ? vx : 0,
    vy: flinging ? vy : 0,
    spin: b.spin + spinRate * dt,
    spinRate,
    yaw: ease(b.yaw, yaw, 5, dt),
    pitch: ease(b.pitch, pitch, 5, dt),
    flip: ease(b.flip + showoffFlip, 0, 2.2, dt),
    squash: ease(b.squash, 0, 7, dt),
  }
}

/** The kick a click gives: which reaction it plays and how the body changes. */
export function poke(p: Personality, b: Body, from: { dx: number; dy: number }, override?: Reaction): { body: Body; reaction: Reaction } {
  const reaction = override ?? TRAITS[p].reaction
  const d = Math.hypot(from.dx, from.dy) || 1
  const power = p === 'dramatic' ? 900 : 520
  switch (reaction) {
    case 'fling': // away from where it was clicked
      return { reaction, body: { ...b, vx: (-from.dx / d) * power, vy: (-from.dy / d) * power - 120, flip: b.flip + Math.PI * 4 } }
    case 'boing':
      return { reaction, body: { ...b, squash: 1, flip: b.flip + Math.PI * 2, spinRate: b.spinRate + 8 } }
    default:
      return { reaction, body: b }
  }
}

/** Gag-page moods layered on top: crashed objects freeze and glitch, sad ones droop and drift off. */
export function moodOffset(mood: PageMood | undefined, t: number, seed: number, staying: boolean) {
  if (mood === 'crashed') {
    // A jump to a random spot for a few frames every ~1.7s, otherwise a slow sink.
    const phase = (t + seed) % 1.7
    const glitch = phase < 0.12
    return { dx: glitch ? Math.sin(seed * 97 + Math.floor(t)) * 26 : 0, dy: ((t * 8 + seed * 40) % 160) - 80, frozen: true, glitch }
  }
  if (mood === 'sad') {
    // Drift away and droop; perk back up (and bounce) while the visitor hovers "No" (stay).
    if (staying) return { dx: 0, dy: Math.abs(Math.sin(t * 6)) * -14, frozen: false, glitch: false }
    return { dx: Math.sin(seed) * 60, dy: 24 + Math.sin(t * 0.5 + seed) * 6, frozen: false, glitch: false }
  }
  return { dx: 0, dy: 0, frozen: false, glitch: false }
}
