import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { daniel } from '../../content/daniel'
import { useSfx } from '../../audio/audioContext'
import { icons, popnukeGifs } from '../../content/assets'
import { POPNUKE_3D, PRODUCT } from '../../content/popnuke'
import { Viewer3D } from '../three/Viewer3D'
import { Img } from '../media/Img'
import { usePopups, type SpecialId } from './popupState'

type SpecialProps = { close: () => void }

/** The body of a special popup; each one gets its own buttons and can close its window. */
export function SpecialPopup({ id, close }: SpecialProps & { id: SpecialId }) {
  switch (id) {
    case 'business-card':
      return <BusinessCard />
    case 'ip-alert':
      return <IpAlert close={close} />
    case 'download':
      return <Download close={close} />
    case 'friend-request':
      return <FriendRequest close={close} />
    case 'quick-survey':
      return <QuickSurvey close={close} />
    case 'spin-to-win':
      return <SpinToWin close={close} />
    case 'popnuke-ad':
      return <PopnukeAd close={close} />
    case 'welcome-back':
      return <WelcomeBack />
  }
}

/** POPNUKE's ad: a pop-up advertising a pop-up blocker. 3D emblem, 2D GIFs, and both buttons go to the page. */
function PopnukeAd({ close }: SpecialProps) {
  const navigate = useNavigate()
  const go = () => {
    close()
    navigate('/popnuke')
  }
  return (
    <div className="space-y-2 bg-black p-2 text-center font-[Tahoma,Verdana,sans-serif] text-white" data-testid="popnuke-ad">
      <p className="animate-pulse-scale font-impact text-2xl leading-tight text-yellow-300">TIRED OF POP-UPS?!</p>
      <div className="flex items-center justify-center gap-2">
        <Img slot={popnukeGifs.trefoilSpin} width={40} />
        <Viewer3D spec={POPNUKE_3D.logo} size="96px" res={64} className="bg-[radial-gradient(circle,#332200_0%,#000_70%)]" />
        <Img slot={popnukeGifs.trefoilSpin} width={40} />
      </div>
      <p className="font-impact text-lg">
        <span className="text-yellow-300">POPNUKE</span> {PRODUCT.tagline}
      </p>
      <p className="text-[10px] text-gray-400">{PRODUCT.footnote}</p>
      <button type="button" onClick={go} aria-label="Download POPNUKE now" className="mx-auto block">
        <Img slot={popnukeGifs.downloadNow} width={170} />
      </button>
      <button type="button" onClick={go} className="text-[9px] text-gray-500 underline">
        no thanks, I love pop-ups
      </button>
    </div>
  )
}

/** The first pop-up back after uninstalling POPNUKE. They missed you. */
function WelcomeBack() {
  return (
    <div className="space-y-1 text-center font-[Tahoma,Verdana,sans-serif] text-black">
      <p className="animate-pulse-scale font-impact text-3xl text-red-600">WELCOME BACK</p>
      <p>We missed you. We knew you’d uninstall it.</p>
      <p className="text-xs italic">— The Pop-ups</p>
    </div>
  )
}

function BusinessCard() {
  const { links } = daniel
  return (
    <div className="space-y-1 font-times text-sm text-black">
      <p className="font-impact text-xl text-blue-800">{daniel.name.toUpperCase()}</p>
      <p className="italic">Webmaster • Developer • Kettle Enthusiast</p>
      <ul className="list-inside list-disc">
        {links.email && <li><a className="text-blue-700 underline" href={`mailto:${links.email}`}>{links.email}</a></li>}
        {links.github && <li><a className="text-blue-700 underline" href={links.github} target="_blank" rel="noreferrer">GitHub</a></li>}
        {links.linkedin && <li><a className="text-blue-700 underline" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
      </ul>
      <p>
        Need the serious version? <Link to="/boring" className="text-blue-700 underline">Click here for the boring site</Link>.
      </p>
    </div>
  )
}

const DialogButton = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="win-raised min-w-16 px-2 py-0.5 text-black">
    {children}
  </button>
)

function IpAlert({ close }: SpecialProps) {
  return (
    <div className="space-y-2 font-[Tahoma,Verdana,sans-serif] text-black">
      <div className="flex items-start gap-2">
        <Img slot={icons.warning} width={36} className="shrink-0" />
        <p>
          <b>WARNING!</b> Your IP address is <b className="font-vt text-lg text-red-600">127.0.0.1</b>. Hackers can see it. Daniel can see it too. He says hi.
        </p>
      </div>
      <p className="text-[11px]">Your computer is BROADCASTING an Internet address. Click OK to stop broadcasting (it will not stop).</p>
      <div className="flex justify-center gap-2">
        <DialogButton onClick={close}>OK</DialogButton>
        <DialogButton onClick={close}>Also OK</DialogButton>
      </div>
    </div>
  )
}

const DOWNLOADS = ['DanielBar_Toolbar.exe', 'FREE_SMILEYS_10000.zip', 'KettlePipes3D.scr', 'more_ram_(real).exe', 'cursor_pack_horses.ani']

