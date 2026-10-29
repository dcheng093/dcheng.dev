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
  ocean: '/me/OPOCEAN2.JPG',
  david: '/me/DAVID.png',
  cd: '/me/016C.png',
  xray: '/me/cc330122.jpg',
  pyramids: '/me/qcu50087.jpg',
  palazzo: '/me/BUILD001.jpg',
  warehouse: '/me/BUILD027.jpg',
  stoneWall: '/me/248__wall_stone_texture-seamless.jpg',
  stones: '/me/012C.png',
  crackedStone: '/me/044C.jpg',
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
  worldMap: '/me/013C.jpg',
  grass: '/me/073C.jpg',
  grass2: '/me/ATF_8.png',
  tieDye: '/me/089C.jpg',
  tieDyeSpiral: '/me/090C.jpg',
  tieDyeCircle: '/me/091C.jpg',
  skyClouds: '/me/BACKGR12.JPG',
  beef: '/me/BEEF.JPG',
  wispySky: '/me/CLOUD2.JPG',
  earth: '/me/EARTH_C.JPG',
  tree: '/me/FRAXINS3.png',
  galaxy: '/me/GALAXY2.JPG',
  purpleMetal: '/me/METAL7.JPG',
  painting: '/me/Painting.png',
  bronze: '/me/SC009.JPG',
  copper: '/me/SC010.JPG',
  goldMetal: '/me/SC027.JPG',
  puffySky: '/me/SKY1.png',
  goose: '/me/cc200455.jpg',
  kaleidoscope: '/me/cio60415.jpg',
  cosmic: '/me/cio60416.jpg',
  dollars: '/gifs/bg-dollar-bills.gif',
} as const

/** The congregation's pack: the world behind the sealed page (src/three/worlds.ts, `cult`). */
export const CULT_TEXTURES = {
  fractalEye: '/me/ahm60074.jpg',
  fractalEye2: '/me/ahm60030.jpg',
  vortex: '/me/ahm60003.jpg',
  darkMarble: '/me/046C.jpg',
  blackMetal: '/me/SC051.JPG',
  crt: '/me/qcu50119.jpg',
  lattice: '/me/pni50050.jpg',
  nightStars: '/me/nightskystar.gif',
} as const

/** Every image texture by name. */
export const TEX = { ...TEXTURES, ...DREAM_TEXTURES, ...MORE_TEXTURES, ...CULT_TEXTURES } as const
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

export type WorldId = 'mystic' | 'neon' | 'glitch' | 'meadow' | 'painted' | 'space' | 'cult'
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
