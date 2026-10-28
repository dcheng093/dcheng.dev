import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { gifCursor } from '../lib/cursor'
import { cursors, dividers, selfies } from '../content/assets'
import { SURVEY } from '../content/survey'
import { NEW_SURVEY, claimedTotal, fleeGivesUp, possess, questionNumber, resultRows, type Interrupt, type Question, type SurveyProgress } from '../lib/survey'
import { useStored } from '../hooks/useLocalStorage'
import { AdSlot } from '../components/ads/AdSlot'
import { Img } from '../components/media/Img'
import { GifDivider, ViewersNow } from '../components/chaos/Chaos'
import { useSfx } from '../audio/audioContext'

/**
 * "Answer 3 quick questions to win a FREE HORSE!!!" There are a hundred, in every kind of form control the 2000s
 * had, with interruptions, and the total always claims you're on the last one. Progress survives leaving the page
 * (this visit), and the end is a results page comparing you with everyone else (who all love Daniel).
 */
export function Survey() {
  const [progress, setProgress] = useStored<SurveyProgress>('survey', NEW_SURVEY, 'session')
  const sfx = useSfx()
  const step = Math.min(progress.step, SURVEY.length)
  const current = SURVEY[step]
  const n = questionNumber(SURVEY, step)

  const advance = (answer?: string) => {
    sfx('click')
    setProgress((p) => ({ step: p.step + 1, answers: current && answer !== undefined ? { ...p.answers, [current.id]: answer } : p.answers }))
  }
  const restart = () => setProgress(NEW_SURVEY)

  return (
    <div data-testid="survey" className="tile-cherubs min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.pencilGreen) }}>
      <div className="mx-auto max-w-xl space-y-4 border-4 border-blue-800 bg-white p-4 text-center text-black">
        <h1 className="font-impact text-3xl text-blue-800 sm:text-4xl">CUSTOMER SATISFACTION SURVEY</h1>
        <p className="font-comic">
          Answer <b>3 quick questions</b> to win a <b>FREE HORSE</b>!!! <Img slot="horses" width={60} className="inline-block" />
        </p>
        {!current ? (
          <Results answers={progress.answers} restart={restart} />
        ) : (
          <fieldset key={current.id} data-kind={current.kind} data-step={current.id} className="win-raised space-y-3 p-3 text-left font-[Verdana,sans-serif] text-sm">
            <legend className="bg-win-title px-1 font-bold text-white">{current.kind === 'interrupt' ? 'SYSTEM MESSAGE' : `Question ${n} of ${claimedTotal(n)}`}</legend>
            <div className="win-sunken h-3 w-full bg-white">
              <div className="h-full bg-win-title" style={{ width: `${(n / claimedTotal(n)) * 100}%` }} />
            </div>
            {current.kind === 'interrupt' ? <Interruption step={current} next={() => advance()} /> : <Ask question={current} answer={advance} />}
            {n >= 4 && <p className="animate-blink text-xs font-bold text-red-600">Almost there!!! (you are not almost there)</p>}
          </fieldset>
        )}
        {current && step > 0 && (
          <button type="button" onClick={restart} className="font-comic text-xs text-blue-800 underline">
            Start over (you will lose your progress towards the horse)
          </button>
        )}
        <GifDivider slot={dividers.pinkDots} />
        <ViewersNow thing="this survey" />
      </div>
    </div>
  )
}

const button = 'win-raised px-2 py-1 text-left'
const nextButton = 'win-raised self-end px-3 py-1 font-bold disabled:text-win-dark'

function Ask({ question, answer }: { question: Question; answer: (a: string) => void }) {
  return (
    <>
      <p className="font-bold">{question.q}</p>
      {question.kind === 'choice' && (
        <div className="flex flex-col gap-1">
          {question.a.map((a, i) => (
            <button key={i} type="button" onClick={() => answer(a)} className={button}>
              ○ {a}
            </button>
          ))}
        </div>
      )}
      {question.kind === 'scale' && <Scale answer={answer} />}
      {question.kind === 'checks' && <Checks options={question.options} answer={answer} />}
      {question.kind === 'text' && <Possessed answer={answer} />}
      {question.kind === 'select' && <Dropdown options={question.options} answer={answer} />}
      {question.kind === 'flee' && <Flee yes={question.yes} no={question.no} answer={answer} />}
    </>
  )
}

