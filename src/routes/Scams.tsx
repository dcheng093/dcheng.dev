import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gifCursor } from '../lib/cursor'
import { cursors, dividers, icons, type Slot } from '../content/assets'
import { payout, spinReels, type Face } from '../lib/slots'
import { AdSlot } from '../components/ads/AdSlot'
import { Img } from '../components/media/Img'
import { Blink, GifDivider, Marquee, RainbowText, ResettingCountdown, Sticker } from '../components/chaos/Chaos'
import { usePopups } from '../components/popups/popupState'
import { useSfx } from '../audio/audioContext'

const SCAN_FILES = [
  'C:\\DANIEL\\homework\\libft.c',
  'C:\\DANIEL\\homework\\push_swap.c',
  'C:\\WINDOWS\\SYSTEM\\kettle.sys',
  'C:\\DANIEL\\My Documents\\feelings.tmp',
  'C:\\PROGRAM FILES\\HORSES\\gallop.exe',
  'C:\\DANIEL\\Desktop\\new folder (37)',
  'C:\\WINDOWS\\norminette.dll',
  'C:\\DANIEL\\teeth_backup.zip',
  'C:\\DANIEL\\exam_answers_all_55.txt',
]

const THREATS = [
  { name: 'Segfault.Trojan.42', file: 'push_swap.c', level: 'SEVERE' },
  { name: 'Norminette.Worm', file: 'norminette.dll', level: 'SEVERE' },
  { name: 'Kettle.Overboil', file: 'kettle.sys', level: 'HOT' },
  { name: 'Horse.Gallop.Infinite', file: 'gallop.exe', level: 'UNSTOPPABLE' },
  { name: 'Feelings.Leak', file: 'feelings.tmp', level: 'MODERATE' },
  { name: 'Tooth.Surplus', file: 'teeth_backup.zip', level: 'BITEY' },
]

