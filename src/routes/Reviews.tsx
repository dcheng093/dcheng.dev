import { useEffect, useState } from 'react'
import { BlinkieRow, Blink, GifDivider } from '../components/chaos/Chaos'
import { Img } from '../components/media/Img'
import { Win95Window } from '../components/Win95Window'
import { assets, blinkies, dividers } from '../content/assets'
import { daniel } from '../content/daniel'
import { REVIEWS, type Review } from '../content/reviews'
import { useCopy } from '../hooks/useCopy'
import { DiscordIcon } from '../components/icons'

/**
 * THE HALL OF FAME: what people have said about the site, each screenshot hung in a gilded frame over the hall
 * (its 3D world, PAGE_3D['/reviews']). Click one to see it big. Adding a review: drop it in src/reviews/.
 * Possessed, the frames rust, the screenshots tear, and the plaques say something else (POSSESSED_COPY).
 */
export function Reviews() {
  const [open, setOpen] = useState<Review | null>(null)
  return (
    <div data-testid="reviews" className="tile-marble min-h-screen overflow-x-clip p-3 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <Img slot={assets.trophy} width={80} />
          <h1 className="hall-title font-impact text-5xl tracking-wide sm:text-7xl">HALL OF FAME</h1>
          <p className="bg-black/70 px-2 font-comic text-sm text-yellow-200">real reviews from real people (allegedly)</p>
          <BlinkieRow items={[blinkies.rememberYou, blinkies.niceToNerds]} />
        </header>
        <GifDivider slot={dividers.rainbow} />

        <ol className="flex flex-col items-center gap-8" aria-label="Reviews">
          {REVIEWS.map((r, i) => (
            <li key={r.file} className={`max-w-[calc(100%-1.5rem)] ${i % 2 ? 'sm:translate-x-6 sm:rotate-1' : 'sm:-translate-x-6 sm:-rotate-1'}`}>
              <ReviewFrame review={r} n={i + 1} onOpen={() => setOpen(r)} />
            </li>
          ))}
        </ol>

        <GifDivider slot={dividers.rainbow} />
        <Featured />
      </div>
      {open && <Lightbox review={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function ReviewFrame({ review, n, onOpen }: { review: Review; n: number; onOpen: () => void }) {
  return (
    <figure className="review-frame relative max-w-full">
      {/* Sparkles at the corners: decorations, so chunky (steps), and slow. */}
      {['-left-3 -top-3', '-right-3 -top-3', '-bottom-3 -left-3', '-bottom-3 -right-3'].map((at, i) => (
        <span key={at} aria-hidden className={`review-sparkle absolute ${at}`} style={{ animationDelay: `${i * -0.45}s` }}>
          ✦
        </span>
      ))}
      <button type="button" onClick={onOpen} aria-label={`See review ${n} bigger`} className="review-shot block max-w-full" style={{ '--shot': `url("${review.src}")` } as React.CSSProperties}>
        <img src={review.src} alt={review.alt} loading="lazy" draggable={false} className="block h-auto max-w-full [image-rendering:auto]" />
      </button>
      <figcaption className="review-plaque mx-auto mt-2 w-fit px-3 py-0.5 text-center font-times text-xs font-bold uppercase tracking-widest">
        <span>VERIFIED REVIEW ★★★★★</span> · No. {String(n).padStart(3, '0')}
      </figcaption>
    </figure>
  )
}

function Lightbox({ review, onClose }: { review: Review; onClose: () => void }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])
  return (
    <Win95Window
      title="Review.bmp"
      onClose={onClose}
      testId="review-lightbox"
      className="fixed left-1/2 top-1/2 z-[80] w-[min(760px,calc(100vw-16px))] -translate-x-1/2 -translate-y-1/2"
      bodyClassName="bg-win p-2"
    >
      <img src={review.src} alt={review.alt} className="review-big mx-auto block h-auto w-full [image-rendering:auto]" />
    </Win95Window>
  )
}

const ASK = "want to be featured? send me a message of what you think and i'll include it :)"

/** The way in: message Daniel on Discord. */
function Featured() {
  const { copied, copy } = useCopy()
  const name = daniel.links.discord
  return (
    <section className="win-raised mx-auto max-w-md p-3 text-center font-[Tahoma,Verdana,sans-serif] text-black" aria-label="Get featured">
      <div className="-mx-3 -mt-3 mb-3 bg-win-title px-1 text-left font-bold text-white">Featured.exe</div>
      <p className="font-comic text-lg">
        <Blink>★</Blink> {ASK}
      </p>
      <button
        type="button"
        onClick={() => void copy(name)}
        data-testid="discord-copy"
        className="win-raised mt-3 inline-flex items-center gap-2 bg-[#5865f2] px-3 py-1 font-bold text-white"
      >
        <DiscordIcon />
        <span>@{name}</span>
        <span className="text-xs font-normal">{copied ? 'copied!' : '(click to copy)'}</span>
      </button>
    </section>
  )
}
