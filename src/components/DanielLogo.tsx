import { Img } from './media/Img'

/**
 * Daniel's grinning head, wobbling in a red-and-white candy-striped frame: the dealership's logo, and the
 * taskbar's. `size` is the head's width in px; small sizes get a thinner frame so the face still shows.
 */
export function DanielLogo({ size = 70, className = '' }: { size?: number; className?: string }) {
  const frame = size < 40 ? 'border-2 p-0.5 bg-[repeating-linear-gradient(45deg,#fff_0_4px,#f33_4px_8px)]' : 'border-4 p-1 bg-[repeating-linear-gradient(45deg,#fff_0_8px,#f33_8px_16px)]'
  return (
    <div className={`shrink-0 border-red-600 ${frame} ${className}`}>
      <Img slot="headGrin" width={size} alt="Daniel" className="animate-wobble" />
    </div>
  )
}
