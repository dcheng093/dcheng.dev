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
import { MiniPlayer, MuteButton, WebringBar } from '../components/WebringBar'
import { useStored } from '../hooks/useLocalStorage'

export type RouteHandle = { calm?: boolean; noWebring?: boolean }

/**
 * Global chaos layer. Routes with handle `{ calm: true }` (e.g. /boring) skip all of it.
 * AudioProvider wraps both branches so a trip through /boring pauses the music instead of destroying it.
 */
export function RootLayout() {
  const matches = useMatches()
  const handle = (matches[matches.length - 1]?.handle ?? {}) as RouteHandle
  const { pathname } = useLocation()
  const [entered, setEntered] = useStored('entered', false, 'session')

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
        <PopupProvider auto={entered}>
          <ScrollRestoration />
          <UnlockOnGesture />
          <PageSong />
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
              <Outlet />
              <HiddenSticker />
              <Page3D crashed={!!handle.noWebring && pathname !== '/leave'} />
              <GifConfetti />
            </main>
            {!handle.noWebring && <WebringBar />}
            {pathname !== '/' && !handle.noWebring && <MiniPlayer />}
            {!handle.noWebring && <PetWindow />}
            {entered && !handle.noWebring && <VirusAlert />}
            <LiveChat />
          </div>
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

/** Switches to the page's theme song on arrival, unless the visitor 📌 locked their own pick. */
function PageSong() {
  const { pathname } = useLocation()
  const { locked, setMix } = useAudio()
  useEffect(() => {
    const song = pageSong(pathname)
    if (song && !locked) setMix(song)
    // Only on arrival: unlocking mid-page shouldn't yank the song back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  return null
}
