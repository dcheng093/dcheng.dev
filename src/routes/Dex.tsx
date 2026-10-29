import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RainbowText } from '../components/chaos/Chaos'
import { ObjectWindow } from '../components/three/ObjectWindow'
import { cursors } from '../content/assets'
import { DEX_MILESTONES } from '../content/desktop'
import { shrines } from '../content/shrines'
import { useStored } from '../hooks/useLocalStorage'
import { gifCursor } from '../lib/cursor'
import { DEX, DEX_KEY, dexProgress, type DexEntry, type Found } from '../lib/discovery'
import { usePossessed } from '../lib/possession'
import type { ObjSpec } from '../three/pageScenes'

const STARS = { common: '★☆☆', rare: '★★☆', legendary: '★★★' } as const

const PAGE_NAMES: Record<string, string> = {
  '/dealership': 'The Dealership',
  '/guestbook': 'The Guestbook',
  '/under-construction': 'Under Construction',
  '/you-won': 'You Won!',
  '/checkout': 'Checkout',
  '/scan': 'Virus Scan',
  '/casino': 'The Casino',
  '/survey': 'The Survey',
  '/work-from-home': 'Work From Home',
  '/arcade': 'The Arcade',
  '/desktop': "Daniel's Desktop",
  '/radio': 'DANIEL FM',
  '/oracle': 'The Oracle',
  '/blinkie-maker': 'Blinkie Maker',
  '/popnuke': 'POPNUKE',
  '/settings': 'Control Panel',
  '/stickers': 'Sticker Book',
  '/dex': 'The Object Dex',
  '/leave': 'The Exit',
  anywhere: 'Anywhere, rarely, glowing',
}
const pageName = (page: string) => shrines.find((s) => `/shrine/${s.slug}` === page)?.title ?? PAGE_NAMES[page] ?? page

/**
 * The Object Dex: the site's specimens (one on every page of the ring, the night owls, the legendaries), each
 * catalogued the first time you click it. Missing ones show what they're made of and where they live; milestones hand
 * out hints for Daniel's Desktop. Once the site has turned, caught specimens also show the fragment they carry.
 */
