import { describe, expect, it } from 'vitest'
import { apply, turkSort, type Stacks } from '../components/boring/demos/logic/pushSwap'
import { E, generate, key, logoCells, N, S, solve, W } from '../components/boring/demos/logic/maze'
import { ftPrintf, gnlTrace } from '../components/boring/demos/logic/textTools'
import { acceptsPrefix, CALLS, decode, FUNCTIONS } from '../components/boring/demos/logic/callMeMaybe'
import { mulberry32 } from '../lib/random'
import { existsSync } from 'node:fs'
import { monthYear, portfolio, type DemoId } from '../content/portfolio'
import { intraStats } from '../components/boring/intraStats'

const shuffled = (n: number, seed: number) => {
  const rng = mulberry32(seed)
  const xs = Array.from({ length: n }, (_, i) => i * 7 - 300)
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[xs[i], xs[j]] = [xs[j], xs[i]]
  }
  return xs
}

describe('push_swap (Turk sort port)', () => {
  it.each([2, 3, 5, 12, 100])('sorts %i numbers, ending with everything in a', (n) => {
    for (let seed = 1; seed <= 5; seed++) {
      const xs = shuffled(n, seed)
      const s: Stacks = { a: [...xs], b: [] }
      for (const op of turkSort(xs)) expect(apply(s, op)).toBe(true)
      expect(s.b).toEqual([])
      expect(s.a).toEqual([...xs].sort((p, q) => p - q))
    }
  })

  it('needs nothing for sorted input and stays under the 100-number pass mark (700 ops)', () => {
    expect(turkSort([1, 2, 3, 4])).toEqual([])
    for (let seed = 1; seed <= 5; seed++) expect(turkSort(shuffled(100, seed)).length).toBeLessThan(700)
  })
})

describe('A-Maze-ing (DFS port)', () => {
  it('carves a perfect maze around the 42, which stays walled in, and solves it', () => {
    const { grid, logo, steps } = generate(20, 15, mulberry32(42))
    expect(logo.size).toBe(18)
    expect(logoCells(10, 6).size).toBe(0)
    let open = 0
    for (let y = 0; y < 15; y++)
      for (let x = 0; x < 20; x++) {
        if (logo.has(key(x, y))) expect(grid[y][x]).toBe(N | E | S | W)
        if (!(grid[y][x] & E)) open++
        if (!(grid[y][x] & S)) open++
      }
    // A perfect maze is a tree: one fewer passage than the cells it reaches.
    expect(open).toBe(20 * 15 - logo.size - 1)
    expect(steps.filter((s) => s.dir > 0).length).toBe(20 * 15 - logo.size - 1)
    const path = solve(grid, [0, 0], [19, 14])
    expect(path[0]).toEqual([0, 0])
    expect(path.at(-1)).toEqual([19, 14])
    for (const [x, y] of path) expect(logo.has(key(x, y))).toBe(false)
    expect(grid[0][0] & W).toBe(W)
  })
})

describe('ft_printf and get_next_line ports', () => {
  it('ft_printf converts like the C', () => {
    const out = (f: string, a: (string | number | null)[]) => ftPrintf(f, a).map((p) => p.out).join('')
    expect(out('%c|%s|%s|%d|%i|%u|%x|%X|%%|%p|%p', [65, 'hi', null, -42, 7, -1, 255, 255, 0, 0xdeadbeef])).toBe(
      'A|hi|(null)|-42|7|4294967295|ff|FF|%|(nil)|0xdeadbeef',
    )
    expect(ftPrintf('a%db', [1]).map((p) => p.conv)).toEqual([false, true, false])
  })

  it('get_next_line hands back every line, reading BUFFER_SIZE bytes at a time', () => {
    const file = 'Apple\nBanana\nCherry'
    const trace = gnlTrace(file, 4)
    expect(trace.filter((e) => e.kind === 'line').map((e) => e.kind === 'line' && e.line)).toEqual(['Apple\n', 'Banana\n', 'Cherry'])
    for (const e of trace) if (e.kind === 'read') expect(e.bytes.length).toBeLessThanOrEqual(4)
    expect(trace.filter((e) => e.kind === 'read').map((e) => e.kind === 'read' && e.bytes).join('')).toBe(file)
  })
})

