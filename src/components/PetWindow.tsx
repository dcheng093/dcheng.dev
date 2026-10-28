import { useState } from 'react'
import { daniel } from '../content/daniel'
import { kawaii } from '../content/assets'
import { useStored } from '../hooks/useLocalStorage'
import { clampToViewport, useDrag } from '../hooks/useDrag'
import { Win95Window } from './Win95Window'

const WIDTH = 322 // the 314px pet plus window chrome
// Phones (either way up): the 340px-tall pet would cover most of a short screen.
const startsSmall = () => typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 639px), (max-height: 500px)').matches

/** Melly, Daniel's Gify pet, in a draggable window top-right. Starts minimised on phones; remembers either way. */
export function PetWindow() {
  const [minimised, setMinimised] = useStored('petMinimised', startsSmall())
  // The iframe is created the first time Melly is shown and only hidden after that, so she never reloads.
  const [loaded, setLoaded] = useState(!minimised)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const drag = useDrag((x, y) => setPos(clampToViewport(x, y, WIDTH)))
  const toggle = () => {
    setLoaded(true)
    setMinimised((m) => !m)
  }
  return (
    <Win95Window
      title="Melly.exe"
      icon={kawaii.strawberry}
      minimised={minimised}
      onMinimise={toggle}
      drag={drag}
      testId="pet-window"
      className={`fixed z-40 ${pos ? '' : 'right-2 top-10'} ${minimised ? 'w-36' : 'w-[322px] max-w-[calc(100vw-16px)]'}`}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      bodyClassName="overflow-hidden bg-white"
    >
      {loaded && (
        <iframe
          title="Melly the Gify pet"
          src={daniel.petUrl}
          width={314}
          height={321}
          scrolling="no"
          loading="lazy"
          className="block max-w-full border-0"
        />
      )}
    </Win95Window>
  )
}
