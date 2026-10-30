import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAudio } from '../../audio/audioContext'
import { useStored } from '../../hooks/useLocalStorage'
import { AFTER_KNOCK, cracksAt, dueCues, HAUNT_DONE_KEY, HAUNT_KEY } from '../../lib/haunting'
import { Cracks } from './Cracks'

/**
 * Plays the haunting (src/lib/haunting.ts) while the site is possessed: one tick a second of time spent on a loud
 * page with the tab open (`paused` on the desktop, the Dex, Settings and the shrine). Its cracks stay on the screen
 * for the rest of the sitting; the shatter stays until the next page. Once it has played out, ever, it only knocks.
 */
export function Haunting({ paused }: { paused: boolean }) {
  const { sfx } = useAudio()
  const { pathname } = useLocation()
  const [seconds, setSeconds] = useStored(HAUNT_KEY, 0, 'session')
  const [done, setDone] = useStored(HAUNT_DONE_KEY, false)
  // Shattered on this page (the broken glass goes when you leave it).
  const [shatteredOn, setShatteredOn] = useState<string | null>(null)
  const [shake, setShake] = useState(0)
  const nextKnock = useRef(0)
  const at = useRef(seconds)
  const here = useRef(pathname)
  useEffect(() => {
    here.current = pathname
  }, [pathname])

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return
      if (done) {
        // Played out: just the odd faint knock, from somewhere.
        nextKnock.current -= 1
        if (nextKnock.current > 0) return
        nextKnock.current = AFTER_KNOCK[0] + Math.random() * (AFTER_KNOCK[1] - AFTER_KNOCK[0])
        return sfx('knock', { gain: 0.12, pan: Math.random() * 1.6 - 0.8 })
      }
      const before = at.current
      at.current = before + 1
      setSeconds(at.current)
      for (const cue of dueCues(before, at.current)) {
        cue.sounds.forEach(([name, opts], i) => window.setTimeout(() => sfx(name, opts), i * 350))
        if (cue.shake) setShake((k) => k + 1)
        if (cue.shatter) {
          setShatteredOn(here.current)
          setDone(true)
        }
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [paused, done, sfx, setSeconds, setDone])

  return <Cracks count={done ? 0 : cracksAt(seconds)} shattered={shatteredOn === pathname} shake={shake} />
}
