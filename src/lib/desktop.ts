import type { FsNode } from '../content/desktop'

/** Window manager for Daniel's Desktop: which programs are open, minimised, and in front. */
/** The fixed programs, plus one viewer window per open file (`viewer:` and the file's path). */
export type AppId = 'computer' | 'bin' | 'notepad' | 'paint' | 'daniel-exe'
export type ViewerId = `viewer:${string}`
export type ProgramId = AppId | ViewerId
export const isViewer = (id: ProgramId): id is ViewerId => id.startsWith('viewer:')

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
  /** The power went off: every window gone. */
  | { type: 'reset' }

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
    case 'reset':
      return { windows: [] }
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

// ——— The filesystem ———

/** What the explorer can see right now: hidden files, this visit's letters, tonight's folder, today's files. */
export type FsContext = { showHidden: boolean; visit: number; night: boolean; today: string }

export const visible = (n: FsNode, ctx: FsContext) =>
  (!n.hidden || ctx.showHidden) && (n.fromVisit ?? 0) <= ctx.visit && (!n.nightOnly || ctx.night) && (!n.onDate || n.onDate === ctx.today)

export const listDir = (n: FsNode, ctx: FsContext) => (n.children ?? []).filter((c) => visible(c, ctx))

/** ['C:', 'GAMES'] -> 'C:\\GAMES' */
export const joinPath = (path: readonly string[]) => path.join('\\')

/** Follows a path through what's visible; undefined if any step isn't there (any more). */
export function walk(root: readonly FsNode[], path: readonly string[], ctx: FsContext): FsNode | undefined {
  let here: FsNode | undefined = { name: '', kind: 'folder', children: [...root] }
  for (const name of path) here = here && listDir(here, ctx).find((c) => c.name === name)
  return here
}

/** Every locked folder in the tree by path, whatever's visible right now. */
export function locksIn(root: readonly FsNode[], at: string[] = []): { path: string; seal: string }[] {
  return root.flatMap((n) => {
    const p = [...at, n.name]
    return [...(n.lock ? [{ path: joinPath(p), seal: n.lock.seal }] : []), ...locksIn(n.children ?? [], p)]
  })
}

/** Puts opened folders' (unsealed) files into the tree, by path. */
export function graft(root: readonly FsNode[], opened: Readonly<Record<string, FsNode[]>>, at: string[] = []): FsNode[] {
  return root.map((n) => {
    const p = [...at, n.name]
    const inside = opened[joinPath(p)]
    if (n.lock && inside) return { ...n, children: inside }
    return n.children ? { ...n, children: graft(n.children, opened, p) } : n
  })
}
