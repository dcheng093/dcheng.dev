import { Outlet, ScrollRestoration, useMatches } from 'react-router-dom'
import { AudioProvider } from '../audio/AudioProvider'
import { PopupProvider } from '../components/popups/PopupProvider'
import { EnterGate } from '../components/EnterGate'
import { GifConfetti } from '../components/chaos/GifConfetti'
import { CursorTrail } from '../components/CursorTrail'
import { LiveChat } from '../components/LiveChat'
import { MuteButton, WebringBar } from '../components/WebringBar'
import { useStored } from '../hooks/useLocalStorage'

export type RouteHandle = { calm?: boolean; noWebring?: boolean }

/** Global chaos layer. Routes with handle `{ calm: true }` (e.g. /boring) skip all of it. */
export function RootLayout() {
  const matches = useMatches()
  const handle = (matches[matches.length - 1]?.handle ?? {}) as RouteHandle
  const [entered, setEntered] = useStored('entered', false, 'session')

  if (handle.calm) {
    return (
      <>
        <ScrollRestoration />
        <Outlet />
      </>
    )
  }

  return (
    <AudioProvider>
      <PopupProvider auto={entered}>
        <ScrollRestoration />
        {!entered && <EnterGate onEnter={() => setEntered(true)} />}
        <CursorTrail />
        <MuteButton />
        <main className="relative">
          <Outlet />
          <GifConfetti />
        </main>
        {!handle.noWebring && <WebringBar />}
        <LiveChat />
      </PopupProvider>
    </AudioProvider>
  )
}
