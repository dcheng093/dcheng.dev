import { useEffect, useRef, useState } from 'react'
import { useLocation, useRouteError } from 'react-router-dom'
import { isChunkLoadError, reloadForNewDeploy } from '../lib/staleDeploy'
import { FakeBSOD } from './FakeBSOD'

const isBoring = (path: string) => /^\/boring\/?$/i.test(path)

/**
 * Whatever goes wrong while a page loads or renders. A page whose code is from an older deploy just loads again
 * (staleDeploy.ts). Anything else is logged, so the real cause is in the console, then: on the fun site, the crash
 * screen; on the boring site, a plain error, because that one is a normal website. Imported up front (routes.tsx), never
 * lazily, so it can still show when loading code is the very thing that failed.
 */
export function RouteError() {
  const error = useRouteError()
  const { pathname } = useLocation()
  const chunk = isChunkLoadError(error)
  // Whether the fresh load was started: null until tried (a ref, so StrictMode's second effect run doesn't try again).
  const tried = useRef<boolean | null>(null)
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    if (chunk) {
      tried.current ??= reloadForNewDeploy()
      if (tried.current) return
      setGaveUp(true)
    }
    console.error('Route error:', error)
  }, [error, chunk])

  // A blink of the page's own background while it comes back.
  if (chunk && !gaveUp) return <div data-testid="route-reloading" className={`fixed inset-0 ${isBoring(pathname) ? 'bg-[#0a0a0a]' : 'bg-black'}`} />
  if (isBoring(pathname)) return <BoringError />
  return <FakeBSOD />
}

function BoringError() {
  return (
    <div
      data-testid="boring-error"
      role="alert"
      className="fixed inset-0 z-[95] grid place-items-center bg-[#0a0a0a] p-6 font-sans text-[#f4f1ea]"
    >
      <div className="max-w-md text-center">
        <p className="text-2xl font-semibold tracking-tight">Something went wrong loading this page.</p>
        <p className="mt-3 text-[#f4f1ea]/60">Reloading usually sorts it out.</p>
        <button
          type="button"
          onClick={() => location.replace(location.href)}
          className="mt-8 rounded-full bg-[#f4f1ea] px-6 py-2.5 font-semibold text-[#16161d] transition-transform duration-300 hover:scale-105"
        >
          Reload
        </button>
      </div>
    </div>
  )
}
