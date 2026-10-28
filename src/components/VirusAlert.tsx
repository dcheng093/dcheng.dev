import { useEffect, useRef, useState } from 'react'
import { clampToViewport, useDrag } from '../hooks/useDrag'
import { useSfx } from '../audio/audioContext'
import { useStored } from '../hooks/useLocalStorage'
import { usePopnuke } from './popnuke/popnukeState'

export const VIRUS_ALERT_DELAY_MS = 25_000

/**
 * The Albanian virus: a Windows 10 style message box that turns up once per visit, a little while in.
 * No minimise, just ✕, and every button closes it (the virus is very polite).
 */
export function VirusAlert() {
  const [seen, setSeen] = useStored('virusAlertSeen', false, 'session')
  const [open, setOpen] = useState(false)
  // Centred until dragged; then it sits wherever the visitor left it.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const drag = useDrag((x, y) => setPos(clampToViewport(x, y, 460)))
  const sfx = useSfx()

  // POPNUKE (if installed) catches it instead. Read through a ref so the timer isn't restarted by every block.
  const nuke = usePopnuke()
  const nukeRef = useRef(nuke)
  useEffect(() => {
    nukeRef.current = nuke
  })

  useEffect(() => {
    if (seen) return
    const t = window.setTimeout(() => {
      if (nukeRef.current.installed) {
        nukeRef.current.countBlocked()
        setSeen(true)
        return
      }
      setOpen(true)
      sfx('error')
    }, VIRUS_ALERT_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [seen, sfx, setSeen])

  const close = () => {
    setOpen(false)
    setSeen(true)
  }
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close only touches stable setters
  }, [open])

  if (!open) return null
  const button = 'min-w-[88px] border bg-[#e1e1e1] px-3 py-1 hover:border-[#0078d7] hover:bg-[#e5f1fb]'
  return (
    <div
      role="alertdialog"
      aria-labelledby="virus-alert-title"
      aria-describedby="virus-alert-text"
      data-testid="virus-alert"
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={`fixed z-[97] w-[min(460px,calc(100vw-16px))] ${pos ? '' : 'left-1/2 top-[28%] -translate-x-1/2'} animate-pop-in border border-[#888] bg-white font-['Segoe_UI',Tahoma,sans-serif] text-[13px] text-black shadow-[0_10px_30px_rgba(0,0,0,0.45)]`}
    >
      <div className="flex cursor-move touch-none select-none items-center justify-between" data-testid="virus-alert-titlebar" {...drag}>
        <span id="virus-alert-title" className="pl-3 text-[13px]">Virus Alert</span>
        <button type="button" onClick={close} aria-label="Close" className="px-4 py-1.5 text-base leading-none hover:bg-[#e81123] hover:text-white">
          ✕
        </button>
      </div>
      <div className="flex items-start gap-4 px-6 pb-6 pt-4">
        {/* Windows' red error badge, drawn in CSS. */}
        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff7676,#d40000_70%)] text-base font-bold text-white ring-1 ring-[#8b0000]">
          ✕
        </span>
        <p id="virus-alert-text" className="leading-snug">
          Hi, I am Albanian virus, due to poor technology in my country I not able to damage your computer, please be kind enough to smash your computer with a hammer
        </p>
      </div>
      <div className="flex justify-end gap-2 bg-[#f0f0f0] px-4 py-3">
        {['Yes', 'No', 'Cancel'].map((label, i) => (
          <button key={label} type="button" onClick={close} autoFocus={i === 0} className={`${button} ${i === 0 ? 'border-[#0078d7]' : 'border-[#adadad]'}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
