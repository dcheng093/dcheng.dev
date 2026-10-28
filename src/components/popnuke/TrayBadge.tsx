import { Link } from 'react-router-dom'
import { popnukeGifs } from '../../content/assets'
import { Img } from '../media/Img'
import { usePopnuke } from './popnukeState'

/** While POPNUKE is installed: a little system-tray badge counting what it has blocked. Opens its page. */
export function TrayBadge() {
  const { installed, blocked } = usePopnuke()
  if (!installed) return null
  return (
    <Link
      to="/popnuke"
      data-testid="popnuke-badge"
      title="POPNUKE is protecting you. Click to manage (or uninstall)."
      className="win-raised fixed left-9 top-1 z-50 flex h-7 items-center gap-1 px-1 font-[Tahoma,sans-serif] text-[11px] text-black"
    >
      <Img slot={popnukeGifs.shieldRadiation} width={22} />
      <span>
        POPNUKE: <b key={blocked} className="inline-block animate-squash" data-testid="popnuke-blocked">{blocked}</b> blocked
      </span>
    </Link>
  )
}
