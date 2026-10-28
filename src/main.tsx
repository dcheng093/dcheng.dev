import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@fontsource/press-start-2p'
import '@fontsource/vt323'
import '@fontsource/silkscreen'
import './index.css'
import { routes } from './routes'
import { VISITED_KEY } from './lib/dialup'

// A refresh always lands back on the enter gate at the top of the home page (the gate's click is what unlocks audio),
// with the dial-up "cache" emptied, so every page slow-loads again the first time.
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
  if (location.pathname !== '/') history.replaceState(null, '', '/')
}

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
