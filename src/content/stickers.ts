import { assets, icons, kawaii, type Slot } from './assets'

/**
 * The sticker hunt. Each sticker hides on one page; `spot` positions it inside that page's <main>
 * (percentages of the page, so it lands in the same place at any width). Keep them small and a bit sneaky.
 */
export type Sticker = { id: string; name: string; slot: Slot; page: string; hint: string; spot: { top: string; left: string } }

export const stickers: Sticker[] = [
  { id: 'shiba', name: 'Shiba Pup', slot: kawaii.shiba, page: '/', hint: 'Somewhere on the front page, just past the coding stuff.', spot: { top: '31%', left: '2%' } },
  { id: 'cupcake', name: 'Cupcake', slot: kawaii.cupcake, page: '/dealership', hint: 'Hiding among the car deals.', spot: { top: '62%', left: '94%' } },
  { id: 'bouquet-cat', name: 'Bouquet Cat', slot: kawaii.bouquetCat, page: '/shrine/chiikawa', hint: 'Pay your respects at the cutest shrine.', spot: { top: '78%', left: '4%' } },
  { id: 'teapot', name: 'Teapot', slot: icons.teapot, page: '/shrine/kettle', hint: 'Where else would a teapot be?', spot: { top: '55%', left: '90%' } },
  { id: 'virus', name: 'Lil Virus', slot: icons.virus, page: '/shrine/segfault', hint: 'Core dumped next to it.', spot: { top: '40%', left: '6%' } },
  { id: 'bluebird', name: 'Bluebird', slot: kawaii.bluebird, page: '/guestbook', hint: 'It wants to sign the guestbook too.', spot: { top: '20%', left: '92%' } },
  { id: 'hamster', name: 'Hamster', slot: kawaii.hamster, page: '/under-construction', hint: 'Wearing a tiny hard hat (it isn\'t).', spot: { top: '70%', left: '8%' } },
  { id: 'cherry', name: 'Jackpot Cherry', slot: icons.cherry, page: '/casino', hint: 'Fell out of a slot machine.', spot: { top: '85%', left: '88%' } },
  { id: 'strawberry', name: 'Strawberry', slot: kawaii.strawberry, page: '/survey', hint: 'Question 4 is about fruit. Probably.', spot: { top: '12%', left: '4%' } },
  { id: 'joystick-blob', name: 'Cheer Blob', slot: kawaii.cheerBlob, page: '/arcade', hint: 'Cheering on the high scores.', spot: { top: '88%', left: '3%' } },
  { id: 'floppy', name: 'Floppy', slot: icons.floppy, page: '/desktop', hint: 'Someone left a disk on the desktop.', spot: { top: '72%', left: '80%' } },
  { id: 'grin', name: 'Shocked Daniel', slot: assets.headShock, page: '/oracle', hint: 'The kettle foresaw this one.', spot: { top: '18%', left: '88%' } },
]

export const stickerFor = (pathname: string) => stickers.find((s) => s.page === pathname)
