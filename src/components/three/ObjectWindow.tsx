import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clampToViewport, useDrag } from '../../hooks/useDrag'
import { icons } from '../../content/assets'
import type { ObjSpec } from '../../three/pageScenes'
import { Win95Window } from '../Win95Window'
import { Viewer3D } from './Viewer3D'

const STARS = { common: '★☆☆', rare: '★★☆', legendary: '★★★' } as const

/** "The Lucky Die" -> "the-lucky-die", like a file on Daniel's desktop. */
const fileName = (name: string) => name.toLowerCase().replace(/[^a-z0-9£]+/g, '-').replace(/^-|-$/g, '') || 'object'
const WIDTH = 440

/**
 * "<object>.obj - Properties": a big live 3D view you can drag to turn, plus the object's name, lore, what
 * it's made of and its rarity. Its personality is never revealed.
 */
export function ObjectWindow({ spec, onClose, inDex = false }: { spec: ObjSpec; onClose: () => void; inDex?: boolean }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const drag = useDrag((x, y) => setPos(clampToViewport(x, y, WIDTH)))
  return (
    <Win95Window
      title={`${fileName(spec.name)}.obj - Properties`}
      icon={icons.floppy}
      onClose={onClose}
      drag={drag}
      testId="object-window"
      className={`fixed z-[70] w-[min(440px,calc(100vw-16px))] ${pos ? '' : 'left-1/2 top-[18%] -translate-x-1/2'}`}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      bodyClassName="bg-win"
    >
      <div className="flex flex-col gap-2 p-2 sm:flex-row">
        <Viewer3D spec={spec} size="180px" className="win-sunken mx-auto bg-[radial-gradient(circle,#335_0%,#000_75%)]" />
        <dl className="min-w-0 flex-1 space-y-1 text-black">
          <dt className="sr-only">Name</dt>
          <dd className="font-bold">{spec.name}</dd>
          <dt className="sr-only">Lore</dt>
          <dd className="win-sunken bg-white p-1 font-[Tahoma,sans-serif] leading-snug">{spec.lore}</dd>
          <div className="flex gap-1">
            <dt className="font-bold">Made of:</dt>
            <dd>{spec.madeOf}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-bold">Rarity:</dt>
            <dd className={spec.rarity === 'legendary' ? 'animate-rainbow font-bold' : ''}>
              {STARS[spec.rarity]} {spec.rarity.toUpperCase()}
            </dd>
          </div>
          {spec.rarity === 'legendary' && (
            <dd>
              <Link to={`/legendary/${spec.id}`} onClick={onClose} className="font-bold text-blue-800 underline">
                ✦ Visit its page ✦
              </Link>
            </dd>
          )}
        </dl>
      </div>
      <p className="flex flex-wrap justify-between gap-x-2 border-t border-win-dark px-2 py-1 text-[10px] text-gray-700">
        <span>Drag the picture to turn it. Some objects are shy.</span>
        {!inDex && spec.specimen && (
          <Link to="/dex" onClick={onClose} className="font-bold text-green-800 underline" data-testid="dex-link">
            ✓ Catalogued in the Object Dex
          </Link>
        )}
      </p>
    </Win95Window>
  )
}
