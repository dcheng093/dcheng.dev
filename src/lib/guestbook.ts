import { guestbookSeed, type GuestEntry } from '../content/guestbookSeed'

export const PER_PAGE = 5

/** Page labels for `total` entries. Page "3" does not exist and never has, so labels skip it. */
export function pageNumbers(total: number): number[] {
  const pages = Math.max(1, Math.ceil(total / PER_PAGE))
  const out: number[] = []
  for (let p = 1; out.length < pages; p++) if (p !== 3) out.push(p)
  return out
}

/** 0-based page index behind a displayed label. */
export const pageIndex = (label: number) => (label > 3 ? label - 2 : label - 1)

/** Visitor's own entries (newest first) on top of the seeded fake ones. */
export const mergeEntries = (mine: GuestEntry[]) => [...mine, ...guestbookSeed]