/** An "online virus scan" that finds exactly the viruses it sells the cure for. */
export function Scan() {
  const [pct, setPct] = useState(0)
  const [started, setStarted] = useState(false)
  const popups = usePopups()
  const navigate = useNavigate()
  const sfx = useSfx()
  const done = pct >= 100
  const found = Math.min(THREATS.length, Math.floor((pct / 100) * (THREATS.length + 1)))

  useEffect(() => {
    if (!started || done) return
    const id = window.setInterval(() => setPct((p) => Math.min(100, p + 4)), 150)
    return () => window.clearInterval(id)
  }, [started, done])
  useEffect(() => {
    if (found > 0) sfx('error')
  }, [found, sfx])

  return (
    <div data-testid="scan" className="tile-static min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.virus) }}>
      <div className="win-raised mx-auto max-w-2xl p-0.5 font-[Tahoma,Verdana,sans-serif] text-sm text-black">
        <div className="flex items-center gap-1 bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">
          <Img slot={icons.virus} width={16} /> VirusBlaster 2000 — FREE Online Scan (Trial)
        </div>
        <div className="space-y-3 p-3">
          <div className="flex items-center gap-3">
            <Img slot="printer" width={48} />
            <div>
              <h1 className="font-impact text-2xl text-red-700 sm:text-3xl">YOUR COMPUTER MAY BE AT RISK!!!</h1>
              <p className="text-xs">Scanning from the Internet is 100% safe and definitely possible.</p>
            </div>
          </div>
          {!started ? (
            <button type="button" onClick={() => setStarted(true)} className="win-raised w-full animate-pulse-scale py-2 font-bold">
              ▶ START FREE SCAN
            </button>
          ) : (
            <>
              <div className="win-sunken h-5 w-full bg-white" role="progressbar" aria-valuenow={pct} aria-label="Scan progress">
                <div className="h-full bg-[repeating-linear-gradient(90deg,#c00_0_10px,transparent_10px_12px)]" style={{ width: `${pct}%` }} />
              </div>
              <p className="truncate font-vt text-lg">
                {done ? 'Scan complete.' : `Scanning: ${SCAN_FILES[Math.floor(pct / 12) % SCAN_FILES.length]}`}
              </p>
            </>
          )}
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#336] text-white">
                <th className="p-1">Threat</th>
                <th className="p-1">File</th>
                <th className="p-1">Danger</th>
              </tr>
            </thead>
            <tbody>
              {THREATS.slice(0, found).map((t) => (
                <tr key={t.name} className="border-b bg-red-50">
                  <td className="p-1 font-bold text-red-700">{t.name}</td>
                  <td className="break-all p-1">{t.file}</td>
                  <td className="p-1"><Blink className="font-bold text-red-600">{t.level}</Blink></td>
                </tr>
              ))}
              {found === 0 && (
                <tr>
                  <td colSpan={3} className="p-1 italic text-gray-600">No threats found yet. Give it a second.</td>
                </tr>
              )}
            </tbody>
          </table>
          {done && (
            <div role="alert" className="space-y-2 border-2 border-red-600 bg-yellow-100 p-2">
              <p className="font-bold">
                {THREATS.length} THREATS FOUND. Your computer will explode in <ResettingCountdown seconds={30} label="" className="text-lg text-red-600" />
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => navigate('/checkout')} className="animate-pulse-scale border-2 border-black bg-green-600 px-3 py-1 font-impact text-lg text-white">
                  REMOVE ALL THREATS (£49.99) »
                </button>
                <button type="button" onClick={() => popups.open('ip-alert', 'multiply')} className="win-raised px-3 py-1">
                  Ignore (not recommended)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-4 flex max-w-2xl justify-center">
        <AdSlot format="banner" kind="scam" className="w-full max-w-[468px]" />
      </div>
    </div>
  )
}

const STAKE = 50
const FACES: Record<Face, Slot> = {
  horse: icons.horseRun,
  kettle: icons.teapot,
  tooth: icons.toothBuddy,
  smiley: icons.smiley,
  floppy: icons.floppyGuy,
  cherry: icons.cherry,
  diamond: icons.diamond,
}
const BONUS = 500

/** Slots where the reels can never line up, and the bank is always Daniel. */
export function Casino() {
  const [reels, setReels] = useState<Face[]>(['diamond', 'diamond', 'cherry'])
  const [balance, setBalance] = useState(BONUS)
  const [debt, setDebt] = useState(0)
  const [message, setMessage] = useState('PULL THE LEVER!!!')
  const sfx = useSfx()
  const broke = balance < STAKE

  const spin = () => {
    const next = spinReels()
    const back = payout(next, STAKE)
    setReels(next)
    setBalance((b) => b - STAKE + back)
    sfx(back ? 'coin' : 'click')
    setMessage(back ? `SO CLOSE!!! You win £${back} back. Nearly a jackpot!` : next[0] === next[1] ? 'ONE AWAY FROM THE JACKPOT!!!' : 'Unlucky! Next one is definitely it.')
  }
  const borrow = () => {
    setBalance((b) => b + BONUS)
    setDebt((d) => d + BONUS * 2)
    setMessage('Daniel has lent you £500 at 100% interest. Good luck!!!')
  }

  return (
    <div data-testid="casino" className="tile-casino-table min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.dice) }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <Marquee className="w-full bg-red-700 py-1 font-vt text-xl text-yellow-300">
          ★ DANIEL’S ONLINE CASINO ★ LICENSED IN THE KETTLE KINGDOM ★ 99.9% PAYOUT RATE (for the house) ★ GAMBLE RESPONSIBLY (or at all) ★
        </Marquee>
        <h1 className="font-impact text-4xl sm:text-6xl">
          <RainbowText text="$$$ DANIEL SLOTS $$$" />
        </h1>
        <div className="w-full max-w-md rounded-t-[3rem] border-8 border-yellow-500 bg-gradient-to-b from-red-700 to-red-900 p-4 shadow-[8px_8px_0_#000]">
          <div className="flex justify-center gap-2" aria-label={`Reels: ${reels.join(' ')}`} role="img">
            {reels.map((f, i) => (
              <span key={i} className="win-sunken grid size-20 place-items-center bg-white p-1 sm:size-24" aria-hidden>
                <Img slot={FACES[f]} width={Math.min(64, FACES[f].w)} className="max-h-full w-auto" />
              </span>
            ))}
          </div>
          <p className="mt-3 min-h-12 bg-black p-1 font-vt text-xl text-lime" role="status">{message}</p>
          <div className="mt-3 flex items-center justify-between font-impact text-yellow-300">
            <span>CREDIT: £{balance}</span>
            {debt > 0 && <span className="text-red-300">OWED TO DANIEL: £{debt}</span>}
          </div>
          {broke ? (
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" onClick={borrow} className="animate-pulse-scale border-2 border-black bg-yellow-300 py-2 font-impact text-xl text-red-700">
                BORROW £500 FROM DANIEL
              </button>
              <Link to="/checkout" className="font-comic text-sm text-white underline">or top up with a real card (please do not)</Link>
            </div>
          ) : (
            <button type="button" onClick={spin} className="mt-3 w-full animate-pulse-scale border-4 border-black bg-yellow-400 py-2 font-impact text-2xl text-red-700 shadow-[3px_3px_0_#000]">
              SPIN (£{STAKE})
            </button>
          )}
        </div>
        <div className="win-raised w-full max-w-md p-2 text-left font-times text-sm text-black">
          <p className="font-bold">PAYTABLE</p>
          <ul>
            {(
              [
                ['diamond', '£1,000,000 JACKPOT'],
                ['horse', 'a horse'],
                ['kettle', 'Kettle+ for life'],
              ] as const
            ).map(([f, prize]) => (
              <li key={f} className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <Img key={i} slot={FACES[f]} width={22} />
                ))}
                <span>— {prize}</span>
              </li>
            ))}
            <li>any two — half your money back</li>
          </ul>
          <p className="mt-1 text-[10px] text-gray-600">Jackpot has been won 0 times. Odds available on request (request denied).</p>
        </div>
        <GifDivider slot={dividers.rainbow} />
        <Sticker className="text-lg">NO DEPOSIT NEEDED*</Sticker>
        <AdSlot format="leaderboard" className="w-full max-w-[728px]" />
      </div>
    </div>
  )
}

