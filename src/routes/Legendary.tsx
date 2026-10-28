import { useParams } from 'react-router-dom'
import { Link } from '../components/Link'
import { useSfx } from '../audio/audioContext'
import { WavyText } from '../components/chaos/Chaos'
import { Viewer3D } from '../components/three/Viewer3D'
import { legendary } from '../content/objects'
import { useStored } from '../hooks/useLocalStorage'
import { FakeBSOD } from './FakeBSOD'

/** Each legendary's backdrop: butcher-shop tiles, deep space, a meadow sky. */
const SCENERY: Record<string, string> = {
  beef: 'bg-[repeating-conic-gradient(#fff_0_25%,#c8102e_0_50%)_0_0/48px_48px]',
  'planet-daniel': "bg-[#05030f] bg-[url('/me/GALAXY2.JPG')] bg-cover bg-center",
  goose: "bg-[#9cd0ff] bg-[url('/me/CLOUD2.JPG')] bg-cover bg-top",
}

/** A legendary's own page. Sealed until you've caught it somewhere on the site. */
export function Legendary() {
  const { id } = useParams()
  const spec = legendary(id)
  const [found] = useStored<Record<string, string>>('legendaries', {})
  const sfx = useSfx()
  if (!spec) return <FakeBSOD />
  const seen = found[spec.id]

  return (
    <div data-testid="legendary" className={`min-h-screen p-3 sm:p-6 ${SCENERY[spec.id]}`}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        {seen ? (
          <>
            <h1 className="bg-black/60 px-3 py-1 font-times text-4xl font-bold italic text-[#ffd84a] [text-shadow:0_0_12px_#ffb300] sm:text-6xl">
              <WavyText text={`✦ ${spec.name} ✦`} />
            </h1>
            <Viewer3D
              spec={spec}
              size="min(360px, 85vw)"
              res={200}
              className="win-sunken animate-legend bg-[radial-gradient(circle,#443_0%,#000_75%)]"
              onClick={() => sfx(spec.id === 'goose' ? 'honk' : 'coin')}
            />
            <p className="win-raised max-w-lg p-3 font-[Tahoma,sans-serif] text-black">{spec.lore}</p>
            <dl className="win-raised grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 p-3 text-left font-[Tahoma,sans-serif] text-sm text-black" aria-label="Sighting log">
              <dt className="font-bold">Rarity</dt>
              <dd className="animate-rainbow font-bold">★★★ LEGENDARY</dd>
              <dt className="font-bold">Made of</dt>
              <dd>{spec.madeOf}</dd>
              <dt className="font-bold">First seen by you</dt>
              <dd data-testid="first-seen">{new Date(seen).toLocaleString()}</dd>
            </dl>
          </>
        ) : (
          <div className="win-raised mt-[20vh] max-w-md p-6 font-[Tahoma,sans-serif] text-black" data-testid="sealed">
            <p className="text-4xl">🔒</p>
            <h1 className="mt-2 text-xl font-bold">This page is sealed.</h1>
            <p className="mt-2">The legendary that lives here has not been seen by you. They turn up rarely, glowing, somewhere on the site. Catch one, and this page opens.</p>
          </div>
        )}
        <Link to="/" className="win-raised px-3 py-1 font-bold text-black">
          « Back to the site
        </Link>
      </div>
    </div>
  )
}
