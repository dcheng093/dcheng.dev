import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from './Link'
import { Img } from './media/Img'
import { cursors, icons, type Slot } from '../content/assets'
import { DanielLogo } from './DanielLogo'
import { MuteButton } from './WebringBar'
import { TrayBadge } from './popnuke/TrayBadge'

// Icons are the site's own GIFs or plain glyphs: colour emoji show as empty boxes on systems without an emoji font.
const LINKS: { to: string; icon: string | Slot; label: string; className?: string }[] = [
  { to: '/', icon: '⌂', label: 'Home' },
  { to: '/guestbook', icon: cursors.pencil, label: 'Guestbook' },
  { to: '/settings', icon: '⚙', label: 'Settings' },
  // There is nothing to donate to. There never will be.
  { to: '/under-construction', icon: icons.moneyBag, label: 'DONATE', className: 'text-red-700' },
]

/**
 * The Win95 taskbar along the top of every page: the four places that matter, a system tray (mute, POPNUKE, a
 * clock), and Daniel's wobbling head on the right. Phones get icon-only buttons; nothing hides behind a menu.
 */
export function Taskbar() {
  const { pathname } = useLocation()
  return (
    <nav
      aria-label="Main"
      data-testid="taskbar"
      className="win-raised sticky top-0 z-[45] flex h-11 items-center gap-1 px-1 font-[Tahoma,Verdana,sans-serif] text-xs text-black"
    >
      {LINKS.map((l) => {
        const here = pathname === l.to
        return (
          <Link
            key={l.to}
            to={l.to}
            aria-label={l.label}
            aria-current={here ? 'page' : undefined}
            className={`flex h-8 shrink-0 items-center gap-1 px-2 font-bold ${here ? 'win-sunken bg-[repeating-conic-gradient(#c0c0c0_0_25%,#fff_0_50%)] bg-[length:2px_2px]' : 'win-raised'} ${l.className ?? ''}`}
          >
            {typeof l.icon === 'string' ? <span aria-hidden className="text-base leading-none">{l.icon}</span> : <Img slot={l.icon} width={20} />}
            <span className="max-sm:hidden">{l.label}</span>
          </Link>
        )
      })}
      <div className="min-w-0 flex-1" />
      <div data-testid="tray" className="win-sunken flex h-8 shrink-0 items-center gap-1 px-1">
        <MuteButton />
        <TrayBadge />
        <Clock />
      </div>
      <Link to="/" aria-label="Daniel Cheng's World Wide Web Site: home" className="shrink-0">
        <DanielLogo size={26} />
      </Link>
    </nav>
  )
}

/** The tray clock, like the real thing: hours and minutes, ticking over on the minute. */
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <time dateTime={now.toISOString()} className="px-1 tabular-nums max-[360px]:hidden">
      {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
    </time>
  )
}