const TESTIMONIALS = [
  { quote: 'I quit my job, my other job, and school. I now make £5,000 a week. Sometimes £5.', who: 'Daniel, Earth' },
  { quote: 'Before the system I had nothing. Now I have the system, and also nothing.', who: 'Also Daniel' },
  { quote: 'Daniel recruited me, I recruited my nan, my nan recruited the vicar. The vicar is doing very well.', who: 'Kevin (downline #4)' },
  { quote: 'neigh', who: 'A horse' },
]

/** The classic one-very-long-page sales letter. */
export function WorkFromHome() {
  const navigate = useNavigate()
  return (
    <div data-testid="work-from-home" className="tile-dollar-bills min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.coin) }}>
      <article className="mx-auto max-w-2xl space-y-4 border-4 border-dashed border-red-600 bg-white p-4 font-times text-lg text-black">
        <p className="text-center font-comic text-sm text-gray-600">From the desk of: Daniel • Location: my bedroom • Time: 3:47am</p>
        <h1 className="text-center font-impact text-3xl leading-tight text-red-600 sm:text-5xl">
          “I MAKE <span className="bg-yellow-300">£5,000 A WEEK</span> FROM MY BEDROOM… AND SO CAN <u>YOU</u>!!!”
        </h1>
        <p className="text-center font-comic font-bold text-blue-800">
          <Blink>NEW!!!</Blink> The secret system THEY don’t want you to know about (they do not know about it either)
        </p>
        <div className="flex items-center justify-center gap-3">
          <Img slot={icons.moneyBag} width={64} className="animate-boing" />
          <Img slot="body" width={160} className="-rotate-3 border-4 border-black bg-white" />
          <Img slot={icons.moneyBag} width={64} className="animate-boing" />
        </div>
        <p>Dear Friend,</p>
        <p>
          If you are reading this, <b>congratulations</b>. You have scrolled further than most. That alone proves you have what it takes. What does it take? I cannot say. It
          is a secret. But you have it.
        </p>
        <p>
          Just six weeks ago I was a <i>normal student</i>, writing C, fighting the norminette and drinking kettle water. Then I discovered <b className="bg-yellow-300">THE SYSTEM</b>.
        </p>
        <p className="font-bold text-red-600">Now I wake up whenever I want. (This is mostly because of exam week, not the system.)</p>
        <GifDivider slot={dividers.yellowDots} />
        <h2 className="font-impact text-2xl text-blue-800">MY EARNINGS (REAL SCREENSHOT)</h2>
        <table className="w-full border-collapse border-2 border-black text-left text-base">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="border border-black p-1">Week</th>
              <th className="border border-black p-1">Earned</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['1', '£0.00'],
              ['2', '£0.00'],
              ['3', '£4.20 (found it)'],
              ['4', '£5,000 (projected)'],
            ].map(([w, e]) => (
              <tr key={w}>
                <td className="border border-black p-1">{w}</td>
                <td className="border border-black p-1 font-bold text-green-700">{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <GifDivider slot={dividers.yellowDots} />
        <h2 className="font-impact text-2xl text-blue-800">WHAT PEOPLE ARE SAYING</h2>
        <ul className="space-y-2">
          {TESTIMONIALS.map((t) => (
            <li key={t.who} className="border-l-4 border-yellow-400 bg-yellow-50 p-2 italic">
              “{t.quote}” <span className="not-italic font-bold">— {t.who}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-4 border-black bg-yellow-200 p-3 text-center">
          <p className="font-impact text-2xl">STARTER KIT: <s className="text-gray-600">£2,999</s> <span className="text-red-600">£299</span></p>
          <p className="font-comic text-sm">Includes: 1 folder, the word “passive income” written on a sticky note, and a photo of Daniel pointing at a laptop.</p>
          <ResettingCountdown seconds={60} label="OFFER EXPIRES IN" className="text-xl" />
          <p className="font-comic text-sm">Only <b className="text-red-600">3</b> spots left!!! (There have always been 3 spots left.)</p>
          <button type="button" onClick={() => navigate('/checkout')} className="animate-pulse-scale border-2 border-black bg-green-600 px-4 py-1 font-impact text-xl text-white">
            YES! SEND ME THE SYSTEM »
          </button>
        </div>
        <p className="text-base">
          <b>P.S.</b> Still not sure? That is the old you talking. The new you has already clicked the button.
        </p>
        <p className="text-base">
          <b>P.P.S.</b> This is not a pyramid scheme. It is a triangle opportunity.
        </p>
        <p className="text-center font-[Arial,sans-serif] text-[10px] text-gray-500">
          Results not typical. Results not real. Daniel is not a financial advisor, a business, or awake.
        </p>
      </article>
      <div className="mx-auto mt-4 flex max-w-2xl justify-center">
        <AdSlot format="banner" kind="scam" className="w-full max-w-[468px]" />
      </div>
    </div>
  )
}
