import { createContext, useContext } from 'react'

/**
 * Inside an <Uncorrupted> area (Settings, Daniel 95's files, the Object Dex) possession leaves things readable: no
 * text rot, no broken pictures. The DOM side is the `data-uncorrupted` attribute the same component sets.
 */
export const UncorruptedCtx = createContext(false)
export const useUncorrupted = () => useContext(UncorruptedCtx)

/** Small, stable string hash (FNV-1a): the same picture or sentence always rots the same way. */
export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
