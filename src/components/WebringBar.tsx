import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from './Link'
import { neighbour, randomRoute } from '../lib/sitemap'
import { useAudio } from '../audio/audioContext'
import { findTrack, MIXES, type MixId } from '../audio/tracks'
import { useStored } from '../hooks/useLocalStorage'
import { icons } from '../content/assets'
import { Img } from './media/Img'
import { ButtonWall } from './chaos/ButtonWall'
import { Marquee } from './chaos/Chaos'

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

/**
 * Tiny spinning mute toggle. It lives in the taskbar's tray; pages without a taskbar (the fullscreen gags) get the
 * `floating` one, parked top-left.
 */
export function MuteButton({ floating = false }: { floating?: boolean }) {
  const { muted, toggleMute, unlocked } = useAudio()
  if (!unlocked) return null
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? 'Unmute' : 'Mute'}
      data-testid="mute"
      className={`${floating ? 'fixed left-1 top-1 z-50 h-7 w-7' : 'relative h-6 w-6 shrink-0'} grid animate-spin-z overflow-hidden place-items-center rounded-full border border-black bg-white text-sm`}
    >
      <Img slot={icons.speaker} width={18} className={muted ? 'opacity-40 grayscale' : ''} />
      {muted && <span aria-hidden className="absolute inset-0 m-auto h-0.5 w-6 rotate-45 bg-red-600" />}
    </button>
  )
}

const titleBar = 'flex items-center gap-1 bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white'

/** Picking a mix also unmutes: choosing a song and hearing nothing would be confusing. */
function useMixPicker() {
  const { setMix, muted, toggleMute } = useAudio()
  return (id: MixId) => {
    setMix(id)
    if (muted) toggleMute()
  }
}

/** Scrollable track list; ♪ is a built-in synth song, 💿 an audio file from src/music/. */
function MixList({ className = '' }: { className?: string }) {
  const { mix } = useAudio()
  const pick = useMixPicker()
  const list = useRef<HTMLUListElement>(null)
  // Keep the playing track in view after ⏮/⏭. Sets scrollTop directly: scrollIntoView would also scroll the page.
  useEffect(() => {
    const ul = list.current
    const li = ul?.querySelector<HTMLElement>('[aria-current="true"]')
    if (ul && li) ul.scrollTop = li.offsetTop - (ul.clientHeight - li.offsetHeight) / 2
  }, [mix])
  return (
    <ul ref={list} className={`win-sunken relative space-y-0.5 overflow-y-auto overflow-x-hidden bg-white ${className}`}>
      {MIXES.map((m) => (
        <li key={m.id} aria-current={m.id === mix}>
          <button type="button" onClick={() => pick(m.id)} className={`w-full px-1 text-left ${m.id === mix ? 'bg-win-title text-white' : 'hover:bg-gray-300'}`}>
            {m.kind === 'file' ? '♪' : '♪'} {m.label}
          </button>
        </li>
      ))}
    </ul>
  )
}

/** 📌 keeps the visitor's pick playing everywhere instead of each page's theme song. */
function LockButton({ className = '' }: { className?: string }) {
  const { locked, toggleLock } = useAudio()
  return (
    <button
      type="button"
      onClick={toggleLock}
      aria-pressed={locked}
      aria-label="Lock song"
      title={locked ? 'Song locked: plays on every page' : 'Lock this song (otherwise each page plays its own)'}
      className={`win-raised px-1 font-bold ${locked ? 'bg-yellow-300 [border-color:#404040_#fff_#fff_#404040]' : ''} ${className}`}
    >
      📌
    </button>
  )
}

/** Win95-style volume trackbar: one level for the music and the sound effects. */
export function VolumeSlider({ className = '' }: { className?: string }) {
  const { volume, setVolume, muted } = useAudio()
  const pct = Math.round(volume * 100)
  return (
    <label className={`flex items-center gap-1 ${className}`}>
      <Img slot={icons.speaker} width={16} className={muted || pct === 0 ? 'opacity-40 grayscale' : ''} />
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        aria-label="Volume"
        data-testid="volume"
        className="h-4 min-w-0 flex-1 cursor-pointer accent-win-title"
      />
      <span className="w-8 text-right font-vt text-sm" aria-hidden>
        {pct}%
      </span>
    </label>
  )
}

export function Jukebox() {
  const { mix, muted } = useAudio()
  return (
    <div className="win-raised w-[260px] max-w-full p-1 font-[Tahoma,sans-serif] text-xs text-black">
      <div className={titleBar}>DANIELAMP 2.91 — choose your mix</div>
      <div className="win-sunken my-1 bg-black p-1 font-vt text-lg text-lime">
        <span className="animate-blink">▶</span> {findTrack(mix).label} {muted && '(muted)'}
      </div>
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="text-[10px]">Each page has its own song. Pin one to keep it.</span>
        <LockButton />
      </div>
      <VolumeSlider className="mb-1" />
      <MixList className="max-h-56" />
    </div>
  )
}

/** Floating DANIELAMP for every page except Home (which has the full Jukebox inline). */
export function MiniPlayer() {
  const { unlocked, mix, muted, toggleMute } = useAudio()
  const pick = useMixPicker()
  const [minimised, setMinimised] = useStored('playerMinimised', false)
  if (!unlocked) return null
  const i = MIXES.indexOf(findTrack(mix))
  const skip = (step: 1 | -1) => pick(MIXES[(i + step + MIXES.length) % MIXES.length].id)
  const transport = 'win-raised flex-1 py-0.5 font-bold text-black'
  return (
    <section
      aria-label="Music player"
      data-testid="mini-player"
      className={`win-raised fixed bottom-2 left-2 z-50 max-sm:bottom-12 p-0.5 font-[Tahoma,sans-serif] text-xs text-black shadow-[4px_4px_0_#000] ${minimised ? '' : 'w-[min(230px,calc(100vw-16px))]'}`}
    >
      <div className={titleBar}>
        <span className="flex-1 truncate">{minimised ? `♫ ${MIXES[i].label}` : 'DANIELAMP 2.91'}</span>
        <button
          type="button"
          onClick={() => setMinimised((m) => !m)}
          aria-label={minimised ? 'Restore player' : 'Minimise player'}
          className="win-raised grid h-4 w-4 place-items-center leading-none text-black"
        >
          {minimised ? '□' : '_'}
        </button>
      </div>
      {!minimised && (
        <div className="p-1">
          <div className="win-sunken mb-1 bg-black p-1 font-vt text-lg leading-tight text-lime" data-testid="now-playing">
            <Marquee speed={8}>
              {i + 1}. DANIEL — {MIXES[i].label} {muted ? '(PAUSED)' : '*** NOW PLAYING ***'}
            </Marquee>
          </div>
          <div className="mb-1 flex gap-1">
            <button type="button" className={transport} onClick={() => skip(-1)} aria-label="Previous track">◀◀</button>
            <button type="button" className={transport} onClick={toggleMute} aria-label={muted ? 'Play' : 'Pause'}>{muted ? '▶' : '❚❚'}</button>
            <button type="button" className={transport} onClick={() => skip(1)} aria-label="Next track">▶▶</button>
            <LockButton />
          </div>
          <VolumeSlider className="mb-1" />
          {/* Phones get just the transport and volume: the full list would cover half the page. */}
          {/* Phones (either way up) skip the list: on a short screen it covered half the page. ◀◀ ▶▶ still pick. */}
          <MixList className="max-h-40 max-sm:hidden [@media(max-height:500px)]:hidden" />
        </div>
      )}
    </section>
  )
}
