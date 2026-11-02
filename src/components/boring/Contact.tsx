import { useState, type FormEvent } from 'react'
import { portfolio } from '../../content/portfolio'
import { useCopy } from '../../hooks/useCopy'
import { Chapter, Panel } from './Chapter'
import { SocialLink } from './Hero'

const field =
  'w-full border-b border-[#16161d]/20 bg-transparent px-0 py-3 text-lg text-[#16161d] placeholder:text-[#16161d]/40 outline-none transition-colors focus:border-[var(--accent)]'

/** No server: the form writes the email and opens it in the visitor's own mail app. Every social, by name, beside it. */
export function Contact() {
  const chapter = portfolio.chapters.find((c) => c.id === 'contact')!
  const { copied, copy } = useCopy()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const ready = form.name.trim() && form.message.trim()
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })
  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!ready) return
    const body = `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`
    const subject = form.subject || `Hello from ${form.name}`
    window.location.href = `mailto:${portfolio.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  return (
    <Chapter id="contact" title={chapter.title} lede={portfolio.contactLine}>
      <Panel className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={send} aria-label="Contact form" className="space-y-2">
          <div className="grid gap-x-6 sm:grid-cols-2">
            <input aria-label="Name" placeholder="Name" className={field} value={form.name} onChange={set('name')} />
            <input aria-label="Email" placeholder="Email" type="email" className={field} value={form.email} onChange={set('email')} />
          </div>
          <input aria-label="Subject" placeholder="Subject" className={field} value={form.subject} onChange={set('subject')} />
          <textarea aria-label="Message" placeholder="Message" rows={5} className={`${field} resize-none`} value={form.message} onChange={set('message')} />
          <button
            type="submit"
            disabled={!ready}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#16161d] px-6 py-3 font-semibold text-[#f4f1ea] transition-[transform,opacity] duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] enabled:hover:scale-105 disabled:opacity-35"
          >
            Send message
          </button>
        </form>
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#16161d]/50">Elsewhere</p>
          <ul aria-label="Socials" className="mt-4 divide-y divide-[#16161d]/10 border-y border-[#16161d]/10">
            {portfolio.socials.map((s) => (
              <li key={s.id}>
                <SocialLink {...s} showLabel onCopy={(text) => void copy(text)} className="w-full py-3.5 text-lg text-[#16161d]" />
              </li>
            ))}
          </ul>
          <p role="status" className="mt-3 h-5 text-sm text-[#16161d]/60">
            {copied ? `Copied my Discord: ${portfolio.socials.find((s) => s.copy)?.copy}` : ''}
          </p>
        </div>
      </Panel>
    </Chapter>
  )
}
