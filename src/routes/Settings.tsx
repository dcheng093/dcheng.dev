import { useState, type ReactNode } from 'react'
import { assets, icons, kawaii, selfies, type Slot } from '../content/assets'
import { Img } from '../components/media/Img'
import { Win95Window } from '../components/Win95Window'
import { VolumeSlider } from '../components/WebringBar'
import { useSettings } from '../components/settings/settingsState'
import { useCursor } from '../components/settings/cursors'
import { useAudio } from '../audio/audioContext'
import { useClosing } from '../hooks/useClosing'
import { usePopups } from '../components/popups/popupState'
import { CHAOS_LEVELS, CURSORS, THEMES, danielPick, danielSwap, type Settings as SettingsT } from '../lib/settings'
import { usePossessed } from '../lib/possession'
import { Baptism } from '../components/possessed/Baptism'

const APPLETS = [
  { id: 'display', label: 'Display', icon: icons.kidComputer },
  { id: 'mouse', label: 'Mouse', icon: icons.keyboard },
  { id: 'sounds', label: 'Sounds', icon: icons.speaker },
  { id: 'daniel', label: 'Daniel', icon: assets.headGrin },
  { id: 'chaos', label: 'Chaos', icon: icons.siren },
] as const
/** Only there while the site is possessed: the way back. */
const BAPTIZE = { id: 'baptize', label: 'Baptize', icon: kawaii.angelBaby } as const
type AppletId = (typeof APPLETS)[number]['id'] | typeof BAPTIZE.id

/**
 * The Daniel Control Panel: a Win95 Control Panel window of applets. Each opens a Properties dialog that edits a
 * draft; Apply/OK save it for the whole site, Cancel forgets it.
 */
export function Settings() {
  const [open, setOpen] = useState<AppletId | null>(null)
  const [baptizing, setBaptizing] = useState(false)
  const possessed = usePossessed()
  const applets = possessed ? [...APPLETS, BAPTIZE] : APPLETS
  return (
    <div data-testid="settings" className="min-h-screen bg-[#008080] p-3 sm:p-6">
      <Win95Window title="Daniel Control Panel" icon={icons.kidComputer} className="mx-auto max-w-2xl" bodyClassName="bg-white">
        <div className="flex gap-3 border-b border-win-dark bg-win px-2 py-0.5" aria-hidden>
          {['File', 'Edit', 'View', 'Help'].map((m) => (
            <span key={m}>
              <u>{m[0]}</u>
              {m.slice(1)}
            </span>
          ))}
        </div>
        <ul className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-5">
          {applets.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setOpen(a.id)}
                aria-label={`${a.label} Properties`}
                className="flex w-full flex-col items-center gap-1 p-2 hover:bg-[#000080]/10 focus-visible:bg-win-title focus-visible:text-white"
              >
                <Img slot={a.icon} width={40} />
                <span>{a.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-win-dark bg-win px-2 py-0.5 text-[11px]">
          {applets.length} object(s) · Settings are saved on this computer, for this whole site.
        </p>
      </Win95Window>
      {open === 'baptize' ? (
        <BaptizeApplet
          onClose={() => setOpen(null)}
          onBaptize={() => {
            setOpen(null)
            setBaptizing(true)
          }}
        />
      ) : (
        open && <Applet key={open} id={open} onClose={() => setOpen(null)} />
      )}
      {baptizing && <Baptism onDone={() => setBaptizing(false)} />}
    </div>
  )
}

/** The Baptize applet: no settings, one button, and some water. */
function BaptizeApplet({ onClose, onBaptize }: { onClose: () => void; onBaptize: () => void }) {
  const shut = useClosing(onClose)
  const button = 'win-raised min-w-[72px] px-3 py-1'
  return (
    <Win95Window
      title="Baptize Properties"
      icon={BAPTIZE.icon}
      onClose={onClose}
      shut={shut}
      testId="applet"
      className="fixed left-1/2 top-[12%] z-[55] w-[min(360px,calc(100vw-16px))] -translate-x-1/2"
      bodyClassName="bg-win"
    >
      <div className="space-y-3 p-3">
        <Group legend="Font">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt>Holy water:</dt>
            <dd>1 L</dd>
            <dt>Faith:</dt>
            <dd>optional</dd>
            <dt>Status:</dt>
            <dd className="font-bold text-red-800">Something has followed you home.</dd>
          </dl>
        </Group>
        <p className="text-[11px] text-gray-700">This returns the website to how it was. What you saw, you will still have seen.</p>
        <div className="flex justify-end gap-2">
          <button type="button" className={`${button} font-bold`} onClick={onBaptize}>
            Baptize
          </button>
          <button type="button" className={button} onClick={shut.close}>
            Cancel
          </button>
        </div>
      </div>
    </Win95Window>
  )
}

function Applet({ id, onClose }: { id: Exclude<AppletId, 'baptize'>; onClose: () => void }) {
  const { settings, update } = useSettings()
  const [draft, setDraft] = useState(settings)
  const shut = useClosing(onClose)
  const set = (patch: Partial<SettingsT>) => setDraft((d) => ({ ...d, ...patch }))
  const changed = JSON.stringify(draft) !== JSON.stringify(settings)
  const applet = APPLETS.find((a) => a.id === id)!
  const button = 'win-raised min-w-[72px] px-3 py-1 disabled:text-win-dark'
  return (
    <Win95Window
      title={`${applet.label} Properties`}
      icon={applet.icon}
      onClose={onClose}
      shut={shut}
      testId="applet"
      className="fixed left-1/2 top-[12%] z-[55] max-h-[80vh] w-[min(420px,calc(100vw-16px))] -translate-x-1/2 overflow-y-auto"
      bodyClassName="bg-win"
    >
      <div className="space-y-3 p-3">
        {id === 'display' && <Display draft={draft} set={set} />}
        {id === 'mouse' && <Mouse draft={draft} set={set} />}
        {id === 'sounds' && <Sounds draft={draft} set={set} />}
        {id === 'daniel' && <Daniel draft={draft} set={set} />}
        {id === 'chaos' && <ChaosApplet draft={draft} set={set} />}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={button}
            onClick={() => {
              update(draft)
              shut.close()
            }}
          >
            OK
          </button>
          <button type="button" className={button} onClick={shut.close}>
            Cancel
          </button>
          <button type="button" className={button} disabled={!changed} onClick={() => update(draft)}>
            Apply
          </button>
        </div>
      </div>
    </Win95Window>
  )
}

type AppletProps = { draft: SettingsT; set: (patch: Partial<SettingsT>) => void }

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border border-win-dark p-2 shadow-[1px_1px_0_#fff_inset]">
      <legend className="px-1">{legend}</legend>
      {children}
    </fieldset>
  )
}

