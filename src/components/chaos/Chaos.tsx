import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { readStored, writeStored } from '../../hooks/useLocalStorage'
import { nextHitCount } from '../../lib/hitCounter'
import { useRandomInterval } from '../../hooks/useRandomInterval'
import { icons, type Slot } from '../../content/assets'
import { Img } from '../media/Img'
import { usePossessed } from '../../lib/possession'

export function Marquee({ children, className = '', speed = 12 }: { children: ReactNode; className?: string; speed?: number }) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className="inline-block animate-marquee pl-[100%]" style={{ animationDuration: `${speed}s` }}>
        {children}
      </div>
    </div>
  )
}

export function Blink({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`animate-blink ${className}`}>{children}</span>
}

/** Each letter bobs on its own beat, like LINGsCARS' wavy headings. */
export function WavyText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden className="inline-block animate-wave" style={{ animationDelay: `${(i % 8) * 0.12}s` }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

export function RainbowText({ text, className = '' }: { text: string; className?: string }) {
  const colors = ['#f00', '#f80', '#ff0', '#0f0', '#0ff', '#00f', '#f0f']
  return (
    <span className={`animate-rainbow ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden style={{ color: colors[i % colors.length] }}>
          {ch}
        </span>
      ))}
    </span>
  )
}

export function HitCounter({ className = '' }: { className?: string }) {
  const [count] = useState(() => {
    const next = nextHitCount(readStored('hits', 0), Date.now())
    writeStored('hits', next)
    return next
  })
  // Possessed, every visitor is the same visitor.
  const shown = usePossessed() ? 666 : count
  return (
    <span className={`inline-flex items-center gap-1 font-vt text-lg ${className}`} data-testid="hit-counter">
      <span>you are visitor #</span>
      <span className="inline-flex border-2 border-gray-500 bg-black px-0.5">
        {String(shown).padStart(8, '0').split('').map((d, i) => (
          <span key={i} className="mx-px w-3 bg-gradient-to-b from-gray-800 to-black text-center text-lime">
            {d}
          </span>
        ))}
      </span>
    </span>
  )
}

/** "DEAL ENDS IN" timer that hits zero and quietly starts over. */
export function ResettingCountdown({ seconds = 59, label = 'DEAL ENDS IN', className = '' }: { seconds?: number; label?: string; className?: string }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => (s <= 0 ? seconds : s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [seconds])
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <span className={`font-vt ${className}`} data-testid="countdown">
      {label} <span className="animate-strobe px-1">{mm}:{ss}</span>
    </span>
  )
}

export function ViewersNow({ thing = 'this Daniel', className = '' }: { thing?: string; className?: string }) {
  const [n, setN] = useState(37)
  useRandomInterval(() => setN((v) => Math.max(3, v + Math.round((Math.random() - 0.4) * 9))), 1500, 4000)
  return (
    <span className={`font-comic text-sm ${className}`}>
      <Img slot={icons.flame} width={14} className="inline-block align-[-2px]" /> <b>{n}</b> people are looking at {thing} right now!!
    </span>
  )
}

export function UnderConstruction({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <Img slot="ucSign" width={240} />
      <Img slot="ucBar" width={300} />
    </div>
  )
}

export function Sticker({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`inline-block rotate-[-8deg] border-2 border-black bg-yellow-300 px-2 py-0.5 font-impact text-red-600 shadow-[3px_3px_0_#000] ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}

/** CSS-only giant red arrow (the LINGsCARS "use the left hand menu" kind). */
export function BigArrow({ children, direction = 'left', className = '' }: { children: ReactNode; direction?: 'left' | 'right'; className?: string }) {
  const clip = direction === 'left' ? 'polygon(0 50%, 30% 0, 30% 25%, 100% 25%, 100% 75%, 30% 75%, 30% 100%)' : 'polygon(100% 50%, 70% 0, 70% 25%, 0 25%, 0 75%, 70% 75%, 70% 100%)'
  return (
    <div className={`relative grid w-full max-w-[420px] animate-jank-x place-items-center ${className}`}>
      <div className="aspect-[2.2/1] w-full bg-red-600" style={{ clipPath: clip }} />
      <div className={`absolute inset-y-0 grid place-items-center px-2 text-center font-impact text-sm text-white sm:text-lg ${direction === 'left' ? 'left-[30%] right-0' : 'left-0 right-[30%]'}`}>
        {children}
      </div>
    </div>
  )
}

/** A GIF horizontal rule, repeated across the full width at its native height. */
export function GifDivider({ slot, className = '' }: { slot: Slot; className?: string }) {
  return <div role="separator" className={`w-full bg-repeat-x [image-rendering:pixelated] ${className}`} style={{ backgroundImage: `url("${slot.src}")`, backgroundPosition: 'center', height: slot.h }} />
}

/** A little cluster of blinkies, pinned up the way people did on their about-me pages. */
export function BlinkieRow({ items, className = '' }: { items: readonly Slot[]; className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-1 ${className}`}>
      {items.map((b) => (
        <Img key={b.src} slot={b} alt={b.label.replace('blinkie: ', '')} />
      ))}
    </div>
  )
}