describe('Call Me Maybe (grammar mask)', () => {
  it('accepts every prefix of a valid call and rejects what breaks the schema', () => {
    const call = '{"name": "fn_add_numbers", "parameters": {"a": 2.0, "b": 3.0}}'
    for (let i = 0; i <= call.length; i++) expect(acceptsPrefix(call.slice(0, i)), call.slice(0, i)).toBe(true)
    for (const bad of ['Sure', '{"function', '{"name": "fn_multiply', '{"name": "fn_add_numbers", "parameters": {"a": two', '{"name": "fn_greet", "parameters": {"name": 5'])
      expect(acceptsPrefix(bad), bad).toBe(false)
  })

  it.each(CALLS.map((c, i) => [c.prompt, i] as const))('"%s": every chosen token is allowed, some temptations masked, and it ends as valid JSON', (_, i) => {
    const steps = decode(CALLS[i].tokens, i)
    for (const s of steps) {
      expect(s.candidates[0]).toEqual({ token: s.chosen, allowed: true })
      expect(s.candidates.length).toBeGreaterThanOrEqual(3)
    }
    expect(steps.some((s) => s.candidates.some((c) => !c.allowed))).toBe(true)
    const json = JSON.parse(CALLS[i].tokens.join(''))
    expect(FUNCTIONS.map((f) => f.name)).toContain(json.name)
  })
})

describe('the boring site data (src/content/portfolio.ts)', () => {
  // Daniel keeps portfolio.ts up to date himself, so these check the card's arithmetic against whatever it says.
  it('works the 42 card out from the project list: validated, categories, the ongoing ones, newest first', () => {
    const { projects } = portfolio.intra
    const stats = intraStats(projects)
    const scored = projects.filter((p) => p.score !== undefined)
    expect(stats.validated).toBe(scored.length)
    expect(stats.ongoing.map((p) => p.name)).toEqual(projects.filter((p) => p.status === 'ongoing').map((p) => p.name))
    expect(stats.byKind.reduce((n, k) => n + k.n, 0)).toBe(stats.validated)
    for (let i = 1; i < stats.recent.length; i++) expect(stats.recent[i - 1].date >= stats.recent[i].date).toBe(true)
    // Validating a project is a one-line change.
    const done = intraStats([...projects.filter((p) => p.status !== 'ongoing'), { name: 'Call-Me-Maybe', score: 115, date: '2099-12', kind: 'Python' }])
    expect(done.validated).toBe(scored.length + 1)
    expect(done.ongoing).toEqual([])
    expect(done.recent[0].name).toBe('Call-Me-Maybe')
  })

  it('shows a group (the Python modules) as one row, each still counted, with ongoing work on top', () => {
    const { projects } = portfolio.intra
    const { rows } = intraStats(projects)
    const ongoing = projects.filter((p) => p.status === 'ongoing')
    expect(rows.slice(0, ongoing.length).map((r) => r.ongoing)).toEqual(ongoing.map(() => true))
    const modules = projects.filter((p) => p.group === 'Python Modules' && p.score !== undefined)
    const row = rows.filter((r) => r.name.startsWith('Python Modules'))
    expect(row).toEqual([
      expect.objectContaining({
        count: modules.length,
        score: Math.min(...modules.map((m) => m.score!)),
        date: modules.map((m) => m.date!).sort().at(-1),
      }),
    ])
    expect(row[0].name).toMatch(/^Python Modules \(\d+–\d+\)$/)
    // Fixed data: the grouping and the range label.
    const fake = intraStats([
      { name: 'Mod 02', score: 100, date: '2026-01', kind: 'Python', group: 'Mods' },
      { name: 'Mod 05', score: 90, date: '2026-03', kind: 'Python', group: 'Mods' },
      { name: 'Solo', score: 125, date: '2026-02', kind: 'C' },
    ])
    expect(fake.rows).toEqual([
      { name: 'Mods (02–05)', date: '2026-03', score: 90, ongoing: false, count: 2 },
      { name: 'Solo', date: '2026-02', score: 125, ongoing: false, count: 1 },
    ])
    expect(fake.validated).toBe(3)
  })

  it('every project has an animation and a real date, every stack entry a logo, every social a link or a copy', () => {
    const demos: DemoId[] = ['libft', 'printf', 'gnl', 'pushSwap', 'timebound', 'maze', 'callMe', 'descent']
    for (const p of portfolio.projects) {
      expect(demos, p.title).toContain(p.demo)
      expect(p.date, p.title).toMatch(/^\d{4}-\d{2}$/)
      expect(monthYear(p.date)).toMatch(/^[A-Z][a-z]{2} \d{4}$/)
    }
    for (const s of portfolio.stack) expect(existsSync(`public/boring/logos/${s.logo}.webp`), s.name).toBe(true)
    expect(new Set(portfolio.stack.map((s) => s.level))).toEqual(new Set(['main', 'experienced', 'site']))
    for (const s of portfolio.socials) expect(!!s.href !== !!s.copy, s.id).toBe(true)
  })
})
