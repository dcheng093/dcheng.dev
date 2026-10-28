/** Window manager for Daniel's Desktop: which programs are open, minimised, and in front. */
export type ProgramId = 'computer' | 'bin' | 'notepad' | 'paint' | 'daniel-exe'

export type DeskWindow = { id: ProgramId; minimised: boolean; x: number; y: number }
export type DesktopState = { windows: DeskWindow[] } // last = front

export type DesktopAction =
  | { type: 'open'; id: ProgramId; x: number; y: number }
  | { type: 'close'; id: ProgramId }
  | { type: 'focus'; id: ProgramId }
  | { type: 'minimise'; id: ProgramId }
  | { type: 'move'; id: ProgramId; x: number; y: number }
  /** Taskbar button: restore a minimised window, minimise the front one, or bring another forward. */
  | { type: 'taskbar'; id: ProgramId }

const toFront = (ws: DeskWindow[], id: ProgramId, patch: Partial<DeskWindow> = {}) => {
  const w = ws.find((x) => x.id === id)
  return w ? [...ws.filter((x) => x.id !== id), { ...w, ...patch }] : ws
}

export function desktopReducer(s: DesktopState, a: DesktopAction): DesktopState {
  switch (a.type) {
    case 'open':
      return s.windows.some((w) => w.id === a.id)
        ? { windows: toFront(s.windows, a.id, { minimised: false }) }
        : { windows: [...s.windows, { id: a.id, minimised: false, x: a.x, y: a.y }] }
    case 'close':
      return { windows: s.windows.filter((w) => w.id !== a.id) }
    case 'focus':
      return { windows: toFront(s.windows, a.id) }
    case 'minimise':
      return { windows: s.windows.map((w) => (w.id === a.id ? { ...w, minimised: true } : w)) }
    case 'move':
      return { windows: s.windows.map((w) => (w.id === a.id ? { ...w, x: a.x, y: a.y } : w)) }
    case 'taskbar': {
      const w = s.windows.find((x) => x.id === a.id)
      if (!w) return s
      if (w.minimised) return { windows: toFront(s.windows, a.id, { minimised: false }) }
      const front = [...s.windows].reverse().find((x) => !x.minimised)
      return front?.id === a.id ? desktopReducer(s, { type: 'minimise', id: a.id }) : { windows: toFront(s.windows, a.id) }
    }
  }
}
