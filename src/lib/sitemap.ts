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
  '/popnuke',
  '/leave',
]

export const randomRoute = (exclude?: string, rng: Rng = Math.random) =>
  pick(WEBRING.filter((r) => r !== exclude), rng)

export const neighbour = (current: string, step: 1 | -1) => {
  const i = WEBRING.indexOf(current)
  if (i === -1) return WEBRING[0]
  return WEBRING[(i + step + WEBRING.length) % WEBRING.length]
}
