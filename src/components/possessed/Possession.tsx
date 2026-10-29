import { useEffect, useRef, useState } from 'react'

const WHISPERS = [
  'it sees you',
  'you were received',
  'descend',
  'do not look at him',
  '37093',
  'enlightenment awaits',
  'user666 is watching',
  'you cannot unsee it',
  'there is water where things are set',
  'nothing is ever deleted',
  'he is still in here',
]

/**
 * The possessed site's top layer (html[data-possessed] in index.css does the rest): the #rot filter the rotted
 * pictures warp through, a blood tint and a vignette over everything, and whispers that surface and sink again.
 * All of it is slow: the warp re-seeds every 1.6s in a step (its shape changes, not its brightness), whispers take
 * seconds to fade. Nothing flashes.
 */
export function Possession() {
  const turbulence = useRef<SVGFETurbulenceElement>(null)
  const [whisper, setWhisper] = useState<{ id: number; text: string; x: number; y: number } | null>(null)

  useEffect(() => {
    let seed = 1
    const warp = window.setInterval(() => turbulence.current?.setAttribute('seed', String((seed = (seed % 97) + 1))), 1600)
    let n = 0
    const speak = () => {
      n++
      setWhisper({ id: n, text: WHISPERS[(n * 7) % WHISPERS.length], x: 8 + ((n * 37) % 70), y: 12 + ((n * 53) % 70) })
    }
    const talk = window.setInterval(speak, 9000)
    return () => {
      window.clearInterval(warp)
      window.clearInterval(talk)
    }
  }, [])

  return (
    <div aria-hidden data-testid="possession">
      <svg width="0" height="0" className="absolute">
        <filter id="rot" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0.012 0.05" numOctaves={2} seed={1} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* Everything goes the colour of an old wound; the corners go dark. */}
      <div className="pointer-events-none fixed inset-0 z-[96] bg-[#d07a7a] mix-blend-multiply" />
      <div className="pointer-events-none fixed inset-0 z-[96] bg-[radial-gradient(ellipse_at_center,#0000_45%,#1a0000cc_100%)]" />
      {whisper && (
        <p
          key={whisper.id}
          className="pointer-events-none fixed z-[96] animate-whisper font-times text-lg italic tracking-[0.3em] text-[#5a0000] [text-shadow:0_0_6px_#ff000066] sm:text-2xl"
          style={{ left: `${whisper.x}%`, top: `${whisper.y}%` }}
        >
          {whisper.text}
        </p>
      )}
    </div>
  )
}
