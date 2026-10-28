import type { CSSProperties, ReactNode } from 'react'
import type { useDrag } from '../hooks/useDrag'
import { icons, type Slot } from '../content/assets'
import { Img } from './media/Img'
import { useClosing } from '../hooks/useClosing'

type Props = {
  title: string
  icon?: Slot
  minimised?: boolean
  onMinimise?: () => void
  onClose?: () => void
  /**
   * For a window closed by its own buttons too (OK/Cancel): pass a useClosing() of your own and the window eases
   * shut whichever way it's closed. Otherwise ✕ eases it shut by itself.
   */
  shut?: ReturnType<typeof useClosing>
  /** Title-bar handlers from useDrag; omit for a window that stays put. */
  drag?: ReturnType<typeof useDrag>
  onFocus?: () => void
  /** Greyed title bar, like a window that isn't in front. */
  inactive?: boolean
  className?: string
  style?: CSSProperties
  bodyClassName?: string
  testId?: string
  children?: ReactNode
}

/** Win95 window chrome shared by the pet, the desktop programs and friends. */
export function Win95Window({ title, icon = icons.floppy, minimised, onMinimise, onClose, shut: theirs, drag, onFocus, inactive, className = '', style, bodyClassName = 'bg-white', testId, children }: Props) {
  const btn = 'win-raised grid h-4 w-4 place-items-center text-[10px] font-bold leading-none text-black'
  const own = useClosing(onClose)
  const shut = theirs ?? own
  return (
    <section
      aria-label={title}
      data-testid={testId}
      onPointerDownCapture={onFocus}
      onAnimationEnd={shut.onAnimationEnd}
      className={`win-raised ${shut.closing ? 'pointer-events-none animate-pop-out' : 'animate-pop-in'} p-0.5 font-[Tahoma,Verdana,sans-serif] text-xs text-black shadow-[4px_4px_0_rgba(0,0,0,0.5)] ${className}`}
      style={style}
    >
      <div
        className={`flex select-none items-center gap-1 px-1 ${inactive ? 'bg-win-dark' : 'bg-gradient-to-r from-win-title to-[#1084d0]'} py-0.5 font-bold text-white ${drag ? 'cursor-move touch-none' : ''}`}
        {...drag}
      >
        <Img slot={icon} width={14} />
        <span className="flex-1 truncate">{title}</span>
        {onMinimise && (
          <button type="button" onClick={onMinimise} aria-label={minimised ? `Restore ${title}` : `Minimise ${title}`} className={btn}>
            {minimised ? '□' : '_'}
          </button>
        )}
        {onClose && (
          <button type="button" onClick={shut.close} aria-label={`Close ${title}`} className={btn}>
            ×
          </button>
        )}
      </div>
      {children !== undefined && <div className={`${bodyClassName} ${minimised ? 'hidden' : ''}`}>{children}</div>}
    </section>
  )
}