export function Dex() {
  const [dex] = useStored<Found>(DEX_KEY, {})
  const [legendaries] = useStored<Found>('legendaries', {})
  const found = useMemo(() => ({ ...legendaries, ...dex }), [legendaries, dex])
  const { found: n, total, pct, complete } = dexProgress(found)
  const [open, setOpen] = useState<ObjSpec | null>(null)
  const possessed = usePossessed()
  const pages = useMemo(() => {
    const by = new Map<string, DexEntry[]>()
    for (const e of DEX) by.set(e.page, [...(by.get(e.page) ?? []), e])
    return [...by]
  }, [])

  return (
    <div data-testid="dex" className="tile-space-clouds min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.star) }}>
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="win-raised p-3 text-center text-black">
          <h1 className="font-impact text-3xl sm:text-5xl">
            <RainbowText text="THE OBJECT DEX" />
          </h1>
          <p className="mt-1 font-[Tahoma,sans-serif] text-sm">
            Not every 3D thing on this website: only the specimens. One on every page of the ring, seven that only come out at night, three that glow. Click one and it's catalogued.
          </p>
          <div className="win-sunken mx-auto mt-2 h-5 max-w-md bg-white" role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={total} aria-label="Objects catalogued">
            <div className="h-full bg-[repeating-linear-gradient(90deg,#000080_0_8px,#1084d0_8px_12px)] transition-[width] duration-500" style={{ width: `${(n / total) * 100}%` }} />
          </div>
          <p className="mt-1 font-pixel text-[10px]" data-testid="dex-count">
            {n} / {total} CATALOGUED ({pct}%)
          </p>
        </header>

        <section className="win-raised p-2 font-[Tahoma,sans-serif] text-xs text-black" aria-label="Rewards">
          <p className="bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">Rewards: hints for Daniel&apos;s Desktop</p>
          <ul className="mt-1 grid gap-1 sm:grid-cols-2">
            {DEX_MILESTONES.map((m) => (
              <li key={m.pct} className="win-sunken bg-white p-1" data-testid={`milestone-${m.pct}`}>
                {pct >= m.pct ? (
                  <>
                    🔓 <b>{m.pct}%</b> · <span className="font-mono">{m.folder}</span> · <span className="text-green-800">{m.hint}</span>
                  </>
                ) : (
                  <span className="text-gray-600">
                    🔒 <b>{m.pct}%</b> · <span className="font-mono">{m.folder}</span> · hint: ???
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-1">
            The locked folders are in <Link to="/desktop" className="text-blue-800 underline">My Computer</Link>. Every one has another way in, too.
          </p>
        </section>

        {pages.map(([page, entries]) => {
          const got = entries.filter((e) => found[e.spec.id]).length
          return (
            <section key={page} className="win-raised p-2 text-black" aria-label={pageName(page)}>
              <h2 className="flex items-baseline justify-between gap-2 border-b border-win-dark pb-1 font-[Tahoma,sans-serif] text-sm font-bold">
                {page.startsWith('/') ? <Link to={page} className="text-blue-800 underline">{pageName(page)}</Link> : <span>{pageName(page)}</span>}
                <span className="shrink-0 font-pixel text-[9px]">
                  {got}/{entries.length}
                </span>
              </h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {entries.map(({ spec }) => (
                  <DexCard key={spec.id} spec={spec} seen={found[spec.id]} possessed={possessed} onOpen={() => setOpen(spec)} />
                ))}
              </ul>
            </section>
          )
        })}

        {complete && (
          <section data-testid="dex-certificate" className="animate-pop-in border-8 border-double border-win-title bg-white p-6 text-center text-black shadow-[8px_8px_0_#000]">
            <h2 className="font-times text-3xl font-bold italic">Certificate of Total Cataloguing</h2>
            <p className="mt-2 font-times text-lg">
              You caught all {total} specimens. Every one. Even the goose. That is not the bottom. It is barely the start.
            </p>
          </section>
        )}
      </div>
      {open && <ObjectWindow key={open.id} spec={open} inDex onClose={() => setOpen(null)} />}
    </div>
  )
}

function DexCard({ spec, seen, possessed, onOpen }: { spec: ObjSpec; seen?: string; possessed: boolean; onOpen: () => void }) {
  const fragment = spec.specimen?.glyph ?? spec.specimen?.digit
  const tags = [spec.when === 'night' && '🌙 after dark', spec.role === 'anchor' && '🖥 big screens', spec.rarity === 'legendary' && '✦ legendary'].filter(Boolean)
  return (
    <li data-testid="dex-card" data-found={seen ? 'yes' : 'no'}>
      {seen ? (
        <button type="button" onClick={onOpen} className="win-raised flex h-full w-full flex-col gap-0.5 bg-[#ffffe1] p-1.5 text-left font-[Tahoma,sans-serif] text-[11px] leading-tight">
          <span className="flex items-start justify-between gap-1">
            <b className="text-xs">{spec.name}</b>
            {/* The fragment it carries: only the possessed can read it. Before that, an empty seal. */}
            {fragment && (
              <span
                aria-label={possessed ? `Fragment ${fragment}` : 'A blank seal'}
                data-testid="fragment"
                className={`grid h-6 w-6 shrink-0 place-items-center border font-times text-base font-bold ${possessed ? 'border-[#7a0000] bg-black text-[#ff2a2a] [text-shadow:0_0_4px_#f00]' : 'border-dashed border-gray-400 text-transparent'}`}
              >
                {possessed ? fragment : '·'}
              </span>
            )}
          </span>
          <span className={spec.rarity === 'legendary' ? 'animate-rainbow font-bold' : ''}>{STARS[spec.rarity]}</span>
          <span className="text-gray-700">First seen {new Date(seen).toLocaleDateString()}</span>
          {tags.length > 0 && <span className="text-[10px] text-gray-600">{tags.join(' · ')}</span>}
        </button>
      ) : (
        <div className="win-sunken flex h-full flex-col gap-0.5 bg-[#e8e8e8] p-1.5 font-[Tahoma,sans-serif] text-[11px] leading-tight text-gray-700">
          <b className="font-pixel text-[10px] text-black">???</b>
          <span>made of {spec.madeOf}</span>
          {tags.length > 0 && <span className="text-[10px]">{tags.join(' · ')}</span>}
        </div>
      )}
    </li>
  )
}
