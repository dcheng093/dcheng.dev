import '@fontsource-variable/space-grotesk'
import '@fontsource/permanent-marker/latin-400.css'
import { useEffect, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { About } from '../components/boring/About'
import { Contact } from '../components/boring/Contact'
import { Footer } from '../components/boring/Footer'
import { Hero } from '../components/boring/Hero'
import { Navbar } from '../components/boring/Navbar'
import { Projects } from '../components/boring/Projects'
import { ACCENT, ACCENT_2 } from '../components/boring/theme'

/**
 * The boring site: Daniel's real portfolio, modelled on his brother's (elyxiandev.com). A calm route (routes.tsx), so
 * none of the chaos, the music or the possession reaches it, and it never imports any of them. Professional only.
 */
export function Boring() {
  const { hash } = useLocation()
  useEffect(() => {
    const was = document.title
    document.title = 'Daniel Cheng'
    return () => {
      document.title = was
    }
  }, [])
  // Arriving at a section (the webring's "List Sites" comes to #sitemap).
  useEffect(() => {
    if (!hash) return
    const id = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }), 50)
    return () => window.clearTimeout(id)
  }, [hash])
  return (
    <div data-testid="boring" className="boring min-h-screen overflow-x-clip bg-[#0a0a0a] text-white" style={{ '--accent': ACCENT, '--accent-2': ACCENT_2 } as CSSProperties}>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
