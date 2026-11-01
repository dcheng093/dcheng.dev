// A port of Daniel and asyeo's A-Maze-ing generator (github.com/dcheng093/A-Maze-ing, mazegen/): an iterative
// depth-first carve that never enters the 42 logo's cells, then a breadth-first solve. Perfect mazes only (the
// demo's), and every step of the carve is recorded so it can be replayed.

export const N = 1
export const E = 2
export const S = 4
export const W = 8
const DIRS = [N, E, S, W]
const DX: Record<number, number> = { [N]: 0, [E]: 1, [S]: 0, [W]: -1 }
const DY: Record<number, number> = { [N]: -1, [E]: 0, [S]: 1, [W]: 0 }
const OPPOSITE: Record<number, number> = { [N]: S, [S]: N, [E]: W, [W]: E }

// renderer.py FOUR_TWO_PATTERN: the "4" then the "2", seven cells wide and five tall.
const FOUR_TWO: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [1, 2], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
  [4, 0], [5, 0], [6, 0], [6, 1], [5, 2], [4, 3], [4, 4], [5, 4], [6, 4],
]

/** Every wall up: each cell is a bitmask of its closed sides. */
export type Grid = number[][]
/** A carve step: the stack moved into (x, y) through `dir`, or backed out of it (dir 0). */
export type Step = { x: number; y: number; dir: number }

export const key = (x: number, y: number) => `${x},${y}`

/** The 42's cells, centred as renderer.py centres them (only drawn in mazes bigger than 12×7). */
export function logoCells(width: number, height: number) {
  const cells = new Set<string>()
  if (width <= 12 || height <= 7) return cells
  const cx = Math.floor(width / 2) - 3
  const cy = Math.floor(height / 2) - 2
  for (const [dx, dy] of FOUR_TWO) cells.add(key(cx + dx, cy + dy))
  return cells
}

export function generate(width: number, height: number, rng: () => number) {
  const grid: Grid = Array.from({ length: height }, () => Array(width).fill(N | E | S | W))
  const logo = logoCells(width, height)
  const visited = Array.from({ length: height }, () => Array(width).fill(false))
  const pick = () => [Math.floor(rng() * width), Math.floor(rng() * height)]
  let [sx, sy] = pick()
  while (logo.has(key(sx, sy))) [sx, sy] = pick()

  const steps: Step[] = [{ x: sx, y: sy, dir: -1 }]
  const stack: [number, number, number][] = [[sx, sy, -1]]
  visited[sy][sx] = true
  while (stack.length) {
    const [x, y, last] = stack[stack.length - 1]
    // random.shuffle, Fisher-Yates.
    const dirs = [...DIRS]
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[dirs[i], dirs[j]] = [dirs[j], dirs[i]]
    }
    const next = dirs.find((d) => {
      if (d === last) return false
      const nx = x + DX[d]
      const ny = y + DY[d]
      return nx >= 0 && nx < width && ny >= 0 && ny < height && !logo.has(key(nx, ny)) && !visited[ny][nx]
    })
    if (next === undefined) {
      stack.pop()
      if (stack.length) steps.push({ x: stack[stack.length - 1][0], y: stack[stack.length - 1][1], dir: 0 })
      continue
    }
    const nx = x + DX[next]
    const ny = y + DY[next]
    grid[y][x] &= ~next
    grid[ny][nx] &= ~OPPOSITE[next]
    visited[ny][nx] = true
    stack.push([nx, ny, OPPOSITE[next]])
    steps.push({ x: nx, y: ny, dir: next })
  }
  return { grid, logo, steps }
}

/** solver.py: breadth-first, shortest path from start to end as a list of cells (empty if there is none). */
export function solve(grid: Grid, start: [number, number], end: [number, number]): [number, number][] {
  const height = grid.length
  const width = grid[0].length
  const parent = new Map<string, [number, number]>()
  const seen = new Set([key(...start)])
  const queue: [number, number][] = [start]
  while (queue.length) {
    const [x, y] = queue.shift()!
    if (x === end[0] && y === end[1]) break
    for (const d of DIRS) {
      if (grid[y][x] & d) continue
      const nx = x + DX[d]
      const ny = y + DY[d]
      if (nx < 0 || nx >= width || ny < 0 || ny >= height || seen.has(key(nx, ny))) continue
      seen.add(key(nx, ny))
      parent.set(key(nx, ny), [x, y])
      queue.push([nx, ny])
    }
  }
  if (!parent.has(key(...end))) return []
  const path: [number, number][] = [end]
  for (let at = end; at[0] !== start[0] || at[1] !== start[1]; ) path.unshift((at = parent.get(key(...at))!))
  return path
}