/** A download that reaches 99% and starts again with a different file. */
function Download({ close }: SpecialProps) {
  const [{ pct, file }, setProgress] = useState(() => ({ pct: 0, file: Math.floor(Math.random() * DOWNLOADS.length) }))
  const [note, setNote] = useState<string | null>(null)
  useEffect(() => {
    const id = window.setInterval(() => {
      const step = Math.ceil(Math.random() * 14)
      setProgress((d) => (d.pct < 99 ? { ...d, pct: Math.min(99, d.pct + step) } : { pct: 0, file: (d.file + 1) % DOWNLOADS.length }))
    }, 600)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="space-y-2 font-[Tahoma,Verdana,sans-serif] text-black">
      <div className="flex items-center gap-2">
        <Img slot="surfer" width={42} />
        <p>
          Downloading <b className="break-all">{DOWNLOADS[file]}</b> from <i>daniel-free-stuff.biz</i>
        </p>
      </div>
      <div className="win-sunken h-4 w-full bg-white" role="progressbar" aria-valuenow={pct} aria-label="Download progress">
        <div className="h-full bg-[repeating-linear-gradient(90deg,#000080_0_8px,transparent_8px_10px)]" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px]">{pct}% complete • estimated time left: {pct === 99 ? 'forever' : `${(99 - pct) * 7} minutes`} • 0.2 KB/sec</p>
      {note && <p className="bg-yellow-200 p-1 text-[11px] font-bold">{note}</p>}
      <div className="flex justify-center gap-2">
        <DialogButton onClick={() => setNote('Downloads cannot be cancelled on dial-up. Speeding it up instead (it will not speed up).')}>Cancel</DialogButton>
        <DialogButton onClick={close}>Hide</DialogButton>
      </div>
    </div>
  )
}

const FRIENDS = ['xX_DaNiEl_Xx', 'daniel_2001', 'kettle_lover_42', 'SegFaultSally', 'HorseGuy99']

/** Instant-messenger friend request. Declining just sends it again. */
function FriendRequest({ close }: SpecialProps) {
  const [who] = useState(() => FRIENDS[Math.floor(Math.random() * FRIENDS.length)])
  const [declines, setDeclines] = useState(0)
  const navigate = useNavigate()
  const sfx = useSfx()
  return (
    <div className="space-y-2 bg-[#ffffe1] p-1 font-[Tahoma,Verdana,sans-serif] text-black">
      <p>
        <Img slot={icons.online} width={12} className="mr-1 inline-block" />
        <b>{who}</b> wants to add you to their Buddy List!
      </p>
      <p className="text-[11px] italic">“hey!! a/s/l?? i saw ur page, it’s so cool. do u like horses” </p>
      {declines > 0 && (
        <p className="text-[11px] font-bold text-red-700">
          Request declined. {who} has sent you {declines + 1} more request{declines ? 's' : ''}.
        </p>
      )}
      <div className="flex justify-center gap-2">
        <DialogButton
          onClick={() => {
            close()
            navigate('/guestbook')
          }}
        >
          Accept
        </DialogButton>
        <DialogButton
          onClick={() => {
            sfx('ding')
            setDeclines((d) => d + 1)
          }}
        >
          Decline
        </DialogButton>
      </div>
    </div>
  )
}

/** One question. Every answer is the right answer, and every right answer leads to a longer survey. */
function QuickSurvey({ close }: SpecialProps) {
  const navigate = useNavigate()
  const go = () => {
    close()
    navigate('/survey')
  }
  return (
    <div className="space-y-2 text-center font-comic text-black">
      <p className="font-impact text-lg text-blue-800">QUICK SURVEY (1 QUESTION!!)</p>
      <p>Do you like Daniel?</p>
      <div className="flex justify-center gap-2">
        <DialogButton onClick={go}>YES</DialogButton>
        <DialogButton onClick={go}>YES!!!</DialogButton>
      </div>
      <p className="text-[10px] text-gray-600">Takes 30 seconds*. *Takes longer than 30 seconds.</p>
    </div>
  )
}

// The wheel lands on these in order; the "win" is always the last one.
const PRIZES = ['TRY AGAIN', 'SO CLOSE!!', 'A HORSE (ALMOST)', '1× FREE DANIEL']

/** A wheel that eventually lands on a prize you have to pay for. */
function SpinToWin({ close }: SpecialProps) {
  const [turn, setTurn] = useState(0)
  const [spins, setSpins] = useState(0)
  const popups = usePopups()
  const navigate = useNavigate()
  const sfx = useSfx()
  const landed = spins > 0 ? PRIZES[Math.min(spins, PRIZES.length) - 1] : null
  const won = spins >= PRIZES.length
  return (
    <div className="flex flex-col items-center gap-2 bg-yellow-300 p-1 text-center text-red-600">
      <p className="animate-shake font-impact text-xl">SPIN TO WIN!!!</p>
      <div
        aria-hidden
        className="size-28 rounded-full border-4 border-black transition-transform duration-[1500ms] ease-out"
        style={{ rotate: `${turn}deg`, background: 'conic-gradient(#f00 0 60deg,#ff0 0 120deg,#0c0 0 180deg,#00f 0 240deg,#f0f 0 300deg,#0ff 0)' }}
      />
      <p className="min-h-5 font-impact text-lg text-black" role="status">{landed}</p>
      {won ? (
        <button
          type="button"
          className="animate-pulse-scale border-2 border-black bg-red-600 px-2 font-impact text-white"
          onClick={() => {
            close()
            navigate('/checkout')
          }}
        >
          CLAIM (£9.99 shipping) »
        </button>
      ) : (
        <button
          type="button"
          className="border-2 border-black bg-red-600 px-2 font-impact text-white"
          onClick={() => {
            sfx('coin')
            setTurn((t) => t + 1080 + Math.random() * 360)
            setSpins((s) => s + 1)
            // Losing spins summon a consolation ad, because of course they do.
            if (spins % 2 === 1) popups.open('millionth')
          }}
        >
          SPIN »
        </button>
      )}
    </div>
  )
}
