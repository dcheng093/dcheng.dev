import { Link, useParams } from 'react-router-dom'
import { emojiCursor } from '../lib/cursor'
import { AdSlot } from '../components/ads/AdSlot'
import { Img } from '../components/media/Img'
import { Blink, Marquee, RainbowText } from '../components/chaos/Chaos'
import { findShrine, shrines } from '../content/shrines'
import { FakeBSOD } from './FakeBSOD'

export function Shrine() {
  const { slug } = useParams()
  const shrine = findShrine(slug)
  if (!shrine) return <FakeBSOD />

  const others = shrines.filter((s) => s.slug !== shrine.slug)
  return (
    <div data-testid="shrine" className={`${shrine.tile} min-h-screen p-3 sm:p-6`} style={{ cursor: emojiCursor(shrine.cursor) }}>
      <div className={`mx-auto flex max-w-4xl flex-col items-center gap-5 text-center ${shrine.textColor}`}>
        <Marquee className="w-full bg-black py-1 font-vt text-xl text-yellow-300">
          {`${shrine.altar} `.repeat(6)} WELCOME TO THE SHRINE {`${shrine.altar} `.repeat(6)} PLEASE BE RESPECTFUL {`${shrine.altar} `.repeat(6)}
        </Marquee>
        <h1 className="bg-black/60 px-3 py-1 font-impact text-3xl text-white sm:text-5xl">
          <RainbowText text={shrine.title} />
        </h1>
        <div className="flex items-end justify-center gap-2 sm:gap-6">
          <span className="animate-wobble text-4xl sm:text-6xl" aria-hidden>🕯️</span>
          <span className="animate-pulse-scale text-7xl sm:text-9xl" aria-hidden>{shrine.altar}</span>
          <span className="animate-wobble text-4xl sm:text-6xl" style={{ animationDelay: '0.25s' }} aria-hidden>🕯️</span>
        </div>
        <p className="max-w-xl bg-white/80 p-3 font-comic text-lg text-black">{shrine.intro}</p>
        {shrine.photo && (
          <Img slot={shrine.photo} width={360} alt={shrine.title} className="-rotate-2 border-8 border-double border-yellow-400 bg-black shadow-[8px_8px_0_#000]" />
        )}
        <div className="flex w-full flex-wrap items-center justify-center gap-4 overflow-x-clip">
          {shrine.gifs.map((g, i) => (
            <Img key={i} slot={g} className={i === 1 ? 'animate-boing' : 'animate-jank-x'} />
          ))}
        </div>
        <ul className="w-full max-w-xl space-y-2 text-left">
          {shrine.facts.map((f, i) => (
            <li key={f} className="win-raised p-2 font-times text-black" style={{ rotate: `${(i % 2 ? 1 : -1) * 1.5}deg` }}>
              <b className="text-red-700">FACT #{i + 1}:</b> {f}
            </li>
          ))}
        </ul>
        <AdSlot format="banner" className="w-full max-w-[468px]" />
        <div className="bg-black/70 p-3 font-vt text-xl text-white">
          <p className="text-yellow-300">
            <Blink>★</Blink> OTHER SHRINES <Blink>★</Blink>
          </p>
          <ul className="flex flex-wrap justify-center gap-x-4">
            {others.map((s) => (
              <li key={s.slug}>
                <Link to={`/shrine/${s.slug}`} className="text-cyber underline">
                  {s.altar} {s.slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
