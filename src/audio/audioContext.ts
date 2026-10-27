import { createContext, useContext, useEffect } from 'react'
import type { MixId, SfxName } from './synth'

export type AudioApi = {
  unlocked: boolean
  muted: boolean
  mix: MixId
  unlock: () => void
  toggleMute: () => void
  setMix: (mix: MixId) => void
  sfx: (name: SfxName) => void
}

export const AudioCtx = createContext<AudioApi>({
  unlocked: false,
  muted: true,
  mix: 'system-default',
  unlock: () => {},
  toggleMute: () => {},
  setMix: () => {},
  sfx: () => {},
})

export const useAudio = () => useContext(AudioCtx)
export const useSfx = () => useContext(AudioCtx).sfx

/** Fallback for when the enter gate was skipped: unlock audio on the first click or keypress. */
export function useUnlockOnGesture() {
  const { unlocked, unlock } = useAudio()
  useEffect(() => {
    if (unlocked) return
    document.addEventListener('click', unlock)
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [unlocked, unlock])
}
