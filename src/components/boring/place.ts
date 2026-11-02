import { useSyncExternalStore } from 'react'
import type { ChapterId } from '../../content/portfolio'

/** Where the reader is: the hero ('intro') or one of portfolio.chapters (see Chapter.tsx). The world, the sidebar and the bar follow it. */
export type Place = 'intro' | ChapterId

let current: Place = 'intro'
const listeners = new Set<() => void>()

export function setPlace(next: Place) {
  if (next === current) return
  current = next
  for (const l of listeners) l()
}
export const getPlace = () => current

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const usePlace = () => useSyncExternalStore(subscribe, getPlace, () => 'intro' as Place)
