/** Sticker hunt bookkeeping: the collection is just a list of found ids. */
export const collect = (have: readonly string[], id: string) => (have.includes(id) ? [...have] : [...have, id])

export const progress = (have: readonly string[], all: readonly { id: string }[]) => {
  const found = all.filter((s) => have.includes(s.id)).length
  return { found, total: all.length, complete: found === all.length }
}
