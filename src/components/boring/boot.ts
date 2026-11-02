import { useSyncExternalStore } from 'react'

// The page's arrival: how far the world has loaded (0..1, for the intro loader's counter) and whether the loader has
// gone (the hero's entrances and the world's cloud dive wait for it).

let progress = 0
let ready = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Raises the loading progress (it never goes backwards). */
export function reportProgress(p: number) {
  if (p <= progress) return
  progress = Math.min(1, p)
  emit()
}
export function markReady() {
  if (ready) return
  ready = true
  emit()
}
export const isReady = () => ready
export const getProgress = () => progress
export const useReady = () => useSyncExternalStore(subscribe, () => ready, () => false)
/** For a fresh visit (the page remounting): start the count again. */
export function resetBoot() {
  if (!progress && !ready) return
  progress = 0
  ready = false
  emit()
}
