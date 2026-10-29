import { Link, useNavigate } from 'react-router-dom'
import { Band, Piece } from '../components/collage/Band'
import { AdSlot } from '../components/ads/AdSlot'
import { DealCard } from '../components/ads/DealCard'
import { pickAds } from '../components/ads/pickAd'
import { Img } from '../components/media/Img'
import { usePopups } from '../components/popups/popupState'
import { Jukebox } from '../components/WebringBar'
import { ButtonWall } from '../components/chaos/ButtonWall'
import { BigArrow, Blink, BlinkieRow, GifDivider, HitCounter, Marquee, RainbowText, ResettingCountdown, Sticker, UnderConstruction, ViewersNow, WavyText } from '../components/chaos/Chaos'
import { ads } from '../content/ads'
import { assets, blinkies, cursors, dividers, icons, kawaii, type Slot } from '../content/assets'
import { daniel } from '../content/daniel'
import { models } from '../content/dealership'
import { randomRoute } from '../lib/sitemap'
import { useState } from 'react'

const adById = (id: string) => ads.find((a) => a.id === id)!
const meSlot = (file: string, w: number, h: number, label: string): Slot => ({ src: `/me/${file}`, w, h, label })

/** What each band heaps into its side gutters on wide screens (see Band's `edges`). */
const EDGES = {
  header: [assets.globe, kawaii.twinkleStar, assets.newBadge, kawaii.pastelSparkles, assets.arrow, kawaii.fairy, assets.email3d],
  welcome: [kawaii.bearHeart, kawaii.smileHeart, kawaii.heartRain, kawaii.bouquetCat, kawaii.angelBaby, kawaii.pinkSparkles, kawaii.blushBun, kawaii.heartFloat],
  coding: [icons.floppy, icons.virus, assets.typingPc, icons.warning, assets.surfer, icons.kidComputer, assets.printer],
  games: [assets.trophy, icons.diamond, icons.smiley, icons.rocket, kawaii.twinkleStar, icons.cherry],
  lease: [icons.moneyBag, assets.trophy, icons.horseRun, assets.newBadge, icons.rocket, assets.globe, icons.diamond],
  interests: [kawaii.shiba, kawaii.pug, kawaii.duckling, kawaii.hamster, kawaii.cupcake, kawaii.strawberry, icons.kawaiiBlob, kawaii.balloonBear],
  roots: [kawaii.moonCat, kawaii.hammockKitten, kawaii.poolBear, kawaii.chicksRow, kawaii.bluebird, kawaii.bunMail],
  town: [cursors.joystick, assets.kettle, icons.floppy, icons.speaker, kawaii.cheerBlob, assets.newBadge, icons.smiley],
  destiny: [icons.question, kawaii.mochiStars, kawaii.butterflies, kawaii.fairy, icons.diamond, kawaii.twinkleStar, kawaii.pinkButterfly],
  end: [icons.flame, icons.skull, icons.candle, kawaii.angelChick, icons.flame, icons.crying],
} satisfies Record<string, Slot[]>

export function Home() {
  return (
    <div data-testid="home">
      <HeaderBand />
      <GifDivider slot={dividers.rainbow} className="bg-white" />
      <WelcomeBand />
      <GifDivider slot={dividers.sparkleFlowers} className="bg-white" />
      <AdStrip />
      <CodingBand />
      <AdWall />
      <GameBand />
      <GifDivider slot={dividers.rainbowDots} className="bg-black" />
      <LeaseBand />
      <GifDivider slot={dividers.smileys} className="bg-white" />
      <InterestsBand />
      <GifDivider slot={dividers.flowers} className="bg-white" />
      <RootsBand />
      <GifDivider slot={dividers.beads} className="bg-white" />
      <CyberTownBand />
      <GifDivider slot={dividers.caution} className="bg-black" />
      <DestinyBand />
      <GifDivider slot={dividers.flames} className="bg-black" />
      <EndBand />
    </div>
  )
}

