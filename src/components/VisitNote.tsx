import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { kawaii } from '../content/assets'
import { useClock } from '../hooks/useClock'
import { useStored } from '../hooks/useLocalStorage'
import { useSfx } from '../audio/audioContext'
import { visitNote } from '../lib/visitNote'
import { Win95Window } from './Win95Window'

const VISIT_NOTE_DELAY_MS = 4_000

/** A little "welcome back / it's a special day" note under the taskbar, once per visit. Never in the way. */
export function VisitNote() {
  const { visit, today } = useClock()
  const [seen, setSeen] = useStored('visitNoteSeen', false, 'session')
  const [open, setOpen] = useState(false)
  const sfx = useSfx()
  const note = visitNote(visit, today)

  useEffect(() => {
    if (seen || !note) return
    const t = window.setTimeout(() => {
      setOpen(true)
      setSeen(true)
      sfx('ding')
    }, VISIT_NOTE_DELAY_MS)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per visit; `note` only changes at midnight
  }, [seen])

  if (!open || !note) return null
  return (
    <Win95Window title={note.title} icon={kawaii.bunMail} onClose={() => setOpen(false)} testId="visit-note" className="fixed left-2 top-14 z-40 w-[min(280px,calc(100vw-16px))]" bodyClassName="bg-[#ffffe1]">
      <p className="p-2 leading-snug">{note.text}</p>
      <p className="px-2 pb-2">
        <Link to="/desktop" onClick={() => setOpen(false)} className="font-bold text-blue-800 underline">
          {note.link} »
        </Link>
      </p>
    </Win95Window>
  )
}
