import { useEffect, useRef } from 'react'
import { useAudio } from '../audio/audioContext'
import { findTrack, useMixes } from '../audio/tracks'
import { Marquee, WavyText } from '../components/chaos/Chaos'
import { VolumeSlider } from '../components/WebringBar'
import { cursors } from '../content/assets'
import { gifCursor } from '../lib/cursor'
import { pick } from '../lib/random'

const SHOUTOUTS = [
  'DJ DANIEL IN THE MIX',
  'SHOUT OUT TO EVERYONE STILL ON DIAL-UP',
  'THIS NEXT ONE GOES OUT TO THE NORMINETTE. YOU KNOW WHAT YOU DID.',
  'CALLER 9 WINS A KETTLE (THERE IS NO KETTLE)',
  'NO ADS ON DANIEL FM* (*SEE ENTIRE REST OF WEBSITE)',
  'REQUEST LINE IS OPEN. IT IS A BUTTON. PRESS IT.',
]

const freq = (i: number) => (88.1 + i * 1.3).toFixed(1)

/** DANIEL FM: a boombox that tunes through every track, with a live visualizer off the site's own audio graph. */
export function Radio() {
  const { unlocked, muted, mix, setMix, toggleMute, setLocked, getAnalyser } = useAudio()
  const mixes = useMixes()
  const canvas = useRef<HTMLCanvasElement>(null)
  const speakers = useRef<(HTMLDivElement | null)[]>([])
  const i = Math.max(0, mixes.indexOf(findTrack(mix)))

  // Tuning in on the radio is an explicit choice, so it pins the song for the rest of the site.
  const tune = (index: number) => {
    setMix(mixes[(index + mixes.length) % mixes.length].id)
    setLocked(true)
    if (muted) toggleMute()
  }

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    const analyser = getAnalyser()
    if (!ctx || !analyser) return
    const bins = new Uint8Array(analyser.frequencyBinCount)
    let raf = 0
    const draw = () => {
      analyser.getByteFrequencyData(bins)
      const { width: w, height: h } = ctx.canvas
      ctx.fillStyle = '#001a00'
      ctx.fillRect(0, 0, w, h)
      const bw = w / bins.length
      bins.forEach((v, b) => {
        // Chunky LED segments, green to yellow to red.
        const segs = Math.round((v / 255) * 10)
        for (let s = 0; s < segs; s++) {
          ctx.fillStyle = s > 7 ? '#f33' : s > 5 ? '#fd0' : '#0f0'
          ctx.fillRect(b * bw + 1, h - (s + 1) * (h / 10) + 1, bw - 2, h / 10 - 2)
        }
      })
      const bass = (bins[1] + bins[2] + bins[3]) / (3 * 255)
      speakers.current.forEach((sp) => sp && (sp.style.scale = `${1 + bass * 0.12}`))
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [getAnalyser, unlocked])

  const btn = 'win-raised px-3 py-1 font-bold text-black'
  return (
    <div data-testid="radio" className="tile-radio min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.arcade) }}>
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-center font-impact text-5xl text-yellow-300 [text-shadow:3px_3px_0_#c00,6px_6px_0_#000] sm:text-7xl">
          <WavyText text="DANIEL FM" />
        </h1>
        <p className="text-center font-vt text-xl text-white [text-shadow:1px_1px_0_#000]">{freq(i)} MHz · ALL DANIEL, ALL THE TIME</p>

        {/* The boombox. */}
        <div className="rounded-3xl border-4 border-black bg-gradient-to-b from-[#ccc] to-[#777] p-3 shadow-[8px_8px_0_#000] sm:p-5">
          <div className="mx-auto -mt-8 mb-2 h-6 w-2/3 rounded-t-xl border-4 border-b-0 border-black" aria-hidden />
          <div className="grid grid-cols-[1fr_2fr_1fr] items-center gap-2 sm:gap-4">
            {[0, 1].map((n) => (
              <div
                key={n}
                ref={(el) => {
                  speakers.current[n] = el
                }}
                aria-hidden
                className={`${n ? 'order-3' : ''} aspect-square rounded-full border-4 border-black bg-[radial-gradient(circle,#222_20%,#555_22%,#111_45%,#333_47%,#000_70%)] shadow-[inset_0_0_12px_#000]`}
              />
            ))}
            <div className="order-2 min-w-0 space-y-2">
              <div className="rounded border-4 border-black bg-[#9c3] p-1 font-vt text-lg leading-tight text-[#132] shadow-[inset_0_0_8px_#0006]" data-testid="radio-lcd">
                <div className="flex justify-between">
                  <span>FM {freq(i)}</span>
                  <span>{muted || !unlocked ? '■ STOP' : '▶ ON AIR'}</span>
                </div>
                <Marquee speed={10}>{findTrack(mix).label.toUpperCase()} ··· {SHOUTOUTS[i % SHOUTOUTS.length]}</Marquee>
              </div>
              <canvas ref={canvas} width={320} height={80} className="w-full rounded border-4 border-black" aria-label="Audio visualizer" />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <VolumeSlider className="rounded border-4 border-black bg-[#9c3] px-2 py-1 font-bold text-[#132] shadow-[inset_0_0_8px_#0006]" />
            <input
              type="range"
              min={0}
              max={mixes.length - 1}
              value={i}
              onChange={(e) => tune(Number(e.target.value))}
              aria-label="Tuning dial"
              className="w-full accent-red-600"
            />
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" className={btn} onClick={() => tune(i - 1)} aria-label="Tune down">◀◀ TUNE</button>
              <button type="button" className={`${btn} min-w-24`} onClick={toggleMute}>{muted ? '▶ PLAY' : '❚❚ PAUSE'}</button>
              <button type="button" className={btn} onClick={() => tune(i + 1)} aria-label="Tune up">TUNE ▶▶</button>
              <button type="button" className={`${btn} animate-pulse-scale bg-yellow-300`} onClick={() => tune(mixes.indexOf(pick(mixes.filter((m) => m.id !== mix))))}>
                ☎ REQUEST LINE
              </button>
            </div>
          </div>
        </div>

        {!unlocked && <p className="win-raised p-2 text-center font-comic text-black">The radio is off. Click anywhere to switch it on.</p>}

        <ol className="win-raised grid gap-1 p-2 text-sm text-black sm:grid-cols-2" aria-label="Stations">
          {mixes.map((m, n) => (
            <li key={m.id}>
              <button type="button" onClick={() => tune(n)} className={`w-full px-1 text-left font-vt text-lg ${n === i ? 'bg-win-title text-white' : 'hover:bg-gray-300'}`}>
                {freq(n)} — {m.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
