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

const fullscreen: RouteHandle = { noWebring: true }

/** Shared by main.tsx (createBrowserRouter) and tests (createMemoryRouter). */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <FakeBSOD />,
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
      { path: '*', element: <FakeBSOD />, handle: fullscreen },
    ],
  },
]