function HeaderBand() {
  return (
    <Band id="header" edges={EDGES.header} tile="tile-sky" cursor={cursors.star} lgHeight={470}>
      <Piece lg="lg:left-[3%] lg:top-[30px]" className="[perspective:400px]">
        <Img slot="headGrin" width={170} className="animate-spin-y" />
      </Piece>
      <Piece lg="lg:left-[19%] lg:top-[30px] lg:w-[54%]" className="w-full text-center">
        <h1 className="wordart text-4xl leading-none sm:text-6xl lg:text-7xl">{daniel.siteTitle}</h1>
        <p className="mt-2 font-comic text-lg font-bold text-blue-900">~*~ the OFFICIAL home of {daniel.name} on the information superhighway ~*~</p>
      </Piece>
      <Piece lg="lg:left-[34%] lg:top-[315px]" tilt={-2}>
        <HitCounter className="bg-white/80 px-2" />
      </Piece>
      <Piece lg="lg:right-[3%] lg:top-[20px]">
        <Img slot="globeCage" width={140} />
      </Piece>
      <Piece lg="lg:left-[6%] lg:top-[250px]" tilt={-12} className="flex gap-1">
        <Img slot="newBadge" />
        <Img slot="newBadge" />
        <Img slot="newBadge" />
      </Piece>
      <Piece lg="lg:right-[1%] lg:top-[190px]" tilt={4}>
        <UnderConstruction />
      </Piece>
      <Piece lg="lg:left-0 lg:right-0 lg:bottom-0" className="w-full">
        <Marquee className="border-y-2 border-black bg-yellow-300 py-1 font-impact text-xl text-red-600">
          ★ WELCOME!!! ★ YOU ARE VISITING THE WORLD WIDE WEB SITE OF DANIEL CHENG ★ PLEASE SIGN MY GUESTBOOK ★ NOW WITH 40% MORE KETTLE ★ LEASE DANIEL TODAY ★ THIS SITE IS Y2K COMPLIANT ★
        </Marquee>
      </Piece>
    </Band>
  )
}

