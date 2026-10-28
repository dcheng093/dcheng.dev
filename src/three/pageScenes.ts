// Which pages get 3D, and what. Plain data (no three.js import) so it can live in the main bundle;
// the 3D code itself only downloads on pages listed here.

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
  palazzo: '/me/BUILD001.png',
  warehouse: '/me/BUILD027.png',
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

export type ShapeId = 'dice' | 'teapot' | 'crystal' | 'cd' | 'floppy' | 'coin' | 'knot' | 'gem' | 'donut' | 'star' | 'octa'
export type WorldId = 'mystic' | 'neon' | 'glitch'

/** A spinning object, positioned inside the page like the hidden stickers (percent of the page). */
export type SpinnerSpec = { shape: ShapeId; texture?: TextureId; top: string; left: string; size?: number }

export type PageScene = { world?: WorldId; spinners: SpinnerSpec[] }

/** Full TextureTown worlds on three pages only (so it stays special); spinners where they fit. Never on Home. */
export const PAGE_3D: Record<string, PageScene> = {
  '/oracle': { world: 'mystic', spinners: [{ shape: 'crystal', texture: 'blobs', top: '6%', left: '8%', size: 120 }] },
  '/arcade': {
    world: 'neon',
    spinners: [
      { shape: 'coin', top: '4%', left: '6%' },
      { shape: 'gem', texture: 'triangles', top: '62%', left: '90%' },
    ],
  },
  '/shrine/segfault': { world: 'glitch', spinners: [{ shape: 'knot', texture: 'streaks', top: '8%', left: '88%', size: 130 }] },
  '/casino': {
    spinners: [
      { shape: 'dice', top: '10%', left: '6%' },
      { shape: 'dice', top: '46%', left: '91%', size: 90 },
    ],
  },
  '/shrine/kettle': { spinners: [{ shape: 'teapot', texture: 'marble', top: '14%', left: '88%', size: 130 }] },
  '/radio': { spinners: [{ shape: 'cd', top: '3%', left: '86%', size: 120 }] },
  '/desktop': { spinners: [{ shape: 'floppy', top: '6%', left: '93%', size: 96 }] },
  '/dealership': { spinners: [{ shape: 'gem', texture: 'lava', top: '30%', left: '3%', size: 90 }] },
  '/stickers': { spinners: [{ shape: 'star', texture: 'blobs', top: '4%', left: '90%', size: 110 }] },
  '/under-construction': { spinners: [{ shape: 'octa', texture: 'steel', top: '20%', left: '88%' }] },
  '/guestbook': { spinners: [{ shape: 'donut', texture: 'graph', top: '10%', left: '4%' }] },
  '/scan': { spinners: [{ shape: 'knot', texture: 'binary', top: '70%', left: '90%', size: 100 }] },
}

export const sceneFor = (pathname: string): PageScene | undefined => PAGE_3D[pathname.toLowerCase().replace(/\/+$/, '') || '/']
