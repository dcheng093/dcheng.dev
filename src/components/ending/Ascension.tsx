import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useAudio } from '../../audio/audioContext'
import { underlayFor } from '../../lib/possessedArt'
import { baptize } from '../../lib/possession'
import { mulberry32 } from '../../lib/random'
import { World3D } from '../three/Page3D'
import { ASCENSION_AT, CALM_MS, CREDITS_MS } from './timing'

const ORDER = ['still', 'undo', 'peel', 'eye', 'dawn', 'name', 'credits', 'calm'] as const
type Stage = (typeof ORDER)[number]


const STRIPS = 12
const HIT = { x: 69, y: 36 } // where the glass was hit, % of the screen (as in Cracks)

/**
 * THE ASCENSION: the end of the hunt, played the first time C:\DANIEL opens (and by DESCEND.EXE after).
 * Horror into light:
 * 1. Everything goes still and grey.
 * 2. The cracks run back into the point that was hit.
 * 3. The flesh peels away in strips.
 * 4. An eye opens in the dark, looks, and closes; its eyelid becomes a line of light that slowly fills the screen.
 *    Behind it, the possession lifts.
 * 5. Dawn over the meadow; they're asked who they are.
 * 6. Credits; then calm.
 * Nothing flashes: every brightening fades in over seconds.
 */
