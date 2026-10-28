import { useEffect, useState } from 'react'
import { assets, cursors } from '../../content/assets'
import { gifCursor } from '../../lib/cursor'
import type { CursorId } from '../../lib/settings'

// A Win95 hourglass, drawn as pixels: there's no GIF of one worth having, and it's the most 1998 cursor there is.
const HOURGLASS = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='32' shape-rendering='crispEdges'>" +
    "<path d='M1 1h18v3h-2v5l-5 6 5 6v5h2v3H1v-3h2v-5l5-6-5-6V4H1z' fill='#000'/>" +
    "<path d='M5 4h10v4l-5 6-5-6zM5 25l5-7 5 7v3H5z' fill='#fff'/>" +
    "<path d='M7 8h6l-3 4zM6 27l4-5 4 5z' fill='#c90'/></svg>",
)}") 10 16, wait`

const GIF_CURSORS = { fist: cursors.fist, horse: cursors.horse, skull: cursors.skull, coffee: cursors.coffee, moneyBag: cursors.moneyBag } as const

/** The CSS cursor value for a choice, or null for "page default". Daniel's head is shrunk to 32px first. */
export function useCursor(id: CursorId) {
  const [head, setHead] = useState<string | null>(null)
  useEffect(() => {
    if (id !== 'daniel' || head) return
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = c.height = 32
      c.getContext('2d')?.drawImage(img, 0, 0, 32, 32)
      try {
        setHead(`url("${c.toDataURL('image/png')}") 16 16, auto`)
      } catch {
        // A tainted canvas can't be read back; the grin GIF will do.
      }
    }
    img.src = assets.headGrin.src
  }, [id, head])
  if (id === 'page') return null
  if (id === 'hourglass') return HOURGLASS
  if (id === 'daniel') return head ?? gifCursor(cursors.grin, [16, 16])
  return gifCursor(GIF_CURSORS[id])
}
