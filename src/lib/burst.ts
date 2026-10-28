import { sparkles } from '../content/assets'

const PARTICLES = 6

/** Sparkles flying out from a point (viewport px). Also used when a 3D object bursts. */
export function burstAt(x: number, y: number, host: HTMLElement = document.body, count = PARTICLES, spread = 1) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6
    const dist = (28 + Math.random() * 22) * spread
    const sparkle = sparkles[(i + Math.floor(Math.random() * sparkles.length)) % sparkles.length]
    const s = document.createElement('img')
    s.src = sparkle.src
    s.alt = ''
    s.width = 14
    s.className = 'pointer-events-none fixed z-[91] -translate-x-1/2 -translate-y-1/2 animate-burst [image-rendering:pixelated]'
    s.style.left = `${x}px`
    s.style.top = `${y}px`
    s.style.setProperty('--bx', `${Math.cos(angle) * dist}px`)
    s.style.setProperty('--by', `${Math.sin(angle) * dist}px`)
    s.addEventListener('animationend', () => s.remove())
    host.appendChild(s)
  }
}
