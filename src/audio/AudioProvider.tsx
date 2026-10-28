import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useStored } from '../hooks/useLocalStorage'
import { AudioCtx } from './audioContext'
import { MusicPlayer } from './music'
import { playSfx, type SfxName } from './synth'
import type { MixId } from './tracks'

/**
 * Browsers block sound until a user gesture; nothing is created until `unlock()` (the enter gate).
 * `silent` (calm routes like /boring) pauses everything without tearing the AudioContext down,
 * so the music picks straight back up on the way out.
 */
export function AudioProvider({ children, silent = false }: { children: ReactNode; silent?: boolean }) {
  const [muted, setMuted] = useStored('muted', false)
  // 0..1 of the original loudness. New visitors start at half: the full blast made people mute on arrival.
  const [volume, setVolumeState] = useStored('volume', 0.5)
  const [mix, setMixState] = useStored<MixId>('mix', 'system-default')
  const [locked, setLocked] = useStored('songLock', false)
  const [unlocked, setUnlocked] = useState(false)
  const graph = useRef<{ ctx: AudioContext; master: GainNode; analyser: AnalyserNode; music: MusicPlayer } | null>(null)

  const unlock = useCallback(() => {
    if (graph.current || typeof window.AudioContext !== 'function') return
    const ctx = new window.AudioContext()
    const master = ctx.createGain()
    // Everything passes through the analyser so DANIEL FM's visualizer sees music and SFX alike.
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    master.connect(analyser).connect(ctx.destination)
    graph.current = { ctx, master, analyser, music: new MusicPlayer(ctx, master) }
    void ctx.resume()
    setUnlocked(true)
  }, [])

  useEffect(() => {
    const g = graph.current
    if (!g) return
    if (muted || silent) g.music.stop()
    else g.music.start(mix)
  }, [muted, silent, mix, unlocked])

  // Volume only touches the gain, so dragging a slider never restarts the song.
  useEffect(() => {
    const g = graph.current
    if (g) g.master.gain.value = muted || silent ? 0 : 0.6 * volume
  }, [muted, silent, volume, unlocked])

  useEffect(() => () => {
    graph.current?.music.stop()
    void graph.current?.ctx.close()
  }, [])

  const sfx = useCallback(
    (name: SfxName) => {
      const g = graph.current
      if (g && !muted && !silent) playSfx(g.ctx, g.master, name)
    },
    [muted, silent],
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
    () => ({
      unlocked,
      muted,
      mix,
      unlock,
      sfx,
      toggleMute: () => setMuted((m) => !m),
      volume,
      // Turning the volume up from muted means "I want to hear it": unmute too.
      setVolume: (v: number) => {
        const next = Math.max(0, Math.min(1, v))
        setVolumeState(next)
        if (next > 0 && muted) setMuted(false)
      },
      setMix: setMixState,
      locked,
      toggleLock: () => setLocked((l) => !l),
      setLocked,
      getAnalyser: () => graph.current?.analyser ?? null,
    }),
    [unlocked, muted, volume, mix, unlock, sfx, setMuted, setVolumeState, setMixState, locked, setLocked],
  )
  return <AudioCtx.Provider value={api}>{children}</AudioCtx.Provider>
}
