import { useEffect, useReducer, useRef, useState, type Dispatch, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSfx } from '../audio/audioContext'
import { Img } from '../components/media/Img'
import { Win95Window } from '../components/Win95Window'
import { useDrag } from '../hooks/useDrag'
import { assets, cursors, icons, kawaii, type Slot } from '../content/assets'
import { diaryStart, drives, recycled, restoreErrors } from '../content/desktop'
import { useStored } from '../hooks/useLocalStorage'
import { gifCursor } from '../lib/cursor'
import { desktopReducer, type DesktopAction, type DeskWindow, type ProgramId } from '../lib/desktop'
import { pick } from '../lib/random'

const PROGRAMS: Record<ProgramId, { title: string; icon: Slot; width: number }> = {
  computer: { title: 'My Computer', icon: icons.kidComputer, width: 300 },
  bin: { title: 'Recycle Bin', icon: icons.crying, width: 320 },
  notepad: { title: 'diary.txt - Notepad', icon: kawaii.bunDiary, width: 320 },
  paint: { title: 'untitled - Paint', icon: cursors.pencil, width: 320 },
  'daniel-exe': { title: 'Daniel.exe', icon: assets.headWink, width: 280 },
}
const ORDER: ProgramId[] = ['computer', 'bin', 'notepad', 'paint', 'daniel-exe']

/** Daniel's Desktop: a fake Win95 with draggable program windows, a Start menu and a taskbar. */
export function Desktop() {
  const [state, dispatch] = useReducer(desktopReducer, { windows: [] })
  const [startOpen, setStartOpen] = useState(false)
  const area = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const sfx = useSfx()

  const open = (id: ProgramId) => {
    const n = state.windows.length
    dispatch({ type: 'open', id, x: 90 + n * 22, y: 16 + n * 22 })
    setStartOpen(false)
    sfx('ding')
  }
  const front = [...state.windows].reverse().find((w) => !w.minimised)?.id

  return (
    <div data-testid="desktop" className="p-2 sm:p-4" style={{ cursor: gifCursor(cursors.mouse) }}>
      <div ref={area} className="tile-desktop relative mx-auto h-[max(560px,calc(100vh-160px))] max-w-5xl overflow-hidden border-4 border-[#404040] shadow-[8px_8px_0_#000]">
        <ul className="absolute left-2 top-2 grid gap-3" aria-label="Desktop icons">
          {ORDER.map((id) => (
            <li key={id}>
              <button type="button" onClick={() => open(id)} className="group flex w-20 flex-col items-center gap-1 text-center font-[Tahoma,sans-serif] text-[11px] text-white">
                <Img slot={PROGRAMS[id].icon} width={36} className="group-hover:animate-boing" />
                <span className="px-0.5 group-focus:bg-win-title">{PROGRAMS[id].title.replace(' - Notepad', '').replace(' - Paint', '')}</span>
              </button>
            </li>
          ))}
        </ul>

        {state.windows.map((w, z) => (
          <ProgramWindow key={w.id} win={w} z={10 + z} active={w.id === front} area={area} dispatch={dispatch} />
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
                <button type="button" onClick={() => navigate('/leave')} className="w-full px-2 py-1 text-left hover:bg-win-title hover:text-white">⏻ Shut Down…</button>
              </li>
            </ul>
          </nav>
        )}

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
                <Img slot={PROGRAMS[w.id].icon} width={14} />
                <span className="truncate">{PROGRAMS[w.id].title}</span>
              </button>
            ))}
          </div>
          <Clock />
        </div>
      </div>
    </div>
  )
}

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 10_000)
    return () => window.clearInterval(t)
  }, [])
  return <span className="win-sunken px-2 py-0.5" data-testid="desktop-clock">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
}

type WinProps = {
  win: DeskWindow
  z: number
  active: boolean
  area: RefObject<HTMLDivElement | null>
  dispatch: Dispatch<DesktopAction>
}

function ProgramWindow({ win, z, active, area, dispatch }: WinProps) {
  const p = PROGRAMS[win.id]
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
      testId={`window-${win.id}`}
      inactive={!active}
      className="absolute max-w-[calc(100%-8px)]"
      style={{ left: win.x, top: win.y, width: p.width, zIndex: z }}
      bodyClassName="bg-white"
    >
      {win.id === 'computer' && <MyComputer />}
      {win.id === 'bin' && <RecycleBin />}
      {win.id === 'notepad' && <Notepad />}
      {win.id === 'paint' && <Paint />}
      {win.id === 'daniel-exe' && <DanielExe close={() => dispatch({ type: 'close', id: win.id })} />}
    </Win95Window>
  )
}

function MyComputer() {
  const [sel, setSel] = useState(1)
  return (
    <div className="p-2">
      <ul className="grid grid-cols-2 gap-2">
        {drives.map((d, i) => (
          <li key={d.letter}>
            <button type="button" onClick={() => setSel(i)} className={`flex w-full items-center gap-1 p-1 text-left ${sel === i ? 'bg-win-title text-white' : ''}`}>
              <Img slot={i === 0 ? icons.floppy : i === 2 ? icons.diamond : icons.keyboard} width={24} /> {d.letter} {d.name}
            </button>
          </li>
        ))}
      </ul>
      <p className="win-sunken mt-2 bg-[#ffffe1] p-1" role="status">{drives[sel].detail}</p>
    </div>
  )
}

function RecycleBin() {
  const [files, setFiles] = useState(recycled)
  const [sel, setSel] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
        <button type="button" disabled={!sel} onClick={() => setError(pick(restoreErrors))} className="win-raised px-2 disabled:opacity-50">Restore</button>
        <button type="button" disabled={!files.length} onClick={() => { setFiles([]); setSel(null); setError(null) }} className="win-raised px-2 disabled:opacity-50">Empty Bin</button>
      </div>
      {error && (
        <p role="alert" className="mt-2 flex animate-shake items-center gap-2 border-2 border-red-700 bg-[#ffe] p-1 [animation-iteration-count:3]">
          <Img slot={icons.warning} width={24} /> {error}
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