/** A 1–10 slider that is, and will always be, at 10. */
function Scale({ answer }: { answer: (a: string) => void }) {
  const [tried, setTried] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2">
        <span>1</span>
        <input type="range" min={1} max={10} value={10} onChange={() => setTried(true)} aria-label="Rating" className="min-w-0 flex-1 accent-win-title" />
        <span>10</span>
      </label>
      <p className="text-center font-impact text-xl text-blue-800">
        10 <span className="font-[Verdana,sans-serif] text-xs text-gray-700">{tried ? '(nice try)' : '(you can’t argue with science)'}</span>
      </p>
      <button type="button" className={nextButton} onClick={() => answer('10')}>
        Next ›
      </button>
    </div>
  )
}

/** Tick what you like. The ones about liking Daniel won't come unticked. */
function Checks({ options, answer }: { options: { label: string; locked?: boolean }[]; answer: (a: string) => void }) {
  const [ticked, setTicked] = useState(() => new Set(options.filter((o) => o.locked).map((o) => o.label)))
  const [nope, setNope] = useState<string | null>(null)
  const toggle = (o: { label: string; locked?: boolean }) => {
    if (o.locked) return setNope(o.label)
    setTicked((t) => {
      const next = new Set(t)
      if (next.has(o.label)) next.delete(o.label)
      else next.add(o.label)
      return next
    })
  }
  return (
    <div className="flex flex-col gap-1">
      {options.map((o) => (
        <label key={o.label} className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={ticked.has(o.label)} onChange={() => toggle(o)} />
          {o.label}
          {nope === o.label && <span className="text-xs text-red-600">nice try</span>}
        </label>
      ))}
      <button type="button" className={nextButton} onClick={() => answer(options.map((o) => o.label).filter((l) => ticked.has(l)).join(', '))}>
        Next ›
      </button>
    </div>
  )
}

/** Type anything you like. It comes out as Daniel. */
function Possessed({ answer }: { answer: (a: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={value}
        maxLength={60}
        onChange={(e) => setValue(possess(e.target.value.length))}
        aria-label="Your answer"
        className="win-sunken bg-white px-1 py-0.5"
        autoComplete="off"
      />
      <button type="button" className={nextButton} disabled={!value.trim()} onClick={() => answer(value.trim())}>
        Next ›
      </button>
    </div>
  )
}

function Dropdown({ options, answer }: { options: string[]; answer: (a: string) => void }) {
  const [value, setValue] = useState(options[0])
  return (
    <div className="flex flex-col gap-2">
      <select value={value} onChange={(e) => setValue(e.target.value)} aria-label="Your answer" className="win-sunken bg-white px-1 py-0.5">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <button type="button" className={nextButton} onClick={() => answer(value)}>
        Next ›
      </button>
    </div>
  )
}

// Where No runs to, in turn: always away from Yes (never on top of it, or there'd be nothing left to click), and
// small enough to stay on a phone screen.
const HOPS = [
  [44, -14],
  [70, 10],
  [20, 22],
] as const

/** Yes, or a No that runs away (from the mouse, or from a tap) until it gives up and becomes a Yes. */
function Flee({ yes, no, answer }: { yes: string; no: string; answer: (a: string) => void }) {
  const [escapes, setEscapes] = useState(0)
  const gaveUp = fleeGivesUp(escapes)
  const run = () => !gaveUp && setEscapes((e) => e + 1)
  const [x, y] = escapes ? HOPS[(escapes - 1) % HOPS.length] : [0, 0]
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button type="button" className="win-raised px-4 py-1 font-bold" onClick={() => answer(yes)}>
        {yes}
      </button>
      <button
        type="button"
        className="win-raised px-4 py-1 transition-transform duration-100"
        style={{ transform: gaveUp ? undefined : `translate(${x}px, ${y}px)` }}
        onPointerEnter={(e) => e.pointerType === 'mouse' && run()}
        onClick={() => (gaveUp ? answer(yes) : run())}
      >
        {gaveUp ? `${yes} (we heard you)` : no}
      </button>
    </div>
  )
}

function Interruption({ step, next }: { step: Interrupt; next: () => void }) {
  switch (step.variant) {
    case 'expired':
      return (
        <div className="space-y-2 text-center">
          <p className="font-bold text-red-700">⚠ Your session has expired. Please start again.</p>
          <button type="button" className="win-raised px-3 py-1" onClick={next}>
            Start again
          </button>
          <p className="text-xs text-gray-600">(just kidding, your answers are safe with Daniel)</p>
        </div>
      )
    case 'captcha':
      return <Captcha next={next} />
    case 'ad':
      return <AdBreak next={next} />
  }
}

