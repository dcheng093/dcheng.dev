import { useEffect, useState, type MouseEvent } from 'react'
import { useSfx } from '../audio/audioContext'
import { Img } from '../components/media/Img'
import { Blink, RainbowText } from '../components/chaos/Chaos'
import { assets, cursors } from '../content/assets'
import { useStored } from '../hooks/useLocalStorage'
import { addHighScore, hit, miss, newRound, ROUND_MS, spawn, summary, TARGET_MS, targetScale, type AimState, type HighScore } from '../lib/aim'
import { gifCursor } from '../lib/cursor'
import { buy, click, cost, newKettle, perSecond, shouldWhistle, tick, UPGRADES, type KettleSave } from '../lib/kettleClicker'

type Game = 'aim' | 'kettle'

// Targets rotate through Daniel's faces.
const HEADS = [assets.headGrin, assets.headShock, assets.headWink]

/** DANIEL'S ARCADE: a CRT cabinet with two original mini-games. */
export function Arcade() {
  const [game, setGame] = useState<Game>('aim')
  return (
    <div data-testid="arcade" className="tile-arcade min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.joystick) }}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center font-pixel text-2xl leading-relaxed text-yellow-300 [text-shadow:3px_3px_0_#f0f] sm:text-4xl">
          <RainbowText text="DANIEL'S ARCADE" />
        </h1>
        <p className="mb-3 text-center font-pixel text-[10px] text-white">
          <Blink>INSERT COIN</Blink> · FREE PLAY ENABLED · NO REFUNDS
        </p>
        {/* The cabinet: chunky bezel around a CRT-ish screen. */}
        <div className="rounded-t-[2rem] border-8 border-[#333] bg-gradient-to-b from-[#5b1a8b] to-[#200040] p-3 shadow-[8px_8px_0_#000] sm:p-5">
          <div className="mb-3 flex justify-center gap-2" role="tablist" aria-label="Choose a game">
            {(
              [
                ['aim', 'AIM TRAINER 98'],
                ['kettle', 'KETTLE CLICKER'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={game === id}
                onClick={() => setGame(id)}
                className={`border-4 border-black px-2 py-1 font-pixel text-[10px] sm:text-xs ${game === id ? 'bg-yellow-300 text-black' : 'bg-[#333] text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-xl border-4 border-black bg-black shadow-[inset_0_0_40px_#0f0a] [background-image:repeating-linear-gradient(0deg,transparent_0_2px,#ffffff08_2px_3px)]">
            {game === 'aim' ? <AimTrainer /> : <KettleClicker />}
          </div>
        </div>
        <div className="h-6 rounded-b-lg border-x-8 border-b-8 border-[#333] bg-[#200040]" aria-hidden />
      </div>
    </div>
  )
}

function AimTrainer() {
  const sfx = useSfx()
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready')
  const [round, setRound] = useState<AimState>(newRound)
  const [now, setNow] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [scores, setScores] = useStored<HighScore[]>('aimScores', [])
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (phase !== 'playing') return
    const t = window.setInterval(() => {
      const n = performance.now()
      setNow(n)
      if (n - startedAt >= ROUND_MS) {
        setPhase('over')
        sfx('ding')
        return
      }
      // A target that shrank away counts as a miss.
      setRound((r) => (r.target && n - r.target.bornAt >= TARGET_MS ? miss(r, n, Math.random) : r))
    }, 50)
    return () => window.clearInterval(t)
  }, [phase, startedAt, sfx])

  const start = () => {
    const n = performance.now()
    setStartedAt(n)
    setNow(n)
    setRound(spawn(newRound(), n, Math.random))
    setSaved(false)
    setPhase('playing')
  }
  const onTarget = (e: MouseEvent) => {
    e.stopPropagation()
    sfx('coin')
    setRound((r) => hit(r, performance.now(), Math.random))
  }
  const onMiss = () => {
    if (phase !== 'playing') return
    sfx('error')
    setRound((r) => miss(r, performance.now(), Math.random))
  }

  const s = summary(round)
  const left = Math.max(0, Math.ceil((ROUND_MS - (now - startedAt)) / 1000))
  const qualifies = phase === 'over' && !saved && round.hits > 0 && (scores.length < 5 || s.score > scores[scores.length - 1].score)
  return (
    <div className="font-pixel text-[10px] text-lime sm:text-xs">
      <div className="flex justify-between px-3 pt-2">
        <span>HITS {round.hits}</span>
        <span>{phase === 'playing' ? `TIME ${left}` : 'AIM TRAINER 98'}</span>
        <span>MISS {round.misses}</span>
      </div>
      <div data-testid="aim-area" onPointerDown={onMiss} className="relative h-[min(60vh,380px)] select-none" style={{ cursor: 'crosshair' }}>
        {phase === 'playing' && round.target && (
          <button
            key={round.target.id}
            type="button"
            aria-label="Target"
            data-testid="aim-target"
            onPointerDown={onTarget}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${round.target.x * 100}%`, top: `${round.target.y * 100}%`, scale: `${0.35 + 0.65 * targetScale(round.target, now)}` }}
          >
            <Img slot={HEADS[round.target.id % HEADS.length]} width={64} alt="" className="pointer-events-none" />
          </button>
        )}
        {phase !== 'playing' && (
          <div className="absolute inset-0 grid place-items-center p-4 text-center">
            <div className="space-y-3">
              {phase === 'over' && (
                <div className="animate-pop-in space-y-1" data-testid="aim-results">
                  <p className="text-lg text-yellow-300">GAME OVER</p>
                  <p>SCORE {s.score}</p>
                  <p>ACCURACY {s.accuracy}% · AVG {s.avgMs}MS</p>
                </div>
              )}
              {qualifies && (
                <form
                  className="space-x-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setScores((t) => addHighScore(t, name || 'DAN', s.score))
                    setSaved(true)
                  }}
                >
                  <label htmlFor="aim-name">NEW HIGH SCORE! NAME:</label>
                  <input id="aim-name" maxLength={3} value={name} onChange={(e) => setName(e.target.value.toUpperCase())} className="w-14 border-2 border-lime bg-black px-1 text-center uppercase text-lime" />
                  <button type="submit" className="border-2 border-lime px-1">OK</button>
                </form>
              )}
              <button type="button" onClick={start} className="animate-pulse-scale border-4 border-lime bg-black px-3 py-2 text-sm text-lime">
                {phase === 'over' ? 'PLAY AGAIN' : 'PRESS START'}
              </button>
              <p className="text-white">Click Daniel's head before it shrinks away. 30 seconds. Misses count.</p>
            </div>
          </div>
        )}
      </div>
      <ol className="border-t-2 border-lime/40 px-3 py-2" aria-label="High scores">
        <li className="text-yellow-300">HIGH SCORES</li>
        {scores.length === 0 && <li className="text-white">NO SCORES YET. BE THE FIRST.</li>}
        {scores.map((h, i) => (
          <li key={i}>
            {i + 1}. {h.name} {String(h.score).padStart(6, '0')}
          </li>
        ))}
      </ol>
    </div>
  )
}

