import { createContext, useContext, useEffect } from 'react'
import type { SfxName } from './synth'
import type { MixId } from './tracks'

export type AudioApi = {
  unlocked: boolean
  muted: boolean
  mix: MixId
  unlock: () => void
  toggleMute: () => void
  /** 0..1, shared by the music and the sound effects. */
  volume: number
  setVolume: (volume: number) => void
  setMix: (mix: MixId) => void
  /** 📌 on: the visitor's pick plays everywhere instead of each page's theme song. */
  locked: boolean
  toggleLock: () => void
  setLocked: (locked: boolean) => void
  /** Null until audio is unlocked. */
  getAnalyser: () => AnalyserNode | null
  sfx: (name: SfxName) => void
}

export const AudioCtx = createContext<AudioApi>({
  unlocked: false,
  muted: true,
  mix: 'system-default',
  unlock: () => {},
  toggleMute: () => {},
  volume: 0.5,
  setVolume: () => {},
  setMix: () => {},
  locked: false,
  toggleLock: () => {},
  setLocked: () => {},
  getAnalyser: () => null,
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
