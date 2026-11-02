import 'lenis/dist/lenis.css'
import Lenis from 'lenis'
import { useEffect } from 'react'

let lenis: Lenis | null = null

/** Smooth, weighted scrolling for the page (the reference's own library), for as long as the page is mounted. */
export function useLenis() {
  useEffect(() => {
    lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: false })
    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [])
}

/** Scrolls to a section (by id), smoothly through Lenis when it's running. */
export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(id === 'home' ? 0 : el, { offset: 0, immediate })
  else el.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth', block: 'start' })
}
