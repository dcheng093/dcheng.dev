import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import { useEffect, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { About, Intra, Stack } from '../components/boring/About'
import { Contact } from '../components/boring/Contact'
import { Footer } from '../components/boring/Footer'
import { useReady } from '../components/boring/boot'
import { Hero } from '../components/boring/Hero'
import { Loader } from '../components/boring/Loader'
import { Navbar } from '../components/boring/Navbar'
import { ProjectPanels } from '../components/boring/ProjectPanels'
import { Sidebar } from '../components/boring/Sidebar'
import { ACCENT, ACCENT_2 } from '../components/boring/theme'
import { scrollToId, useLenis } from '../components/boring/useLenis'
import { World } from '../components/boring/World'

/**
 * The boring site: Daniel's real portfolio, an editorial page in the manner of Shopify Editions. One 3D world behind
 * it all, its camera flying through it as you scroll (after a short loader: Loader.tsx); huge one-word titles over
 * it; the detail on cream panels. A calm route (routes.tsx), so none of the chaos, the music or the possession
 * reaches it, and it never imports any of them. Professional only.
 */
export function Boring() {
  const { hash } = useLocation()
  const ready = useReady()
  useLenis()
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
    const id = window.setTimeout(() => scrollToId(hash.slice(1), true), 60)
    return () => window.clearTimeout(id)
  }, [hash])
  return (
    <div
      data-testid="boring"
      data-ready={ready || undefined}
      className="boring min-h-screen overflow-x-clip text-[#f4f1ea]"
      style={{ '--accent': ACCENT, '--accent-2': ACCENT_2, '--side': 'clamp(200px, 17vw, 280px)' } as CSSProperties}
    >
      <Loader />
      <World />
      <Navbar />
      <Sidebar />
      <main>
        <Hero />
        <About />
        <Stack />
        <Intra />
        <ProjectPanels />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
