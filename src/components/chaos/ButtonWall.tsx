import { Link } from '../Link'
import { buttons88 } from '../../content/assets'
import { Img } from '../media/Img'
import { usePopups } from '../popups/popupState'

// Hand-drawn 88×31s for the badges no one put on GeoCities without a real brand on them.
// [small top line, big bottom line, left-strip colours, body colours, optional route]
const BADGES: [string, string, string, string, `/${string}`?][] = [
  ['DANIEL', 'NOW!', 'bg-black text-cyber', 'bg-[#036] text-white', '/dealership'],
  ['MADE WITH', 'NOTEPAD', 'bg-white text-blue-800', 'bg-[#c0c0c0] text-black'],
  ['BEST VIEWED', '800×600', 'bg-yellow-300 text-black', 'bg-black text-yellow-300'],
  ['KETTLE', 'POWERED', 'bg-orange-500 text-white', 'bg-white text-orange-600', '/shrine/kettle'],
  ['Y2K', 'COMPLIANT', 'bg-lime text-black', 'bg-[#003300] text-lime'],
  ['SIGN MY', 'GUESTBOOK', 'bg-hotpink text-white', 'bg-white text-hotpink', '/guestbook'],
  ['HTML', '3.2', 'bg-red-600 text-white', 'bg-white text-red-600'],
  ['GET', 'MORE RAM', 'bg-green-700 text-white', 'bg-black text-green-400', '/under-construction'],
  ['NEIGH', 'CERTIFIED', 'bg-purple-800 text-yellow-200', 'bg-yellow-200 text-purple-800', '/shrine/horses'],
  ['SEGFAULT', 'FREE*', 'bg-black text-red-500', 'bg-[#001a00] text-lime', '/shrine/segfault'],
  ['ANTI', 'FLASH', 'bg-white text-black', 'bg-red-600 text-white'],
  ['FRAMES', 'FREE ZONE', 'bg-blue-700 text-white', 'bg-cyber text-black'],
]

/** A wall of 88×31 buttons, the way every personal page ended. Some go somewhere; most just sit there. */
export function ButtonWall({ className = '' }: { className?: string }) {
  const popups = usePopups()
  return (
    <div className={`flex flex-wrap justify-center gap-1 [image-rendering:pixelated] ${className}`} aria-label="Link buttons">
      <Img slot={buttons88.bestViewed} />
      {BADGES.map(([top, bottom, strip, body, to]) => {
        const badge = (
          <span className="flex h-[31px] w-[88px] overflow-hidden border border-black font-silk text-[7px] leading-[8px]">
            <span className={`grid w-[22px] shrink-0 place-items-center border-r border-black text-center ${strip}`}>★</span>
            <span className={`flex flex-1 flex-col items-center justify-center text-center ${body}`}>
              <span>{top}</span>
              <span className="text-[9px] font-bold leading-[10px]">{bottom}</span>
            </span>
          </span>
        )
        return to ? (
          <Link key={top + bottom} to={to} aria-label={`${top} ${bottom}`}>
            {badge}
          </Link>
        ) : (
          <span key={top + bottom} role="img" aria-label={`${top} ${bottom}`}>
            {badge}
          </span>
        )
      })}
      <button type="button" onClick={() => popups.open('business-card')} aria-label="E-mail the webmaster">
        <Img slot={buttons88.email} />
      </button>
      <button type="button" onClick={() => popups.open('spin-to-win')} aria-label="Click">
        <Img slot={buttons88.click} />
      </button>
    </div>
  )
}
