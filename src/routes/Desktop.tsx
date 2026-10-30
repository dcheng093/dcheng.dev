import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type FormEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSfx } from '../audio/audioContext'
import { Img } from '../components/media/Img'
import { Win95Window } from '../components/Win95Window'
import { useDrag } from '../hooks/useDrag'
import { assets, cursors, icons, kawaii, type Slot } from '../content/assets'
import { diaryStart, FILESYSTEM, recycled, restoredFeelings, restoreErrors, type FsKind, type FsNode } from '../content/desktop'
import { useStored } from '../hooks/useLocalStorage'
import { useClock } from '../hooks/useClock'
import { gifCursor } from '../lib/cursor'
import { desktopReducer, graft, isViewer, joinPath, listDir, locksIn, walk, type AppId, type DesktopAction, type DeskWindow, type FsContext, type ProgramId, type ViewerId } from '../lib/desktop'
import { openLock } from '../lib/hunt'
import { summonScare, useHeardAt, usePossessed } from '../lib/possession'
import { pick } from '../lib/random'
import { UncorruptedCtx } from '../lib/uncorrupted'
import { descend, descendedOf, heardAt } from '../lib/possession'
import { dexProgress, readDex, VISITS_KEY } from '../lib/discovery'
import { readStored } from '../hooks/useLocalStorage'
import { daniel } from '../content/daniel'
import { downloadCertificate } from '../components/ending/certificate'

// The ending only loads for those who reach it.
const Ascension = lazy(() => import('../components/ending/Ascension').then((m) => ({ default: m.Ascension })))

type Program = { title: string; icon: Slot; width: number }
const PROGRAMS: Record<AppId, Program> = {
  computer: { title: 'My Computer', icon: icons.kidComputer, width: 380 },
  bin: { title: 'Recycle Bin', icon: icons.crying, width: 320 },
  notepad: { title: 'diary.txt - Notepad', icon: kawaii.bunDiary, width: 320 },
  paint: { title: 'untitled - Paint', icon: cursors.pencil, width: 320 },
  'daniel-exe': { title: 'Daniel.exe', icon: assets.headWink, width: 280 },
}
const ORDER: AppId[] = ['computer', 'bin', 'notepad', 'paint', 'daniel-exe']

/** off → POST → (ScanDisk, if the plug was pulled) → splash → on → shutting down → safe to turn off. */
type Phase = 'off' | 'post' | 'scandisk' | 'splash' | 'on' | 'shutting' | 'safe'

const viewerTitle = (f: FsNode | null) =>
  f ? `${f.name} - ${f.kind === 'img' ? 'Image Viewer' : f.kind === 'exe' ? 'Error' : f.kind === 'audio' ? 'Media Player' : 'Notepad'}` : 'Notepad'

/**
 * Daniel's Desktop: a fake Win95 PC. Press the power button and it POSTs, boots to a splash and plays its
 * startup chord; then there are draggable program windows, a Start menu, a taskbar and a whole filesystem
 * to dig through. Shut it down properly, or pull the plug and sit through ScanDisk next time.
 */
