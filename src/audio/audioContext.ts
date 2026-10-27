import { createContext, useContext } from 'react'
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
