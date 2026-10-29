/**
 * The early-2000s feel: the first time a page is opened in a visit it "loads" over dial-up; after that it's cached
 * and the Win95 blinds sweep off it instead. Pure numbers and text here; components/DialUp.tsx does the drawing.
 */

/** sessionStorage key listing the pages "cached" this visit (main.tsx empties it on a refresh). */
export const VISITED_KEY = 'dialupVisited'

/** How long a page takes to "load" over dial-up, and how long the blinds take to sweep off a cached one. */
export const LOAD_MS = 1100
export const WIPE_MS = 400

/** How a page arrives: over dial-up the first time this visit, from the "cache" (under the blinds) after that. */
export const arrival = (visitedBefore: boolean): 'dialup' | 'wipe' => (visitedBefore ? 'wipe' : 'dialup')

/** The browser status bar's line while a page loads (`progress` 0 → 1). */
export function statusLine(path: string, progress: number) {
  if (progress >= 1) return 'Document: Done'
  if (progress < 0.12) return 'Contacting host: www.danielcheng.geocities.com…'
  if (progress < 0.22) return 'Host contacted. Waiting for reply…'
  return `Opening page ${path}… ${Math.min(99, Math.round(progress * 100))}%`
}
