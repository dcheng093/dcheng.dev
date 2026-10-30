import { lazy, Suspense } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { SealedLookup } from '../hooks/useSealedPage'
import { FakeBSOD } from './FakeBSOD'

// The page itself (and its 3D world) only loads once one has actually opened.
const SealedPage = lazy(() => import('./SealedPage').then((m) => ({ default: m.Sealed })))
const black = <div aria-busy className="fixed inset-0 z-[95] bg-black" />

/**
 * Every address the site doesn't know. Usually that's the crash screen; but if a sealed page opens with this
 * address as its key (RootLayout tries, see useSealedPage), that page is here instead. Nothing in the code says
 * which addresses those are.
 */
export function SealedOrBSOD() {
  const lookup = useOutletContext<SealedLookup | undefined>()
  if (lookup?.status === 'open')
    return (
      <Suspense fallback={black}>
        <SealedPage page={lookup.page} />
      </Suspense>
    )
  // A blink of black while the key is derived: the CRT warming up, whichever it turns out to be.
  if (lookup?.status === 'opening') return black
  return <FakeBSOD />
}
