import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useStored } from '../hooks/useLocalStorage'
import { AudioCtx } from './audioContext'
import { Chiptune, playSfx, type MixId, type SfxName } from './synth'

/** Browsers block sound until a user gesture; nothing is created until `unlock()` (the enter gate). */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useStored('muted', false)
  const [mix, setMixState] = useStored<MixId>('mix', 'system-default')
  const [unlocked, setUnlocked] = useState(false)
  const graph = useRef<{ ctx: AudioContext; master: GainNode; music: Chiptune } | null>(null)

  const unlock = useCallback(() => {
    if (graph.current || typeof window.AudioContext !== 'function') return
    const ctx = new window.AudioContext()
    const master = ctx.createGain()
    master.connect(ctx.destination)
    graph.current = { ctx, master, music: new Chiptune(ctx, master) }
    void ctx.resume()
    setUnlocked(true)
  }, [])

  useEffect(() => {
    const g = graph.current
    if (!g) return
    g.master.gain.value = muted ? 0 : 0.6
    if (muted) g.music.stop()
    else g.music.start(mix)
  }, [muted, mix, unlocked])

  useEffect(() => () => {
    graph.current?.music.stop()
    void graph.current?.ctx.close()
  }, [])

  const sfx = useCallback(
    (name: SfxName) => {
      const g = graph.current
      if (g && !muted) playSfx(g.ctx, g.master, name)
    },
    [muted],
  )

  // Every link/button blips; hovering ticks (throttled).
  useEffect(() => {
    let lastHover = 0
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a,button')) sfx('click')
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || Date.now() - lastHover < 120) return
      if ((e.target as Element | null)?.closest?.('a,button')) {
        lastHover = Date.now()
        sfx('hover')
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('pointerover', onOver)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('pointerover', onOver)
    }
  }, [sfx])

  const api = useMemo(
    () => ({ unlocked, muted, mix, unlock, sfx, toggleMute: () => setMuted((m) => !m), setMix: setMixState }),
    [unlocked, muted, mix, unlock, sfx, setMuted, setMixState],
  )
  return <AudioCtx.Provider value={api}>{children}</AudioCtx.Provider>
}
