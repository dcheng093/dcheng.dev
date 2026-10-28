import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { randomRoute } from '../lib/sitemap'

/** 404s and crashes. Any key (or tap) flings you somewhere random. */
export function FakeBSOD() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const go = () => navigate(randomRoute(pathname))
    window.addEventListener('keydown', go)
    return () => window.removeEventListener('keydown', go)
  }, [navigate, pathname])

  return (
    <div
      data-testid="bsod"
      onClick={() => navigate(randomRoute(pathname))}
      className="fixed inset-0 z-[95] grid cursor-none place-items-center overflow-y-auto bg-bsod p-4 font-vt text-lg text-white sm:text-2xl"
    >
      <div className="max-w-2xl space-y-4">
        <p className="mx-auto w-fit bg-gray-300 px-2 text-bsod">DANIEL</p>
        <p>A fatal exception 0E has occurred at DANIEL:0042C0FFEE. The current page ({pathname}) will be terminated.</p>
        <ul className="list-inside list-['*_']">
          <li>Press any key to go somewhere else entirely.</li>
          <li>Press CTRL+ALT+DEL to lease a new Daniel. You will lose any unsaved horses.</li>
        </ul>
        <p className="text-center">
          Press any key to continue <span className="animate-blink">_</span>
        </p>
      </div>
    </div>
  )
}
