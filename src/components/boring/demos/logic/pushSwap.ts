// A line-for-line port of Daniel's push_swap (github.com/dcheng093/push_swap, srcs/turksort*.c and ops*.c): the
// "Turk" sort. Push everything but three onto b, each time choosing the number cheapest to bring to the top along
// with its target in b; sort the three; push them all back, each to its place in a; rotate the smallest to the top.

export type Op = 'sa' | 'sb' | 'ss' | 'pa' | 'pb' | 'ra' | 'rb' | 'rr' | 'rra' | 'rrb' | 'rrr'
export type Stacks = { a: number[]; b: number[] }

/** Applies one operation in place; false (and no change) when the C version would refuse it and print nothing. */
export function apply(s: Stacks, op: Op): boolean {
  const swap = (x: number[]) => (x.length < 2 ? false : (([x[0], x[1]] = [x[1], x[0]]), true))
  const rot = (x: number[]) => (x.length < 2 ? false : (x.push(x.shift()!), true))
  const rrot = (x: number[]) => (x.length < 2 ? false : (x.unshift(x.pop()!), true))
  const both = (f: (x: number[]) => boolean) => (s.a.length < 2 || s.b.length < 2 ? false : (f(s.a), f(s.b), true))
  switch (op) {
    case 'sa': return swap(s.a)
    case 'sb': return swap(s.b)
    case 'ss': return both(swap)
    case 'pa': return s.b.length === 0 ? false : (s.a.unshift(s.b.shift()!), true)
    case 'pb': return s.a.length === 0 ? false : (s.b.unshift(s.a.shift()!), true)
    case 'ra': return rot(s.a)
    case 'rb': return rot(s.b)
    case 'rr': return both(rot)
    case 'rra': return rrot(s.a)
    case 'rrb': return rrot(s.b)
    case 'rrr': return both(rrot)
  }
}

const isSorted = (x: number[]) => x.every((v, i) => i === 0 || x[i - 1] < v)
const minIndex = (x: number[]) => x.indexOf(Math.min(...x))
const maxIndex = (x: number[]) => x.indexOf(Math.max(...x))

/** The operations push_swap prints for these (distinct) numbers. */
export function turkSort(values: number[]): Op[] {
  const s: Stacks = { a: [...values], b: [] }
  const ops: Op[] = []
  const op = (o: Op) => apply(s, o) && ops.push(o)
  const median = (n: number) => Math.floor((n + 1) / 2)

  const sortThree = () => {
    if (s.a.length !== 3) return
    const max = Math.max(...s.a)
    if (s.a[0] === max) op('ra')
    else if (s.a[1] === max) op('rra')
    if (s.a[0] > s.a[1]) op('sa')
  }
  /** Bring a[i] to the top of a, the short way round. */
  const aToTop = (value: number, i: number) => {
    while (s.a[0] !== value) op(i < median(s.a.length) ? 'ra' : 'rra')
  }
  // Each a's target in b: the largest smaller number, or failing that b's largest.
  const targetsA = () =>
    s.a.map((v) => {
      let best = -1
      s.b.forEach((w, j) => {
        if (w < v && (best === -1 || w > s.b[best])) best = j
      })
      return best === -1 && s.b.length > 0 ? maxIndex(s.b) : best
    })
  const moveCheapestToTop = () => {
    const target = targetsA()
    const na = s.a.length
    const nb = s.b.length
    const cost: number[] = []
    const rr: boolean[] = []
    const rrr: boolean[] = []
    for (let i = 0; i < na; i++) {
      cost[i] = (i < median(na) ? i : na - i) + (target[i] < median(nb) ? target[i] : nb - target[i])
      rr[i] = rrr[i] = false
      const up = Math.max(i, target[i])
      if (up < cost[i]) {
        cost[i] = up
        rr[i] = true
      }
      const down = Math.max(na - i, nb - target[i])
      if (down < cost[i]) {
        cost[i] = down
        rr[i] = false
        rrr[i] = true
      }
    }
    let i = 0
    for (let k = 0; k < na; k++) if (cost[k] < cost[i]) i = k
    const aVal = s.a[i]
    const bVal = s.b[target[i]]
    const both = (rr[i] || rrr[i]) && nb > 0 && target[i] < nb
    if (both) {
      const [r, ra, rb]: Op[] = rr[i] ? ['rr', 'ra', 'rb'] : ['rrr', 'rra', 'rrb']
      while (s.a[0] !== aVal && s.b[0] !== bVal) op(r)
      while (s.a[0] !== aVal) op(ra)
      while (s.b[0] !== bVal) op(rb)
      return
    }
    aToTop(aVal, i)
    if (nb === 0 || target[i] >= nb) return
    const t = target[i]
    while (s.b[0] !== bVal) op(t < median(nb) ? 'rb' : 'rrb')
  }
  // b's top goes to the smallest larger number in a, or failing that a's smallest.
  const moveBTargetToTop = () => {
    let best = -1
    s.a.forEach((v, i) => {
      if (v > s.b[0] && (best === -1 || v < s.a[best])) best = i
    })
    const i = best === -1 ? minIndex(s.a) : best
    aToTop(s.a[i], i)
  }

  if (isSorted(s.a)) return ops
  if (s.a.length === 2) op('sa')
  else if (s.a.length === 3) sortThree()
  else {
    for (let k = 0; k < 2; k++) if (s.a.length > 3 && !isSorted(s.a)) op('pb')
    while (s.a.length > 3 && !isSorted(s.a)) {
      moveCheapestToTop()
      op('pb')
    }
    sortThree()
    while (s.b.length > 0) {
      moveBTargetToTop()
      op('pa')
    }
    aToTop(Math.min(...s.a), minIndex(s.a))
  }
  return ops
}
