import { Link, useLocation } from 'react-router-dom'
import { neighbour, randomRoute } from '../lib/sitemap'
import { useAudio } from '../audio/audioContext'
import { MIXES } from '../audio/synth'
import { icons } from '../content/assets'
import { Img } from './media/Img'
import { ButtonWall } from './chaos/ButtonWall'

/** "Daniel's Webring of One": Prev/Next/Random cycle the site's own pages; List is the real sitemap. */
export function WebringBar() {
  const { pathname } = useLocation()
  const btn = 'win-raised px-2 py-0.5 font-bold text-black'
  return (
    <nav aria-label="Webring" className="tile-checker border-t-4 border-black p-2 pb-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 border-4 border-gray-400 [border-style:ridge] bg-white p-2 text-center font-times text-black">
        <p className="flex items-center gap-2 font-bold">
          <Img slot="globe" width={32} />
          This site is a proud member of <i>Daniel’s Webring of One</i>
          <Img slot="globe" width={32} />
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <Link className={btn} to={neighbour(pathname, -1)}>« Prev</Link>
          <Link className={btn} to={randomRoute(pathname)}>Random</Link>
          <Link className={btn} to={neighbour(pathname, 1)}>Next »</Link>
          <Link className={btn} to="/boring">List Sites</Link>
        </div>
        <ButtonWall />
      </div>
    </nav>
  )
}

/** Tiny mute toggle + mix picker, deliberately parked somewhere silly. */
export function MuteButton() {
  const { muted, toggleMute, unlocked } = useAudio()
  if (!unlocked) return null
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? 'Unmute' : 'Mute'}
      data-testid="mute"
      className="fixed left-1 top-1 z-50 grid h-7 w-7 animate-spin-z overflow-hidden place-items-center rounded-full border border-black bg-white text-sm"
    >
      <Img slot={icons.speaker} width={18} className={muted ? 'opacity-40 grayscale' : ''} />
      {muted && <span aria-hidden className="absolute inset-0 m-auto h-0.5 w-6 rotate-45 bg-red-600" />}
    </button>
  )
}

export function Jukebox() {
  const { mix, setMix, muted, toggleMute } = useAudio()
  return (
    <div className="win-raised w-[260px] max-w-full p-1 font-[Tahoma,sans-serif] text-xs text-black">
      <div className="bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">DANIELAMP 2.91 — choose your mix</div>
      <div className="win-sunken my-1 bg-black p-1 font-vt text-lg text-lime">
        <span className="animate-blink">▶</span> {MIXES.find((m) => m.id === mix)?.label} {muted && '(muted)'}
      </div>
      <ul className="space-y-0.5">
        {MIXES.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => { setMix(m.id); if (muted) toggleMute() }} className={`w-full px-1 text-left ${m.id === mix ? 'bg-win-title text-white' : 'hover:bg-gray-300'}`}>
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
