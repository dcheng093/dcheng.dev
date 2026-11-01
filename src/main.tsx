import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// Latin only: everything the site writes in its pixel fonts is (the Dex draws its runes itself).
import '@fontsource/press-start-2p/latin-400.css'
import '@fontsource/vt323/latin-400.css'
import '@fontsource/silkscreen/latin-400.css'
import './index.css'
import { routes } from './routes'
import { VISITED_KEY } from './lib/dialup'
import { countVisit } from './lib/discovery'
import { prefetchOnIntent } from './lib/prefetch'

// A refresh always lands back on the enter gate at the top of the home page (the gate's click is what unlocks audio),
// with the dial-up "cache" emptied, so every page slow-loads again the first time. Except the boring site: it's a
// normal website, and a normal website stays where you refreshed it.
if ((performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'reload') {
  // <ScrollRestoration> hands scrolling back to the browser on pagehide, so take it back before the browser restores.
  history.scrollRestoration = 'manual'
  try {
    sessionStorage.removeItem('entered')
    sessionStorage.removeItem(VISITED_KEY)
    sessionStorage.removeItem('react-router-scroll-positions')
  } catch {
    // Blocked storage: nothing was persisted, so the gate shows anyway.
  }
  if (location.pathname !== '/' && !/^\/boring\/?$/i.test(location.pathname)) history.replaceState(null, '', '/')
}

// Each browser session is one visit; letters and secrets turn up on later ones.
countVisit()

// For whoever opens the console. It points at the song, never at where the song leads.
console.log(
  '%c⟁\n%chello.\nyou looked deeper than most.\nthere is a song on this website with no name. listen to it. then listen harder.',
  'font: 48px serif; color: #8a0000',
  'font: 14px monospace; color: #b8b0c4; line-height: 1.6',
)

const router = createBrowserRouter(routes)
prefetchOnIntent(routes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