function KettleClicker() {
  const sfx = useSfx()
  const [save, setSave] = useStored<KettleSave>('kettleClicker', newKettle())
  const [puffs, setPuffs] = useState<{ id: number; x: number }[]>([])
  // Boiled before this visit? Then no whistle; otherwise it whistles the moment the total hits 100°.
  const [boiledBefore] = useState(save.whistled)
  const [squash, setSquash] = useState(0)

  const advance = (step: (s: KettleSave) => KettleSave) => setSave((s) => {
    const next = step(s)
    return shouldWhistle(next) ? { ...next, whistled: true } : next
  })

  useEffect(() => {
    const t = window.setInterval(() => setSave((s) => {
      const next = tick(s)
      return shouldWhistle(next) ? { ...next, whistled: true } : next
    }), 1000)
    return () => window.clearInterval(t)
  }, [setSave])

  const whistle = save.whistled && !boiledBefore
  useEffect(() => {
    if (whistle) sfx('ding')
  }, [whistle, sfx])

  const boil = () => {
    advance(click)
    setSquash((n) => n + 1)
    const id = Date.now() + Math.random()
    setPuffs((p) => [...p.slice(-8), { id, x: 30 + Math.random() * 40 }])
  }
  const rate = perSecond(save)
  return (
    <div className="grid gap-3 p-3 font-pixel text-[10px] text-lime sm:grid-cols-[1fr_1.2fr] sm:text-xs">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-lg text-yellow-300" data-testid="degrees">{Math.floor(save.degrees)}°</p>
        <p>{rate.toFixed(1)}° PER SECOND</p>
        <div className="relative">
          <button key={squash} type="button" onClick={boil} aria-label="Boil the kettle" data-testid="kettle-button" className="animate-squash">
            <Img slot={assets.kettle} width={120} alt="" />
          </button>
          {puffs.map((p) => (
            <span key={p.id} aria-hidden onAnimationEnd={() => setPuffs((ps) => ps.filter((x) => x.id !== p.id))} className="pointer-events-none absolute top-0 animate-float-up text-yellow-300" style={{ left: `${p.x}%` }}>
              +1°
            </span>
          ))}
        </div>
        {whistle && (
          <p role="status" className="animate-pop-in text-hotpink">
            WHEEEEEE! 100°C! THE KETTLE HAS BOILED!
          </p>
        )}
        <p className="text-white">LIFETIME: {Math.floor(save.total)}°</p>
      </div>
      <ul className="space-y-2">
        {UPGRADES.map((u) => {
          const owned = save.owned[u.id] ?? 0
          const price = cost(u, owned)
          const afford = save.degrees >= price
          return (
            <li key={u.id}>
              <button
                type="button"
                disabled={!afford}
                onClick={() => {
                  advance((s) => buy(s, u.id))
                  sfx('coin')
                }}
                className={`w-full border-2 p-2 text-left ${afford ? 'border-lime hover:bg-lime/10' : 'border-gray-600 text-gray-500'}`}
              >
                <span className="flex justify-between">
                  <span>{u.name}</span>
                  <span>x{owned}</span>
                </span>
                <span className="block text-[9px] text-white">{u.blurb}</span>
                <span className="block">{price}° · +{u.perSecond}°/S</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
