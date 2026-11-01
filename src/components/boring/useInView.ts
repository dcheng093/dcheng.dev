import { useEffect, useState, type RefObject } from 'react'

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

/** Smooth-scrolls to a section and puts it in the address bar without a history entry each time. */
export function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(history.state, '', id === 'home' ? location.pathname : `#${id}`)
}