export function Desktop() {
  const [state, dispatch] = useReducer(desktopReducer, { windows: [] })
  const [startOpen, setStartOpen] = useState(false)
  const [shutdownOpen, setShutdownOpen] = useState(false)
  // Stays on for the rest of the visit once booted; a pulled plug is remembered for the next boot.
  const [poweredOn, setPoweredOn] = useStored('desktopOn', false, 'session')
  const [dirty, setDirty] = useStored('desktopDirty', false, 'session')
  const [phase, setPhase] = useState<Phase>(poweredOn ? 'on' : 'off')
  const [selected, setSelected] = useState<ProgramId | null>(null)
  // Every file opened gets its own window (so a transmission can stay open while you dig through the rest).
  const [viewers, setViewers] = useState<Record<ViewerId, FsNode>>({})
  const [feelings, setFeelings] = useStored('feelingsRestored', false)
  const [showHidden, setShowHidden] = useStored('showHidden', false)
  // The answers this visitor got right, by folder path: on a later visit they re-open the same seals.
  const [keys, setKeys] = useStored<Record<string, string>>('desktopKeys', {})
  const [opened, setOpened] = useState<Record<string, FsNode[]>>({})
  const { visit, night, today } = useClock()
  const possessed = usePossessed()
  const ctx = useMemo<FsContext>(() => ({ showHidden, visit, night, today }), [showHidden, visit, night, today])
  const root = useMemo(() => {
    const base = feelings ? FILESYSTEM.map((d) => (d.name === 'C:' ? { ...d, children: [restoredFeelings, ...(d.children ?? [])] } : d)) : FILESYSTEM
    return graft(base, opened)
  }, [feelings, opened])
  useEffect(() => {
    let live = true
    for (const { path, seal } of locksIn(FILESYSTEM)) {
      if (!keys[path] || opened[path]) continue
      void openLock(seal, keys[path]).then((files) => live && files && setOpened((o) => ({ ...o, [path]: files })))
    }
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only stored answers re-open seals
  }, [keys])
  const area = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const sfx = useSfx()
  const opener = useOpener()

  const open = (id: ProgramId) => {
    const n = state.windows.length
    dispatch({ type: 'open', id, x: 90 + n * 22, y: 16 + n * 22 })
    setStartOpen(false)
    sfx('ding')
  }
  // The end of the hunt: DESCEND.EXE (sealed inside C:\DANIEL) plays the ending, by itself the first time.
  const [ending, setEnding] = useState<{ phrase: string; replay: boolean } | null>(null)
  const [keepsake, setKeepsake] = useState<string | null>(null)
  const finish = (name: string) => {
    const phrase = ending!.phrase
    if (!ending!.replay) descend(name)
    setEnding(null)
    setKeepsake(phrase)
    // Then the words they came for, in plain Notepad: the README beside DESCEND.EXE.
    const [dir, files] = Object.entries(opened).find(([, fs]) => fs.some((f) => f.ending)) ?? []
    const readme = files?.find((f) => f.name === 'README.txt')
    if (dir && readme) openFile(readme, `${dir}\\README.txt`)
  }

  const openFile = (f: FsNode, path: string) => {
    if (f.ending) return setEnding({ phrase: f.ending.phrase, replay: !!descendedOf() })
    // Look at him. (Once ever, and only once the site has turned.)
    if (possessed && f.name === 'me.jpg') window.setTimeout(summonScare, 1800)
    const id: ViewerId = `viewer:${path}`
    setViewers((v) => ({ ...v, [id]: f }))
    // Beside My Computer when there's room (so the next file can still be double-clicked), cascading from there;
    // on a narrow screen they cascade over it. Already open: it just comes to the front.
    const n = state.windows.filter((w) => isViewer(w.id)).length
    const explorer = state.windows.find((w) => w.id === 'computer')
    const width = area.current?.clientWidth ?? 0
    const beside = explorer ? explorer.x + PROGRAMS.computer.width + 12 : 0
    const room = explorer && beside + 340 <= width
    dispatch({ type: 'open', id, x: (room ? beside : 110) + (n % 6) * 22, y: (room ? explorer.y : 30) + (n % 6) * 22 })
    sfx(f.kind === 'exe' ? 'chord' : 'ding')
  }
  const front = [...state.windows].reverse().find((w) => !w.minimised)?.id
  const program = (id: ProgramId): Program => (isViewer(id) ? { title: viewerTitle(viewers[id] ?? null), icon: kawaii.bunDiary, width: 340 } : PROGRAMS[id])
  const titleFor = (id: ProgramId) => program(id).title

  const boot = () => {
    setPhase('post')
    sfx('beep')
  }
  const booted = () => {
    setPhase('on')
    setPoweredOn(true)
    sfx('startup')
  }
  const powerDown = (next: Phase) => {
    dispatch({ type: 'reset' })
    setStartOpen(false)
    setShutdownOpen(false)
    setPoweredOn(false)
    setPhase(next)
  }
  const power = () => {
    if (phase === 'off' || phase === 'safe') return boot()
    // Pulled the plug: no goodbye chord, and ScanDisk on the next boot.
    setDirty(true)
    powerDown('off')
  }
  const shutDown = (how: ShutdownChoice) => {
    if (how === 'leave') return navigate('/leave')
    sfx('shutdown')
    powerDown(how === 'restart' ? 'post' : 'shutting')
  }

  useEffect(() => {
    const next: Partial<Record<Phase, [number, () => void]>> = {
      scandisk: [2600, () => setPhase('splash')],
      splash: [2400, booted],
      shutting: [2600, () => setPhase('safe')],
    }
    const step = next[phase]
    if (!step) return
    const t = window.setTimeout(step[1], step[0])
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per phase
  }, [phase])

  const busy = phase === 'post' || phase === 'scandisk' || phase === 'splash' || phase === 'shutting'
  // Readable even while possessed: the hunt's clues live in these files.
  return (
    <UncorruptedCtx.Provider value>
      <div data-testid="desktop" data-power={phase} data-uncorrupted="" className="p-2 sm:p-4" style={{ cursor: busy ? 'wait' : gifCursor(cursors.mouse) }}>
        <div className="mx-auto max-w-5xl rounded-sm border-2 border-[#8a826c] bg-[#d6cfb6] p-2 shadow-[8px_8px_0_#000] sm:p-3">
          <div
            ref={area}
            className={`relative h-[max(520px,calc(100vh-210px))] overflow-hidden border-4 border-[#404040] ${phase === 'on' ? 'tile-desktop' : 'bg-black'}`}
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            {phase === 'on' ? (
              <div key="on" className="absolute inset-0 animate-crt-on" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
                <ul className="absolute left-2 top-2 grid gap-3" aria-label="Desktop icons">
                  {ORDER.map((id) => (
                    <li key={id}>
                      <button type="button" {...opener(() => setSelected(id), () => open(id))} className="group flex w-20 flex-col items-center gap-1 text-center font-[Tahoma,sans-serif] text-[11px] text-white">
                        <Img slot={PROGRAMS[id].icon} width={36} className={`group-hover:animate-boing ${selected === id ? 'brightness-50 sepia hue-rotate-180 saturate-[4]' : ''}`} />
                        <span className={`px-0.5 ${selected === id ? 'bg-win-title outline-dotted outline-1 outline-white' : ''}`}>{PROGRAMS[id].title.replace(' - Notepad', '').replace(' - Paint', '')}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Stable DOM order, stacked by z-index: moving a window's node to the front mid-click would swallow the click. */}
                {[...state.windows].sort((a, b) => a.id.localeCompare(b.id)).map((w) => ({ w, z: state.windows.indexOf(w) })).map(({ w, z }) => (
                  <ProgramWindow key={w.id} win={w} program={program(w.id)} z={10 + z} active={w.id === front} area={area} dispatch={dispatch}>
                    {w.id === 'computer' && <Explorer
                        root={root}
                        ctx={ctx}
                        setShowHidden={setShowHidden}
                        isOpen={(p) => !!opened[p]}
                        unlock={(p, answer, files) => {
                          setOpened((o) => ({ ...o, [p]: files }))
                          setKeys((k) => ({ ...k, [p]: answer }))
                          const end = files.find((f) => f.ending)?.ending
                          if (end && !descendedOf()) setEnding({ phrase: end.phrase, replay: false })
                        }}
                        openFile={openFile}
                      />}
                    {w.id === 'bin' && <RecycleBin night={night} feelings={feelings} restoreFeelings={() => setFeelings(true)} />}
                    {w.id === 'notepad' && <Notepad />}
                    {w.id === 'paint' && <Paint />}
                    {w.id === 'daniel-exe' && <DanielExe close={() => dispatch({ type: 'close', id: w.id })} />}
                    {isViewer(w.id) && <Viewer file={viewers[w.id] ?? null} />}
                  </ProgramWindow>
                ))}

                {startOpen && (
                  <nav aria-label="Start menu" className="win-raised absolute bottom-9 left-0 z-50 flex animate-pop-in font-[Tahoma,sans-serif] text-xs text-black">
                    <div className="flex w-6 items-end bg-gradient-to-t from-win-title to-[#1084d0] pb-1">
                      <span className="-rotate-90 whitespace-nowrap font-bold text-white [transform-origin:12px_0]">Daniel 95</span>
                    </div>
                    <ul className="w-48 py-1">
                      {ORDER.map((id) => (
                        <li key={id}>
                          <button type="button" onClick={() => open(id)} className="flex w-full items-center gap-2 px-2 py-1 text-left hover:bg-win-title hover:text-white">
                            <Img slot={PROGRAMS[id].icon} width={18} /> {PROGRAMS[id].title}
                          </button>
                        </li>
                      ))}
                      <li className="my-1 border-t border-win-dark" />
                      {(
                        [
                          ['/dex', 'Object Dex.lnk'],
                          ['/arcade', 'Arcade.lnk'],
                          ['/radio', 'DANIEL FM.lnk'],
                          ['/blinkie-maker', 'Blinkie Maker.lnk'],
                        ] as const
                      ).map(([to, label]) => (
                        <li key={to}>
                          <button type="button" onClick={() => navigate(to)} className="w-full px-2 py-1 text-left hover:bg-win-title hover:text-white">↗ {label}</button>
                        </li>
                      ))}
                      <li className="my-1 border-t border-win-dark" />
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setStartOpen(false)
                            setShutdownOpen(true)
                          }}
                          className="w-full px-2 py-1 text-left hover:bg-win-title hover:text-white"
                        >
                          ⏻ Shut Down…
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}

                {shutdownOpen && <ShutdownDialog onYes={shutDown} onNo={() => setShutdownOpen(false)} />}

                <div className="win-raised absolute inset-x-0 bottom-0 z-50 flex h-9 items-center gap-1 px-1 font-[Tahoma,sans-serif] text-xs text-black">
                  <button type="button" onClick={() => setStartOpen((o) => !o)} aria-expanded={startOpen} className={`win-raised flex items-center gap-1 px-2 py-0.5 font-bold ${startOpen ? '[border-color:#404040_#fff_#fff_#404040]' : ''}`}>
                    <Img slot={icons.floppy} width={16} /> Start
                  </button>
                  <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
                    {state.windows.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => dispatch({ type: 'taskbar', id: w.id })}
                        className={`win-raised flex min-w-0 max-w-36 items-center gap-1 truncate px-1 py-0.5 ${w.id === front ? 'bg-[#e0e0e0] font-bold [border-color:#404040_#fff_#fff_#404040]' : ''}`}
                      >
                        <Img slot={program(w.id).icon} width={14} />
                        <span className="truncate">{titleFor(w.id)}</span>
                      </button>
                    ))}
                  </div>
                  <Clock />
                </div>
              </div>
            ) : (
              <BootScreen key={phase} phase={phase} onPosted={() => setPhase(dirty ? 'scandisk' : 'splash')} onScanned={() => setDirty(false)} />
            )}
          </div>
          <Bezel phase={phase} onPower={power} />
        </div>
      </div>
      {/* Over the whole screen, not inside Daniel95's: on a phone the monitor is wider than the window. */}
      {keepsake && <Keepsake phrase={keepsake} onClose={() => setKeepsake(null)} />}
      {ending && (
        <Suspense fallback={null}>
          <Ascension replay={ending.replay} defaultName={descendedOf()?.name ?? 'someone patient'} onDone={finish} />
        </Suspense>
      )}
    </UncorruptedCtx.Provider>
  )
}

