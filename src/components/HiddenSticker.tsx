import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSfx } from '../audio/audioContext'
import { stickerFor, stickers } from '../content/stickers'
import { useStored } from '../hooks/useLocalStorage'
import { collect, progress } from '../lib/stickers'
import { Img } from './media/Img'

/** This page's hidden sticker (if it has one and it isn't collected yet), plus the STICKER GET! toast. */
export function HiddenSticker() {
  const { pathname } = useLocation()
  const sticker = stickerFor(pathname)
  const [have, setHave] = useStored<string[]>('stickers', [])
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null)
  const sfx = useSfx()

  const grab = () => {
    if (!sticker) return
    const next = collect(have, sticker.id)
    setHave(next)
    sfx('coin')
    const { found, total, complete } = progress(next, stickers)
    const text = complete ? `ALL ${total} STICKERS!!! Visit the Sticker Book!` : `STICKER GET! ${sticker.name} (${found}/${total})`
    setToast((t) => ({ key: (t?.key ?? 0) + 1, text }))
  }

  return (
    <>
      {sticker && !have.includes(sticker.id) && (
        <button
          type="button"
          onClick={grab}
          aria-label={`Hidden sticker: ${sticker.name}`}
          data-testid="hidden-sticker"
          className="absolute z-30 -translate-x-1/2 opacity-80 transition-opacity hover:opacity-100"
          style={{ top: sticker.spot.top, left: sticker.spot.left }}
        >
          <Img slot={sticker.slot} width={Math.min(36, sticker.slot.w)} className="animate-wobble" />
        </button>
      )}
      {toast && (
        <p
          key={toast.key}
          role="status"
          onAnimationEnd={() => setToast(null)}
          className="win-raised fixed left-1/2 top-14 z-[96] animate-toast px-3 py-1 font-pixel text-[10px] text-black shadow-[4px_4px_0_#000] sm:text-xs"
        >
          ★ {toast.text} ★
        </p>
      )}
    </>
  )
}
