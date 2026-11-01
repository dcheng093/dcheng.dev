import { useState, type FormEvent } from 'react'
import { daniel } from '../../content/daniel'
import { SectionTitle } from './SectionTitle'
import { goTo } from './useInView'

const field = 'w-full rounded-sm bg-[#1c1c22] px-3 py-2.5 text-white placeholder:text-white/35 outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--accent)]'

/** No server: the form writes the email and opens it in the visitor's own mail app. */
export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const ready = form.name.trim() && form.message.trim()
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })
  const [before, after] = daniel.boring.contactLine.split('socials')
  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!ready || !daniel.links.email) return
    const body = `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`
    const subject = form.subject || `Hello from ${form.name}`
    window.location.href = `mailto:${daniel.links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  return (
    <section id="contact" className="mx-auto max-w-3xl scroll-mt-16 px-4 py-24 sm:px-6">
      <SectionTitle>Contact</SectionTitle>
      <form onSubmit={send} aria-label="Contact form" className="rounded-3xl bg-[#141418] p-6 ring-1 ring-white/5 sm:p-8">
        <p className="mb-6 text-center leading-relaxed text-white/70">
          {before}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              goTo('home')
            }}
            className="font-semibold text-[var(--accent)] underline underline-offset-4"
          >
            socials
          </a>
          {after}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input aria-label="Name" placeholder="Name" className={field} value={form.name} onChange={set('name')} />
          <input aria-label="Email" placeholder="Email" type="email" className={field} value={form.email} onChange={set('email')} />
          <input aria-label="Subject" placeholder="Subject" className={`${field} sm:col-span-2`} value={form.subject} onChange={set('subject')} />
          <textarea aria-label="Message" placeholder="Message" rows={6} className={`${field} resize-none sm:col-span-2`} value={form.message} onChange={set('message')} />
        </div>
        <button
          type="submit"
          disabled={!ready}
          className="group relative mx-auto mt-5 block overflow-hidden px-6 py-1.5 font-semibold text-white transition-colors duration-300 enabled:hover:text-black disabled:opacity-40"
        >
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--accent)] transition-[height] duration-300 ease-out group-enabled:group-hover:h-full" />
          <span className="relative">Send</span>
        </button>
      </form>
    </section>
  )
}
