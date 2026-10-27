import { useState, type FormEvent } from 'react'
import { gifCursor } from '../lib/cursor'
import { blinkies, cursors, dividers } from '../content/assets'
import { Img } from '../components/media/Img'
import { Blink, BlinkieRow, GifDivider, RainbowText } from '../components/chaos/Chaos'
import { FOUND_VIA, type GuestEntry } from '../content/guestbookSeed'
import { PER_PAGE, mergeEntries, pageIndex, pageNumbers } from '../lib/guestbook'
import { useStored } from '../hooks/useLocalStorage'

export function Guestbook() {
  const [mine, setMine] = useStored<GuestEntry[]>('guestbook', [])
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ name: '', from: '', message: '', foundVia: FOUND_VIA[0] as string })
  const [flash, setFlash] = useState<string | null>(null)

  const entries = mergeEntries(mine)
  const pages = pageNumbers(entries.length)
  const start = pageIndex(page) * PER_PAGE
  const shown = entries.slice(start, start + PER_PAGE)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) {
      setFlash('ERROR: please fill in ALL the boxes (there are only two that matter)')
      return
    }
    const entry: GuestEntry = {
      id: `me-${Date.now()}`,
      name: form.name.trim().slice(0, 40),
      from: form.from.trim().slice(0, 40) || 'the internet',
      message: form.message.trim().slice(0, 500),
      foundVia: form.foundVia,
      date: new Date().toLocaleDateString('en-US'),
    }
    setMine((m) => [entry, ...m])
    setForm({ name: '', from: '', message: '', foundVia: FOUND_VIA[0] })
    setPage(1)
    setFlash('THANK YOU!!! Your entry has been saved (on your computer only, where nobody else can see it).')
  }

  const field = 'win-sunken w-full bg-white px-1 font-[Verdana,sans-serif] text-sm text-black'
  return (
    <div data-testid="guestbook" className="tile-quills min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.pencil) }}>
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="flex flex-col items-center gap-2 text-center">
          <Img slot="envelope" width={110} />
          <h1 className="bg-white px-3 font-comic text-4xl font-bold sm:text-5xl">
            <RainbowText text="SIGN MY GUESTBOOK" />
          </h1>
          <p className="bg-yellow-200 px-2 font-comic text-sm">
            <Blink>NEW!</Blink> {entries.length} people have signed. You could be {entries.length + 1}!
          </p>
          <BlinkieRow items={[blinkies.guestbook, blinkies.rememberYou]} />
        </header>
        <GifDivider slot={dividers.flowers} />

        <form onSubmit={submit} className="win-raised space-y-2 p-3 font-[Verdana,sans-serif] text-sm text-black" aria-label="Sign the guestbook">
          <div className="bg-win-title px-1 font-bold text-white">Sign Guestbook.exe</div>
          <label className="block">
            Your name: <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block">
            Where r u from: <input className={field} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
          </label>
          <label className="block">
            How did you find my site?
            <select className={field} value={form.foundVia} onChange={(e) => setForm({ ...form, foundVia: e.target.value })}>
              {FOUND_VIA.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Message: <textarea rows={3} className={field} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </label>
          <button type="submit" className="win-raised px-4 py-1 font-bold">
            SIGN IT!!!
          </button>
          {flash && <p role="status" className="bg-yellow-200 p-1 font-bold text-red-700">{flash}</p>}
        </form>

        <ol className="space-y-3" aria-label="Guestbook entries">
          {shown.map((g) => (
            <li key={g.id} className="border-4 border-double border-hotpink bg-white p-3 font-times text-black">
              <p className="flex flex-wrap justify-between gap-2 border-b border-dotted border-black text-sm">
                <b className="text-blue-800">{g.name}</b>
                <span>from <i>{g.from}</i></span>
                <span>{g.date}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words">{g.message}</p>
              <p className="mt-1 text-right text-xs text-gray-600">found via: {g.foundVia}</p>
            </li>
          ))}
          {shown.length === 0 && <li className="bg-white p-3 font-comic">This page is empty. Go back. GO BACK.</li>}
        </ol>

        <nav aria-label="Guestbook pages" className="flex flex-wrap justify-center gap-1 font-[Verdana,sans-serif] text-sm">
          {pages.map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)} className={`win-raised px-2 ${p === page ? 'font-bold text-red-700' : 'text-black'}`} aria-current={p === page ? 'page' : undefined}>
              {p}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
