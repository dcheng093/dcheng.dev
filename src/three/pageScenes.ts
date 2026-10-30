import type { PageMood, Personality, Reaction } from '../lib/personality'

// The vocabulary shared by the 3D content (src/content/objects.ts) and the 3D code (src/three/*):
// textures, shapes, worlds and the object spec. Plain data, no three.js import, so it can sit in the main bundle.

/** Daniel's TextureTown textures plus a few of the site's own tiles. Static first frames get used. */
export const TEXTURES = {
  streaks: '/me/004.GIF', // red/grey streaks
  blobs: '/me/1055.GIF', // purple blobs on green
  marble: '/gifs/bg-marble.gif',
  steel: '/gifs/bg-steel.gif',
  nebula: '/gifs/bg-nebula.gif',
  lava: '/gifs/bg-lava-lamps.gif',
  graph: '/gifs/bg-graph-paper.gif',
  binary: '/gifs/bg-binary.gif',
  orbs: '/gifs/bg-purple-orbs.gif',
  carpet: '/gifs/bg-gold-carpet.gif',
  triangles: '/gifs/bg-rainbow-triangles.gif',
  static: '/gifs/bg-static.gif',
  lightning: '/me/048.GIF',
  swirls: '/me/017.GIF',
} as const
export type TextureId = keyof typeof TEXTURES

/** Daniel's texture pack for the enter gate's dream world (src/three/dream.ts). */
export const DREAM_TEXTURES = {
  ocean: '/me/OPOCEAN2.webp',
  david: '/me/DAVID.webp',
  cd: '/me/016C.webp',
  xray: '/me/cc330122.webp',
  pyramids: '/me/qcu50087.webp',
  palazzo: '/me/BUILD001.webp',
  warehouse: '/me/BUILD027.webp',
  stoneWall: '/me/248__wall_stone_texture-seamless.jpg',
  stones: '/me/012C.webp',
  crackedStone: '/me/044C.webp',
  gold: '/me/002.GIF',
  goldTopo: '/me/056.GIF',
  oil: '/me/054.GIF',
  rainbowOil: '/me/082.GIF',
  psychedelic: '/me/011.GIF',
  plasma: '/me/009.GIF',
  swirls: '/me/017.GIF',
  lightning: '/me/048.GIF',
} as const

/** The newest texture pack. */
export const MORE_TEXTURES = {
  worldMap: '/me/013C.webp',
  grass: '/me/073C.webp',
  grass2: '/me/ATF_8.webp',
  tieDye: '/me/089C.webp',
  tieDyeSpiral: '/me/090C.webp',
  tieDyeCircle: '/me/091C.webp',
  skyClouds: '/me/BACKGR12.webp',
  beef: '/me/BEEF.webp',
  wispySky: '/me/CLOUD2.webp',
  earth: '/me/EARTH_C.webp',
  tree: '/me/FRAXINS3.webp',
  galaxy: '/me/GALAXY2.webp',
  purpleMetal: '/me/METAL7.webp',
  painting: '/me/Painting.webp',
  bronze: '/me/SC009.JPG',
  copper: '/me/SC010.JPG',
  goldMetal: '/me/SC027.webp',
  puffySky: '/me/SKY1.webp',
  goose: '/me/cc200455.webp',
  kaleidoscope: '/me/cio60415.jpg',
  cosmic: '/me/cio60416.jpg',
  dollars: '/gifs/bg-dollar-bills.gif',
} as const

/** The congregation's pack: the world behind the sealed page (src/three/worlds.ts, `cult`). */
export const CULT_TEXTURES = {
  fractalEye: '/me/ahm60074.jpg',
  fractalEye2: '/me/ahm60030.jpg',
  vortex: '/me/ahm60003.jpg',
  darkMarble: '/me/046C.webp',
  blackMetal: '/me/SC051.JPG',
  crt: '/me/qcu50119.webp',
  lattice: '/me/pni50050.webp',
  nightStars: '/me/nightskystar.gif',
} as const

/** The possessed site's pack (public/possessed/, made by scripts/possessed-assets.mjs): flesh skins for the
 * objects, and the flesh world's material, skies and eyes. */
