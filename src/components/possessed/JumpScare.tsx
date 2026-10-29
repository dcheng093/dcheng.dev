import { useEffect, useState } from 'react'
import { useSfx } from '../../audio/audioContext'
import { assets } from '../../content/assets'
import { markScared, SCARE_EVENT } from '../../lib/possession'
import { rotted } from './rot'

/**
 * The one jump scare. It waits for summonScare() (looking at his photo, me.jpg, on the possessed desktop), then: his
 * face, mutilated, filling the screen, with a sting. Held for a moment, then gone. Once, ever. A single appearance,
 * not a flash: it comes once and fades, it never alternates.
 */
export function JumpScare() {
  const [face, setFace] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'on' | 'fading'>('idle')
  const sfx = useSfx()

  useEffect(() => {
    // Drawn ahead of time, so it's ready the instant it's needed.
    void rotted(assets.headShock.src).then(setFace)
    const go = () => {
      markScared()
      setPhase('on')
      sfx('sting')
    }
    window.addEventListener(SCARE_EVENT, go)
    return () => window.removeEventListener(SCARE_EVENT, go)
  }, [sfx])

  useEffect(() => {
    if (phase === 'idle') return
    const t = window.setTimeout(() => setPhase(phase === 'on' ? 'fading' : 'idle'), phase === 'on' ? 650 : 320)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === 'idle') return null
  return (
    <div
      aria-hidden
      data-testid="jump-scare"
      className={`fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-black transition-opacity duration-300 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'}`}
    >
      <img src={face ?? assets.headShock.src} alt="" data-rotted="" className="h-[115vmin] w-[115vmin] max-w-none animate-lunge object-contain [filter:url(#rot)_contrast(1.4)]" />
    </div>
  )
}
