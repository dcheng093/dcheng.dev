import { useEffect, useState, type RefObject } from 'react'

// Home is ~20 bands, 400 looping animations and up to 180 confetti GIFs. Anything well off screen gets
// `data-offscreen`, which pauses its animations (index.css): nobody can see them, and the page stays smooth.
// One observer for all of it.
let observer: IntersectionObserver | undefined
export const offscreenObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.toggleAttribute('data-offscreen', !e.isIntersecting)
    },
    { rootMargin: '300px 0px' },
  ))

export function useOffscreenPause(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = offscreenObserver()
    io.observe(el)
    return () => io.unobserve(el)
  }, [ref])
}

/** Whether a media query matches, kept up to date (false where matchMedia doesn't exist). */
export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia(query).matches)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const m = window.matchMedia(query)
    const on = () => setMatches(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return matches
}

/**
 * In-page jumps (Home's #end, #welcome…): skipped bands only have a guessed height, so for a moment around the jump
 * every band is laid out for real and the browser lands on the right spot. Once seen, a band remembers its size.
 */
export function useExactJumps() {
  useEffect(() => {
    let timer = 0
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (!a) return
      const html = document.documentElement
      html.dataset.jumping = ''
      window.clearTimeout(timer)
      timer = window.setTimeout(() => delete html.dataset.jumping, 2000)
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.clearTimeout(timer)
      delete document.documentElement.dataset.jumping
    }
  }, [])
}
