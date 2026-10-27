import { assets, kawaii, type AssetKey, type Slot } from './assets'

export type Shrine = {
  slug: string
  title: string
  tile: string
  cursor: string
  textColor: string
  altar: string
  intro: string
  gifs: (AssetKey | Slot)[]
  facts: string[]
  /** Daniel's own photo, framed on the altar. */
  photo?: Slot
}

export const shrines: Shrine[] = [
  // One per hobby (daniel.hobbies[].shrine)
  {
    slug: 'chiikawa',
    title: '♡ THE CHIIKAWA SHRINE ♡',
    tile: 'tile-hearts',
    cursor: '🧸',
    textColor: 'text-pink-900',
    altar: '🧸',
    intro: 'Chiikawa is small. Chiikawa is cute. Chiikawa is trying its best, and so am I. I watch every episode and I buy the merch. This is the merch.',
    gifs: [kawaii.blushBun, kawaii.bouquetCat, kawaii.angelBaby, kawaii.heartRow, kawaii.cheerBlob],
    facts: [
      'Shelf space remaining: 0.',
      'An episode is about a minute long. I have watched them for hours.',
      'Every plush is a limited edition. Mostly limited by my wallet.',
    ],
    photo: assets.hobbies[0],
  },
  {
    slug: 'battlestation',
    title: 'THE BATTLESTATION: WHERE THE GAMES HAPPEN',
    tile: 'tile-stars',
    cursor: '🎮',
    textColor: 'text-cyber',
    altar: '🖥️',
    intro: 'This desk is where the TOP 1 MGE WAS BORNN',
    gifs: ['surfer', 'typingPc', 'trophy'],
    facts: [
      'Hours played: yes.',
      'Matches lost to lag: all of them. Matches lost to skill: none (source: me).',
      'Touching grass: scheduled for a future patch.',
      'The plushie on the desk is my coach.',
    ],
    photo: assets.hobbies[1],
  },
  {
    slug: 'peripherals',
    title: 'PERIPHERAL MUSEUM: PLEASE DO NOT TOUCH THE MICE',
    tile: 'tile-flames',
    cursor: '🖱️',
    textColor: 'text-yellow-200',
    altar: '🖱️',
    intro: 'Keyboards. Mice. Mousepads.',
    gifs: ['printer', 'typingPc', 'newBadge'],
    facts: [
      'Mice owned: more than hands owned.',
      'I SWEAR THEYRE NOT THE SAME',
      'Soon I will tape a sensor to my hand',
      'I owe my life to aliexpress for cheap mice',
    ],
    photo: assets.hobbies[2],
  },
  {
    slug: 'segfault',
    title: 'THE SEGMENTATION FAULT SHRINE',
    tile: 'tile-terminal',
    cursor: '💀',
    textColor: 'text-lime',
    altar: '💀',
    intro: 'Here we honour the signal that visits every 42 student. Light a candle. Dereference a NULL. Feel nothing.',
    gifs: ['typingPc', 'ucBar', 'surfer'],
    facts: [
      'Core dumped: 1,337 times this semester.',
      'Valgrind says I "definitely lost" 42 bytes. I say I definitely lost my mind.',
      'The fault is not in our stars but in our pointers.',
      'If a segfault happens and no one runs gdb, did it really happen?',
    ],
  },
  {
    slug: 'norminette',
    title: '~*~ NORMINETTE ~*~ SHE WHO MUST BE OBEYED',
    tile: 'tile-checker',
    cursor: '📏',
    textColor: 'text-black',
    altar: '📏',
    intro: 'Twenty-five lines. Four parameters. Five variables. No for loops. These are the commandments.',
    gifs: ['ucSign', 'worker', 'arrow'],
    facts: [
      'Error: SPACE_REPLACE_TAB (line 1, col 1, everywhere, forever)',
      'Error: WRONG_SCOPE_COMMENT — my comments were in the wrong scope. So was I.',
      'Error: TOO_MANY_FUNCS — five per file. I had six dreams.',
    ],
  },
  {
    slug: 'push-swap',
    title: 'PUSH_SWAP: I SPENT WAY TOO FUCKING LONG ON IT',
    tile: 'tile-brick',
    cursor: '🥞',
    textColor: 'text-yellow-200',
    altar: '🥞',
    intro: 'sa sb ss pa pb ra rb rr rra rrb rrr. Say it with me. Say it until it means something.',
    gifs: ['printer', 'trophy', 'arrow'],
    facts: ['500 numbers. 5,500 moves. One man.', 'turksort is a lifestyle.', 'pb pb pb pb pb pb (this is me pushing everyone away)'],
  },
  {
    slug: 'kettle',
    title: 'THE KETTLE SHRINE (THERE IS NO REASON FOR THIS)',
    tile: 'tile-clouds',
    cursor: '☕',
    textColor: 'text-blue-900',
    altar: '🫖',
    intro: 'This kettle was found on a GeoCities friendship wall in 2009. It has been boiling ever since. We do not ask why.',
    gifs: ['kettle', 'kettle', 'kettle'],
    facts: ['The kettle is always on.', 'Steam emitted since 2009: unknown.', 'The kettle does not accept guestbook entries.'],
  },
  {
    slug: 'horses',
    title: '♞ HORSE APPRECIATION CORNER ♞',
    tile: 'tile-hearts',
    cursor: '🐴',
    textColor: 'text-purple-900',
    altar: '🐎',
    intro: 'I do not own a horse. I have rode a horse only once. This page is for the horses anyway.',
    gifs: ['horses', 'horses', 'trophy'],
    facts: ['Horses: 2 (animated).', 'Times these horses have stopped galloping: 0.', 'Neigh.'],
  },
  {
    slug: 'teeth',
    title: 'TOOTH ZONE: BRUSH YOUR TEETH',
    tile: 'tile-water',
    cursor: '🦷',
    textColor: 'text-white',
    altar: '🦷',
    intro: 'A public service announcement from Daniel: brush twice a day. That is all. Please leave.',
    gifs: ['tooth', 'tooth', 'plumber'],
    facts: ['Recommended brushing time: 2 minutes.', 'Time spent making this page: longer.', 'The tooth is wearing shoes.'],
  },
]

export const findShrine = (slug: string | undefined) => shrines.find((s) => s.slug === slug)
