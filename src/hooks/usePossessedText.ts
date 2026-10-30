import { useEffect, useReducer } from 'react'
import { usePossessed } from '../lib/possession'
import { useUncorrupted } from '../lib/uncorrupted'

// The possessed copy and its rot are only fetched once someone is possessed (most visitors never are).
let rot: typeof import('../lib/rot') | null = null
let loading: Promise<void> | null = null
const loadRot = () => (loading ??= import('../lib/rot').then((m) => void (rot = m)))

/** For components that split text up before it reaches the page (one span per letter): rot it first, whole. */
export function usePossessedText(text: string) {
  const possessed = usePossessed()
  const uncorrupted = useUncorrupted()
  const [, loaded] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    if (possessed && !rot) void loadRot().then(loaded)
  }, [possessed])
  return possessed && !uncorrupted && rot ? rot.possessedText(text) : text
}
