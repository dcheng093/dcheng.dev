import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSfx } from '../audio/audioContext'
import { Img } from '../components/media/Img'
import { WavyText } from '../components/chaos/Chaos'
import { assets, cursors, icons } from '../content/assets'
import { fortunes } from '../content/fortunes'
import { gifCursor } from '../lib/cursor'
import { dailyBrew, fortuneFor } from '../lib/oracle'

const BOIL_MS = 3000

/** Ask the Magic Kettle. It boils, it steams, it decides. Same question, same day, same answer. */
export function Oracle() {
  const [question, setQuestion] = useState('')
  const [phase, setPhase] = useState<'idle' | 'boiling' | 'done'>('idle')
  const [temp, setTemp] = useState(20)
  const [answer, setAnswer] = useState('')
  const [typed, setTyped] = useState(0)
  const sfx = useSfx()
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearInterval(t)), [])

  const boil = (e: FormEvent) => {
    e.preventDefault()
    if (!question.trim() || phase === 'boiling') return
    setPhase('boiling')
    setTemp(20)
    setTyped(0)
    setAnswer(fortuneFor(question, new Date(), fortunes))
    const start = Date.now()
    const t = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / BOIL_MS)
      setTemp(Math.round(20 + p * 80))
      if (p >= 1) {
        window.clearInterval(t)
        sfx('ding')
        setPhase('done')
        // Type the fortune out like an old terminal.
        const type = window.setInterval(() => setTyped((n) => n + 1), 28)
        timers.current.push(type)
      }
    }, 100)
    timers.current.push(t)
  }

  const boiling = phase === 'boiling'
  return (
    <div data-testid="oracle" className="tile-oracle min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.coffee) }}>
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <h1 className="font-times text-4xl font-bold italic text-[#fd0] [text-shadow:0_0_10px_#f0f,2px_2px_0_#000] sm:text-5xl">
          <WavyText text="The Magic Kettle" />
        </h1>
        <p className="font-comic text-lg text-white [text-shadow:1px_1px_0_#000]">Ask, and it shall boil.</p>

        <div className="relative mx-auto grid h-44 w-44 place-items-end justify-center">
          {/* Steam: three puffs on staggered loops while it boils. */}
          {boiling &&
            [0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                className="absolute bottom-24 h-8 w-8 animate-steam rounded-full bg-white/70 blur-[2px]"
                style={{ animationDelay: `${i * 0.6}s`, left: `${40 + i * 18}%`, ['--sx' as string]: `${(i - 1) * 16}px` }}
              />
            ))}
          <Img slot={assets.kettle} width={140} className={boiling ? 'animate-shake' : phase === 'done' ? 'animate-squash' : 'animate-wobble'} alt="the magic kettle" />
        </div>

        <form onSubmit={boil} className="win-raised space-y-2 p-3 text-black">
          <label className="block font-bold" htmlFor="oracle-q">Your question for the kettle:</label>
          <input
            id="oracle-q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={120}
            placeholder="Will my code compile first try?"
            className="win-sunken w-full bg-white px-2 py-1 font-comic"
          />
          <button type="submit" disabled={boiling || !question.trim()} className="win-raised w-full py-1 font-impact text-2xl text-red-700 disabled:opacity-50">
            {boiling ? `BOILING… ${temp}°C` : 'BOIL!'}
          </button>
          <div className="win-sunken h-3 bg-white" aria-hidden>
            <div className="h-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-600 transition-[width]" style={{ width: `${temp}%` }} />
          </div>
        </form>

        {phase === 'done' && (
          <div role="status" data-testid="fortune" className="animate-pop-in border-4 border-double border-[#fd0] bg-[#2a0040]/90 p-4 font-vt text-2xl text-[#fd0]" aria-label={answer}>
            <span aria-hidden>{answer.slice(0, typed)}</span>
            {typed < answer.length && <span aria-hidden className="animate-blink">▌</span>}
          </div>
        )}

        <aside className="win-raised flex items-center gap-3 p-2 text-left text-black">
          <Img slot={icons.teapot} width={48} />
          <p className="font-comic text-sm">
            <b>Today's Brew:</b> {dailyBrew(new Date(), fortunes)}
          </p>
        </aside>
      </div>
    </div>
  )
}
