import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router-dom'
import { AudioProvider } from '../audio/AudioProvider'
import { useAudio, useUnlockOnGesture } from '../audio/audioContext'
import { pageSong } from '../audio/pageSongs'
import { PopupProvider } from '../components/popups/PopupProvider'
import { EnterGate } from '../components/EnterGate'
import { GifConfetti } from '../components/chaos/GifConfetti'
import { CursorTrail } from '../components/CursorTrail'
import { ClickBurst } from '../components/chaos/ClickBurst'
import { HiddenSticker } from '../components/HiddenSticker'
import { Page3D } from '../components/three/Page3D'
import { LiveChat } from '../components/LiveChat'
import { PetWindow } from '../components/PetWindow'
import { PopnukeProvider } from '../components/popnuke/PopnukeProvider'
import { Taskbar } from '../components/Taskbar'
import { PageLoad, ScanIn } from '../components/DialUp'
import { SettingsProvider } from '../components/settings/SettingsProvider'
import { VirusAlert } from '../components/VirusAlert'
import { VisitNote } from '../components/VisitNote'
import { MiniPlayer, MuteButton, WebringBar } from '../components/WebringBar'
import { useStored } from '../hooks/useLocalStorage'
import { useSealedPage } from '../hooks/useSealedPage'
import { usePossessed } from '../lib/possession'
import { Possession } from '../components/possessed/Possession'
import { JumpScare } from '../components/possessed/JumpScare'

/**
 * `calm`: none of the chaos at all (/boring). `quiet`: the chaos minus pop-up ambushes and the virus alert.
 * `sealable`: an unknown address, where a sealed page might open. That page is `solemn`: quiet, and none of the
 * playful clutter either (confetti, stickers, Melly, the live chat), so nothing cute floats over it.
 */
export type RouteHandle = { calm?: boolean; noWebring?: boolean; quiet?: boolean; sealable?: boolean; solemn?: boolean }

/**
 * Global chaos layer. Routes with handle `{ calm: true }` (e.g. /boring) skip all of it.
 * AudioProvider wraps both branches so a trip through /boring pauses the music instead of destroying it.
 */
export function RootLayout() {
  const matches = useMatches()
  const { pathname } = useLocation()
  const routeHandle = (matches[matches.length - 1]?.handle ?? {}) as RouteHandle
  const sealed = useSealedPage(pathname, !!routeHandle.sealable)
  const handle: RouteHandle = sealed.status === 'open' ? { quiet: true, solemn: true } : routeHandle
  const [entered, setEntered] = useStored('entered', false, 'session')
  // Once a sealed page has been seen, the whole site turns (until the visitor is baptized in the Control Panel).
  const possessed = usePossessed() && !handle.calm
  useEffect(() => {
    const html = document.documentElement
    if (possessed) html.dataset.possessed = ''
    else delete html.dataset.possessed
    return () => {
      delete html.dataset.possessed
    }
  }, [possessed])

  return (
    <SettingsProvider active={!handle.calm}>
    <AudioProvider silent={handle.calm}>
      {handle.calm ? (
        <>
          <ScrollRestoration />
          <Outlet />
        </>
      ) : (
        <PopnukeProvider>
        <PopupProvider auto={entered && !handle.quiet}>
          <ScrollRestoration />
          <UnlockOnGesture />
          <PageSong override={sealed.status === 'open' ? sealed.page.song : undefined} />
          {!entered && <EnterGate onEnter={() => setEntered(true)} />}
          <CursorTrail />
          <ClickBurst />
          {/* The first time each page is opened this visit it "loads" over dial-up (starting with the one you enter
              on); after that it's cached and fades in. Not behind the enter gate: nobody would see it, and the page
              would count as cached already. */}
          {entered && (
            <>
              <PageLoad key={pathname} path={pathname} belowTaskbar={!handle.noWebring} />
              <ScanIn />
            </>
          )}
          {/* While the gate is up the site sits mounted but unpainted underneath it: the gate is opaque, and
              painting the whole animated collage behind it would just eat the frame budget of its 3D dream. */}
          <div className={entered ? 'contents' : 'invisible'}>
            {handle.noWebring ? <MuteButton floating /> : <Taskbar />}
            <main className="relative">
              <Outlet context={sealed} />
              {!handle.solemn && <HiddenSticker />}
              <Page3D crashed={!!handle.noWebring && pathname !== '/leave'} />
              {!handle.solemn && <GifConfetti />}
            </main>
            {!handle.noWebring && <WebringBar />}
            {pathname !== '/' && !handle.noWebring && <MiniPlayer />}
            {!handle.noWebring && !handle.solemn && <PetWindow />}
            {entered && !handle.noWebring && !handle.quiet && <VirusAlert />}
            {entered && !handle.noWebring && !handle.quiet && <VisitNote />}
            {!handle.solemn && <LiveChat />}
          </div>
          {possessed && <Possession />}
          <JumpScare />
        </PopupProvider>
        </PopnukeProvider>
      )}
    </AudioProvider>
    </SettingsProvider>
  )
}

/** After a refresh the gate stays dismissed (session flag), so the first click on any page restarts the music. */
function UnlockOnGesture() {
  useUnlockOnGesture()
  return null
}

/** Switches to the page's theme song on arrival, unless the visitor 📌 locked their own pick. A sealed page names its own. */
function PageSong({ override }: { override?: string }) {
  const { pathname } = useLocation()
  const { locked, setMix } = useAudio()
  useEffect(() => {
    const song = override ?? pageSong(pathname)
    if (song && !locked) setMix(song)
    // Only on arrival: unlocking mid-page shouldn't yank the song back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, override])
  return null
}
