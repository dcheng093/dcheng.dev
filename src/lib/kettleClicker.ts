/** Kettle Clicker: an idle game where the currency is degrees. Pure state so the maths is testable. */
export type Upgrade = { id: string; name: string; blurb: string; baseCost: number; perSecond: number }

export const UPGRADES: Upgrade[] = [
  { id: 'element', name: 'Electric Element', blurb: 'It plugs in. Revolutionary.', baseCost: 15, perSecond: 0.5 },
  { id: 'second-kettle', name: 'Second Kettle', blurb: 'Two kettles. One Daniel. No regrets.', baseCost: 100, perSecond: 4 },
  { id: 'intern', name: 'Tea Intern', blurb: 'Unpaid. Boils with passion.', baseCost: 600, perSecond: 20 },
  { id: 'boiler', name: 'Industrial Boiler', blurb: 'Technically a kettle if you squint.', baseCost: 4000, perSecond: 120 },
]

export type KettleSave = { degrees: number; total: number; owned: Record<string, number>; whistled: boolean }

export const newKettle = (): KettleSave => ({ degrees: 0, total: 0, owned: {}, whistled: false })

/** Each copy costs 15% more than the last. */
export const cost = (u: Upgrade, owned: number) => Math.ceil(u.baseCost * 1.15 ** owned)

export const perSecond = (s: KettleSave) => UPGRADES.reduce((sum, u) => sum + u.perSecond * (s.owned[u.id] ?? 0), 0)

const gain = (s: KettleSave, d: number): KettleSave => ({ ...s, degrees: s.degrees + d, total: s.total + d })

export const click = (s: KettleSave) => gain(s, 1)

export const tick = (s: KettleSave, seconds = 1) => gain(s, perSecond(s) * seconds)

export const buy = (s: KettleSave, id: string): KettleSave => {
  const u = UPGRADES.find((x) => x.id === id)
  if (!u) return s
  const owned = s.owned[id] ?? 0
  const price = cost(u, owned)
  if (s.degrees < price) return s
  return { ...s, degrees: s.degrees - price, owned: { ...s.owned, [id]: owned + 1 } }
}

/** True exactly once: the first time the lifetime total reaches boiling point. */
export const shouldWhistle = (s: KettleSave) => !s.whistled && s.total >= 100
