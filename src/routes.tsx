import type { RouteObject } from 'react-router-dom'
import { RootLayout, type RouteHandle } from './layouts/RootLayout'
import { Home } from './routes/Home'
import { FakeBSOD } from './routes/FakeBSOD'
import { SealedOrBSOD } from './routes/Sealed'

// Every page but Home (where everyone arrives) and the crash screen loads on demand: nobody needs every page's code
// up front, and each one carries its own games, encoders and copy.
const lazyPage = <K extends string>(load: () => Promise<Record<K, () => React.JSX.Element>>, name: K) => async () => ({ Component: (await load())[name] })

const fullscreen: RouteHandle = { noWebring: true }
// Unknown addresses: the crash screen, unless a sealed page opens there (RootLayout, useSealedPage).
const unknown: RouteHandle = { noWebring: true, sealable: true }
// Pages for digging around in: no pop-up ambushes or virus alert while you're there.
const quiet: RouteHandle = { quiet: true }

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
      { path: 'dealership', lazy: lazyPage(() => import('./routes/Dealership'), 'Dealership') },
      { path: 'shrine/:slug', lazy: lazyPage(() => import('./routes/Shrine'), 'Shrine') },
      { path: 'guestbook', lazy: lazyPage(() => import('./routes/Guestbook'), 'Guestbook') },
      { path: 'boring', lazy: lazyPage(() => import('./routes/Boring'), 'Boring'), handle: { calm: true } satisfies RouteHandle },
      { path: 'you-won', lazy: lazyPage(() => import('./routes/Traps'), 'YouWon') },
      { path: 'under-construction', lazy: lazyPage(() => import('./routes/Traps'), 'UnderConstruction') },
      { path: 'leave', lazy: lazyPage(() => import('./routes/Traps'), 'Leave'), handle: fullscreen },
      { path: 'checkout', lazy: lazyPage(() => import('./routes/Traps'), 'Checkout') },
      { path: 'scan', lazy: lazyPage(() => import('./routes/Scams'), 'Scan') },
      { path: 'casino', lazy: lazyPage(() => import('./routes/Scams'), 'Casino') },
      { path: 'survey', lazy: lazyPage(() => import('./routes/Survey'), 'Survey') },
      { path: 'work-from-home', lazy: lazyPage(() => import('./routes/Scams'), 'WorkFromHome') },
      { path: 'arcade', lazy: lazyPage(() => import('./routes/Arcade'), 'Arcade') },
      { path: 'desktop', lazy: lazyPage(() => import('./routes/Desktop'), 'Desktop'), handle: quiet },
      { path: 'radio', lazy: lazyPage(() => import('./routes/Radio'), 'Radio') },
      { path: 'oracle', lazy: lazyPage(() => import('./routes/Oracle'), 'Oracle') },
      { path: 'blinkie-maker', lazy: lazyPage(() => import('./routes/BlinkieMaker'), 'BlinkieMaker') },
      { path: 'stickers', lazy: lazyPage(() => import('./routes/StickerBook'), 'StickerBook') },
      { path: 'dex', lazy: lazyPage(() => import('./routes/Dex'), 'Dex'), handle: quiet },
      { path: 'popnuke', lazy: lazyPage(() => import('./routes/Popnuke'), 'Popnuke') },
      { path: 'settings', lazy: lazyPage(() => import('./routes/Settings'), 'Settings') },
      // Secret: not in the webring or sitemap, so random links never spoil them.
      { path: 'legendary/:id', lazy: lazyPage(() => import('./routes/Legendary'), 'Legendary'), handle: quiet },
      { path: '*', element: <SealedOrBSOD />, handle: unknown },
    ],
  },
]
