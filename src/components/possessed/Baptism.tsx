import { useEffect, useState } from 'react'
import { useAudio } from '../../audio/audioContext'
import { baptize } from '../../lib/possession'

type Stage = 'pour' | 'under' | 'surface' | 'clean'

// When each stage starts, in ms from the first drop.
const AT: Record<Stage, number> = { pour: 0, under: 1300, surface: 4200, clean: 5600 }
const DONE = 7600
/** Under the water, out of sight, is when the possession actually lets go. */
const CLEANSED = 3000

const BUBBLES = Array.from({ length: 16 }, (_, i) => ({ left: (i * 61) % 100, size: 6 + ((i * 7) % 14), delay: (i * 0.37) % 2.4 }))

/**
 * The baptism (Control Panel → Baptize, only while possessed). Holy water pours from the top of the screen, the
 * whole site goes under (the music too, muffled), something lets go down there, and you come up into slow warm light
 * to a held chord. Smooth water, chunky drops and bubbles; the light fades in over seconds, never flashes.
 */
export function Baptism({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>('pour')
  const { sfx, muffle } = useAudio()

  useEffect(() => {
    sfx('splash')
    const timers = [
      window.setTimeout(() => {
        setStage('under')
        muffle(true)
      }, AT.under),
      window.setTimeout(baptize, CLEANSED),
      window.setTimeout(() => {
        setStage('surface')
        muffle(false)
        sfx('choir')
      }, AT.surface),
      window.setTimeout(() => setStage('clean'), AT.clean),
      window.setTimeout(onDone, DONE),
    ]
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      muffle(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one baptism per mount
  }, [])

  const flooded = stage === 'under'
  return (
    <div role="status" aria-label="Baptism" data-testid="baptism" data-stage={stage} className="pointer-events-auto fixed inset-0 z-[110] overflow-hidden">
      {/* The pour: a stream from the top, landing in chunky splashes. */}
      {stage === 'pour' && (
        <>
          <div className="absolute left-1/2 top-0 w-10 -translate-x-1/2 animate-pour bg-gradient-to-b from-[#e8f6ffcc] via-[#7cc4ffbb] to-[#3a8ee0aa] sm:w-16" />
          <div className="absolute bottom-0 left-1/2 h-16 w-48 -translate-x-1/2 animate-splash bg-[radial-gradient(ellipse_at_bottom,#bfe4ffcc_0%,#bfe4ff00_70%)]" />
        </>
      )}
      {/* The water: rises over everything, holds, drains. */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#5aa8f0cc] to-[#0b3a78ee] transition-[height] ease-in-out ${flooded ? 'h-full duration-[1400ms]' : stage === 'pour' ? 'h-0 duration-[1300ms]' : 'h-0 duration-[1200ms]'}`}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-4 -translate-y-1/2 animate-wave bg-[radial-gradient(circle_at_50%_100%,#cfeaff_0_40%,#0000_42%)_0_0/24px_16px_repeat-x]" />
        {flooded &&
          BUBBLES.map((b) => (
            <span
              key={b.left}
              className="absolute bottom-0 animate-bubble rounded-full border-2 border-[#e8f6ff] bg-[#ffffff22]"
              style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s` }}
            />
          ))}
      </div>
      {/* Surfacing: slow warm light. */}
      {(stage === 'surface' || stage === 'clean') && (
        <div className="absolute inset-0 animate-rays bg-[repeating-conic-gradient(from_0deg_at_50%_-10%,#fff6d8aa_0deg_6deg,#fff6d800_6deg_18deg)]" />
      )}
      {stage === 'clean' && (
        <p className="absolute inset-x-0 top-1/3 animate-rise-in text-center font-times text-4xl font-bold uppercase tracking-[0.3em] text-[#5a4300] [text-shadow:0_0_18px_#fff6d8] sm:text-6xl">
          You are clean.
        </p>
      )}
    </div>
  )
}
