import { useSyncExternalStore } from 'react'
import { readStored, writeStored } from '../hooks/useLocalStorage'

// What the hunt does to the visitor, shared site-wide (one store, so every component sees a change at once):
// - heard: they reached a sealed page. Remembered forever (the hymn stays in DANIELAMP, the first time is kept).
// - possessed: the site has turned. Lasts across visits until they are baptized in the Control Panel.
// - scared: the one jump scare has happened. It never happens twice.

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  window.addEventListener('storage', l)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', l)
  }
}

export const POSSESSED_KEY = 'possessed'
export const HEARD_KEY = 'secrets'
export const SCARED_KEY = 'scared'

export const isPossessed = () => readStored(POSSESSED_KEY, false)
/** When they first reached a sealed page (an ISO date), or null. */
export const heardAt = () => readStored<Record<string, string>>(HEARD_KEY, {}).morse ?? null
export const wasScared = () => readStored(SCARED_KEY, false)

/** A sealed page opened: remember the first time, and the site turns. */
export function possess(now = new Date()) {
  if (!heardAt()) writeStored(HEARD_KEY, { ...readStored<Record<string, string>>(HEARD_KEY, {}), morse: now.toISOString() })
  writeStored(POSSESSED_KEY, true)
  notify()
}

export function baptize() {
  writeStored(POSSESSED_KEY, false)
  notify()
}

export function markScared() {
  writeStored(SCARED_KEY, true)
  notify()
}

export const usePossessed = () => useSyncExternalStore(subscribe, isPossessed, () => false)
export const useHeardAt = () => useSyncExternalStore(subscribe, heardAt, () => null)

/** The one jump scare. Only answers once, only while possessed; src/components/possessed/JumpScare.tsx listens. */
export const SCARE_EVENT = 'daniel:scare'
export function summonScare() {
  if (!isPossessed() || wasScared()) return false
  window.dispatchEvent(new Event(SCARE_EVENT))
  return true
}
