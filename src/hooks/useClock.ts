import { useEffect, useState } from 'react'
import { isNight, monthDay, VISITS_KEY } from '../lib/discovery'
import { readStored } from './useLocalStorage'

const read = () => {
  const now = new Date()
  return { visit: Math.max(1, readStored(VISITS_KEY, 0)), night: isNight(now), today: monthDay(now) }
}

/** Which visit this is, whether it's night, and today's date; re-checked every minute. */
export function useClock() {
  const [clock, setClock] = useState(read)
  useEffect(() => {
    const t = window.setInterval(() => {
      const next = read()
      setClock((c) => (c.night === next.night && c.today === next.today && c.visit === next.visit ? c : next))
    }, 60_000)
    return () => window.clearInterval(t)
  }, [])
  return clock
}
