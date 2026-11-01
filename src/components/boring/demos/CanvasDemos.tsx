import { useRef } from 'react'
import { mulberry32 } from '../../../lib/random'
import { ACCENT, ACCENT_2 } from '../theme'
import { useCanvasLoop } from './loop'
import { E, generate, S, solve, type Grid, type Step } from './logic/maze'
import { apply, turkSort, type Op, type Stacks } from './logic/pushSwap'

type DemoProps = { active: boolean }
const BG = '#0b0a12'
const MONO = '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

// ——— push_swap: the real operations, replayed on two stacks of bars ———

const COUNT = 40
const OPS_PER_SECOND = 24

type SortRun = { start: number; values: number[]; ops: Op[]; stacks: Stacks; done: number }

function newSort(round: number, start: number): SortRun {
  const rng = mulberry32(round * 7919 + 3)
  const values = Array.from({ length: COUNT }, (_, i) => i + 1)
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }
  return { start, values, ops: turkSort(values), stacks: { a: [...values], b: [] }, done: 0 }
}

export function PushSwapDemo({ active }: DemoProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const run = useRef<{ round: number; sort: SortRun } | null>(null)
  useCanvasLoop(canvas, active, (g, w, h, t) => {
    if (!run.current) run.current = { round: 1, sort: newSort(1, t) }
    let { sort } = run.current
    // Each round: the operations, then a beat to admire the sorted stack, then a fresh shuffle.
    if (t - sort.start > sort.ops.length / OPS_PER_SECOND + 2.2) {
      run.current.round++
      sort = run.current.sort = newSort(run.current.round, t)
    }
    const due = Math.min(sort.ops.length, Math.floor((t - sort.start) * OPS_PER_SECOND))
    while (sort.done < due) apply(sort.stacks, sort.ops[sort.done++])

    g.fillStyle = BG
    g.fillRect(0, 0, w, h)
    const top = 26
    const foot = 30
    const col = (w - 36) / 2
    const row = (h - top - foot) / COUNT
    g.font = MONO
    g.textBaseline = 'middle'
    ;(['a', 'b'] as const).forEach((name, c) => {
      const x0 = 12 + c * (col + 12)
      g.fillStyle = 'rgba(255,255,255,0.4)'
      g.fillText(`stack ${name}`, x0, 13)
      sort.stacks[name].forEach((v, i) => {
        const f = v / COUNT
        g.fillStyle = `hsl(${255 - f * 70} 90% ${55 + f * 10}%)`
        g.fillRect(x0, top + i * row + 0.5, Math.max(2, f * col), Math.max(1, row - 1))
      })
    })
    // The op ticker: the last few operations, newest brightest, and the count.
    const recent = sort.ops.slice(Math.max(0, sort.done - 7), sort.done)
    let x = 12
    recent.forEach((op, i) => {
      g.fillStyle = i === recent.length - 1 ? ACCENT_2 : `rgba(255,255,255,${0.2 + (i / recent.length) * 0.4})`
      g.fillText(op, x, h - foot / 2)
      x += g.measureText(op).width + 8
    })
    const label = sort.done === sort.ops.length ? `sorted in ${sort.ops.length} ops ✓` : `${sort.done} / ${sort.ops.length} ops`
    g.fillStyle = sort.done === sort.ops.length ? '#4ade80' : 'rgba(255,255,255,0.5)'
    g.textAlign = 'right'
    g.fillText(label, w - 12, h - foot / 2)
    g.textAlign = 'left'
  })
  return <canvas ref={canvas} aria-hidden className="h-full w-full rounded-xl" />
}

// ——— A-Maze-ing: the depth-first carve around the 42, then the breadth-first solve ———

const MW = 20
const MH = 15
const CARVE_PER_SECOND = 95
const SOLVE_PER_SECOND = 32
const DX: Record<number, number> = { 1: 0, 2: 1, 4: 0, 8: -1 }
const DY: Record<number, number> = { 1: -1, 2: 0, 4: 1, 8: 0 }

type MazeRun = { start: number; steps: Step[]; logo: Set<string>; path: [number, number][]; walls: Grid; seen: boolean[][]; done: number }

