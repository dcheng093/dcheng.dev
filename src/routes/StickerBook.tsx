import { Link } from '../components/Link'
import { Img } from '../components/media/Img'
import { RainbowText } from '../components/chaos/Chaos'
import { stickers } from '../content/stickers'
import { cursors, kawaii } from '../content/assets'
import { daniel } from '../content/daniel'
import { useStored } from '../hooks/useLocalStorage'
import { gifCursor } from '../lib/cursor'
import { progress } from '../lib/stickers'

/** The sticker book: every sticker hidden around the site, with hints for the missing ones. */
export function StickerBook() {
  const [have, setHave] = useStored<string[]>('stickers', [])
  const { found, total, complete } = progress(have, stickers)
  return (
    <div data-testid="stickers" className="tile-stickers min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.kawaiiBear) }}>
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="win-raised p-3 text-center">
          <h1 className="font-comic text-3xl font-bold text-hotpink sm:text-5xl">
            <RainbowText text="✿ DANIEL'S STICKER BOOK ✿" />
          </h1>
          <p className="mt-1 font-comic text-sm text-black">
            {total} stickers are hidden around this website. Find them all, win a prize. The prize is a certificate. It is a very good certificate.
          </p>
          <div className="win-sunken mx-auto mt-2 h-5 max-w-md bg-white" role="progressbar" aria-valuenow={found} aria-valuemin={0} aria-valuemax={total} aria-label="Stickers found">
            <div className="h-full bg-[repeating-linear-gradient(90deg,#f0c_0_8px,#fcf_8px_12px)] transition-[width] duration-500" style={{ width: `${(found / total) * 100}%` }} />
          </div>
          <p className="mt-1 font-pixel text-[10px] text-black" data-testid="sticker-count">{found} / {total} FOUND</p>
        </header>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {stickers.map((s, i) => {
            const got = have.includes(s.id)
            return (
              <li key={s.id} className={`win-raised flex flex-col items-center gap-1 p-2 text-center text-black ${got ? 'animate-pop-in' : ''}`} style={{ animationDelay: `${i * 40}ms`, rotate: `${((i * 37) % 9) - 4}deg` }}>
                <div className="grid h-16 w-full place-items-center bg-[radial-gradient(circle,#fff_40%,#fde)]">
                  <Img slot={s.slot} width={Math.min(56, s.slot.w)} className={got ? 'animate-boing' : 'opacity-25 brightness-0'} alt={got ? s.name : 'missing sticker'} />
                </div>
                <p className="font-pixel text-[9px]">{got ? s.name : '???'}</p>
                <p className="font-comic text-[11px] leading-tight text-gray-700">{got ? `Found on ${s.page}` : s.hint}</p>
              </li>
            )
          })}
        </ul>

        {complete ? (
          <section data-testid="certificate" className="animate-pop-in border-8 border-double border-yellow-600 bg-[#fffbe6] p-6 text-center text-black shadow-[8px_8px_0_#000] print:shadow-none">
            <Img slot={kawaii.balloonBear} width={90} className="mx-auto animate-boing" />
            <h2 className="font-times text-3xl font-bold italic">Certificate of Sticker Mastery</h2>
            <p className="mt-2 font-times text-lg">This certifies that <b>YOU</b> found all {total} of {daniel.name}'s stickers, and are therefore extremely cool.</p>
            <p className="mt-2 font-comic text-sm">Signed, Daniel (and the kettle)</p>
            <button type="button" onClick={() => window.print()} className="win-raised mt-3 px-3 py-1 font-bold">🖨 Print it</button>
          </section>
        ) : (
          <p className="win-raised p-2 text-center font-comic text-sm text-black">Tip: stickers wobble. Look in the margins. Then go <Link to="/" className="text-blue-700 underline">back to the front page</Link> and start hunting.</p>
        )}
        {found > 0 && (
          <p className="text-center">
            <button type="button" onClick={() => setHave([])} className="win-raised px-2 py-0.5 text-xs text-black">Peel them all off (start again)</button>
          </p>
        )}
      </div>
    </div>
  )
}
