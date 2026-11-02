import { useEffect, useRef, useState, type RefObject } from 'react'
import { scrollToId } from './useLenis'

/** Whether the element is on screen (at least `threshold` of it). Starts false. */
export function useInView(ref: RefObject<Element | null>, threshold = 0.2) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return inView
}

/**
 * Marks the element `data-shown` the first time it comes into view, for the entrance animations in index.css
 * (`.reveal-up`, `.reveal-letters`, the orbit, the 42 card). Without IntersectionObserver it just shows.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.shown = ''
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        el.dataset.shown = ''
        io.disconnect()
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}

/** Smooth-scrolls to a section and puts it in the address bar without a history entry each time. */
export function goTo(id: string) {
  scrollToId(id)
  history.replaceState(history.state, '', id === 'home' ? location.pathname : `#${id}`)
}
