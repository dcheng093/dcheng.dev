import { useEffect, useId, useState, type CSSProperties } from 'react'
import { assets, possessedGifs, type AssetKey, type Slot } from '../../content/assets'
import { danielPick, danielSwap } from '../../lib/settings'
import { useSettings } from '../settings/settingsState'
import { usePossessed } from '../../lib/possession'
import { isDaniel, rotted } from '../possessed/rot'
import { BrokenImage } from '../possessed/BrokenImage'
import { hash, useUncorrupted } from '../../lib/uncorrupted'

type Props = {
  slot: Slot | AssetKey
  /** Rendered width in px; height follows the slot's aspect ratio. Defaults to the slot's native size. */
  width?: number
  className?: string
  style?: CSSProperties
  alt?: string
}

const resolve = (slot: Slot | AssetKey): Slot => (typeof slot === 'string' ? assets[slot] : slot)

/** What a decoration turns into on the possessed site, by shape: strips, tall things, and the rest. */
const ratio = (g: Slot) => g.w / g.h
const ROT_BY_SHAPE = {
  wide: possessedGifs.filter((g) => ratio(g) > 2.5),
  tall: possessedGifs.filter((g) => ratio(g) < 0.75),
  square: possessedGifs.filter((g) => ratio(g) >= 0.75 && ratio(g) <= 2.5),
}
const rotFor = (s: Slot, seed: number) => {
  const pool = ratio(s) > 2.5 ? ROT_BY_SHAPE.wide : ratio(s) < 0.75 ? ROT_BY_SHAPE.tall : ROT_BY_SHAPE.square
  return pool[seed % pool.length]
}

/** Everything Daniel Density can turn an image into. */
const DANIELS = [...assets.misc, assets.headGrin, assets.headShock, assets.headWink]

/** While the site is possessed, Daniel's own pictures are swapped for their mutilated stills (src/components/possessed/rot.ts). */
function useRotted(src: string) {
  const on = usePossessed() && isDaniel(src)
  const [done, setDone] = useState<{ src: string; url: string | null } | null>(null)
  useEffect(() => {
    if (!on) return
    let live = true
    void rotted(src).then((url) => live && setDone({ src, url }))
    return () => {
      live = false
    }
  }, [on, src])
  return on && done?.src === src ? done.url : null
}

/** Low-res image that degrades to a "SUPPLY ME" placeholder when the file isn't in public/ yet. */
export function Img({ slot, width, className = '', style, alt = '' }: Props) {
  const s = resolve(slot)
  const [missing, setMissing] = useState(false)
  const spot = useId()
  const { density } = useSettings().settings
  const swapped = !s.src.startsWith('/me/') && danielSwap(s.src, spot, density)
  const d = swapped ? DANIELS[danielPick(s.src, spot, DANIELS.length)] : null
  const rot = useRotted(d?.src ?? s.src)
  const possessed = usePossessed()
  const uncorrupted = useUncorrupted()
  const w = width ?? s.w
  const h = Math.round((w * s.h) / s.w)
  if (missing) return <Placeholder slot={s} width={w} height={h} className={className} style={style} />
  const seed = hash(s.src + spot)
  const corruptible = possessed && !uncorrupted && !isDaniel(s.src) && !s.src.startsWith('/ads/')
  // Possessed, about one picture in six fails to load, 666-style. Never Daniel (he rots instead), never an ad's art.
  if (corruptible && seed % 6 === 0) return <BrokenImage width={w} height={h} className={className} />
  // And about half the decorations are something else now: an eye, a skull, a candle, a strip of blood or static.
  if (corruptible && s.src.startsWith('/gifs/') && !s.src.startsWith('/gifs/px-') && (seed >>> 8) % 2 === 0) {
    const g = rotFor(s, seed >>> 12)
    return (
      <img
        src={g.src}
        width={w}
        height={h}
        alt={alt}
        loading="lazy"
        draggable={false}
        data-possessed-gif=""
        className={`max-w-full h-auto object-contain ${className}`}
        style={{ ...style, aspectRatio: `${w} / ${h}` }}
      />
    )
  }
  // Daniel Density (Control Panel): some images become Daniel, in the same box. Photos of him already are him.
  if (d) {
    return (
      <img
        src={rot ?? d.src}
        data-rotted={rot ? '' : undefined}
        width={w}
        height={h}
        alt={alt}
        loading="lazy"
        draggable={false}
        data-daniel=""
        className={`max-w-full h-auto object-cover ${className}`}
        style={{ ...style, aspectRatio: `${w} / ${h}` }}
      />
    )
  }
  return (
    <img
      src={rot ?? s.src}
      data-rotted={rot ? '' : undefined}
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
