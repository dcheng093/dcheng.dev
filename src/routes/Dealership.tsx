import { useState } from 'react'
import { Link } from 'react-router-dom'
import { emojiCursor } from '../lib/cursor'
import { AdSlot } from '../components/ads/AdSlot'
import { DealCard } from '../components/ads/DealCard'
import { pickAds } from '../components/ads/pickAd'
import { Img } from '../components/media/Img'
import { BigArrow, Blink, Marquee, ResettingCountdown, Sticker, ViewersNow, WavyText } from '../components/chaos/Chaos'
import { assets } from '../content/assets'
import { brands, howItWorks, models, pressClippings, testimonials } from '../content/dealership'

/** "DANIEL'S DISCOUNT DANIELS" — the LINGsCARS layout: paisley frame, left nav, deal grid, right ad tower. */
export function Dealership() {
  const [tower] = useState(() => [...pickAds('skyscraper', 3), ...pickAds('button125', 4)])
  return (
    <div data-testid="dealership" className="tile-paisley px-0 py-2 sm:px-3 lg:px-6" style={{ cursor: emojiCursor('🚗') }}>
      <div className="mx-auto max-w-[1180px] border-4 border-[#7a00cc] bg-[#f4f4ff] text-black">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-[170px_minmax(0,1fr)_150px]">
          <LeftNav />
          <main className="min-w-0 space-y-6 p-2 sm:p-4">
            <Hero />
            <DealGrid />
            <Link to="/checkout" className="mx-auto block w-full max-w-[420px]">
              <BigArrow>For 17,498 more lease deals, use the left hand menu!</BigArrow>
            </Link>
            <CustomerMosaic />
            <Press />
            <Testimonials />
            <HowItWorks />
            <Rocket />
            <TrustFooter />
          </main>
          <aside aria-label="Ad tower" className="flex min-w-0 gap-2 overflow-x-auto border-t-2 border-[#99c] bg-[#ffe] p-2 lg:flex-col lg:items-center lg:overflow-visible lg:border-l-2 lg:border-t-0">
            {tower.map((ad, i) => (
              <AdSlot key={i} ad={ad} format={i < 3 ? 'skyscraper' : 'button125'} className="shrink-0" />
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="border-b-4 border-[#7a00cc] bg-white">
      <div className="flex flex-wrap items-center justify-center gap-3 p-2 sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
          <div className="border-4 border-red-600 bg-[repeating-linear-gradient(45deg,#fff_0_8px,#f33_8px_16px)] p-1">
            <Img slot="headGrin" width={70} className="animate-wobble" />
          </div>
          <div>
            <p className="font-impact text-[clamp(1.5rem,8vw,3rem)] leading-none text-[#7a00cc]">
              DANIEL<span className="text-red-600">s</span>DANIELS<span className="text-sm">.com</span>
            </p>
            <p className="bg-yellow-300 px-1 font-[Verdana,sans-serif] text-[10px] font-bold sm:text-xs">DANIEL LEASING — CONTRACT HIRE — CHEAP LEASE DANIELS</p>
          </div>
          <span className="text-4xl" aria-hidden>🚦</span>
        </div>
        <div className="flex items-center gap-2">
          <Img slot="forSale" width={260} />
        </div>
      </div>
      <Marquee className="bg-[#7a00cc] py-0.5 font-[Verdana,sans-serif] text-sm font-bold text-yellow-300" speed={18}>
        ★ DANIEL OF THE DAY: DANIEL SPORT £420/mo ★ NO DEPOSIT* ★ *DEPOSIT REQUIRED ★ ALL DANIELS COME WITH A FULL TANK OF OPINIONS ★ FINANCE AVAILABLE TO NOBODY ★
      </Marquee>
    </header>
  )
}

function LeftNav() {
  return (
    <nav aria-label="Daniel models" className="min-w-0 border-b-2 border-[#99c] bg-[#ffe] p-2 font-[Verdana,sans-serif] text-xs lg:border-b-0 lg:border-r-2">
      <p className="mb-1 bg-red-600 px-1 font-bold text-white">MODELS</p>
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-0.5 lg:overflow-visible">
        {models.map((m) => (
          <li key={m.name} className="shrink-0">
            <Link to={m.to.startsWith('/') ? m.to : '/checkout'} className="whitespace-nowrap text-blue-800 underline hover:bg-yellow-300">
              » {m.name}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mb-1 mt-2 bg-[#336] px-1 font-bold text-white">BRANDS</p>
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:block lg:overflow-visible">
        {brands.map((b) => (
          <li key={b} className="shrink-0 whitespace-nowrap">
            <Link to="/checkout" className="text-blue-800 hover:bg-yellow-300">{b}</Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 hidden lg:block">
        <Img slot="rotary" width={140} />
        <p className="text-center font-bold text-red-600">
          <Blink>CALL NOW!!!</Blink>
        </p>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="relative border-4 border-black bg-black">
        <Img slot="hero" width={640} className="w-full" />
        <span className="absolute left-2 top-2 animate-blink bg-red-600 px-2 font-impact text-white">● LIVE</span>
        <span className="absolute bottom-2 right-2 bg-black/70 px-1 font-vt text-lime">CAM 1 — Daniel in his natural habitat</span>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <Sticker className="text-lg">AWARD WINNING!!!</Sticker>
        <Img slot="trophy" />
        <ViewersNow />
        <ResettingCountdown seconds={30} className="text-xl" />
      </div>
    </section>
  )
}

function DealGrid() {
  return (
    <section>
      <h2 className="mb-2 bg-[#336] px-2 py-1 text-center font-impact text-2xl text-yellow-300">TOP CHEAP LEASE DANIELS</h2>
      <div className="grid grid-cols-1 justify-items-center gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {models.map((m, i) => (
          <DealCard key={m.name} model={m} slot={assets.misc[i % assets.misc.length]} index={i} />
        ))}
      </div>
    </section>
  )
}

function CustomerMosaic() {
  const filters = ['', 'hue-rotate(90deg)', 'saturate(3)', 'invert(1)', 'sepia(1)', 'hue-rotate(200deg)', 'grayscale(1)']
  return (
    <section className="text-center">
      <h2 className="font-impact text-4xl text-[#7a00cc] [text-shadow:2px_2px_0_#ff0]">DANIEL’S CUSTOMERS!</h2>
      <p className="font-comic text-sm">(they are all Daniel)</p>
      <div className="mx-auto mt-2 grid max-w-[560px] grid-cols-8 gap-0 border-4 border-black sm:grid-cols-12">
        {Array.from({ length: 48 }, (_, i) => (
          <Img key={i} slot={assets.misc[i % assets.misc.length]} width={48} className="aspect-square w-full object-cover" style={{ filter: filters[i % filters.length] }} />
        ))}
      </div>
    </section>
  )
}

function Press() {
  return (
    <section className="flex flex-wrap justify-center gap-3">
      {pressClippings.map((p, i) => (
        <article key={p.paper} className="w-[220px] bg-[#f5f0e1] p-2 font-times text-black shadow-[3px_3px_0_#999]" style={{ rotate: `${(i - 1) * 3}deg` }}>
          <p className="border-b-2 border-black text-center font-bold italic">{p.paper}</p>
          <p className="mt-1 text-lg font-bold leading-tight">{p.headline}</p>
          <p className="text-sm">{p.quote}</p>
        </article>
      ))}
    </section>
  )
}

function Testimonials() {
  return (
    <section className="text-center">
      <h2 className="font-impact text-3xl text-red-600 sm:text-4xl">
        <WavyText text="WHAT CUSTOMERS SAY" />
      </h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {testimonials.map((t) => (
          <blockquote key={t.who} className="border-2 border-dashed border-[#7a00cc] bg-white p-2 font-comic text-sm">
            “{t.text}” <footer className="text-right font-bold">— {t.who}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-lg">
      <h2 className="text-center font-impact text-3xl text-[#336]">…how it works</h2>
      <ol className="mt-2 list-inside list-decimal space-y-1 bg-white p-3 font-[Verdana,sans-serif] text-sm">
        {howItWorks.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  )
}

function Rocket() {
  return (
    <section className="flex flex-col items-center gap-2 text-center">
      <p className="max-w-md font-impact text-2xl text-red-600">I launch a nuclear rocket into the personal website industry</p>
      <span className="animate-boing text-7xl" aria-hidden>
        🚀
      </span>
      <Img slot="globe" />
    </section>
  )
}

function TrustFooter() {
  return (
    <footer className="flex flex-col items-center gap-2 border-4 border-yellow-400 bg-[#7a00cc] p-4 text-center">
      <Img slot="body" width={140} />
      <p className="font-impact text-3xl text-yellow-300 sm:text-5xl">YOU CAN TRUST ME, I AM DANIEL!</p>
      <p className="font-[Verdana,sans-serif] text-[10px] text-white/70">
        DANIELsDANIELS is not a real company. No Daniels were leased in the making of this page. Representative example: £69/mo for 48 months, total
        amount payable: your dignity.
      </p>
    </footer>
  )
}