/** After the ending: something to take away. A certificate of the descent, and a way to tell Daniel. */
function Keepsake({ phrase, onClose }: { phrase: string; onClose: () => void }) {
  const me = descendedOf()
  const record = () => ({
    name: me?.name ?? 'someone patient',
    heard: heardAt(),
    finished: me?.at ?? new Date().toISOString(),
    visits: readStored(VISITS_KEY, 1),
    dex: dexProgress(readDex()),
  })
  const r = record()
  const body = [phrase, '', `name: ${r.name}`, `first heard the song: ${r.heard ?? 'unknown'}`, `reached the bottom: ${r.finished}`, `visits: ${r.visits}`, `specimens: ${r.dex.found} of ${r.dex.total}`].join('\n')
  const mail = `mailto:${daniel.links.email}?subject=${encodeURIComponent('I descended')}&body=${encodeURIComponent(body)}`
  return (
    <div role="dialog" aria-label="Take something with you" data-testid="keepsake" className="fixed left-1/2 top-1/2 z-[60] w-[min(340px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 animate-pop-in">
      <div className="win-raised bg-win p-0.5 font-[Tahoma,sans-serif] text-xs text-black shadow-[6px_6px_0_#0006]">
        <p className="bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">Take something with you</p>
        <div className="space-y-2 p-3">
          <p>You descended. Here's the proof, and a way to tell the one who made this.</p>
          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={() => downloadCertificate(record())} className="win-raised px-2 py-1 font-bold" data-testid="download-certificate">
              Download your certificate
            </button>
            <a href={mail} className="win-raised px-2 py-1 text-center font-bold text-black no-underline" data-testid="send-to-daniel">
              Send it to Daniel
            </a>
            <button type="button" onClick={onClose} className="win-raised px-2 py-1">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Win95 icons: click selects, double-click opens. Touch has no double-click, so a tap opens; so does Enter. */
function useOpener() {
  const touch = useRef(false)
  return useCallback(
    (select: () => void, open: () => void) => ({
      onPointerDown: (e: ReactPointerEvent) => {
        touch.current = e.pointerType === 'touch'
      },
      onClick: (e: ReactMouseEvent) => {
        select()
        if (e.detail === 0 || touch.current) open()
      },
      onDoubleClick: () => {
        if (!touch.current) open()
      },
    }),
    [],
  )
}

/** The beige strip under the screen: badge, power light, and the big button. */
function Bezel({ phase, onPower }: { phase: Phase; onPower: () => void }) {
  const off = phase === 'off' || phase === 'safe'
  return (
    <div className="mt-2 flex items-center gap-3 px-1 font-[Tahoma,sans-serif] text-black">
      <span className="font-times text-sm font-bold italic tracking-wide text-[#4a4535]">
        Daniel<span className="font-impact not-italic text-win-title">95</span>
      </span>
      <span className="ml-auto flex items-center gap-1 text-[10px] uppercase text-[#4a4535]">
        <span aria-hidden className={`inline-block h-2 w-2 rounded-full border border-[#4a4535] ${off ? 'bg-[#3a2a00]' : phase === 'on' ? 'bg-[#2f2]' : 'animate-blink bg-[#fb0]'}`} />
        {off ? 'Standby' : phase === 'on' ? 'On' : 'HDD'}
      </span>
      {off && <span aria-hidden className="animate-blink font-pixel text-[9px] text-red-700">PRESS →</span>}
      <button
        type="button"
        onClick={onPower}
        aria-label="Power"
        data-testid="power"
        className="win-raised grid h-9 w-9 place-items-center rounded-full bg-[#e8e2cc] text-lg font-bold leading-none text-[#4a4535] active:[border-color:#404040_#fff_#fff_#404040]"
      >
        ⏻
      </button>
    </div>
  )
}

const POST: { at: number; text: string | ((mem: number) => string); disk?: boolean }[] = [
  { at: 0, text: 'Daniel BIOS v4.2   (C) 1995 Daniel Cheng Software Ltd.' },
  { at: 2, text: 'Daniel 486DX2 CPU at 66 MHz' },
  { at: 3, text: (mem) => `Memory Test : ${mem}K${mem >= 65536 ? ' OK' : ''}` },
  { at: 19, text: 'Detecting IDE Primary Master   ... DANIEL (C:)', disk: true },
  { at: 21, text: "Detecting IDE Secondary Master ... CD-ROM (D:)" },
  { at: 23, text: 'Detecting Floppy Drive A:      ... 1.44M 3½"' },
  { at: 24, text: 'Detecting Kettle               ... boiling' },
  { at: 28, text: 'Starting Daniel 95...' },
]
const POST_END = 33

/** Everything the monitor shows while the PC isn't on the desktop. Clicks or keys skip the POST. */
function BootScreen({ phase, onPosted, onScanned }: { phase: Exclude<Phase, 'on'>; onPosted: () => void; onScanned: () => void }) {
  const sfx = useSfx()
  const [tick, setTick] = useState(0)
  const done = useRef(false)
  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    onPosted()
  }, [onPosted])

  useEffect(() => {
    if (phase !== 'post' && phase !== 'scandisk') return
    const t = window.setInterval(() => setTick((n) => n + 1), 100)
    return () => window.clearInterval(t)
  }, [phase])
  useEffect(() => {
    if (phase === 'post') {
      if (POST.some((l) => l.disk && l.at === tick)) sfx('disk')
      if (tick >= POST_END) finish()
    }
    if (phase === 'scandisk' && tick === 1 && !done.current) {
      done.current = true
      sfx('disk')
      onScanned()
    }
  }, [phase, tick, sfx, finish, onScanned])
  useEffect(() => {
    if (phase !== 'post') return
    window.addEventListener('keydown', finish)
    return () => window.removeEventListener('keydown', finish)
  }, [phase, finish])

  if (phase === 'off')
    return (
      <div className="grid h-full place-items-center p-4 text-center font-vt text-xl text-[#2a2a2a]" data-testid="screen-off">
        <p>
          NO SIGNAL
          <br />
          <span className="text-base">press the power button to start Daniel 95</span>
        </p>
      </div>
    )
  if (phase === 'safe')
    return (
      <div className="grid h-full animate-crt-on place-items-center bg-black p-4 text-center font-[Tahoma,sans-serif] text-2xl font-bold text-[#ff8c00] sm:text-4xl" data-testid="screen-safe">
        It&apos;s now safe to turn off
        <br />
        your computer.
      </div>
    )
  if (phase === 'post') {
    const mem = Math.min(65536, Math.max(0, tick - 3) * 4096)
    return (
      <button type="button" onClick={finish} aria-label="Skip the start-up checks" className="block h-full w-full animate-crt-on cursor-wait p-3 text-left font-vt text-base leading-tight text-[#c0c0c0] sm:text-xl" data-testid="screen-post">
        {POST.filter((l) => l.at <= tick).map((l) => (
          <span key={l.at} className="block whitespace-pre">
            {typeof l.text === 'function' ? l.text(mem) : l.text}
          </span>
        ))}
        <span className="absolute inset-x-3 bottom-3 block">Press DEL to enter SETUP. Press any key (or click) to skip.</span>
      </button>
    )
  }
  if (phase === 'scandisk') {
    const checks = ['Media descriptor', 'File allocation tables', 'Directory structure', 'File system', 'Kettle', 'Surface scan']
    const doneN = Math.min(checks.length, Math.floor(tick / 4))
    return (
      <div className="h-full bg-[#0000a8] p-3 font-vt text-base text-[#c0c0c0] sm:text-xl" data-testid="screen-scandisk">
        <p className="bg-[#c0c0c0] px-2 text-center text-[#0000a8]">Daniel ScanDisk</p>
        <p className="mt-3">
          Because Daniel 95 was not shut down properly, ScanDisk is now checking your drives for errors. To avoid seeing this message, always shut down your computer by clicking Start, then Shut Down.
        </p>
        <ul className="mt-3">
          {checks.map((c, i) => (
            <li key={c} className="whitespace-pre">
              {i < doneN ? '  √ ' : i === doneN ? '  » ' : '    '}
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-4 h-4 max-w-md border border-[#c0c0c0]">
          <div className="h-full bg-[#ffff55]" style={{ width: `${(doneN / checks.length) * 100}%` }} />
        </div>
      </div>
    )
  }
  return (
    <div className="relative grid h-full place-items-center bg-[#5a8fd8] bg-[url('/me/CLOUD2.webp')] bg-cover bg-center text-center" data-testid={`screen-${phase}`}>
      <div className={phase === 'splash' ? 'animate-crt-on' : ''}>
        <p className="font-times text-5xl font-bold italic text-white [text-shadow:3px_3px_0_#000] sm:text-7xl">
          Daniel<span className="font-impact not-italic text-[#ffd84a]">95</span>
        </p>
        <p className="mt-2 font-[Tahoma,sans-serif] text-sm font-bold text-white [text-shadow:1px_1px_0_#000]">
          {phase === 'splash' ? 'Starting Daniel 95…' : 'Please wait while your computer shuts down.'}
        </p>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3 animate-boot-bar bg-[linear-gradient(90deg,#000080,#1084d0,#7fdfff,#1084d0,#000080)] bg-[length:160px_100%]" />
    </div>
  )
}

type ShutdownChoice = 'shutdown' | 'restart' | 'leave'

function ShutdownDialog({ onYes, onNo }: { onYes: (how: ShutdownChoice) => void; onNo: () => void }) {
  const [how, setHow] = useState<ShutdownChoice>('shutdown')
  const choices: [ShutdownChoice, string][] = [
    ['shutdown', 'Shut down the computer?'],
    ['restart', 'Restart the computer?'],
    ['leave', 'Close all programs and leave the website?'],
  ]
  return (
    // The rest of the screen greys out behind a dither, like it did.
    <div className="absolute inset-0 z-[60] grid place-items-center bg-[repeating-conic-gradient(#0000_0_25%,#0007_0_50%)_0_0/2px_2px]">
      <Win95Window title="Shut Down Daniel 95" icon={icons.kidComputer} onClose={onNo} testId="shutdown-dialog" className="w-[min(340px,calc(100%-16px))]" bodyClassName="bg-win">
        <form
          className="flex gap-3 p-3"
          onSubmit={(e) => {
            e.preventDefault()
            onYes(how)
          }}
        >
          <Img slot={icons.kidComputer} width={48} />
          <fieldset className="space-y-1">
            <legend className="mb-1">Are you sure you want to:</legend>
            {choices.map(([id, label]) => (
              <label key={id} className="flex items-center gap-1">
                <input type="radio" name="shutdown" checked={how === id} onChange={() => setHow(id)} /> {label}
              </label>
            ))}
            <div className="flex gap-1 pt-2">
              <button type="submit" className="win-raised w-16 px-2 font-bold">Yes</button>
              <button type="button" onClick={onNo} className="win-raised w-16 px-2">No</button>
            </div>
          </fieldset>
        </form>
      </Win95Window>
    </div>
  )
}

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 10_000)
    return () => window.clearInterval(t)
  }, [])
  const possessed = usePossessed()
  return <span className="win-sunken px-2 py-0.5" data-testid="desktop-clock">{possessed ? '6:66' : now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
}

type WinProps = {
  win: DeskWindow
  program: Program
  z: number
  active: boolean
  area: RefObject<HTMLDivElement | null>
  dispatch: Dispatch<DesktopAction>
  children: ReactNode
}

function ProgramWindow({ win, program: p, z, active, area, dispatch, children }: WinProps) {
  const drag = useDrag((x, y) => {
    const r = area.current?.getBoundingClientRect()
    if (!r) return
    dispatch({ type: 'move', id: win.id, x: Math.min(r.width - 60, Math.max(-p.width + 60, x - r.left)), y: Math.min(r.height - 60, Math.max(0, y - r.top)) })
  })
  if (win.minimised) return null
  return (
    <Win95Window
      title={p.title}
      icon={p.icon}
      drag={drag}
      onFocus={() => dispatch({ type: 'focus', id: win.id })}
      onMinimise={() => dispatch({ type: 'minimise', id: win.id })}
      onClose={() => dispatch({ type: 'close', id: win.id })}
      testId={isViewer(win.id) ? 'window-viewer' : `window-${win.id}`}
      inactive={!active}
      className="absolute max-w-[calc(100%-8px)]"
      style={{ left: win.x, top: win.y, width: p.width, zIndex: z }}
      bodyClassName="bg-white"
    >
      {children}
    </Win95Window>
  )
}

/** Little Win95-ish icons, drawn: a folder, a drive, a page, a shortcut, a program. Padlocked when locked. */
function FileIcon({ kind, locked }: { kind: FsKind; locked: boolean }) {
  const body: Record<FsKind, ReactNode> = {
    folder: (
      <>
        <path d="M2 8h10l2 3h16v15H2z" fill="#ffd84a" stroke="#000" />
        <path d="M2 13h28" stroke="#b08800" />
      </>
    ),
    drive: (
      <>
        <path d="M2 12h28v10H2z" fill="#c0c0c0" stroke="#000" />
        <path d="M5 18h14" stroke="#808080" />
        <rect x="24" y="16" width="3" height="3" fill="#2f2" stroke="#000" />
      </>
    ),
    txt: (
      <>
        <path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000" />
        <path d="M10 12h12M10 16h12M10 20h12M10 24h8" stroke="#000080" />
      </>
    ),
    img: (
      <>
        <path d="M4 6h24v20H4z" fill="#fff" stroke="#000" />
        <path d="M6 24l7-9 5 6 3-3 5 6z" fill="#2a8" />
        <circle cx="22" cy="11" r="2.5" fill="#fc0" />
      </>
    ),
    audio: (
      <>
        <path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000" />
        <path d="M12 10v12M12 10l8-2v12" fill="none" stroke="#000" strokeWidth={1.5} />
        <circle cx="10.5" cy="22" r="2" fill="#000" />
        <circle cx="18.5" cy="20" r="2" fill="#000" />
      </>
    ),
    link: (
      <>
        <path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000" />
        <path d="M5 18h9v9H5z" fill="#fff" stroke="#000" />
        <path d="M7 25l5-5M9 20h3v3" stroke="#000" />
      </>
    ),
    exe: (
      <>
        <path d="M3 6h26v20H3z" fill="#fff" stroke="#000" />
        <path d="M3 6h26v4H3z" fill="#000080" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 32 32" width={32} height={32} aria-hidden shapeRendering="crispEdges" className="shrink-0">
      {body[kind]}
      {locked && (
        <g>
          <path d="M19 19h10v9H19z" fill="#fc0" stroke="#000" />
          <path d="M21 19v-3a3 3 0 0 1 6 0v3" fill="none" stroke="#000" strokeWidth={1.5} />
        </g>
      )}
    </svg>
  )
}

type ExplorerProps = {
  root: FsNode[]
  ctx: FsContext
  setShowHidden: (v: boolean) => void
  isOpen: (path: string) => boolean
  unlock: (path: string, answer: string, files: FsNode[]) => void
  openFile: (f: FsNode, path: string) => void
}

/** My Computer, but you can go in: drives, folders, files, shortcuts, hidden files and password-locked folders. */
function Explorer({ root, ctx, setShowHidden, isOpen, unlock, openFile }: ExplorerProps) {
  const [path, setPath] = useState<string[]>([])
  const [history, setHistory] = useState<string[][]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [viewMenu, setViewMenu] = useState(false)
  const [prompt, setPrompt] = useState<{ node: FsNode; path: string[] } | null>(null)
  const [problem, setProblem] = useState<{ text: string; retry: () => void } | null>(null)
  const sfx = useSfx()
  const navigate = useNavigate()
  const opener = useOpener()

  // Tonight's folder at 5am, say: if where you were has gone, you're back at My Computer.
  const here = walk(root, path, ctx) ?? walk(root, [], ctx)!
  const at = walk(root, path, ctx) ? path : []
  const items = listDir(here, ctx)
  const locked = (n: FsNode, p: string[]) => !!n.lock && !isOpen(joinPath(p))

  const go = (next: string[]) => {
    setHistory((h) => [...h, at])
    setPath(next)
    setSel(null)
    sfx('disk')
  }
  const open = (n: FsNode) => {
    const p = [...at, n.name]
    if (n.kind === 'drive' && listDir(n, ctx).length === 0) {
      sfx('chord')
      return setProblem({ text: `${n.name}\\ is not accessible.\n\nThe device is not ready.`, retry: () => open(n) })
    }
    if (n.kind === 'drive' || n.kind === 'folder') return locked(n, p) ? setPrompt({ node: n, path: p }) : go(p)
    if (n.kind === 'link') return navigate(n.to!)
    openFile(n, joinPath(p))
  }
  const selected = items.find((n) => n.name === sel)

  return (
    <div className="relative font-[Tahoma,sans-serif] text-black" data-testid="explorer">
      <div className="relative flex gap-3 border-b border-win-dark bg-win px-1">
        <span aria-hidden><u>F</u>ile</span>
        <span aria-hidden><u>E</u>dit</span>
        <button type="button" aria-expanded={viewMenu} onClick={() => setViewMenu((v) => !v)} className={viewMenu ? 'bg-win-title text-white' : ''}>
          <u>V</u>iew
        </button>
        <span aria-hidden><u>H</u>elp</span>
        {viewMenu && (
          <div className="win-raised absolute left-10 top-full z-10 bg-win p-1">
            <label className="flex items-center gap-1 whitespace-nowrap px-1 hover:bg-win-title hover:text-white">
              <input
                type="checkbox"
                checked={ctx.showHidden}
                onChange={(e) => {
                  setShowHidden(e.target.checked)
                  setViewMenu(false)
                }}
              />
              Show hidden files
            </label>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 bg-win p-1">
        <button
          type="button"
          disabled={!history.length}
          onClick={() => {
            setPath(history[history.length - 1])
            setHistory((h) => h.slice(0, -1))
            setSel(null)
          }}
          className="win-raised px-1.5 disabled:text-win-dark"
        >
          ← Back
        </button>
        <button type="button" disabled={!at.length} onClick={() => go(at.slice(0, -1))} className="win-raised px-1.5 disabled:text-win-dark">
          ↑ Up
        </button>
        <span className="win-sunken min-w-0 flex-1 truncate bg-white px-1" data-testid="address">
          {at.length ? `${joinPath(at)}\\` : 'My Computer'}
        </span>
      </div>
      <ul aria-label="Files" className="win-sunken grid max-h-56 min-h-32 grid-cols-[repeat(auto-fill,minmax(76px,1fr))] content-start gap-1 overflow-y-auto bg-white p-1">
        {items.map((n) => (
          <li key={n.name}>
            <button type="button" {...opener(() => setSel(n.name), () => open(n))} className={`flex w-full flex-col items-center gap-0.5 p-0.5 text-center text-[11px] leading-tight ${n.hidden ? 'opacity-60' : ''}`}>
              <FileIcon kind={n.kind} locked={locked(n, [...at, n.name])} />
              <span className={`break-all px-0.5 ${sel === n.name ? 'bg-win-title text-white outline-dotted outline-1' : ''}`}>{n.name}</span>
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="col-span-full p-1 italic text-gray-600">This folder is empty.</li>}
      </ul>
      <p className="flex gap-1 bg-win px-1 py-0.5 text-[11px]" role="status">
        <span className="win-sunken shrink-0 px-1">{items.length} object(s)</span>
        <span className="win-sunken min-w-0 flex-1 truncate px-1">
          {selected ? (selected.kind === 'drive' ? selected.text : locked(selected, [...at, selected.name]) ? '🔒 Locked. Double-click to enter the password.' : `${selected.name}${selected.hidden ? ' (hidden)' : ''}`) : 'Double-click to open.'}
        </span>
      </p>

      {prompt && (
        <PasswordPrompt
          node={prompt.node}
          onCancel={() => setPrompt(null)}
          onUnlock={(answer, files) => {
            sfx('tada')
            unlock(joinPath(prompt.path), answer, files)
            setPrompt(null)
            go(prompt.path)
          }}
        />
      )}
      {problem && (
        <div role="alertdialog" aria-label="Error" className="absolute inset-0 z-20 grid place-items-center bg-[repeating-conic-gradient(#0000_0_25%,#0005_0_50%)_0_0/2px_2px] p-2">
          <div className="win-raised w-full max-w-[260px] animate-pop-in bg-win p-0.5">
            <p className="bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">{at.length ? joinPath(at) : 'My Computer'}</p>
            <div className="flex gap-2 p-2">
              <Img slot={icons.warning} width={28} />
              <p className="whitespace-pre-line">{problem.text}</p>
            </div>
            <div className="flex justify-center gap-1 pb-2">
              <button
                type="button"
                onClick={() => {
                  const retry = problem.retry
                  setProblem(null)
                  retry()
                }}
                className="win-raised w-16 px-2"
              >
                Retry
              </button>
              <button type="button" onClick={() => setProblem(null)} className="win-raised w-16 px-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Trying a password really is work (deriving the seal's key), so the hourglass comes out while it thinks. */
function PasswordPrompt({ node, onUnlock, onCancel }: { node: FsNode; onUnlock: (answer: string, files: FsNode[]) => void; onCancel: () => void }) {
  const [guess, setGuess] = useState('')
  const [wrong, setWrong] = useState(0)
  const [hint, setHint] = useState(false)
  const [busy, setBusy] = useState(false)
  const sfx = useSfx()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy || !guess.trim()) return
    setBusy(true)
    const files = await openLock(node.lock!.seal, guess)
    setBusy(false)
    if (files) return onUnlock(guess, files)
    sfx('chord')
    setWrong((w) => w + 1)
    setGuess('')
  }
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[repeating-conic-gradient(#0000_0_25%,#0005_0_50%)_0_0/2px_2px] p-2" style={busy ? { cursor: 'wait' } : undefined} aria-busy={busy}>
      <form role="dialog" aria-label={`Password for ${node.name}`} onSubmit={submit} className="win-raised w-full max-w-[280px] animate-pop-in bg-win p-0.5">
        <p className="bg-gradient-to-r from-win-title to-[#1084d0] px-1 font-bold text-white">Enter Password</p>
        <div className="space-y-1 p-2">
          <p>
            <b>{node.name}</b> is password protected.
          </p>
          <label className="flex items-center gap-1">
            Password:
            {/* `key` restarts the shake on every wrong guess. */}
            <input key={wrong} type="password" autoFocus value={guess} onChange={(e) => setGuess(e.target.value)} className={`win-sunken min-w-0 flex-1 bg-white px-1 ${wrong ? 'animate-shake [animation-iteration-count:3]' : ''}`} />
          </label>
          {wrong > 0 && <p className="text-red-800" role="alert">The password is incorrect. ({wrong})</p>}
          {hint && <p className="win-sunken bg-[#ffffe1] p-1" data-testid="password-hint">{node.lock!.hint}</p>}
          <div className="flex justify-end gap-1 pt-1">
            <button type="button" onClick={() => setHint(true)} className="win-raised px-2">Hint</button>
            <button type="submit" disabled={busy} className="win-raised w-14 px-2 font-bold">{busy ? '⌛' : 'OK'}</button>
            <button type="button" onClick={onCancel} className="win-raised w-14 px-2">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  )
}

/** Whatever was last opened from My Computer: a text file in Notepad, a picture, or a program's error. */
function Viewer({ file }: { file: FsNode | null }) {
  const heard = useHeardAt()
  if (!file) return null
  if (file.kind === 'audio')
    return (
      <div className="space-y-2 bg-win p-3" data-testid="viewer-audio">
        <audio controls preload="none" src={file.src} className="w-full" />
        <a href={file.src} download={file.name} className="block text-blue-800 underline">
          Save {file.name} to your computer
        </a>
      </div>
    )
  if (file.kind === 'img')
    return (
      <div className="grid place-items-center bg-win p-2">
        <Img slot={file.slot!} width={Math.min(300, file.slot!.w)} className="win-sunken" alt={file.name} />
      </div>
    )
  if (file.kind === 'exe')
    return (
      <div className="flex gap-2 bg-win p-3">
        <Img slot={icons.warning} width={32} />
        <p>{file.text}</p>
      </div>
    )
  return (
    <div>
      <div className="flex gap-3 border-b border-win-dark bg-win px-1 text-black" aria-hidden>
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>S</u>earch</span>
        <span><u>H</u>elp</span>
      </div>
      <pre data-testid="viewer-text" className="h-52 overflow-auto whitespace-pre-wrap p-1 font-mono text-xs text-black">
        {file.text?.replace('{{heard}}', heard ? new Date(heard).toLocaleString() : 'a day you will remember')}
      </pre>
    </div>
  )
}

function RecycleBin({ night, feelings, restoreFeelings }: { night: boolean; feelings: boolean; restoreFeelings: () => void }) {
  const [files, setFiles] = useState(() => recycled.filter((f) => !(feelings && f === 'feelings.exe')))
  const [sel, setSel] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const sfx = useSfx()
  const restore = () => {
    // Feelings only come back at night.
    if (sel === 'feelings.exe' && night) {
      restoreFeelings()
      setFiles((fs) => fs.filter((f) => f !== sel))
      setSel(null)
      setError(null)
      setNote('feelings.exe was restored to C:\\. Handle with care.')
      return sfx('tada')
    }
    sfx('chord')
    setNote(null)
    setError(pick(restoreErrors))
  }
  return (
    <div className="p-2">
      <ul className="win-sunken max-h-40 overflow-y-auto overflow-x-hidden bg-white">
        {files.map((f) => (
          <li key={f}>
            <button type="button" onClick={() => setSel(f)} className={`w-full px-1 text-left font-mono ${sel === f ? 'bg-win-title text-white' : ''}`}>
              🗎 {f}
            </button>
          </li>
        ))}
        {files.length === 0 && <li className="p-1 italic text-gray-600">The bin is empty. Daniel is at peace.</li>}
      </ul>
      <div className="mt-2 flex gap-1">
        <button type="button" disabled={!sel} onClick={restore} className="win-raised px-2 disabled:opacity-50">Restore</button>
        <button
          type="button"
          disabled={!files.length}
          onClick={() => {
            sfx('disk')
            setFiles([])
            setSel(null)
            setError(null)
          }}
          className="win-raised px-2 disabled:opacity-50"
        >
          Empty Bin
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 flex animate-shake items-center gap-2 border-2 border-red-700 bg-[#ffe] p-1 [animation-iteration-count:3]">
          <Img slot={icons.warning} width={24} /> {error}
        </p>
      )}
      {note && (
        <p role="status" className="mt-2 border-2 border-green-700 bg-[#efe] p-1">
          {note}
        </p>
      )}
    </div>
  )
}

function Notepad() {
  const [text, setText] = useStored('desktopDiary', diaryStart)
  return (
    <div>
      <div className="flex gap-3 border-b border-win-dark bg-win px-1 text-black" aria-hidden>
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>S</u>earch</span>
        <span><u>H</u>elp</span>
      </div>
      <textarea
        aria-label="Notepad diary"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="block h-48 w-full resize-none p-1 font-mono text-xs text-black outline-none"
      />
    </div>
  )
}

const PALETTE = ['#000000', '#ffffff', '#ff0000', '#ff9900', '#ffff00', '#00cc00', '#0066ff', '#cc00ff', '#ff66cc', '#996633']

function Paint() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState('#ff0000')
  const [size, setSize] = useState(4)
  const last = useRef<{ x: number; y: number } | null>(null)

  const clear = () => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  useEffect(clear, [])

  const at = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height }
  }
  const stroke = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx || !last.current) return
    const p = at(e)
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }
  const save = () => {
    const a = document.createElement('a')
    a.href = canvas.current?.toDataURL('image/png') ?? ''
    a.download = 'masterpiece.png'
    a.click()
  }
  return (
    <div className="p-1">
      <canvas
        ref={canvas}
        width={300}
        height={170}
        aria-label="Paint canvas"
        className="win-sunken block w-full touch-none bg-white"
        style={{ cursor: gifCursor(cursors.pencil, [2, 22]) }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          last.current = at(e)
          stroke(e)
        }}
        onPointerMove={stroke}
        onPointerUp={() => (last.current = null)}
      />
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {PALETTE.map((c) => (
          <button key={c} type="button" aria-label={`Colour ${c}`} onClick={() => setColor(c)} className={`h-5 w-5 border-2 ${c === color ? 'border-black outline outline-1 outline-white' : 'border-win-dark'}`} style={{ background: c }} />
        ))}
        <select aria-label="Brush size" value={size} onChange={(e) => setSize(Number(e.target.value))} className="win-sunken ml-auto bg-white">
          {[2, 4, 8, 14].map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
        <button type="button" onClick={clear} className="win-raised px-1">New</button>
        <button type="button" onClick={save} className="win-raised px-1">Save</button>
      </div>
    </div>
  )
}

const DANIEL_MESSAGES = [
  'Daniel.exe has performed an illegal operation and will be shut down.',
  'Ignoring Daniel.exe is not supported in this version of Daniel.',
  'Debugging Daniel.exe… found 1 bug. It is a feature.',
  'Daniel.exe is not responding. Daniel.exe is taking a nap.',
]

function DanielExe({ close }: { close: () => void }) {
  const [msg, setMsg] = useState(0)
  return (
    <div className="flex gap-2 p-3">
      <Img slot={assets.headWink} width={56} className={msg ? 'animate-shake [animation-iteration-count:4]' : ''} key={msg} />
      <div className="space-y-2">
        <p>{DANIEL_MESSAGES[msg]}</p>
        <div className="flex gap-1">
          <button type="button" onClick={close} className="win-raised px-2">Close</button>
          <button type="button" onClick={() => setMsg(1)} className="win-raised px-2">Ignore</button>
          <button type="button" onClick={() => setMsg((m) => (m === 2 ? 3 : 2))} className="win-raised px-2">Debug</button>
        </div>
      </div>
    </div>
  )
}
