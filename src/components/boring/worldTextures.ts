// Textures for the /boring world (heroScene.ts). Drop an image named after its slot into src/world-textures/
// (sky.webp, mountains-far.png, …: webp, png or jpg) and the world uses it on the next build; every slot that's missing
// is drawn in code instead, so they can arrive one at a time. What each slot wants:
//   sky            dusk sky panorama, equirectangular 2:1 (e.g. 4096×2048), clouds, no ground
//   mountains-far  a wide mountain-range silhouette (3000px+), transparent background, pale and far
//   mountains-near the same, nearer and darker
//   clouds-1, -2…  soft clouds on transparent backgrounds (as many as you like; npm run world-textures makes them from
//                  cloud photos)
//   water-normal   a seamless water-ripple normal map, 512–1024 square (npm run world-textures makes one from a
//                  calm-water photo)
//   ground         a seamless grass or rocky ground texture, 1024 square

export type WorldSlot = 'sky' | 'mountains-far' | 'mountains-near' | 'water-normal' | 'ground'

const FILES = import.meta.glob<string>('../../world-textures/*.{webp,png,jpg,jpeg}', { eager: true, import: 'default' })

const nameOf = (path: string) => path.slice(path.lastIndexOf('/') + 1).replace(/\.\w+$/, '')

/** Every image whose name starts with `prefix-` (clouds-1, clouds-2…), in name order. */
export function worldTextures(prefix: string): string[] {
  return Object.entries(FILES)
    .filter(([path]) => nameOf(path).startsWith(`${prefix}-`))
    .sort(([a], [b]) => nameOf(a).localeCompare(nameOf(b), 'en', { numeric: true }))
    .map(([, url]) => url)
}

/** The URL of the image for `slot`, or undefined to draw it in code. */
export function worldTexture(slot: WorldSlot): string | undefined {
  for (const [path, url] of Object.entries(FILES)) if (nameOf(path) === slot) return url
  return undefined
}