/** "Select all squares containing Daniel." They all contain Daniel. */
function Captcha({ next }: { next: () => void }) {
  const [picked, setPicked] = useState(new Set<number>())
  const [verified, setVerified] = useState(false)
  const tiles = Array.from({ length: 9 }, (_, i) => selfies[i % selfies.length])
  if (verified)
    return (
      <div className="space-y-2 text-center">
        <p className="font-bold text-green-700">✔ Correct! They were all Daniel.</p>
        <button type="button" className="win-raised px-3 py-1" onClick={next}>
          Continue ›
        </button>
      </div>
    )
  return (
    <Panel title="Please verify you are human: select all squares containing Daniel.">
      <div className="mx-auto grid w-full max-w-[240px] grid-cols-3 gap-1">
        {tiles.map((s, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Square ${i + 1}`}
            aria-pressed={picked.has(i)}
            onClick={() => setPicked((p) => (p.has(i) ? new Set([...p].filter((x) => x !== i)) : new Set(p).add(i)))}
            className={`aspect-square overflow-hidden border-2 ${picked.has(i) ? 'border-blue-700 opacity-70' : 'border-transparent'}`}
          >
            <img src={s.src} alt="" className="h-full w-full object-cover [image-rendering:pixelated]" />
          </button>
        ))}
      </div>
      <button type="button" className="win-raised mt-2 px-3 py-1 disabled:text-win-dark" disabled={!picked.size} onClick={() => setVerified(true)}>
        Verify
      </button>
    </Panel>
  )
}

const AD_SECONDS = 3

/** A word from our sponsors; the survey continues in 3… 2… 1… */
function AdBreak({ next }: { next: () => void }) {
  const [left, setLeft] = useState(AD_SECONDS)
  useEffect(() => {
    if (!left) return
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])
  return (
    <Panel title={left ? `ADVERTISEMENT: your survey will continue in ${left}…` : 'ADVERTISEMENT: thank you for watching'}>
      <AdSlot format="square" className="mx-auto" />
      <button type="button" className="win-raised mt-2 px-3 py-1 disabled:text-win-dark" disabled={left > 0} onClick={next}>
        {left ? `Skip ad in ${left}` : 'Skip ad ›'}
      </button>
    </Panel>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-bold">{title}</p>
      {children}
    </div>
  )
}

/** Your answers vs everyone else's. Everyone else loves Daniel. */
function Results({ answers, restart }: { answers: Record<string, string>; restart: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="space-y-3" role="status" data-testid="survey-results">
      <p className="font-impact text-2xl text-green-700">THANK YOU!!!</p>
      <p className="font-impact text-xl text-blue-800">YOUR ANSWERS vs EVERYONE ELSE’S</p>
      <ul className="space-y-3 text-left font-[Verdana,sans-serif] text-xs">
        {resultRows(answers).map((r) => (
          <li key={r.id} className="win-raised p-2">
            <p className="mb-1 font-bold">{r.label}</p>
            <Bar who="You" answer={r.you} colour="bg-hotpink" />
            <Bar who="Everyone else" answer={r.everyone} colour="bg-win-title" />
            <p className={`mt-1 ${r.agree ? 'text-green-700' : 'text-red-600'}`}>{r.agree ? '✔ You agree with everyone.' : '✘ Everyone else is right.'}</p>
          </li>
        ))}
      </ul>
      <p className="font-comic">Statistically, you are 0.0% unique.</p>
      <p className="font-comic">Your horse will arrive in 6–8 business decades. To confirm delivery, please claim your prize below.</p>
      <button type="button" onClick={() => navigate('/you-won')} className="animate-pulse-scale border-2 border-black bg-red-600 px-4 py-1 font-impact text-xl text-white">
        CLAIM MY HORSE »
      </button>
      <button type="button" onClick={restart} className="block w-full font-comic text-xs text-blue-800 underline">
        Take the survey again
      </button>
    </div>
  )
}

/** One person, one answer: 100% of you said it. 100% of everyone else said theirs. */
function Bar({ who, answer, colour }: { who: string; answer: string; colour: string }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0">{who}</span>
        <div className="win-sunken h-4 min-w-0 flex-1 bg-white">
          <div className={`h-full w-full ${colour}`} />
        </div>
        <span className="w-10 shrink-0 text-right">100%</span>
      </div>
      <p className="truncate pl-[6.5rem] text-gray-700">“{answer}”</p>
    </div>
  )
}
