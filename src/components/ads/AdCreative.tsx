import type { Ad, AdFormat } from '../../content/ads'
import { assets } from '../../content/assets'
import { Img } from '../media/Img'

const imgSlot = (ad: Ad) => {
  if (!ad.img) return null
  if (typeof ad.img === 'object') return ad.img
  return ad.img === 'head' ? assets.headGrin : ad.img === 'body' ? assets.body : assets[ad.img]
}

/**
 * The sponsor's ads (Gulag Games) look like their own studio, not like the site's joke ads: their dark palette and
 * condensed type, and their real art filling the slot (box art in tall slots, the man and his horse in wide ones).
 */
function SponsorCreative({ ad, format }: { ad: Ad; format: AdFormat }) {
  const art = ad.art?.[format] ?? imgSlot(ad)!
  const cta = <span className="inline-block border border-[#f5f5f0] bg-[#c8102e] px-2 py-0.5 font-impact uppercase tracking-wide text-[#f5f5f0]">{ad.cta} »</span>
  const studio = 'font-impact uppercase leading-none tracking-wide'
  if (format === 'leaderboard' || format === 'banner') {
    const big = format === 'leaderboard'
    return (
      <div className={`relative w-full overflow-hidden border-2 border-black ${ad.palette} ${big ? 'aspect-[728/90] max-w-[728px]' : 'aspect-[468/60] max-w-[468px]'}`}>
        <Img slot={art} width={art.w} className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0bcc] to-transparent" />
        <div className="relative flex h-full items-center gap-2 px-2">
          <div className="min-w-0 flex-1">
            <p className={`truncate ${studio} ${big ? 'text-base sm:text-2xl' : 'text-sm sm:text-lg'}`}>{ad.headline}</p>
            {ad.body && <p className="hidden truncate font-mono text-[10px] text-[#d8d8d0] sm:block">{ad.body}</p>}
          </div>
          <span className="shrink-0 text-[10px] sm:text-xs">{cta}</span>
        </div>
      </div>
    )
  }
  return (
    <div className={`flex flex-col items-center gap-2 overflow-hidden border-2 border-black p-2 text-center ${ad.palette} ${format === 'skyscraper' ? 'h-[600px] w-[120px] justify-between' : format === 'square' ? 'aspect-square w-[250px] max-w-full justify-around' : ''}`}>
      <span className={`${studio} ${format === 'skyscraper' ? 'text-lg' : 'text-xl'}`}>{ad.headline}</span>
      <Img slot={art} width={format === 'square' ? 120 : format === 'skyscraper' ? 104 : 280} className="border border-[#f5f5f0]/40" />
      {ad.body && format !== 'square' && <span className="font-mono text-[11px] leading-snug text-[#d8d8d0]">{ad.body}</span>}
      {cta}
    </div>
  )
}

/** The visual body of an ad, sized for its IAB-ish format. Click handling lives in AdSlot. */
export function AdCreative({ ad, format }: { ad: Ad; format: AdFormat }) {
  if (ad.kind === 'sponsor') return <SponsorCreative ad={ad} format={format} />
  const slot = imgSlot(ad)
  const cta = (
    <span className="inline-block animate-pulse-scale border-2 border-black bg-red-600 px-2 py-0.5 font-impact text-white shadow-[2px_2px_0_#000]">
      {ad.cta} »
    </span>
  )

  switch (format) {
    case 'button':
      return (
        <div className={`flex h-[31px] w-[88px] items-center gap-0.5 overflow-hidden border border-black px-0.5 font-silk text-[7px] leading-[8px] ${ad.palette}`}>
          {slot && <Img slot={slot} width={22} />}
          <span className="flex-1">{ad.headline}</span>
        </div>
      )
    case 'button125':
      return (
        <div className={`flex h-[125px] w-[125px] flex-col items-center justify-between overflow-hidden border-2 border-black p-1 text-center ${ad.palette}`}>
          <span className="font-impact text-sm leading-tight">{ad.headline}</span>
          {slot && <Img slot={slot} width={50} />}
          <span className="font-pixel text-[8px]">{ad.cta}!</span>
        </div>
      )
    case 'leaderboard':
    case 'banner': {
      const big = format === 'leaderboard'
      return (
        <div
          className={`flex w-full animate-breathe items-center gap-2 overflow-hidden border-2 border-black px-2 ${ad.palette} ${big ? 'aspect-[728/90] max-w-[728px]' : 'aspect-[468/60] max-w-[468px]'}`}
        >
          {slot && <Img slot={slot} width={big ? 70 : 48} className="shrink-0" />}
          <div className="min-w-0 flex-1">
            <p className={`truncate font-impact ${big ? 'text-base sm:text-2xl' : 'text-sm sm:text-lg'}`}>{ad.headline}</p>
            {ad.body && <p className="hidden truncate font-comic text-[11px] sm:block">{ad.body}</p>}
          </div>
          {ad.price && <span className="hidden font-impact text-xl sm:block">{ad.price}</span>}
          <span className="shrink-0 text-[10px] sm:text-xs">{cta}</span>
        </div>
      )
    }
    case 'skyscraper':
      return (
        <div className={`flex h-[600px] w-[120px] flex-col items-center justify-between overflow-hidden border-2 border-black p-2 text-center ${ad.palette}`}>
          <span className="font-impact text-2xl leading-none">{ad.headline}</span>
          {slot && <Img slot={slot} width={100} className="animate-boing" />}
          {ad.body && <span className="font-comic text-xs">{ad.body}</span>}
          {ad.price && <span className="animate-blink font-impact text-3xl">{ad.price}</span>}
          {cta}
        </div>
      )
    case 'square':
      return (
        <div className={`flex aspect-square w-[250px] max-w-full flex-col items-center justify-around overflow-hidden border-4 border-double border-black p-2 text-center ${ad.palette}`}>
          <span className="font-impact text-2xl leading-none">{ad.headline}</span>
          {slot && <Img slot={slot} width={90} className="animate-wobble" />}
          {ad.body && <span className="font-comic text-xs">{ad.body}</span>}
          <div className="flex items-center gap-2">
            {ad.price && <span className="font-impact text-xl">{ad.price}</span>}
            {cta}
          </div>
        </div>
      )
    case 'classified':
      return (
        <div className="w-[220px] max-w-full border border-black bg-amber-50 p-2 font-times text-sm text-black">
          <p className="font-bold uppercase">{ad.headline}</p>
          {ad.body && <p className="text-[13px] leading-snug">{ad.body}</p>}
          <p className="mt-1 text-right text-xs underline">{ad.cta}</p>
        </div>
      )
    case 'popup':
      return (
        <div className={`flex flex-col items-center gap-2 p-2 text-center ${ad.palette}`}>
          <span className="animate-breathe font-impact text-xl leading-tight">{ad.headline}</span>
          {slot && <Img slot={slot} width={80} />}
          {ad.body && <span className="font-comic text-xs">{ad.body}</span>}
          {ad.price && <span className="font-impact text-2xl">{ad.price}</span>}
          {cta}
        </div>
      )
  }
}