function newMaze(round: number, start: number): MazeRun {
  const { grid, logo, steps } = generate(MW, MH, mulberry32(round * 104729 + 11))
  return {
    start,
    steps,
    logo,
    path: solve(grid, [0, 0], [MW - 1, MH - 1]),
    walls: Array.from({ length: MH }, () => Array(MW).fill(15)),
    seen: Array.from({ length: MH }, () => Array(MW).fill(false)),
    done: 0,
  }
}

export function MazeDemo({ active }: DemoProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const run = useRef<{ round: number; maze: MazeRun } | null>(null)
  useCanvasLoop(canvas, active, (g, w, h, t) => {
    if (!run.current) run.current = { round: 1, maze: newMaze(1, t) }
    let { maze } = run.current
    const carveTime = maze.steps.length / CARVE_PER_SECOND
    const solveTime = maze.path.length / SOLVE_PER_SECOND
    if (t - maze.start > carveTime + solveTime + 2.6) {
      run.current.round++
      maze = run.current.maze = newMaze(run.current.round, t)
    }
    const elapsed = t - maze.start
    // Replay the carve up to now: each forward step knocks down the wall it came through.
    const due = Math.min(maze.steps.length, Math.floor(elapsed * CARVE_PER_SECOND))
    while (maze.done < due) {
      const s = maze.steps[maze.done++]
      maze.seen[s.y][s.x] = true
      if (s.dir > 0) {
        const px = s.x - DX[s.dir]
        const py = s.y - DY[s.dir]
        maze.walls[py][px] &= ~s.dir
        maze.walls[s.y][s.x] &= ~{ 1: 4, 4: 1, 2: 8, 8: 2 }[s.dir]!
      }
    }
    const head = maze.steps[Math.max(0, maze.done - 1)]
    const carving = maze.done < maze.steps.length
    const solved = Math.max(0, Math.floor((elapsed - carveTime) * SOLVE_PER_SECOND))

    g.fillStyle = BG
    g.fillRect(0, 0, w, h)
    const cell = Math.floor(Math.min((w - 24) / MW, (h - 40) / MH))
    const ox = Math.round((w - cell * MW) / 2)
    const oy = Math.round((h - 16 - cell * MH) / 2)
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        if (maze.logo.has(`${x},${y}`)) g.fillStyle = ACCENT
        else if (maze.seen[y][x]) g.fillStyle = '#1b1830'
        else continue
        g.fillRect(ox + x * cell, oy + y * cell, cell, cell)
      }
    if (carving) {
      g.fillStyle = ACCENT_2
      g.fillRect(ox + head.x * cell + 2, oy + head.y * cell + 2, cell - 4, cell - 4)
    }
    // The way through.
    if (!carving && solved > 0) {
      g.strokeStyle = '#4ade80'
      g.lineWidth = Math.max(2, cell * 0.28)
      g.lineCap = g.lineJoin = 'round'
      g.beginPath()
      maze.path.slice(0, solved).forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](ox + (x + 0.5) * cell, oy + (y + 0.5) * cell))
      g.stroke()
    }
    // Walls: each cell draws its east and south sides; the outer north and west edges are drawn once.
    g.strokeStyle = 'rgba(235,232,255,0.85)'
    g.lineWidth = 1.5
    g.lineCap = 'square'
    g.beginPath()
    g.moveTo(ox, oy)
    g.lineTo(ox + MW * cell, oy)
    g.moveTo(ox, oy + cell) // the entrance, top-left, stays open
    g.lineTo(ox, oy + MH * cell)
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        const px = ox + x * cell
        const py = oy + y * cell
        if (maze.walls[y][x] & E && !(x === MW - 1 && y === MH - 1)) {
          g.moveTo(px + cell, py)
          g.lineTo(px + cell, py + cell)
        }
        if (maze.walls[y][x] & S) {
          g.moveTo(px, py + cell)
          g.lineTo(px + cell, py + cell)
        }
      }
    g.stroke()
    g.font = MONO
    g.fillStyle = 'rgba(255,255,255,0.5)'
    g.textBaseline = 'middle'
    g.fillText(carving ? `DFS carving… ${maze.done}/${maze.steps.length} steps` : solved < maze.path.length ? 'BFS solving…' : `shortest path: ${maze.path.length - 1} moves ✓`, ox, h - 12)
  })
  return <canvas ref={canvas} aria-hidden className="h-full w-full rounded-xl" />
}