function WelcomeBand() {
  const popups = usePopups()
  const { profile } = daniel
  return (
    <Band
      id="welcome"
      edges={EDGES.welcome}
      tile="tile-pink-twinkles"
      cursor={cursors.pinkHeart}
      lgHeight={500}
      title={<h2 className="font-comic text-4xl font-bold text-hotpink [text-shadow:3px_3px_0_#fff,5px_5px_0_#000] sm:text-5xl">♥ WELCOME 2 MY HEART ♥</h2>}
    >
      <Piece lg="lg:left-[3%] lg:top-[20px]" tilt={-3}>
        <table className="win-raised border-separate p-2 font-times text-black">
          <caption className="bg-win-title font-bold text-white">a/s/l?? :-)</caption>
          <tbody>
            {[
              ['Name', daniel.name],
              ['Age', profile.age],
              ['Sex', profile.sex],
              ['Location', profile.location],
              ['Mood', profile.mood],
            ].map(([k, v]) => (
              <tr key={k}>
                <th className="pr-2 text-right">{k}:</th>
                <td className="win-sunken bg-white px-1">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Piece>
      <Piece lg="lg:left-[31%] lg:top-[10px]" className="flex flex-row gap-1 font-pixel text-xl text-white [text-shadow:2px_2px_0_#f0c] lg:flex-col">
        {[...'DANIEL'].map((c, i) => (
          <span key={i} className="animate-wave" style={{ animationDelay: `${i * 0.15}s` }}>
            {c}
          </span>
        ))}
      </Piece>
      <Piece lg="lg:left-[38%] lg:top-[40px]" className="w-[220px]">
        <p className="mb-1 inline-block bg-hotpink px-1 font-comic font-bold text-white">My fave emoticons:</p>
        <ul className="grid grid-cols-2 gap-x-3 bg-white/70 p-2 font-vt text-xl text-black">
          {daniel.emoticons.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Piece>
      <Piece lg="lg:left-[60%] lg:top-[60px]" className="animate-drift" style={{ ['--drift-x' as string]: '-120px', ['--drift-y' as string]: '40px' }}>
        <Img slot="horses" width={120} />
      </Piece>
      <Piece lg="lg:right-[4%] lg:top-[30px]" tilt={5} className="flex flex-col items-center gap-1">
        <Img slot="email3d" />
        <Link to="/guestbook" className="font-comic text-lg font-bold text-blue-800 underline">
          <Blink className="bg-white px-1">SIGN MY GUESTBOOK!!!</Blink>
        </Link>
      </Piece>
      <Piece lg="lg:right-[20%] lg:top-[240px]" className="flex flex-col items-center">
        <button type="button" onClick={() => popups.open('business-card')} className="flex flex-col items-center">
          <Img slot="phone" width={130} />
          <span className="bg-yellow-300 px-1 font-impact text-black">CALL ME (business card)</span>
        </button>
      </Piece>
      <Piece lg="lg:left-[8%] lg:top-[300px]" tilt={-6} className="w-[240px] bg-yellow-200 p-3 font-comic text-sm text-black shadow-[4px_4px_0_#000]">
        Hi!!! This is my home page. I made it myself. Please don’t break anything. If you break something, it was already broken. :-)
      </Piece>
      <Piece lg="lg:left-[33%] lg:top-[360px]" className="flex gap-2">
        {assets.misc.slice(0, 3).map((s, i) => (
          <Img key={s.src} slot={s} width={80} className="aspect-square object-cover border-4 border-white shadow" style={{ rotate: `${(i - 1) * 8}deg` }} />
        ))}
      </Piece>
    </Band>
  )
}

function AdStrip() {
  const [buttons] = useState(() => pickAds('button', 8))
  return (
    <div className="flex flex-col items-center gap-2 border-y-4 border-black bg-black p-3">
      <AdSlot format="leaderboard" className="w-full max-w-[728px]" />
      <div className="flex flex-wrap justify-center gap-1">
        {buttons.map((ad, i) => (
          <AdSlot key={i} ad={ad} format="button" />
        ))}
      </div>
    </div>
  )
}

function CodingBand() {
  const { coding } = daniel
  const stackA = [42, 7, 19, 3, 88, 1]
  return (
    <Band
      id="coding"
      edges={EDGES.coding}
      tile="tile-green-grid"
      cursor={cursors.skullSmall}
      lgHeight={600}
      title={
        <h2 className="font-vt text-3xl text-lime sm:text-5xl">
          C:\DANIEL\{coding.school}&gt; dir /s<span className="animate-blink">_</span>
        </h2>
      }
    >
      <Piece lg="lg:left-[2%] lg:top-[10px]" className="w-[min(380px,100%)] border-2 border-lime bg-black p-2 font-vt text-lg text-lime">
        <p> Volume in drive C is DANIEL</p>
        <p> Directory of C:\DANIEL\42</p>
        <br />
        {coding.projects.map((p) => (
          <p key={p}>
            &lt;DIR&gt; &nbsp; {p.padEnd(16, '.')} <span className="text-yellow-300">OK</span>
          </p>
        ))}
        <p className="text-red-400">segfault.core &nbsp; 1,337 bytes</p>
        <p className="mt-1 text-cyber">milestone: {coding.milestone}</p>
      </Piece>
      <Piece lg="lg:left-[40%] lg:top-[20px]" className="flex items-end gap-6 font-vt text-lg text-white">
        <Link to="/shrine/push-swap" className="flex flex-col items-center">
          <span className="text-yellow-300">stack a</span>
          {stackA.map((n, i) => (
            <span key={n} className="w-14 animate-jank-x border border-lime bg-green-900 text-center" style={{ width: 20 + n * 0.6 + 'px', animationDelay: `${i * 0.2}s` }}>
              {n}
            </span>
          ))}
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-yellow-300">stack b</span>
          <span className="text-gray-500">(empty)</span>
          <span className="mt-2 animate-blink text-hotpink">pb pb pb</span>
        </div>
      </Piece>
      <Piece lg="lg:right-[2%] lg:top-[20px]" tilt={3} className="w-[260px] bg-amber-100 p-3 font-times italic text-black shadow-[4px_4px_0_#0f0]">
        <p className="mb-1 font-bold not-italic">~ a norminette haiku ~</p>
        {coding.norminetteHaiku.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <Link to="/shrine/norminette" className="mt-2 block text-right font-bold not-italic text-blue-800 underline">
          visit her shrine »
        </Link>
      </Piece>
      <Piece lg="lg:left-[38%] lg:top-[300px]" className="bg-black/70 p-2 text-center">
        <ResettingCountdown seconds={180} label="EXAM RANK ENDS IN" className="text-2xl text-white" />
      </Piece>
      <Piece lg="lg:right-[4%] lg:top-[270px]" tilt={-4}>
        <AdSlot ad={adById('swm-semicolon')} format="classified" />
      </Piece>
      <Piece lg="lg:left-[5%] lg:top-[350px]">
        <Link to="/shrine/segfault" className="flex flex-col items-center">
          <Img slot="typingPc" width={140} />
          <span className="animate-strobe px-1 font-pixel text-[10px]">ENTER THE SEGFAULT SHRINE</span>
        </Link>
      </Piece>
      <Piece lg="lg:left-[30%] lg:top-[400px]" className="w-[min(320px,100%)] border border-lime bg-black p-2 font-vt text-lg text-lime">
        <p className="text-yellow-300">&gt; cat exam_story.txt</p>
        <p>{coding.examStory}</p>
      </Piece>
      <Piece lg="lg:right-[30%] lg:top-[480px]" className="animate-drift" style={{ ['--drift-x' as string]: '140px', ['--drift-y' as string]: '-20px' }}>
        <Img slot="surfer" />
      </Piece>
    </Band>
  )
}

function AdWall() {
  const [squares] = useState(() => pickAds('button125', 4))
  return (
    <div data-testid="ad-wall" className="tile-smileys flex items-center gap-3 border-y-4 border-black p-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-3">
        {squares.map((ad, i) => (
          <AdSlot key={i} ad={ad} format="button125" className={i % 2 ? 'rotate-3' : '-rotate-2'} />
        ))}
        <AdSlot ad={adById('more-ram')} format="square" />
        <AdSlot format="banner" kind="surreal" className="w-full max-w-[468px]" />
        <BlinkieRow items={[blinkies.niceToNerds, blinkies.gamer, blinkies.caffeine, blinkies.peopleStrange]} className="w-full" />
        <ButtonWall className="w-full max-w-[760px] bg-white/80 p-2" />
        {/* Smaller screens: a 600px-tall skyscraper would swamp the strip, so POPNUKE takes a banner at the end. */}
        <div className="w-full max-w-[468px] lg:hidden">
          <AdSlot ad={adById('popnuke')} format="banner" className="w-full" />
        </div>
      </div>
      {/* The right-hand rail: POPNUKE's skyscraper, like every 2000s page had down the side. */}
      <div className="hidden shrink-0 lg:block">
        <AdSlot ad={adById('popnuke')} format="skyscraper" />
      </div>
    </div>
  )
}

function GameBand() {
  const spots = [
    'lg:left-[2%] lg:top-[10px]',
    'lg:left-[22%] lg:top-[130px]',
    'lg:left-[42%] lg:top-[10px]',
    'lg:left-[62%] lg:top-[130px]',
    'lg:left-[80%] lg:top-[10px]',
  ]
  const scores = [
    ['DAN', 999999],
    ['DCH', 420690],
    ['KTL', 31337],
    ['HRS', 1999],
    ['YOU', 3],
  ] as const
  return (
    <Band
      id="games"
      edges={EDGES.games}
      tile="tile-stars"
      cursor={cursors.arcade}
      lgHeight={660}
      title={
        <h2 className="font-pixel text-2xl text-yellow-300 sm:text-4xl">
          <Blink>INSERT COIN</Blink> <span className="text-cyber">— DANIEL’S GAMES —</span>
        </h2>
      }
    >
      {daniel.games.map((g, i) => (
        <Piece key={g.name} lg={spots[i % spots.length]} tilt={(i % 2 ? 1 : -1) * (2 + i)} className="w-[200px]">
          <div className="rounded-t-lg border-4 border-gray-600 bg-gray-400 p-2 shadow-[6px_6px_0_#000]">
            <div className="mb-1 h-2 rounded bg-gray-600" />
            <div className="border-2 border-black bg-black">
              <Img slot={meSlot(g.slot, 320, 240, `${g.name} gameplay GIF`)} width={180} className="aspect-[4/3] object-cover" />
            </div>
            <p className="mt-1 bg-red-600 px-1 text-center font-pixel text-[10px] text-white">{g.name}</p>
            <p className="font-comic text-xs text-black">{g.pitch}</p>
          </div>
        </Piece>
      ))}
      <Piece lg="lg:left-[6%] lg:top-[400px]" className="w-[min(300px,100%)] border-4 border-double border-cyber bg-black p-3 font-pixel text-[10px] text-white">
        <p className="mb-2 text-center text-yellow-300">HIGH SCORES</p>
        <ol>
          {scores.map(([n, s], i) => (
            <li key={n} className="flex justify-between">
              <span>{i + 1}. {n}</span>
              <span className={i === 0 ? 'animate-rainbow text-red-400' : ''}>{String(s).padStart(6, '0')}</span>
            </li>
          ))}
        </ol>
      </Piece>
      <Piece lg="lg:left-[40%] lg:top-[420px]">
        <AdSlot format="square" kind="scam" />
      </Piece>
      <Piece lg="lg:right-[4%] lg:top-[380px]" tilt={6} className="font-pixel text-[10px] text-white">
        <p className="animate-blink text-center text-yellow-300">PLAYER 2 PRESS START</p>
        <Img slot="trophy" className="mx-auto mt-2" />
      </Piece>
    </Band>
  )
}

function LeaseBand() {
  return (
    <Band
      id="lease"
      edges={EDGES.lease}
      tile="tile-blue-flowers"
      cursor={cursors.car}
      flow
      title={<h2 className="wordart animate-pulse-scale text-4xl sm:text-6xl">LEASE DANIEL TODAY!!!</h2>}
    >
      <div className="flex w-full flex-wrap justify-center gap-2 font-comic text-black">
        <span className="bg-white px-2"><ViewersNow /></span>
        <span className="bg-white px-2"><ResettingCountdown seconds={42} /></span>
      </div>
      {models.slice(0, 3).map((m, i) => (
        <DealCard key={m.name} model={m} index={i} />
      ))}
      <Link to="/dealership" className="w-full max-w-[420px]">
        <BigArrow direction="right">For 17,498 more Daniels, visit the dealership!</BigArrow>
      </Link>
    </Band>
  )
}

function InterestsBand() {
  return (
    <Band
      id="interests"
      edges={EDGES.interests}
      tile="tile-lava-lamps"
      cursor={cursors.starSmall}
      flow
      title={
        <h2 className="inline-block bg-black px-3 font-impact text-4xl sm:text-5xl">
          <RainbowText text="MY INTERESTS" />
        </h2>
      }
    >
      {daniel.hobbies.map((h, i) => (
        <Link
          key={h.title}
          to={`/shrine/${h.shrine}`}
          className="win-raised flex w-[220px] flex-col items-center gap-1 p-2 text-center text-black"
          style={{ rotate: `${(i - 1) * 4}deg` }}
        >
          <Img slot={assets.hobbies[i % assets.hobbies.length]} width={140} className="aspect-[4/3] object-cover" />
          <span className="font-impact text-xl">{h.title}</span>
          <span className="font-comic text-sm">{h.detail}</span>
          <span className="animate-blink font-pixel text-[8px] text-red-600">CLICK 4 SHRINE</span>
        </Link>
      ))}
      <div className="w-[240px] border-4 border-yellow-500 bg-white p-3 text-black">
        <p className="font-impact text-xl">FAVOURITE FOODS (RANKED)</p>
        <ol className="list-inside list-decimal font-comic">
          {daniel.foods.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
        <div className="mt-2 flex items-center justify-between">
          <Img slot="trophy" width={50} />
          <Img slot="kettle" />
          <Img slot="tooth" width={50} />
        </div>
      </div>
    </Band>
  )
}

function RootsBand() {
  const { roots } = daniel
  return (
    <Band id="roots" edges={EDGES.roots} tile="tile-brick" cursor={cursors.bear} flow title={<h2 className="bevel-text font-times text-4xl font-bold italic text-yellow-200 sm:text-5xl">~ ROOTS ~</h2>}>
      <div className="w-[260px] -rotate-2 bg-white p-2 text-center text-black shadow-[6px_6px_0_#000]">
        <Img slot={meSlot('roots-1.jpg', 400, 300, 'hometown photo')} width={240} />
        <p className="font-comic font-bold">{roots.hometown}</p>
      </div>
      <div className="w-[260px] rotate-2 bg-white p-2 text-center text-black shadow-[6px_6px_0_#000]">
        <Img slot={meSlot('roots-2.jpg', 400, 300, 'family photo')} width={240} />
        <p className="font-comic text-sm">{roots.family}</p>
      </div>
      <div className="flex w-[220px] flex-col items-center gap-2 bg-amber-100 p-3 text-center font-times text-black">
        <Img slot="envelope" width={100} />
        <p className="italic">a letter from home:</p>
        {roots.language ? (
          <p>
            <b>{roots.language.greeting}</b> — {roots.language.translation}
          </p>
        ) : (
          <p>“Dear Daniel, please call more. Also what is a website.”</p>
        )}
        <p className="font-bold">{roots.pets}</p>
      </div>
    </Band>
  )
}

/** The playground pages, plus a row of deeply suspicious "sponsored" buttons into the scam pages. */
const TOWN: { to: string; label: string; blurb: string; slot: Slot; anim: string; wide?: boolean }[] = [
  { to: '/arcade', label: "Daniel's Arcade", blurb: 'Aim Trainer 98 + Kettle Clicker', slot: cursors.joystick, anim: 'group-hover:animate-boing' },
  { to: '/desktop', label: "Daniel's Desktop", blurb: 'Snoop around my PC', slot: icons.kidComputer, anim: 'group-hover:animate-shake' },
  { to: '/radio', label: 'DANIEL FM', blurb: 'All Daniel, all the time', slot: icons.speaker, anim: 'group-hover:animate-pulse-scale' },
  { to: '/oracle', label: 'The Magic Kettle', blurb: 'Ask it anything', slot: assets.kettle, anim: 'group-hover:animate-wobble' },
  { to: '/blinkie-maker', label: 'Blinkie Maker', blurb: 'Make your own blinkie', slot: blinkies.iBite, anim: 'group-hover:animate-jank-x' },
  { to: '/stickers', label: 'Sticker Book', blurb: '12 hidden stickers. Find them.', slot: kawaii.cheerBlob, anim: 'group-hover:animate-spin-z' },
  // The seventh door spans the row: every 3D object on the site, catalogued.
  { to: '/dex', label: 'THE OBJECT DEX', blurb: 'Click the floating things. Catch them all. Some only come out at night.', slot: icons.question, anim: 'group-hover:animate-spin-y', wide: true },
]

// No strobe on these: they're loud enough already, and flashing is a seizure risk.
const SPONSORED: { to: string; text: string; className: string }[] = [
  { to: '/scan', text: '⚠ YOUR PC HAS (69) VIRUSES!!! CLICK TO SCAN', className: 'animate-shake bg-red-600 text-yellow-200 border-yellow-300' },
  { to: '/casino', text: '🎰 FREE SPINS!!! (SPINS NOT FREE)', className: 'animate-pulse-scale bg-[#060] text-yellow-300 border-yellow-500' },
  { to: '/survey', text: '📋 2 MINUTE SURVEY (47 MINUTES) WIN AN iPOD', className: 'animate-wobble bg-blue-700 text-white border-cyan-300' },
  { to: '/work-from-home', text: '💷 I MAKE £5,000/WEEK FROM MY BEDROOM. ASK ME HOW', className: 'animate-jank-x bg-yellow-300 text-green-800 border-green-700' },
  { to: '/popnuke', text: '☢ POPNUKE: KILL ALL POP-UPS FOREVER (FREE*)', className: 'animate-wobble bg-black text-yellow-300 border-yellow-400' },
]

function CyberTownBand() {
  return (
    <Band
      id="town"
      edges={EDGES.town}
      tile="tile-town"
      cursor={cursors.arcade}
      flow
      title={
        <h2 className="font-pixel text-2xl leading-relaxed text-white [text-shadow:3px_3px_0_#f0f,6px_6px_0_#000] sm:text-4xl">
          <WavyText text="~ DANIEL'S CYBER TOWN ~" />
        </h2>
      }
    >
      <ul className="grid w-[min(640px,100%)] grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Cyber Town">
        {TOWN.map((t) => (
          <li key={t.to} className={t.wide ? 'col-span-2 sm:col-span-3' : ''}>
            <Link to={t.to} className="win-raised group relative flex h-full flex-col items-center gap-1 p-2 text-center text-black">
              <Img slot={assets.newBadge} width={34} className="absolute -right-2 -top-3 rotate-12" />
              <span className="grid h-14 place-items-center">
                {/* Fit the 56px-tall slot: wide things (blinkies) can be wide, tall things get narrower. */}
                <Img slot={t.slot} width={Math.round(Math.min(110, (56 * t.slot.w) / t.slot.h, t.slot.w > 100 ? 110 : 52))} className={t.anim} />
              </span>
              <span className="font-comic text-sm font-bold">{t.label}</span>
              <span className="font-[Tahoma,sans-serif] text-[11px] text-gray-700">{t.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="w-[min(640px,100%)] space-y-2 text-center">
        <p className="font-[Tahoma,sans-serif] text-[10px] uppercase tracking-widest text-white">— sponsored links (do not click) —</p>
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Sponsored links">
          {SPONSORED.map((s) => (
            <li key={s.to}>
              <Link to={s.to} className={`inline-block border-4 border-double px-3 py-1 font-impact text-sm shadow-[4px_4px_0_#000] sm:text-base ${s.className}`}>
                {s.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  )
}

function DestinyBand() {
  const popups = usePopups()
  const navigate = useNavigate()
  const doors: { label: string; slot: Parameters<typeof Img>[0]['slot']; go: () => void }[] = [
    { label: 'Enter the Guestbook', slot: 'email3d', go: () => navigate('/guestbook') },
    { label: 'Visit the Dealership', slot: 'forSale', go: () => navigate('/dealership') },
    { label: 'Claim your Prize', slot: 'trophy', go: () => navigate('/you-won') },
    { label: 'Hard Hat Area', slot: 'worker', go: () => navigate('/under-construction') },
    { label: 'Email the Webmaster', slot: 'envelope', go: () => popups.open('business-card') },
    { label: '???', slot: 'arrow', go: () => navigate(randomRoute('/')) },
  ]
  return (
    <Band id="destiny" edges={EDGES.destiny} tile="tile-blue-swirl" cursor={cursors.atom} flow title={<h2 className="font-impact text-4xl text-white [text-shadow:0_0_8px_#0ff] sm:text-6xl"><WavyText text="CHOOSE YOUR DESTINY" /></h2>}>
      <Jukebox />
      <div className="grid w-[min(520px,100%)] grid-cols-2 gap-2 sm:grid-cols-3">
        {doors.map((d) => (
          <button key={d.label} type="button" onClick={d.go} className="win-raised flex flex-col items-center gap-1 p-2 text-black">
            <Img slot={d.slot} width={70} />
            <span className="font-comic text-sm font-bold">{d.label}</span>
          </button>
        ))}
      </div>
    </Band>
  )
}

/** The contents page: each chapter goes where its title says (a page, or a section further up this one). */
const TOC: ({ label: string; to: string } | { label: string; scrollTo: string })[] = [
  { label: 'Introduction', scrollTo: 'welcome' },
  { label: 'Kettles', to: '/shrine/kettle' },
  { label: 'Despair (Abridged)', to: '/shrine/norminette' },
  { label: 'Horses', to: '/shrine/horses' },
  { label: 'Segmentation', to: '/shrine/segfault' },
  { label: 'The End', scrollTo: 'end' },
  { label: 'The End (Director’s Cut)', to: '/leave' },
]

function EndBand() {
  return (
    <Band id="end" edges={EDGES.end} tile="tile-flames" cursor={icons.flame} flow className="!bg-[linear-gradient(0deg,#000_0%,#000_40%,#f00_80%,#f80_100%)]">
      <div className="w-[min(420px,100%)] bg-black/80 p-4 font-times text-white">
        <p className="mb-2 text-center text-2xl font-bold underline">TABLE OF CONTENTS</p>
        <ol className="list-inside list-decimal space-y-1">
          {TOC.map((t) => (
            <li key={t.label}>
              {'to' in t ? (
                <Link to={t.to} className="text-cyan-300 underline">
                  {t.label}
                </Link>
              ) : (
                <a
                  href={`#${t.scrollTo}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(t.scrollTo)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-cyan-300 underline"
                >
                  {t.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <Sticker className="mb-4 text-2xl">THIS WEB SITE NO LONGER EXISTS</Sticker>
        <p className="font-vt text-2xl text-white">Thank you for visiting. You may now leave.</p>
        <Link to="/leave" className="animate-shake font-impact text-3xl text-yellow-300 underline">
          to the end →
        </Link>
        <Link to="/boring" className="mt-6 font-[Arial,sans-serif] text-[10px] text-gray-500 underline">
          boring version
        </Link>
      </div>
    </Band>
  )
}
