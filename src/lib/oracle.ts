/** The Magic Kettle's answers are fate, not chance: same question on the same day, same answer. */
export const hash = (text: string) => {
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619)
  return h >>> 0
}

const normalise = (q: string) => q.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

export const fortuneFor = <T>(question: string, day: Date, fortunes: readonly T[]) =>
  fortunes[hash(`${normalise(question)}|${dayKey(day)}`) % fortunes.length]

export const dailyBrew = <T>(day: Date, fortunes: readonly T[]) => fortunes[hash(`brew|${dayKey(day)}`) % fortunes.length]
