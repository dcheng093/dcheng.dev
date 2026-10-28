/**
 * Free space for the 3D objects: they must always be fully visible, so they never sit behind page content,
 * behind the site's floating windows, or outside the window. The geometry is pure (unit-tested); the
 * collectors at the bottom read the DOM.
 */
export type Rect = { x: number; y: number; w: number; h: number }

export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
export const inside = (a: Rect, bounds: Rect) =>
  a.x >= bounds.x && a.y >= bounds.y && a.x + a.w <= bounds.x + bounds.w && a.y + a.h <= bounds.y + bounds.h
export const isFree = (r: Rect, bounds: Rect, obstacles: readonly Rect[]) => inside(r, bounds) && !obstacles.some((o) => overlaps(r, o))
/** `outer` fully encloses `r` (how an anchor recognises its own reserved spot). */
export const contains = (outer: Rect, r: Rect) => r.x >= outer.x && r.y >= outer.y && r.x + r.w <= outer.x + outer.w && r.y + r.h <= outer.y + outer.h

/**
 * The nearest spot to (cx, cy) where a size×size square fits: searched in widening rings, so objects stay as
 * close to where they were meant to be as possible. Returns the square's top-left, or null if nothing fits.
 */
export function nearestFree(cx: number, cy: number, size: number, bounds: Rect, obstacles: readonly Rect[], maxRadius = 700, step = 16) {
  // Only obstacles near the search area matter.
  const area = { x: cx - maxRadius - size, y: cy - maxRadius - size, w: (maxRadius + size) * 2, h: (maxRadius + size) * 2 }
  const near = obstacles.filter((o) => overlaps(o, area))
  const at = (x: number, y: number): Rect => ({ x: x - size / 2, y: y - size / 2, w: size, h: size })
  if (isFree(at(cx, cy), bounds, near)) return at(cx, cy)
  for (let r = step; r <= maxRadius; r += step) {
    const n = Math.max(8, Math.round((2 * Math.PI * r) / step))
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const c = at(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      if (isFree(c, bounds, near)) return c
    }
  }
  return null
}

/** Shrink steps tried when an object doesn't fit at full size. */
export const SHRINK = [1, 0.85, 0.7, 0.58] as const
export const MIN_SIZE = 56

/** Places an object near its preferred centre: full size if possible, smaller if not, null if nowhere fits. */
export function place(cx: number, cy: number, size: number, bounds: Rect, obstacles: readonly Rect[]) {
  for (const k of SHRINK) {
    const s = Math.max(MIN_SIZE, Math.round(size * k))
    const spot = nearestFree(cx, cy, s, bounds, obstacles)
    if (spot) return spot
    if (s === MIN_SIZE) break
  }
  return null
}

/**
 * One step of DVD-logo motion: move, and bounce off any wall or obstacle on the axis that hit it.
 * Returns the new top-left and velocity.
 */
export function bounce(r: Rect, vx: number, vy: number, dt: number, bounds: Rect, obstacles: readonly Rect[]) {
  let { x, y } = r
  const tryX = { ...r, x: x + vx * dt }
  if (isFree(tryX, bounds, obstacles)) x = tryX.x
  else vx = -vx
  const tryY = { ...r, x, y: y + vy * dt }
  if (isFree(tryY, bounds, obstacles)) y = tryY.y
  else vy = -vy
  return { x, y, vx, vy }
}

/**
 * Keeps a personality nudge (dodges, flings, sinking) from pushing an object anywhere hidden: the offset is
 * halved until the object is free again, or dropped.
 */
export function clampOffset(home: Rect, dx: number, dy: number, bounds: Rect, obstacles: readonly Rect[]) {
  for (const k of [1, 0.5, 0.25]) {
    if (isFree({ ...home, x: home.x + dx * k, y: home.y + dy * k }, bounds, obstacles)) return { dx: dx * k, dy: dy * k }
  }
  return { dx: 0, dy: 0 }
}

// ——— reading the page ———

const PAD = 8
const REPLACED = new Set(['IMG', 'CANVAS', 'VIDEO', 'IFRAME', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'PROGRESS', 'METER'])
const pad = (r: DOMRect, sx: number, sy: number): Rect => ({ x: r.left + sx - PAD, y: r.top + sy - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 })

function paints(el: Element, cs: CSSStyleDeclaration) {
  if (REPLACED.has(el.tagName.toUpperCase())) return true
  const bg = cs.backgroundColor
  if (bg && bg !== 'transparent' && !bg.endsWith(', 0)')) return true
  if (cs.backgroundImage !== 'none') return true
  return parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth) > 0 && cs.borderTopStyle !== 'none'
}

/**
 * Everything visible inside `roots` (boxes with a background or border, images and controls, and every line
 * of text), as page-coordinate rects padded a little. `skip` subtrees are ignored (the 3D layers themselves).
 */
export function pageObstacles(roots: Element[], skip: Element[]): Rect[] {
  const sx = window.scrollX
  const sy = window.scrollY
  const out: Rect[] = []
  const skipped = (el: Element) => skip.some((s) => s.contains(el))
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    for (let n: Node | null = walker.currentNode; n; n = walker.nextNode()) {
      if (n.nodeType === Node.TEXT_NODE) {
        if (!n.textContent?.trim()) continue
        const parent = n.parentElement
        if (!parent || skipped(parent)) continue
        const range = document.createRange()
        range.selectNodeContents(n)
        for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) out.push(pad(r, sx, sy))
        continue
      }
      const el = n as Element
      if (el === root && root.tagName !== 'NAV') continue // the page root itself is see-through now
      if (skipped(el)) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
      // Moving things (marquees, wobbles) cover their whole clipping box over time, not just where they are now.
      const moving = cs.animationName !== 'none' && el.parentElement && getComputedStyle(el.parentElement).overflow !== 'visible'
      if (moving) out.push(pad(el.parentElement!.getBoundingClientRect(), sx, sy))
      if (!paints(el, cs)) continue
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) out.push(pad(r, sx, sy))
    }
  }
  return out
}

/**
 * The site's floating UI (pet, player, chat, popups, windows), plus page decorations that come and go
 * (hidden stickers, GIF confetti), in screen coordinates.
 */
const FLOATING = [
  '[data-testid="hidden-sticker"]',
  '[data-testid="gif-confetti"] img',
  '[data-testid="pet-window"]',
  '[data-testid="mini-player"]',
  '[data-testid="mute"]',
  '[data-testid="chat-toggle"]',
  '[aria-label="Live chat"]',
  '[data-testid="popup"]',
  '[data-testid="object-window"]',
  '[data-testid="virus-alert"]',
].join(',')

export function floatingObstacles(): Rect[] {
  return [...document.querySelectorAll(FLOATING)]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => pad(r, 0, 0))
}
