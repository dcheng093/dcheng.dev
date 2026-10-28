import type { RouteObject } from 'react-router-dom'
import { RootLayout, type RouteHandle } from './layouts/RootLayout'
import { Home } from './routes/Home'
import { Dealership } from './routes/Dealership'
import { Shrine } from './routes/Shrine'
import { Guestbook } from './routes/Guestbook'
import { Boring } from './routes/Boring'
import { Checkout, Leave, UnderConstruction, YouWon } from './routes/Traps'
import { Casino, Scan, Survey, WorkFromHome } from './routes/Scams'
import { FakeBSOD } from './routes/FakeBSOD'

// Cyber Town pages load on demand: they carry their own games/encoders and most visitors never open all six.
const lazyPage = <K extends string>(load: () => Promise<Record<K, () => React.JSX.Element>>, name: K) => async () => ({ Component: (await load())[name] })

const fullscreen: RouteHandle = { noWebring: true }

/** Shared by main.tsx (createBrowserRouter) and tests (createMemoryRouter). */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <FakeBSOD />,
    // Shown for a blink when the very first page loaded is one of the lazy Cyber Town pages.
    hydrateFallbackElement: <p className="grid min-h-screen place-items-center bg-black font-pixel text-lime">LOADING…</p>,
    children: [
      { index: true, element: <Home /> },
      { path: 'dealership', element: <Dealership /> },
      { path: 'shrine/:slug', element: <Shrine /> },
      { path: 'guestbook', element: <Guestbook /> },
      { path: 'boring', element: <Boring />, handle: { calm: true } satisfies RouteHandle },
      { path: 'you-won', element: <YouWon /> },
      { path: 'under-construction', element: <UnderConstruction /> },
      { path: 'leave', element: <Leave />, handle: fullscreen },
      { path: 'checkout', element: <Checkout /> },
      { path: 'scan', element: <Scan /> },
      { path: 'casino', element: <Casino /> },
      { path: 'survey', element: <Survey /> },
      { path: 'work-from-home', element: <WorkFromHome /> },
      { path: 'arcade', lazy: lazyPage(() => import('./routes/Arcade'), 'Arcade') },
      { path: 'desktop', lazy: lazyPage(() => import('./routes/Desktop'), 'Desktop') },
      { path: 'radio', lazy: lazyPage(() => import('./routes/Radio'), 'Radio') },
      { path: 'oracle', lazy: lazyPage(() => import('./routes/Oracle'), 'Oracle') },
      { path: 'blinkie-maker', lazy: lazyPage(() => import('./routes/BlinkieMaker'), 'BlinkieMaker') },
      { path: 'stickers', lazy: lazyPage(() => import('./routes/StickerBook'), 'StickerBook') },
      // Secret: not in the webring or sitemap, so random links never spoil them.
      { path: 'legendary/:id', lazy: lazyPage(() => import('./routes/Legendary'), 'Legendary') },
      { path: '*', element: <FakeBSOD />, handle: fullscreen },
    ],
  },
]
