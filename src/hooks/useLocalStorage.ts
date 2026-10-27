import { useCallback, useState } from 'react'

type Store = 'local' | 'session'

const storage = (kind: Store): Storage | null => {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export const readStored = <T>(key: string, fallback: T, kind: Store = 'local'): T => {
  try {
    const raw = storage(kind)?.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export const writeStored = (key: string, value: unknown, kind: Store = 'local') => {
  try {
    storage(kind)?.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode / blocked storage: the site still works, it just forgets.
  }
}

/** useState that persists to web storage and survives storage being unavailable or throwing. */
export function useStored<T>(key: string, fallback: T, kind: Store = 'local') {
  const [value, setValue] = useState<T>(() => readStored(key, fallback, kind))
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        writeStored(key, resolved, kind)
        return resolved
      })
    },
    [key, kind],
  )
  return [value, set] as const
}
