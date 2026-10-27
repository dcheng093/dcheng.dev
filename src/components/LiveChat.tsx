import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CHAT_GREETING, pickReply } from '../content/chatScript'
import { useSfx } from '../audio/audioContext'
import { Img } from './media/Img'
import { Blink } from './chaos/Chaos'

type Msg = { from: 'daniel' | 'you'; text: string }

/** LINGsCARS-style "LIVE CHAT" box. Daniel is always online. Daniel is never helpful. */
export function LiveChat() {
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [log, setLog] = useState<Msg[]>([{ from: 'daniel', text: CHAT_GREETING }])
  const scroller = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const sfx = useSfx()

  useEffect(() => {
    scroller.current?.scrollTo?.({ top: scroller.current.scrollHeight })
  }, [log, typing])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const send = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setLog((l) => [...l, { from: 'you', text }])
    setTyping(true)
    timer.current = window.setTimeout(() => {
      setTyping(false)
      setLog((l) => [...l, { from: 'daniel', text: pickReply(text) }])
      sfx('ding')
    }, 900 + Math.random() * 2200)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="chat-toggle"
        className="fixed bottom-2 right-2 z-50 flex items-center gap-2 border-2 border-black bg-red-600 px-2 py-1 font-impact text-sm text-yellow-300 shadow-[4px_4px_0_#000] animate-wobble sm:text-base"
      >
        <Img slot="headWink" width={28} />
        LIVE CHAT WITH DANIEL!! <Blink className="text-lime">● ONLINE</Blink>
      </button>
    )
  }

  return (
    <div className="win-raised fixed bottom-2 right-2 z-50 flex h-[min(360px,70vh)] w-[min(300px,calc(100vw-16px))] flex-col p-0.5 text-xs" role="dialog" aria-label="Live chat">
      <div className="flex items-center gap-1 bg-gradient-to-r from-red-700 to-yellow-500 px-1 py-0.5 font-bold text-white">
        <Img slot="headGrin" width={20} />
        <span className="flex-1">DANIEL LIVE CHAT 24/7/366</span>
        <button type="button" aria-label="Minimise chat" onClick={() => setOpen(false)} className="win-raised grid h-4 w-4 place-items-center text-[10px] leading-none text-black">
          _
        </button>
      </div>
      <div ref={scroller} className="win-sunken flex-1 space-y-1 overflow-y-auto bg-white p-1 font-[Verdana,sans-serif]">
        {log.map((m, i) => (
          <p key={i} className={m.from === 'daniel' ? 'text-red-700' : 'text-blue-800'}>
            <b>{m.from === 'daniel' ? 'Daniel' : 'You'}:</b> {m.text}
          </p>
        ))}
        {typing && <p className="italic text-gray-500" data-testid="typing">Daniel is typing<Blink>...</Blink></p>}
      </div>
      <form onSubmit={send} className="flex gap-1 pt-0.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Message"
          placeholder="type here!!!"
          className="win-sunken min-w-0 flex-1 bg-white px-1 text-black"
        />
        <button type="submit" className="win-raised px-2 font-bold text-black">
          SEND
        </button>
      </form>
    </div>
  )
}
