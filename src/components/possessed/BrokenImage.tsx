/**
 * A picture that didn't load, the way a 2006 browser said so, and the way the Username 666 page shows half its
 * pictures: a white box, a little red cross, and the number.
 */
export function BrokenImage({ width, height, className = '' }: { width: number; height: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="666"
      data-broken=""
      className={`inline-flex max-w-full items-start gap-1 overflow-hidden border border-[#8a8a8a] bg-white p-1 align-middle font-[Tahoma,sans-serif] text-[11px] text-[#7a7a7a] shadow-[2px_2px_0_#3a0000] ${className}`}
      style={{ width, aspectRatio: `${width} / ${height}` }}
    >
      <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden className="shrink-0">
        <rect x="0.5" y="0.5" width="15" height="15" fill="#fff" stroke="#8a8a8a" />
        <path d="M4 4l8 8M12 4l-8 8" stroke="#d00" strokeWidth={2} />
      </svg>
      666
    </span>
  )
}
