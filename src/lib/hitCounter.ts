// The hit counter only goes up: a big fake base, plus minutes since launch, plus your own visits.
const BASE = 1_337_042
const EPOCH = Date.UTC(2026, 9, 27)

export function nextHitCount(previous: number, now: number): number {
  const organic = BASE + Math.max(0, Math.floor((now - EPOCH) / 60_000))
  return Math.max(previous + 1, organic)
}
