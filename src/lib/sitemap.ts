import { pick, type Rng } from './random'
import { shrines } from '../content/shrines'

/** Every page a random link may fling the visitor to (the webring order, too). */
export const WEBRING: readonly string[] = [
  '/',
  '/dealership',
  ...shrines.map((s) => `/shrine/${s.slug}`),
  '/guestbook',
  '/under-construction',
  '/you-won',
  '/checkout',
  '/scan',
  '/casino',
  '/survey',
  '/work-from-home',
  '/arcade',
  '/desktop',
  '/radio',
  '/oracle',
  '/blinkie-maker',
  '/stickers',
  '/dex',
  '/popnuke',
  '/settings',
  '/leave',
]

/** Each page's name, for lists of them (the Dex, the boring site's site map). Shrines go by their own titles. */
const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/dealership': 'The Dealership',
  '/guestbook': 'The Guestbook',
  '/under-construction': 'Under Construction',
  '/you-won': 'You Won!',
  '/checkout': 'Checkout',
  '/scan': 'Virus Scan',
  '/casino': 'The Casino',
  '/survey': 'The Survey',
  '/work-from-home': 'Work From Home',
  '/arcade': 'The Arcade',
  '/desktop': "Daniel's Desktop",
  '/radio': 'DANIEL FM',
  '/oracle': 'The Oracle',
  '/blinkie-maker': 'Blinkie Maker',
  '/popnuke': 'POPNUKE',
  '/settings': 'Control Panel',
  '/stickers': 'Sticker Book',
  '/dex': 'The Object Dex',
  '/leave': 'The Exit',
  anywhere: 'Anywhere, rarely, glowing',
}
export const pageName = (page: string) => shrines.find((s) => `/shrine/${s.slug}` === page)?.title ?? PAGE_NAMES[page] ?? page

export const randomRoute = (exclude?: string, rng: Rng = Math.random) =>
  pick(WEBRING.filter((r) => r !== exclude), rng)

export const neighbour = (current: string, step: 1 | -1) => {
  const i = WEBRING.indexOf(current)
  if (i === -1) return WEBRING[0]
  return WEBRING[(i + step + WEBRING.length) % WEBRING.length]
}
