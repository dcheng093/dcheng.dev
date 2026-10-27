import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ads } from '../../content/ads'
import { icons } from '../../content/assets'
import { Img } from '../media/Img'
import { AdSlot } from '../ads/AdSlot'
import { isSpecial, type Popup } from './popupState'
import { SpecialPopup } from './specials'

const TITLES = ['Microsoft Internet Exploder', 'Netscrape Navigator', 'IMPORTANT MESSAGE!!!', 'Catastrophe.exe', 'Daniel Alert', 'Untitled - Notepad', 'SYSTEM WARNING', 'You Have (1) New Message', 'Free_Stuff.exe']

type Props = { popup: Popup; z: number; onClose: () => void; onMove: (fx: number, fy: number) => void }

export function PopupWindow({ popup, z, onClose, onMove }: Props) {
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const [dodges, setDodges] = useState(0)
  const [closeX, setCloseX] = useState(0)
  const ad = ads.find((a) => a.id === popup.content)
  const title = TITLES[popup.key % TITLES.length]

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    const rect = e.currentTarget.parentElement!.getBoundingClientRect()
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    onMove(
      Math.min(0.95, Math.max(0, (e.clientX - drag.current.dx) / window.innerWidth)),
      Math.min(0.95, Math.max(0, (e.clientY - drag.current.dy) / window.innerHeight)),
    )
  }

  // "dodge" popups run away from the mouse three times, then give up. They only slide along the
  // title bar: dropping into the body put the × under the ad, which then ate every click.
  const dodge = () => {
    if (popup.variant !== 'dodge' || dodges >= 3) return
    setDodges((d) => d + 1)
    setCloseX(-30 - Math.random() * 110)
  }

  return (
    <div
      role="dialog"
      aria-label={title}
      data-testid="popup"
      data-variant={popup.variant}
      className="win-raised fixed w-[min(320px,calc(100vw-16px))] p-0.5 font-[Tahoma,Verdana,sans-serif] text-xs shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
      style={{ left: `min(${popup.fx * 100}vw, calc(100vw - min(320px, 100vw - 16px) - 8px))`, top: `${popup.fy * 100}vh`, zIndex: z }}
    >
      <div
        className="flex cursor-move touch-none select-none items-center gap-1 bg-gradient-to-r from-win-title to-[#1084d0] px-1 py-0.5 font-bold text-white"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
      >
        <Img slot={icons.floppy} width={14} />
        <span className="flex-1 truncate">{title}</span>
        <span className="win-raised grid h-4 w-4 place-items-center text-[10px] leading-none text-black">_</span>
        <button
          type="button"
          aria-label="Close"
          onPointerEnter={(e) => e.pointerType === 'mouse' && dodge()}
          onClick={onClose}
          className="win-raised relative z-10 grid h-4 w-4 place-items-center text-[10px] font-bold leading-none text-black transition-transform duration-75"
          style={{ transform: `translateX(${closeX}px)` }}
        >
          ×
        </button>
      </div>
      <div className="bg-white p-2">
        {isSpecial(popup.content) ? <SpecialPopup id={popup.content} close={onClose} /> : ad ? <AdSlot ad={ad} format="popup" className="w-full" /> : <p>404 popup not found. Close me. CLOSE ME.</p>}
      </div>
      {popup.variant === 'multiply' && <p className="px-1 pt-0.5 text-[10px] text-gray-700">Closing this window may open more windows.</p>}
    </div>
  )
}
