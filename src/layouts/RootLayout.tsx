import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router-dom'
import { AudioProvider } from '../audio/AudioProvider'
import { useUnlockOnGesture } from '../audio/audioContext'
import { PopupProvider } from '../components/popups/PopupProvider'
import { EnterGate } from '../components/EnterGate'
import { GifConfetti } from '../components/chaos/GifConfetti'
import { CursorTrail } from '../components/CursorTrail'
import { LiveChat } from '../components/LiveChat'
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
    <AudioProvider silent={handle.calm}>
      {handle.calm ? (
        <>
          <ScrollRestoration />
          <Outlet />
        </>
      ) : (
        <PopupProvider auto={entered}>
          <ScrollRestoration />
          <UnlockOnGesture />
          {!entered && <EnterGate onEnter={() => setEntered(true)} />}
          <CursorTrail />
          <MuteButton />
          <main className="relative">
            <Outlet />
            <GifConfetti />
          </main>
          {!handle.noWebring && <WebringBar />}
          {pathname !== '/' && !handle.noWebring && <MiniPlayer />}
          <LiveChat />
        </PopupProvider>
      )}
    </AudioProvider>
  )
}

/** After a refresh the gate stays dismissed (session flag), so the first click on any page restarts the music. */
function UnlockOnGesture() {
  useUnlockOnGesture()
  return null
}
