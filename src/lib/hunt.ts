import data from '../sealed/hunt.json'
import type { FsNode } from '../content/desktop'
import type { WorldId } from '../three/pageScenes'
import { openSeal, type Seal } from './seal'

/** A page that only exists at a secret address (rendered by src/routes/Sealed.tsx). */
export type SealedPage = {
  song?: string
  world?: WorldId
  /** A strip of text scrolling across the top. */
  tape?: string
  title: string
  subtitle?: string
  sections: { heading: string; body?: string[]; list?: string[]; armour?: string[] }[]
  buttons?: string[]
  signature?: string
  close?: string
}

/** Everything `npm run seal` encrypted: pages (opened by their address) and locked folders (opened by password). */
export const SEALED = data as { pages: Seal[]; locks: Record<string, Seal> }

/** The page at this address, if there's one sealed here. */
export async function openPage(pathname: string, pages: readonly Seal[] = SEALED.pages): Promise<SealedPage | null> {
  for (const p of pages) {
    const page = await openSeal<SealedPage>(p, pathname)
    if (page) return page
  }
  return null
}

/** A locked folder's files, or null if that isn't its password. */
export const openLock = (seal: string, answer: string, locks: Record<string, Seal> = SEALED.locks) =>
  locks[seal] ? openSeal<FsNode[]>(locks[seal], answer) : Promise.resolve(null)
