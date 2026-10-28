/**
 * The early-2000s feel: the first time a page is opened in a visit it "loads" over dial-up; after that it's cached
 * and just fades in. Pure numbers and text here; components/DialUp.tsx does the drawing.
 */

/** How long a page takes to "load" over dial-up, and how long a cached one takes to fade in. */
export const LOAD_MS = 1100
export const FADE_MS = 150

/** How a page arrives: over dial-up the first time this visit, from the "cache" after that. */
export const arrival = (visitedBefore: boolean): 'dialup' | 'fade' => (visitedBefore ? 'fade' : 'dialup')

/** The browser status bar's line while a page loads (`progress` 0 → 1). */
export function statusLine(path: string, progress: number) {
  if (progress >= 1) return 'Document: Done'
  if (progress < 0.12) return 'Contacting host: www.danielcheng.geocities.com…'
  if (progress < 0.22) return 'Host contacted. Waiting for reply…'
  return `Opening page ${path}… ${Math.min(99, Math.round(progress * 100))}%`
}
