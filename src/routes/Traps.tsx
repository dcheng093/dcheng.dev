import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gifCursor } from '../lib/cursor'
import { assets, cursors, dividers, icons } from '../content/assets'
import { Img } from '../components/media/Img'
import { Blink, GifDivider, Marquee, RainbowText, Sticker, UnderConstruction as UcSign } from '../components/chaos/Chaos'
import { useSfx } from '../audio/audioContext'
import { randomRoute } from '../lib/sitemap'

/** Prize claim whose submit button flees the mouse and which never, ever succeeds. */
export function YouWon() {
  const [btn, setBtn] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const sfx = useSfx()
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const flee = () => setBtn({ x: (Math.random() - 0.5) * 220, y: (Math.random() - 0.5) * 120 })
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setVerifying(true)
    setError(null)
    timer.current = window.setTimeout(() => {
      setVerifying(false)
      setError('ERROR 0x0042: PRIZE NOT FOUND. Your details have been forgotten. Please try again.')
      form.reset()
      sfx('error')
    }, 2500)
  }

  return (
    <div data-testid="you-won" className="tile-pink-sparkles min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.moneyBag) }}>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="animate-strobe border-4 border-black px-3 py-2 font-impact text-3xl sm:text-5xl">!!! CONGRATULATIONS !!!</h1>
        <p className="bg-white p-2 font-comic text-xl font-bold text-black">
          You are the <RainbowText text="1,000,000th" /> visitor to Daniel’s web site!!!
        </p>
        <div className="flex items-center gap-4">
          <Img slot="trophy" />
          <Sticker className="text-xl">YOU WON!!!</Sticker>
          <Img slot="trophy" />
        </div>
        <form onSubmit={submit} className="win-raised w-full space-y-2 p-3 text-left font-[Verdana,sans-serif] text-sm text-black" aria-label="Claim your prize">
          <div className="bg-win-title px-1 font-bold text-white">ClaimPrize.exe</div>
          {['Full name', 'Favourite horse', 'Mother’s maiden kettle', 'Your opinion of Daniel (positive)'].map((l) => (
            <label key={l} className="block">
              {l}: <input name={l} className="win-sunken w-full bg-white px-1" />
            </label>
          ))}
          <div className="relative flex h-24 items-center justify-center">
            <button
              type="submit"
              onPointerEnter={(e) => e.pointerType === 'mouse' && flee()}
              disabled={verifying}
              className="win-raised px-4 py-1 font-bold transition-transform duration-100"
              style={{ transform: `translate(${btn.x}px, ${btn.y}px)` }}
            >
              {verifying ? 'VERIFYING…' : 'CLAIM PRIZE NOW'}
            </button>
          </div>
          {verifying && <div className="h-3 w-full overflow-hidden bg-white"><div className="h-full w-1/2 animate-jank-x bg-win-title" /></div>}
          {error && <p role="alert" className="bg-red-600 p-1 font-bold text-white">{error}</p>}
        </form>
        <p className="bg-white px-1 font-[Verdana,sans-serif] text-[10px] text-black">No purchase necessary. No prize available. Void where prohibited and also everywhere else.</p>
      </div>
    </div>
  )
}

