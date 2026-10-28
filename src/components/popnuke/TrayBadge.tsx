import { Link } from 'react-router-dom'
import { popnukeGifs } from '../../content/assets'
import { Img } from '../media/Img'
import { usePopnuke } from './popnukeState'

/** While POPNUKE is installed: a little badge in the taskbar's tray counting what it has blocked. Opens its page. */
export function TrayBadge() {
  const { installed, blocked } = usePopnuke()
  if (!installed) return null
  return (
    <Link
      to="/popnuke"
      data-testid="popnuke-badge"
      title="POPNUKE is protecting you. Click to manage (or uninstall)."
      className="flex h-6 shrink-0 items-center gap-1 px-0.5 font-[Tahoma,sans-serif] text-[11px] text-black"
    >
      <Img slot={popnukeGifs.shieldRadiation} width={20} />
      {/* Phones just get the shield and the number. */}
      <span>
        <span className="max-sm:sr-only">POPNUKE: </span>
        <b key={blocked} className="inline-block animate-squash" data-testid="popnuke-blocked">{blocked}</b>
        <span className="max-sm:sr-only"> blocked</span>
      </span>
    </Link>
  )
}
