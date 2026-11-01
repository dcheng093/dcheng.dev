import type { IntraKind, IntraProject } from '../../content/portfolio'

export const INTRA_KINDS: IntraKind[] = ['C', 'Python', 'System', 'Exam']

/** Everything the 42 card shows, worked out from the project list in portfolio.ts (so updating it is one line there). */
export function intraStats(projects: IntraProject[]) {
  const validated = projects.filter((p): p is Extract<IntraProject, { score: number }> => p.score !== undefined)
  const ongoing = projects.filter((p) => p.status === 'ongoing')
  const average = validated.length ? validated.reduce((n, p) => n + p.score, 0) / validated.length : 0
  // Newest first; ongoing work above everything.
  const recent = [...validated].sort((a, b) => b.date.localeCompare(a.date))
  return {
    validated: validated.length,
    average,
    byKind: INTRA_KINDS.map((kind) => ({ kind, n: validated.filter((p) => p.kind === kind).length })),
    ongoing,
    recent,
  }
}