/** Hard hats on. The progress bar is at 99% and will remain there. */
export function UnderConstruction() {
  const [pct, setPct] = useState(99)
  useEffect(() => {
    const id = window.setInterval(() => setPct((p) => (p === 99 ? 98 : 99)), 2600)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div data-testid="under-construction" className="min-h-screen bg-[repeating-linear-gradient(45deg,#fc0_0_30px,#000_30px_60px)] p-3 sm:p-6" style={{ cursor: gifCursor(cursors.fist) }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 bg-white/90 p-4 text-center text-black">
        <GifDivider slot={dividers.caution} />
        <UcSign />
        <h1 className="font-impact text-3xl sm:text-5xl">THIS PAGE IS UNDER CONSTRUCTION</h1>
        <div className="flex gap-3">
          <Img slot="worker" width={60} />
          <Img slot="plumber" width={100} />
          <Img slot="worker" width={60} />
        </div>
        <div className="w-full">
          <div className="win-sunken h-6 w-full bg-white">
            <div className="h-full bg-[repeating-linear-gradient(90deg,#000080_0_12px,transparent_12px_14px)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="font-vt text-xl">Building page… {pct}% <Blink>(est. completion: 1999)</Blink></p>
        </div>
        <Link to="/" className="font-comic text-lg font-bold text-blue-800 underline">come back later (go home)</Link>
      </div>
    </div>
  )
}

const LEAVE_PROMPTS = [
  'Are you sure you want to leave?',
  'Are you REALLY sure?',
  'But we were having such a nice time…',
  'Daniel will be sad. Are you sure?',
  'The horses are crying. Are you sure???',
  'Final answer?',
  'OK FINE. Actually, no.',
]

/** An exit that is not an exit. */
export function Leave() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const last = step >= LEAVE_PROMPTS.length - 1
  return (
    <div data-testid="leave" className="grid min-h-screen grid-cols-1 place-items-center bg-[#008080] p-4" style={{ cursor: gifCursor(cursors.back, [0, 13]) }}>
      <div role="alertdialog" aria-label="Leave the site" className="win-raised w-[min(360px,100%)] p-0.5 font-[Tahoma,Verdana,sans-serif] text-sm text-black">
        <div className="bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">Leave.exe</div>
        <div className="flex items-start gap-3 p-4">
          <Img slot={step > 3 ? icons.crying : icons.question} width={40} className="shrink-0" />
          <p className={step > 4 ? 'animate-shake font-bold' : ''}>{LEAVE_PROMPTS[step]}</p>
        </div>
        <div className="flex justify-center gap-2 pb-3">
          <button type="button" className="win-raised w-20 py-0.5" onClick={() => (last ? navigate('/') : setStep((s) => s + 1))}>
            Yes
          </button>
          <button type="button" data-stay className="win-raised w-20 py-0.5" onClick={() => navigate(randomRoute('/leave'))}>
            No
          </button>
        </div>
      </div>
    </div>
  )
}

/** A cart that only ever contains Daniel. */
export function Checkout() {
  const [removeOffset, setRemoveOffset] = useState(0)
  const [note, setNote] = useState<string | null>(null)
  const navigate = useNavigate()
  return (
    <div data-testid="checkout" className="tile-marble min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.coins) }}>
      <div className="mx-auto max-w-2xl space-y-3 border-4 border-[#7a00cc] bg-white p-3 font-[Verdana,sans-serif] text-sm text-black">
        <Marquee className="bg-yellow-300 font-bold text-red-600">★ SECURE CHECKOUT ★ 128-BIT ENCRYPTION (we wrote the number 128 in a file) ★</Marquee>
        <h1 className="font-impact text-3xl text-[#7a00cc]">YOUR SHOPPING CART (1 item)</h1>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#336] text-white">
              <th className="p-1">Item</th>
              <th className="p-1">Qty</th>
              <th className="p-1">Price</th>
              <th className="p-1" />
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="flex items-center gap-2 p-1">
                <Img slot={assets.misc[10]} width={40} /> 1× Daniel (Used)
              </td>
              <td className="p-1">
                <input aria-label="Quantity" value={1} readOnly onFocus={() => setNote('Quantity is locked. There is only one Daniel.')} className="win-sunken w-12 bg-gray-200 px-1" />
              </td>
              <td className="p-1 font-bold">£69/mo</td>
              <td className="relative p-1">
                <button
                  type="button"
                  onPointerEnter={() => setRemoveOffset((o) => (o > 0 ? -60 : 60))}
                  onClick={() => setNote('Daniel cannot be removed from your cart. Daniel is part of you now.')}
                  className="text-xs text-blue-700 underline transition-transform"
                  style={{ transform: `translateX(${removeOffset}px)` }}
                >
                  remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked readOnly onClick={() => setNote('The extended warranty is mandatory and also optional.')} />
          Add Extended Warranty (+£999/mo) — recommended by 9 out of 10 Daniels
        </label>
        {note && <p role="status" className="bg-yellow-200 p-1 font-bold">{note}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2">
          <p className="font-impact text-2xl">TOTAL: £1,068/mo</p>
          <button type="button" onClick={() => navigate('/you-won')} className="animate-pulse-scale border-2 border-black bg-green-600 px-4 py-1 font-impact text-xl text-white">
            PROCEED TO CHECKOUT »
          </button>
        </div>
      </div>
    </div>
  )
}
