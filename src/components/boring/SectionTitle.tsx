import type { CSSProperties } from 'react'
import { useReveal } from './useInView'

/** Text whose letters rise into place one by one (30ms apart) when it scrolls into view. */
export function RevealText({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  const ref = useReveal<HTMLSpanElement>()
  return (
    <span ref={ref} className={`reveal-letters ${className}`} style={{ '--d': `${delay}s` } as CSSProperties}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden style={{ '--i': i } as CSSProperties}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-10 text-center font-marker text-4xl text-white sm:text-5xl">
      <RevealText text={children} />
    </h2>
  )
}
