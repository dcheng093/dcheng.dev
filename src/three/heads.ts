import { assets } from '../content/assets'

// Daniel's faces for the 3D photo objects. Cut-outs dropped into src/heads/ are found at build time.
const dropped = import.meta.glob<string>('../heads/*.png', { eager: true, query: '?url', import: 'default' })

/** Transparent head cut-outs, for floating head billboards. */
export const HEADS: string[] = [
  assets.headGrin.src,
  assets.headShock.src,
  assets.headWink.src,
  ...Object.keys(dropped)
    .sort()
    .map((k) => dropped[k]),
]

/** Casual photos, for photo cubes and framed portraits. */
export const PHOTOS: string[] = assets.misc.map((s) => s.src)
