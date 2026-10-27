import { useLocation, useNavigate } from 'react-router-dom'
import type { Model } from '../../content/dealership'
import type { Slot } from '../../content/assets'
import { randomRoute } from '../../lib/sitemap'
import { Img } from '../media/Img'
import { Sticker } from '../chaos/Chaos'

/** LINGsCARS deal tile: photo, big monthly price, red/green CTA. */
export function DealCard({ model, slot, index = 0 }: { model: Model; slot: Slot; index?: number }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const go = () => navigate(model.to === 'random' ? randomRoute(pathname) : model.to.startsWith('/') ? model.to : '/checkout')
  const green = index % 2 === 0

  return (
    <div className="relative flex w-full max-w-[240px] flex-col items-center border-2 border-[#99c] bg-[#eef] p-2 text-center font-[Verdana,sans-serif] text-black">
      {model.hot && <Sticker className="absolute -right-2 -top-3 z-10 animate-wobble text-xs">HOT DEAL!!</Sticker>}
      <p className="w-full truncate bg-[#336] px-1 text-xs font-bold text-white">{model.name}</p>
      <div className="my-1 grid aspect-[4/3] w-full place-items-center overflow-hidden bg-white">
        <Img slot={slot} width={150} className="aspect-[4/3] w-full object-cover" />
      </div>
      <p className="text-[11px] italic">{model.tagline}</p>
      <p className="font-impact text-3xl leading-none text-red-600">
        {model.price}
        <span className="text-sm">/mo</span>
      </p>
      <p className="text-[10px]">Initial rental {model.initial} • 0 miles (he walks)</p>
      <button
        type="button"
        onClick={go}
        className={`mt-1 w-full border-2 border-black py-0.5 font-impact text-white ${green ? 'bg-green-600' : 'bg-red-600'} animate-pulse-scale`}
        style={{ animationDelay: `${index * 0.13}s` }}
      >
        ORDER NOW »
      </button>
    </div>
  )
}