export function Ascension({ replay, defaultName, onDone }: { replay: boolean; defaultName: string; onDone: (name: string) => void }) {
  const [stage, setStage] = useState<Stage>('still')
  const [name, setName] = useState(defaultName)
  const { pathname } = useLocation()
  const { sfx, setMix } = useAudio()
  const flesh = underlayFor(pathname)
  // The parent re-renders on its own (clocks, windows); its callback must not restart the credits.
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })
  const cracks = useMemo(() => {
    const rng = mulberry32(666)
    return Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 + rng() * 0.25
      const r = 30 + rng() * 60
      return { x2: HIT.x + Math.cos(a) * r, y2: HIT.y + Math.sin(a) * r * 1.6 }
    })
  }, [])

  // The opening: one heartbeat in the quiet, the music gone. The rest runs on timers until the name is asked.
  useEffect(() => {
    setMix('p-quiet')
    sfx('heartbeat', { gain: 0.9 })
    const at = (ms: number, f: () => void) => window.setTimeout(f, ms)
    const timers = [
      at(1800, () => sfx('heartbeat', { gain: 0.6 })),
      at(ASCENSION_AT.undo, () => setStage('undo')),
      at(ASCENSION_AT.peel, () => setStage('peel')),
      at(ASCENSION_AT.eye, () => setStage('eye')),
      // The light lifts it: behind the black, while the eye closes, the site stops being possessed (so the dawn and
      // everything after it is the clean site), and the song with a name begins.
      at(ASCENSION_AT.eye + 6000, () => {
        setMix('daybreak')
        baptize()
      }),
      at(ASCENSION_AT.dawn, () => setStage('dawn')),
      at(ASCENSION_AT.name, () => setStage('name')),
    ]
    return () => timers.forEach((t) => window.clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one run per mount
  }, [])

  // After the name: the credits, then calm, then it's over.
  useEffect(() => {
    if (stage === 'credits') {
      const t = window.setTimeout(() => setStage('calm'), CREDITS_MS)
      return () => window.clearTimeout(t)
    }
    if (stage === 'calm') {
      const t = window.setTimeout(() => done.current(name.trim() || defaultName), CALM_MS)
      return () => window.clearTimeout(t)
    }
  }, [stage, name, defaultName])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setStage('credits')
  }
  const past = (s: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s)
  const shown = name.trim() || defaultName

  return (
    // Its words are its own: the possessed text rot (TextRot) never touches the ending.
    <div role="dialog" aria-label="The Ascension" data-testid="ascension" data-stage={stage} data-no-rot="" className="fixed inset-0 z-[130] overflow-hidden">
      {/* 1. Stillness: the page goes grey and dark behind everything else. */}
      <div className="absolute inset-0 bg-black/70 backdrop-grayscale transition-opacity duration-[3000ms]" style={{ opacity: past('undo') ? 1 : 0.6 }} />

      {/* 2. Undoing: the cracks run back into the point that was hit. */}
      {stage === 'undo' && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {cracks.map((c, i) => (
            <line key={i} x1={HIT.x} y1={HIT.y} x2={c.x2} y2={c.y2} pathLength={1} strokeDasharray="1 1" className="animate-retract" stroke="#fff" strokeOpacity={0.8} strokeWidth={0.25} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      )}

      {/* 3. Peeling: strips of the flesh come away, one by one, and there's only dark behind. */}
      {past('peel') && (
        <div className="absolute inset-0 bg-black">
          {stage === 'peel' &&
            Array.from({ length: STRIPS }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full animate-peel"
                style={{
                  left: `${(i / STRIPS) * 100}%`,
                  width: `${100 / STRIPS + 0.2}%`,
                  background: `#3a0000 url('${flesh.src}') ${-i * 100}px 0 / ${flesh.size}px auto`,
                  animationDelay: `${((i * 7) % STRIPS) * 0.55}s`,
                }}
              />
            ))}
        </div>
      )}

      {/* 4. The eye opens in the dark, looks, and closes; its eyelid becomes a line of light, and the light comes in. */}
      {stage === 'eye' && (
        <div className="absolute inset-0 grid place-items-center">
          <svg viewBox="-60 -30 120 60" width="min(60vw,520px)" className="animate-eyelid" aria-hidden>
            <path d="M-56 0 Q0 -30 56 0 Q0 30 -56 0Z" fill="#e8e0d4" stroke="#c9b48a" strokeWidth={1.5} />
            <circle r={13} fill="#8a0000" />
            <circle r={5} fill="#000" />
          </svg>
          <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 animate-lightline bg-gradient-to-r from-transparent via-[#fff3d6] to-transparent" />
        </div>
      )}

      {/* 5. Dawn, over the meadow. */}
      {past('dawn') && (
        <div className="absolute inset-0 animate-dawn">
          <World3D id="meadow" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f3c27a99] via-[#ffe6b066] to-[#fff3d633]" />
        </div>
      )}

      {stage === 'name' && (
        <form onSubmit={submit} className="absolute left-1/2 top-1/2 w-[min(360px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 animate-pop-in">
          <div className="win-raised bg-win p-0.5 font-[Tahoma,sans-serif] text-sm text-black shadow-[6px_6px_0_#0006]">
            <p className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-1 font-bold text-white">Who descended?</p>
            <div className="space-y-2 p-3">
              <label className="block">
                Your name, for the record:
                <input autoFocus maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultName} className="win-sunken mt-1 block w-full bg-white px-1" aria-label="Your name" />
              </label>
              <div className="flex justify-end gap-2">
                <button type="submit" className="win-raised min-w-[72px] px-3 py-0.5 font-bold">
                  OK
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 6. Credits. */}
      {stage === 'credits' && (
        <div className="absolute inset-x-0 top-0 h-full">
          <div className="absolute inset-x-0 top-full animate-credits text-center font-times text-[#3a1a00] [text-shadow:0_1px_8px_#fff3d6]" style={{ animationDuration: `${CREDITS_MS}ms` }}>
            <p className="text-5xl font-bold tracking-[0.3em] sm:text-6xl">THE DESCENT</p>
            <p className="mt-24 text-lg italic">made by</p>
            <p className="text-3xl font-bold">Daniel Cheng</p>
            <p className="mt-16 text-lg italic">descended by</p>
            <p className="text-3xl font-bold">{shown}</p>
            <p className="mt-24 text-xl italic">thank you for getting this far.</p>
          </div>
        </div>
      )}

      {/* 7. Calm. */}
      {stage === 'calm' && <div className="absolute inset-0 animate-rise-in bg-[#fffaf0]" />}

      {replay && stage !== 'calm' && (
        <button type="button" onClick={() => onDone(shown)} className="absolute right-3 top-3 z-10 rounded bg-black/40 px-2 py-0.5 font-[Tahoma,sans-serif] text-xs text-white">
          Skip ▸
        </button>
      )}
    </div>
  )
}
