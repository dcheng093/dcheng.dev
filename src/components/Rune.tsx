import { STROKES } from '../lib/runes'

/**
 * Elder Futhark runes, drawn as strokes. Fonts can't be trusted with them (the site's serif has none, and plenty of
 * phones have no fallback), so the Object Dex draws the ones its specimens carry. The character itself is still in
 * the page, hidden, for copying and screen readers.
 */
export function Rune({ glyph, size = 18, className = '' }: { glyph: string; size?: number; className?: string }) {
  const d = STROKES[glyph]
  if (!d) return <span className={className}>{glyph}</span>
  return (
    <span className={`inline-grid place-items-center ${className}`}>
      <svg viewBox="-1 -1 12 18" width={(size * 12) / 18} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="square">
        <path d={d} />
      </svg>
      <span className="sr-only">{glyph}</span>
    </span>
  )
}
