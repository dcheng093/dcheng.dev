import { burstAt } from '../lib/burst'
import { mulberry32 } from '../lib/random'
import { moodOffset, poke, restingBody, step, type Body, type PageMood } from '../lib/personality'
import type { ObjSpec } from './pageScenes'
import { bounce, clampOffset, contains, floatingObstacles, isFree, MIN_SIZE, nearestFree, overlaps, SHRINK, type Rect } from './space'

/**
 * Brains for the 3D objects (no three.js here). The objects sit BEHIND the page content with
 * pointer-events off, so hover and clicks are worked out from the cursor position instead of DOM events:
 * a click only counts when it lands on bare background (not a link, button, input or window), and then
 * the nearest object under the cursor reacts.
 */

/** What the 3D side needs each frame to pose the model. */
export type Pose = { spin: number; yaw: number; pitch: number; flip: number; squash: number; frozen: boolean }

type Entry = {
  spec: ObjSpec
  /** Wrapper element whose box is the object's home spot (anchors) or the drifting frame (drifters). */
  el: HTMLElement
  canvas: HTMLCanvasElement
  body: Body
  hiddenUntil: number
  drift: { x: number; y: number; vx: number; vy: number } | null
  seed: number
  onOpen: (spec: ObjSpec) => void
  onSecret: () => void
  sfx: (name: 'coin' | 'error' | 'ding') => void
  /** Last on-screen centre, for hit tests between frames. */
  cx: number
  cy: number
  r: number
  clock: number
}

const entries = new Set<Entry>()
let cursor: { x: number; y: number } | null = null
let mood: PageMood | undefined
let staying = false

const INTERACTIVE = 'a,button,input,textarea,select,label,summary,[role="button"],[role="dialog"],[role="alertdialog"],[contenteditable],[data-testid="popup"],section[aria-label]'