function Choice({ name, checked, onChange, label, blurb }: { name: string; checked: boolean; onChange: () => void; label: string; blurb?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 py-0.5">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-0.5" />
      <span>
        <b>{label}</b>
        {blurb && <span className="block text-[11px] text-gray-700">{blurb}</span>}
      </span>
    </label>
  )
}

function Display({ draft, set }: AppletProps) {
  return (
    <>
      {/* A tiny page under the chosen theme, before it's applied to the real one. */}
      <div className="win-sunken bg-white p-1">
        <div
          data-testid="theme-preview"
          data-theme={draft.theme === 'classic' ? undefined : draft.theme}
          className="theme-preview tile-stars h-28 p-2 text-center"
          style={draft.comicSans ? { fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" } : undefined}
        >
          <p className="font-impact text-2xl text-yellow-300">DANIEL'S WEB SITE</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <Img slot={kawaii.blueCat} width={40} />
            <span className="bg-white px-1 text-black">Welcome!!</span>
            <Img slot={assets.headGrin} width={40} />
          </div>
        </div>
      </div>
      <Group legend="Theme">
        {THEMES.map((t) => (
          <Choice key={t.id} name="theme" checked={draft.theme === t.id} onChange={() => set({ theme: t.id })} label={t.label} blurb={t.blurb} />
        ))}
      </Group>
      <Group legend="Fonts">
        <label className="flex cursor-pointer items-start gap-2">
          <input type="checkbox" checked={draft.comicSans} onChange={(e) => set({ comicSans: e.target.checked })} className="mt-0.5" />
          <span>
            <b>Comic Sans Mode</b>
            <span className="block text-[11px] text-gray-700">Every word on the whole site, in Comic Sans. This is a crime and you know it.</span>
          </span>
        </label>
      </Group>
    </>
  )
}

function Mouse({ draft, set }: AppletProps) {
  const cursor = useCursor(draft.cursor)
  return (
    <>
      <div data-testid="cursor-preview" className="win-sunken grid h-20 place-items-center bg-white text-center" style={cursor ? { cursor } : undefined}>
        Move the mouse here to try it.
      </div>
      <Group legend="Pointer">
        <div className="grid grid-cols-2 gap-x-2">
          {CURSORS.map((c) => (
            <Choice key={c.id} name="cursor" checked={draft.cursor === c.id} onChange={() => set({ cursor: c.id })} label={c.label} />
          ))}
        </div>
      </Group>
    </>
  )
}

function Level({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-24">{label}</span>
      <input type="range" min={0} max={100} step={5} value={Math.round(value * 100)} onChange={(e) => onChange(Number(e.target.value) / 100)} aria-label={label} className="min-w-0 flex-1 accent-win-title" />
      <span className="w-9 text-right font-vt text-sm">{Math.round(value * 100)}%</span>
    </label>
  )
}

function Sounds({ draft, set }: AppletProps) {
  const { locked, setLocked, sfx } = useAudio()
  return (
    <>
      <Group legend="Master volume (changes straight away)">
        <VolumeSlider />
      </Group>
      <Group legend="Balance">
        <div className="space-y-1">
          <Level label="Music" value={draft.music} onChange={(music) => set({ music })} />
          <Level label="Sound effects" value={draft.sfx} onChange={(v) => set({ sfx: v })} />
          <button type="button" className="win-raised px-2 py-0.5" onClick={() => sfx('coin')}>
            ▶ Test sound
          </button>
        </div>
      </Group>
      <label className="flex cursor-pointer items-start gap-2">
        <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="mt-0.5" />
        <span>
          <b>📌 Keep my song on every page</b>
          <span className="block text-[11px] text-gray-700">Instead of each page playing its own theme song.</span>
        </span>
      </label>
    </>
  )
}

// What the Daniel preview shows before (and maybe after) it becomes Daniel.
const SAMPLES: Slot[] = [kawaii.blueCat, kawaii.moonCat, kawaii.chickHop, kawaii.angelChick, icons.cherry, icons.teapot, icons.rocket, icons.diamond]
const POOL = [...assets.misc, assets.headGrin, assets.headShock, assets.headWink]

function Daniel({ draft, set }: AppletProps) {
  const popups = usePopups()
  return (
    <>
      <div className="win-sunken grid grid-cols-4 gap-1 bg-white p-2" data-testid="daniel-preview">
        {SAMPLES.map((s, i) => {
          const key = `preview-${i}`
          const swap = danielSwap(s.src, key, draft.density)
          return (
            <div key={key} className="grid aspect-square place-items-center overflow-hidden bg-[#eef]">
              {swap ? (
                <img src={POOL[danielPick(s.src, key, POOL.length)].src} alt="" data-daniel="" className="h-full w-full object-cover [image-rendering:pixelated]" />
              ) : (
                <img src={s.src} alt="" className="max-h-full max-w-full [image-rendering:pixelated]" />
              )}
            </div>
          )
        })}
      </div>
      <Group legend="Daniel Density">
        <label className="flex items-center gap-2">
          <Img slot={kawaii.blueCat} width={20} />
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={draft.density}
            onChange={(e) => set({ density: Number(e.target.value) })}
            aria-label="Daniel Density"
            className="min-w-0 flex-1 accent-win-title"
          />
          <Img slot={selfies[3]} width={24} />
          <span className="w-9 text-right font-vt text-sm">{draft.density}%</span>
        </label>
        <p className="mt-1 text-[11px] text-gray-700">How much of the site's pictures are replaced with Daniel. At 100% it is all Daniel. All of it.</p>
      </Group>
      {/* Opening it on purpose: POPNUKE only blocks the ones that ambush you. */}
      <button type="button" className="win-raised px-2 py-0.5" onClick={() => popups.open('daniel-cam')}>
        ● Watch Daniel Cam (live)
      </button>
    </>
  )
}

function ChaosApplet({ draft, set }: AppletProps) {
  const level = CHAOS_LEVELS.findIndex((c) => c.id === draft.chaos)
  return (
    <>
      <div className="win-sunken flex h-8 items-end gap-0.5 bg-black p-1" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={`flex-1 ${i < (level + 1) * 4 ? (i < 4 ? 'bg-lime' : i < 8 ? 'bg-yellow-300' : 'bg-red-600') : 'bg-[#222]'}`} style={{ height: `${30 + i * 6}%` }} />
        ))}
      </div>
      <Group legend="How much is going on">
        {CHAOS_LEVELS.map((c) => (
          <Choice key={c.id} name="chaos" checked={draft.chaos === c.id} onChange={() => set({ chaos: c.id })} label={c.label} blurb={c.blurb} />
        ))}
      </Group>
    </>
  )
}