export const POSSESSED_TEXTURES = {
  fleshSkin: '/possessed/flesh.webp',
  veinSkin: '/possessed/veins.webp',
  cellSkin: '/possessed/cells.webp',
  holeSkin: '/possessed/holes-static.webp',
  rotSkin: '/possessed/rot-red.webp',
  nerveSkin: '/possessed/nerve.webp',
  fleshNormal: '/possessed/flesh-normal.webp',
  fleshRough: '/possessed/flesh-rough.webp',
  fleshAo: '/possessed/flesh-ao.webp',
  fleshHeight: '/possessed/flesh-height.webp',
  skyCorridor: '/possessed/sky-corridor.webp',
  skyGraveyard: '/possessed/sky-graveyard.webp',
  skyChurch: '/possessed/sky-church.webp',
  stillScream: '/possessed/still-scream.webp',
  stillSkull: '/possessed/still-skull.webp',
  stillLetterEye: '/possessed/still-letter-eye.webp',
  stillBloodEyes: '/possessed/still-blood-eyes.webp',
  stillEyes: '/possessed/still-eyes.webp',
  stillMouth: '/possessed/still-mouth.webp',
  stillFace: '/possessed/still-face.webp',
} as const

/** Every image texture by name. */
export const TEX = { ...TEXTURES, ...DREAM_TEXTURES, ...MORE_TEXTURES, ...CULT_TEXTURES, ...POSSESSED_TEXTURES } as const
export type TexName = keyof typeof TEX

/** Textures drawn in code (src/three/procTextures.ts). Listed here so content can name them. */
export const PROC_TEXTURES = [
  'felt', 'barcode', 'receipt', 'paper', 'code', 'keycaps', 'enamel', 'hay', 'bricks', 'card', 'chip', 'caution', 'iris',
  'tiles', 'sad', 'wood', 'checkbox', 'creditCard', 'cassette', 'vinyl', 'tarot', 'giftWrap', 'speaker',
] as const
export type ProcName = (typeof PROC_TEXTURES)[number]
export type TexRef = TexName | `proc:${ProcName}`

export const SHAPES = [
  // the originals
  'dice', 'teapot', 'crystal', 'cd', 'floppy', 'coin', 'knot', 'gem', 'donut', 'star', 'octa',
  // Daniel himself
  'photoCube', 'head', 'portrait',
  // stuff
  'car', 'trophy', 'gift', 'coinStack', 'cash', 'creditCard', 'receipt', 'barcode', 'playingCard', 'pokerChip',
  'clipboard', 'checkbox', 'pencil', 'book', 'quill', 'envelope', 'cone', 'hardHat', 'bricks', 'magnifier', 'shield',
  'virus', 'laptop', 'monitor', 'keyboard', 'mouse', 'headset', 'mousepad', 'joystick', 'cassette', 'vinyl', 'note',
  'tarot', 'eye', 'candle', 'moon', 'palette', 'voxelHeart', 'door', 'suitcase', 'sadFace', 'mug', 'teaBag', 'sugarCube',
  'horseshoe', 'carrot', 'hayBale', 'tooth', 'toothbrush', 'dentures', 'mouthwash', 'skull', 'normSlab', 'redX',
  'warning', 'numberStack', 'arrows', 'heart', 'cloud', 'globe',
  // legendaries
  'beef', 'goose', 'planet',
  // POPNUKE, the pop-up blocker
  'nukeLogo', 'softwareBox', 'popupPane',
  // chunky voxel letters (uses `text`)
  'text',
] as const
export type ShapeId = (typeof SHAPES)[number]

export type WorldId = 'mystic' | 'neon' | 'glitch' | 'meadow' | 'painted' | 'space' | 'cult' | 'flesh'
export type Rarity = 'common' | 'rare' | 'legendary'
export type ObjSize = 's' | 'm' | 'l'

/** One 3D object on a page. Its personality is felt, never shown. */
export type ObjSpec = {
  id: string
  name: string
  lore: string
  /** "Made of" line in the info window. */
  madeOf: string
  shape: ShapeId
  tex?: TexRef
  /** Voxel text for shape 'text'. */
  text?: string
  /** Which casual photo (photoCube/portrait start) or cut-out (head) to use. */
  photo?: number
  personality: Personality
  /** Overrides the personality's usual click reaction ('secret' = a hidden doorway to a random page). */
  reaction?: Reaction
  size: ObjSize
  /** Anchors sit in the margins and scroll with the page; drifters roam the screen behind the content. */
  role: 'anchor' | 'drifter'
  /** Anchors: position as % of the page. */
  spot?: { top: string; left: string }
  rarity: Rarity
  /** 'night': only turns up between 10pm and 5am, visitor's own clock. */
  when?: 'night'
  /** One of the Object Dex's specimens (the only objects it catalogues), and the fragment it carries once caught. */
  specimen?: { glyph?: string; digit?: string }
}

export type PageScene = { world?: WorldId; mood?: PageMood; objects: ObjSpec[] }

export const SIZE_PX: Record<ObjSize, number> = { s: 96, m: 168, l: 300 }
