import { useState, type CSSProperties } from 'react'
import { assets, type AssetKey, type Slot } from '../../content/assets'

type Props = {
  slot: Slot | AssetKey
  /** Rendered width in px; height follows the slot's aspect ratio. Defaults to the slot's native size. */
  width?: number
  className?: string
  style?: CSSProperties
  alt?: string
}

const resolve = (slot: Slot | AssetKey): Slot => (typeof slot === 'string' ? assets[slot] : slot)

/** Low-res image that degrades to a "SUPPLY ME" placeholder when the file isn't in public/ yet. */
export function Img({ slot, width, className = '', style, alt = '' }: Props) {
  const s = resolve(slot)
  const [missing, setMissing] = useState(false)
  const w = width ?? s.w
  const h = Math.round((w * s.h) / s.w)
  if (missing) return <Placeholder slot={s} width={w} height={h} className={className} style={style} />
  return (
    <img
      src={s.src}
      width={w}
      height={h}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setMissing(true)}
      className={`max-w-full h-auto ${className}`}
      style={style}
    />
  )
}

export function Placeholder({ slot, width, height, className = '', style }: { slot: Slot; width: number; height: number; className?: string; style?: CSSProperties }) {
  const file = slot.src.split('/').pop()
  return (
    <span
      role="img"
      aria-label={`placeholder: ${slot.label}`}
      data-placeholder={file}
      className={`inline-grid max-w-full place-items-center overflow-hidden border-2 border-dashed border-black bg-[repeating-linear-gradient(45deg,#ff0_0_8px,#f0f_8px_16px)] p-0.5 text-center align-middle font-silk text-[9px] leading-tight text-black ${className}`}
      style={{ width, aspectRatio: `${width} / ${height}`, ...style }}
    >
      {width >= 60 && height >= 28 ? (
        <span className="bg-white/85 px-0.5">
          SUPPLY ME: {file}
          {height >= 48 && <><br />{slot.w}×{slot.h}</>}
        </span>
      ) : (
        '?'
      )}
    </span>
  )
}
