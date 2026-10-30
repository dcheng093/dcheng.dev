import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { underlayFor } from '../../lib/possessedArt'
import { useSettings } from '../settings/settingsState'

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
// Blood running down from under the taskbar, in the margins: where (% from the left), how thick (px), how far it gets
// (vh), how long it takes (s), and when it starts (s).
const DRIPS = [
  [3, 7, 34, 21, 0],
  [9, 4, 22, 27, 9],
  [14, 6, 41, 24, 4],
  [86, 5, 28, 26, 13],
  [91, 8, 45, 22, 6],
  [96, 4, 19, 29, 16],
]

export function Possession() {
  const turbulence = useRef<SVGFETurbulenceElement>(null)
  const { pathname } = useLocation()
  const under = underlayFor(pathname)
  // The Chaos dial's Calm holds the underlay still and stops the drips: the cheap setting, for a struggling machine.
  const calm = useSettings().settings.chaos === 'calm'
  const crawler = useRef<HTMLDivElement>(null)

  // The walls shift: every few seconds the texture lurches to the next point of a slow loop. A timer and a plain
  // style change, not a CSS animation: a running animation makes the browser re-draw the whole screen every frame
  // (even one in steps), this only when it actually moves.
  useEffect(() => {
    const el = crawler.current
    if (!el || calm) return
    let n = 0
    const lurch = () => {
      n++
      const a = n * 0.31
      el.style.transform = `translate3d(${(Math.sin(a) * 4).toFixed(2)}%, ${(Math.cos(a * 0.7) * 5).toFixed(2)}%, 0)`
    }
    const id = window.setInterval(lurch, 3500)
    return () => window.clearInterval(id)
  }, [calm])
  const [whisper, setWhisper] = useState<{ id: number; text: string; x: number; y: number } | null>(null)

  useEffect(() => {
    let seed = 1
    // Re-seeding re-draws every rotted face, so not too often.
    const warp = window.setInterval(() => turbulence.current?.setAttribute('seed', String((seed = (seed % 97) + 1))), 4800)
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
      {/* What lies under this page: its own texture, crawling and breathing, a little oversized so the drift never
          shows an edge. One layer, shifted by transform alone every few seconds (see the effect above). A second layer
          seeping through it doubled what every frame had to draw. */}
      <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#1a0003]">
        <div ref={crawler} className="absolute -inset-[7%]" style={{ background: `url('${under.src}') 0 0 / ${under.size}px auto` }} />
      </div>
      {/* Blood running down the glass, a little at a time: each drip slides out from under the taskbar (moving, not
          stretching, so its drop keeps its shape), hangs, and fades. */}
      {!calm && DRIPS.map(([left, width, length, secs, delay]) => (
        <div key={left} className="pointer-events-none fixed top-11 z-[44] overflow-hidden" style={{ left: `${left}%`, width: width * 2, height: `${length}vh` }}>
          <div className="absolute inset-x-0 top-0 h-full animate-drip" style={{ animationDuration: `${secs}s`, animationDelay: `${delay}s` }}>
            <div className="mx-auto h-[calc(100%-6px)] rounded-b-full bg-gradient-to-b from-[#3a0000] via-[#6a0006] to-[#8a000c]" style={{ width }} />
            <div className="absolute bottom-0 left-0 aspect-square w-full rounded-full bg-[#8a000c] shadow-[inset_-1px_-2px_0_#3a0000]" />
          </div>
        </div>
      ))}
      <svg width="0" height="0" className="absolute">
        <filter id="rot" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0.012 0.05" numOctaves={2} seed={1} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* Everything goes the colour of an old wound; the corners go dark. One plain, still, see-through layer: no blend
          mode (blending the whole screen every frame made it lag), and one layer rather than two (each is a full-screen
          paint, every frame). */}
      <div data-testid="veil" className="pointer-events-none fixed inset-0 z-[96] bg-[radial-gradient(ellipse_at_center,#50000a66_45%,#1a0000d9_100%)]" />
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
