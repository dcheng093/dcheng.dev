// The world's camera flies one path as the page scrolls. These turn the scroll position into a place along it.

/**
 * Where the reader is along the flight, as a waypoint index with a fraction (0 = the first waypoint, 1 = the second…).
 * `anchors` are the scroll positions (px, ascending) at which each waypoint is reached; before the first it's 0, past
 * the last it's the last.
 */
export function flightIndex(anchors: number[], scroll: number) {
  if (anchors.length < 2 || scroll <= anchors[0]) return 0
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (scroll < b) return i + (b > a ? (scroll - a) / (b - a) : 1)
  }
  return anchors.length - 1
}

/** Eased value at `index` between per-waypoint keyframes (smooth through each waypoint, no corners). */
export function keyframe(values: number[], index: number) {
  const i = Math.min(values.length - 1, Math.max(0, Math.floor(index)))
  const j = Math.min(values.length - 1, i + 1)
  const f = Math.min(1, Math.max(0, index - i))
  const e = f * f * (3 - 2 * f)
  return values[i] + (values[j] - values[i]) * e
}
