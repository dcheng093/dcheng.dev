import type { IntraKind, IntraProject } from '../../content/portfolio'

export const INTRA_KINDS: IntraKind[] = ['C', 'Python', 'System', 'Exam']

/** One line of the recent-projects list: a project, or a group of them (the Python modules) as one. */
export type IntraRow = { name: string; date?: string; score?: number; ongoing: boolean; count: number }

/** "Python Modules" + ["Python Module 00", …, "Python Module 10"] → "Python Modules (00–10)" */
function groupName(group: string, names: string[]) {
  const nums = names.map((n) => n.match(/(\d+)\s*$/)?.[1]).filter((n): n is string => !!n)
  if (nums.length !== names.length) return group
  const sorted = [...nums].sort((a, b) => Number(a) - Number(b))
  return `${group} (${sorted[0]}–${sorted.at(-1)})`
}

/** Everything the 42 card shows, worked out from the project list in portfolio.ts (so updating it is one line there). */
export function intraStats(projects: IntraProject[]) {
  const validated = projects.filter((p): p is Extract<IntraProject, { score: number }> => p.score !== undefined)
  const ongoing = projects.filter((p) => p.status === 'ongoing')
  const average = validated.length ? validated.reduce((n, p) => n + p.score, 0) / validated.length : 0
  // Newest first; ongoing work above everything.
  const recent = [...validated].sort((a, b) => b.date.localeCompare(a.date))

  // The list as shown: grouped projects become one row (newest date, lowest mark, how many).
  const groups = new Map<string, typeof validated>()
  const rows: IntraRow[] = ongoing.map((p) => ({ name: p.name, ongoing: true, count: 1 }))
  for (const p of recent) {
    if (!p.group) {
      rows.push({ name: p.name, date: p.date, score: p.score, ongoing: false, count: 1 })
      continue
    }
    if (!groups.has(p.group)) {
      groups.set(p.group, [])
      rows.push({ name: p.group, date: p.date, score: p.score, ongoing: false, count: 0 })
    }
    groups.get(p.group)!.push(p)
  }
  for (const row of rows) {
    const members = groups.get(row.name)
    if (!members) continue
    row.name = groupName(row.name, members.map((m) => m.name))
    row.count = members.length
    row.score = Math.min(...members.map((m) => m.score))
  }

  return {
    validated: validated.length,
    average,
    byKind: INTRA_KINDS.map((kind) => ({ kind, n: validated.filter((p) => p.kind === kind).length })),
    ongoing,
    recent,
    rows,
  }
}
