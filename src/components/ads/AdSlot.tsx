import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Ad, AdFormat, AdKind } from '../../content/ads'
import { randomRoute } from '../../lib/sitemap'
import { usePopups } from '../popups/popupState'
import { AdCreative } from './AdCreative'
import { pickAd } from './pickAd'

/** A clickable ad. Give it an `ad`, or a format (+kind) and it picks one at random on mount. */
export function AdSlot({ format, kind, ad: fixed, className = '' }: { format: AdFormat; kind?: AdKind; ad?: Ad; className?: string }) {
  const [ad] = useState(() => fixed ?? pickAd(format, { kind }))
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const popups = usePopups()

  const go = () => {
    if (ad.to === 'random') navigate(randomRoute(pathname))
    else if (ad.to.startsWith('popup:')) popups.open(ad.to.slice('popup:'.length))
    else navigate(ad.to)
  }

  return (
    <button type="button" onClick={go} data-ad={ad.id} aria-label={`Advertisement: ${ad.headline}`} className={`block max-w-full cursor-pointer text-left ${className}`}>
      <AdCreative ad={ad} format={format} />
    </button>
  )
}