/** True when (x, y) is bare background: nothing clickable or windowed is there. */
function isBackground(target: EventTarget | null) {
  const el = target as Element | null
  if (!el || el.closest(INTERACTIVE)) return false
  if (el === document.documentElement || el === document.body || el.tagName === 'MAIN' || el.id === 'root') return true
  // Transparent containers (the page root, layout columns) count as background; opaque boxes don't.
  const cs = getComputedStyle(el)
  return (cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent') && cs.backgroundImage === 'none'
}

function hit(x: number, y: number): Entry | null {
  let best: Entry | null = null
  let bestD = Infinity
  for (const e of entries) {
    if (e.clock < e.hiddenUntil || e.canvas.style.opacity === '0') continue // out of sight: not clickable either
    const d = Math.hypot(x - e.cx, y - e.cy)
    if (d < e.r && d < bestD) {
      best = e
      bestD = d
    }
  }
  return best
}

const onMove = (ev: PointerEvent) => {
  cursor = { x: ev.clientX, y: ev.clientY }
  // Pointer cursor when hovering an object through bare background.
  document.documentElement.classList.toggle('over-3d', !!hit(ev.clientX, ev.clientY) && isBackground(ev.target))
  staying = !!(ev.target as Element | null)?.closest?.('[data-stay]')
}
const onLeave = () => {
  cursor = null
  document.documentElement.classList.remove('over-3d')
}
const onClick = (ev: MouseEvent) => {
  if (!isBackground(ev.target)) return
  const e = hit(ev.clientX, ev.clientY)
  if (!e) return
  ev.stopPropagation()
  ev.preventDefault()
  click(e, ev.clientX, ev.clientY)
}

function click(e: Entry, x: number, y: number) {
  const { body, reaction } = poke(e.spec.personality, e.body, { dx: x - e.cx, dy: y - e.cy }, e.spec.reaction)
  e.body = body
  if (reaction === 'secret') {
    e.sfx('ding')
    e.hiddenUntil = e.clock + 0.6
    burstAt(e.cx, e.cy, document.body, 10, 0.6)
    setTimeout(e.onSecret, 450)
    return
  }
  if (reaction === 'burst') {
    e.sfx('error')
    burstAt(e.cx, e.cy, document.body, 12, 1.4)
    e.hiddenUntil = e.clock + 4 // vanishes, then turns up somewhere else
    if (e.drift) e.drift.x = NaN // drifters pick a new free spot
  } else e.sfx('coin')
  e.onOpen(e.spec)
}

function listen(on: boolean) {
  const fn = on ? document.addEventListener.bind(document) : document.removeEventListener.bind(document)
  fn('pointermove', onMove as EventListener)
  fn('pointerleave', onLeave)
  fn('click', onClick as EventListener, { capture: true })
}

export function setPageMood(m: PageMood | undefined) {
  mood = m
}

type Opts = { seed: number; onOpen: (spec: ObjSpec) => void; onSecret: () => void; sfx: Entry['sfx'] }

// ——— shared free space ———
// Page obstacles (content, text, the webring) are in page coordinates and only change with the layout;
// the floating UI (pet, player, chat, popups) moves, so it's re-read four times a second.
let pageObs: Rect[] = []
let floatObs: Rect[] = []
let floatReadAt = -1
let frameAt = -1
let screenObs: Rect[] = []

/** Called by Page3D whenever the page's layout has been measured. */
export function setPageObstacles(obstacles: Rect[]) {
  pageObs = obstacles
  frameAt = -1
}

const viewport = (): Rect => ({ x: 0, y: 0, w: document.documentElement.clientWidth, h: window.innerHeight })

/** Everything an object must not hide behind, in screen coordinates, computed once per frame. */
function obstaclesNow(t: number) {
  if (t !== frameAt) {
    if (t - floatReadAt > 0.25 || t < floatReadAt) {
      floatObs = floatingObstacles()
      floatReadAt = t
    }
    const sx = window.scrollX
    const sy = window.scrollY
    screenObs = [...pageObs.map((o) => ({ ...o, x: o.x - sx, y: o.y - sy })), ...floatObs]
    frameAt = t
  }
  return screenObs
}

/** A random free spot on screen for a drifter of this size, or null only if the screen truly has no room. */
function freeSpotAt(size: number, rng: () => number, obs: readonly Rect[]) {
  const v = viewport()
  for (let i = 0; i < 4; i++) {
    const spot = nearestFree(rng() * v.w, rng() * v.h, size, v, obs, 300, 24)
    if (spot) return spot
  }
  // Unlucky picks: sweep the whole screen outward from the middle before giving up.
  return nearestFree(v.w / 2, v.h / 2, size, v, obs, Math.hypot(v.w, v.h) / 2, 24)
}

/** Like freeSpotAt, but shrinks the drifter (down to MIN_SIZE) if it doesn't fit anywhere at full size. */
function freeSpot(size: number, rng: () => number, obs: readonly Rect[]) {
  for (const k of SHRINK) {
    const s = Math.max(MIN_SIZE, Math.round(size * k))
    const spot = freeSpotAt(s, rng, obs)
    if (spot) return spot
    if (s === MIN_SIZE) break
  }
  return null
}

/**
 * Registers an object. Returns its per-frame driver (moves the DOM, returns the pose for the 3D model)
 * and a cleanup. `el` is the wrapper (its box is an anchor's home), `canvas` is what moves.
 *
 * Objects are never allowed out of sight: anchors only nudge as far as stays clear of content, drifters
 * bounce off content, the site's floating windows and the screen edges, and slip out of the way if
 * scrolling brings content over them.
 */
export function drive(el: HTMLElement, canvas: HTMLCanvasElement, spec: ObjSpec, size: number, opts: Opts) {
  const rng = mulberry32(opts.seed)
  const speed = 40 + rng() * 30
  const angle = rng() * Math.PI * 2
  const entry: Entry = {
    spec,
    el,
    canvas,
    body: restingBody(),
    hiddenUntil: 0,
    drift: spec.role === 'drifter' ? { x: NaN, y: NaN, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed } : null,
    seed: opts.seed,
    onOpen: opts.onOpen,
    onSecret: opts.onSecret,
    sfx: opts.sfx,
    cx: -9999,
    cy: -9999,
    r: size * 0.42,
    clock: 0,
  }
  if (entries.size === 0) listen(true)
  entries.add(entry)
  let lost = false // a drifter with nowhere visible to be
  let shown = size // a drifter's on-screen size: smaller than `size` when the screen is short of room
  let retryAt = 0
  // Anchors step aside when floating UI (Melly, the player, popups) scrolls over them, then drift back.
  const dodge = { x: 0, y: 0, tx: 0, ty: 0, at: -1, cornered: false }

  const frame = (t: number, dt: number): Pose => {
    entry.clock = t
    const obs = obstaclesNow(t)
    const v = viewport()

    // Where the object lives right now (top-left, screen coordinates).
    let home: Rect
    if (entry.drift) {
      const d = entry.drift
      const here = { x: d.x, y: d.y, w: shown, h: shown }
      if (Number.isNaN(d.x) || !isFree(here, v, obs)) {
        // Starting out, respawning after a burst, or content scrolled over it: hop to the nearest clear spot.
        // (When the screen has no room at all it stays out of sight, and only looks again twice a second.)
        if (t >= retryAt) {
          const spot = Number.isNaN(d.x) ? freeSpot(size, rng, obs) : nearestFree(d.x + shown / 2, d.y + shown / 2, shown, v, obs, 500, 24) ?? freeSpot(size, rng, obs)
          lost = !spot
          if (spot) {
            shown = spot.w // may have had to shrink to fit
            d.x = spot.x
            d.y = spot.y
          } else retryAt = t + 0.5
        }
      } else {
        lost = false
        const next = bounce(here, d.vx + Math.sin(t * 0.3 + entry.seed) * 8, d.vy + Math.cos(t * 0.25 + entry.seed) * 6, dt, v, obs)
        d.x = next.x
        d.y = next.y
        d.vx = Math.sign(next.vx || 1) * Math.abs(d.vx)
        d.vy = Math.sign(next.vy || 1) * Math.abs(d.vy)
      }
      home = { x: d.x, y: d.y, w: shown, h: shown }
    } else {
      const r = el.getBoundingClientRect()
      home = { x: r.left, y: r.top, w: r.width, h: r.height }
      if (t - dodge.at > 0.1) {
        dodge.at = t
        // Only on-screen anchors can be covered; one scrolled out of view has nothing to dodge.
        const blocked = overlaps(home, v) && floatObs.some((o) => overlaps(o, home))
        const spot = blocked ? nearestFree(home.x + home.w / 2, home.y + home.h / 2, home.w, v, obs.filter((o) => !contains(o, home)), 400, 16) : null
        // Nowhere to step aside to: duck out of sight until the window moves on, rather than sit underneath it.
        dodge.cornered = blocked && !spot
        dodge.tx = spot ? spot.x - home.x : 0
        dodge.ty = spot ? spot.y - home.y : 0
      }
      dodge.x += (dodge.tx - dodge.x) * Math.min(1, dt * 14)
      dodge.y += (dodge.ty - dodge.y) * Math.min(1, dt * 14)
      home = { ...home, x: home.x + dodge.x, y: home.y + dodge.y }
    }

    // Personality, then the page's mood on top, never pushing it anywhere hidden.
    const cx = home.x + home.w / 2
    const cy = home.y + home.h / 2 // (for drifters home is already the shrunk size)
    const rel = cursor ? { dx: cursor.x - (cx + entry.body.ox), dy: cursor.y - (cy + entry.body.oy) } : null
    entry.body = step(spec.personality, entry.body, rel, t, dt, rng)
    const m = moodOffset(mood, t, entry.seed, staying)
    // Anchors may extend above/below the screen with the page; only the sides are walls for them.
    const bounds = entry.drift ? v : { x: 0, y: -1e7, w: v.w, h: 2e7 }
    // An anchor's own reserved spot is in the obstacle map; don't let it block itself.
    const free = entry.drift ? obs : obs.filter((o) => !contains(o, { ...home, x: home.x - dodge.x, y: home.y - dodge.y }))
    const clamped = clampOffset(home, entry.body.ox + m.dx, entry.body.oy + m.dy, bounds, free)
    // Last line of defence: whatever the nudges add up to, never past the window's sides.
    const dx = Math.min(Math.max(clamped.dx, -home.x), v.w - (home.x + home.w))
    const dy = clamped.dy
    if (dx !== entry.body.ox + m.dx) entry.body.vx = 0
    if (dy !== entry.body.oy + m.dy) entry.body.vy = 0

    const hidden = t < entry.hiddenUntil || lost || dodge.cornered
    canvas.style.opacity = hidden ? '0' : ''
    const sq = entry.body.squash
    const base = entry.drift ? `translate(${entry.drift.x}px, ${entry.drift.y}px) ` : `translate(${dodge.x}px, ${dodge.y}px) `
    const k = shown / size // drifters that had to shrink are scaled from their top-left corner
    canvas.style.transformOrigin = k < 1 ? '0 0' : ''
    canvas.style.transform = `${base}translate(${dx}px, ${dy}px) scale(${k * (1 + sq * 0.25)}, ${k * (1 - sq * 0.25)})`
    canvas.style.filter = m.glitch ? 'hue-rotate(160deg) contrast(2) saturate(3)' : ''
    entry.cx = cx + dx
    entry.cy = cy + dy
    entry.r = shown * 0.42
    return { spin: entry.body.spin, yaw: entry.body.yaw, pitch: entry.body.pitch, flip: entry.body.flip, squash: sq, frozen: m.frozen }
  }

  const cleanup = () => {
    entries.delete(entry)
    if (entries.size === 0) {
      listen(false)
      document.documentElement.classList.remove('over-3d')
    }
  }
  return { frame, cleanup }
}
