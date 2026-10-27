// Every image the site uses, by slot. Files live in public/; a missing file renders a
// "SUPPLY ME" placeholder at the slot's exact size, so nothing here needs to exist yet.

export type Slot = { src: string; w: number; h: number; label: string }

const me = (file: string, w: number, h: number, label: string): Slot => ({ src: `/me/${file}`, w, h, label })
const gif = (id: string, w: number, h: number, label: string): Slot => ({ src: `/gifs/${id}.gif`, w, h, label })

export const assets = {
  // Photos of Daniel (see plan: "Assets I need from you")
  headGrin: me('head-grind.png', 512, 512, 'head cut-out (grin), transparent'),
  headShock: me('head-shock.png', 512, 512, 'head cut-out (shocked), transparent'),
  headWink: me('head-wink.png', 512, 512, 'head cut-out (wink), transparent'),
  body: me('full-body-cutout.png', 443, 960, 'full body cut-out'),
  hero: me('hero-landscape.jpg', 960, 720, 'landscape hero photo'),
  headshot: me('headshot.jpg', 480, 640, 'normal headshot'),
  // File names are case-sensitive once deployed: match public/me/ exactly.
  misc: [
    'MISC-01.JPG', 'MISC-02.JPG', 'MISC-03.JPG', 'MISC-04.JPG', 'MISC-05.JPG', 'MISC-06.JPG', 'MISC-07.JPG',
    'MISC-08.JPG', 'MISC-09.JPG', 'MISC-10.jpg', 'MISC-11.JPG', 'MISC-12.JPG', 'MISC-13.png',
  ].map((file, i) => me(file, 400, 400, `casual photo #${i + 1}`)),
  hobbies: ['HOBBY-1.jpg', 'HOBBY-2.jpg', 'HOBBY-3.jpg'].map((file, i) => me(file, 400, 300, `hobby photo #${i + 1}`)),

  // Third-party GIFs (asset-research picks; credits in public/gifs/CREDITS.md)
  globe: gif('gc-globe-invest', 64, 64, 'spinning globe'),
  globeCage: gif('ai-globe-0053', 148, 148, 'wireframe globe'),
  email3d: gif('gc-3d-email', 100, 62, '3D email'),
  envelope: gif('gc-envelope', 65, 35, 'envelope'),
  phone: gif('gc-telephone', 163, 130, 'desk phone'),
  rotary: gif('ai-tel-0004', 125, 75, 'rotary phone'),
  printer: gif('gc-printer', 64, 64, 'printer'),
  surfer: gif('gc-computer-surf', 84, 68, 'surfing computer'),
  typingPc: gif('gc-typing-pc', 150, 150, 'typing computer'),
  ucSign: gif('gc-uc-tokyo', 323, 118, 'under construction sign'),
  ucBar: gif('gc-uc-bar', 350, 20, 'under construction bar'),
  worker: gif('gc-worker', 40, 40, 'road work sign'),
  newBadge: gif('gc-new6', 40, 30, 'NEW badge'),
  arrow: gif('gc-arrow-right', 53, 53, 'arrow button'),
  trophy: gif('ai-award-0018', 80, 80, 'trophy'),
  horses: gif('gc-2horses', 79, 54, 'horses'),
  kettle: gif('gc-kettle-boil', 40, 40, 'kettle'),
  plumber: gif('gc-plumber-hire', 139, 156, 'plumber for hire'),
  tooth: gif('gc-toothbrush', 98, 143, 'tooth'),
  forSale: gif('gc-forsale-ticker', 372, 63, 'domain for sale ticker'),
} as const

export type AssetKey = Exclude<keyof typeof assets, 'misc' | 'hobbies'>

// Kawaii clutter (asset-research category "kawaii"): GifConfetti strews these over every page,
// and a few are placed by hand.
export const kawaii = {
  angelChick: gif('kw-angel-chick', 46, 40, 'angel chick'),
  blueCat: gif('kw-blue-cat', 50, 50, 'blue cat'),
  moonCat: gif('kw-moon-cat', 67, 80, 'cat on the moon'),
  chickHop: gif('kw-chick-hop', 31, 42, 'hopping chick'),
  chicksRow: gif('kw-chicks-row', 54, 30, 'row of chicks'),
  hammockKitten: gif('kw-hammock-kitten', 199, 164, 'kitten in a hammock'),
  cheerBlob: gif('kw-cheer-blob', 55, 43, 'cheerleader blob'),
  hamster: gif('kw-hamster', 32, 32, 'hamster'),
  bearHeart: gif('kw-bear-heart', 168, 102, 'bear with a heart'),
  pinkSparkles: gif('kw-pink-sparkles', 64, 64, 'pink sparkles'),
  pastelSparkles: gif('kw-pastel-sparkles', 77, 97, 'pastel sparkles'),
  candies: gif('kw-candies', 47, 24, 'candies'),
  smileHeart: gif('kw-smile-heart', 63, 52, 'smiling heart'),
  heartRow: gif('kw-heart-row', 79, 16, 'row of hearts'),
  heartFloat: gif('kw-heart-float', 200, 100, 'floating hearts'),
  heartRain: gif('kw-heart-rain', 89, 144, 'falling hearts'),
  twinkleStar: gif('kw-twinkle-star', 41, 41, 'twinkling star'),
  strawberry: gif('kw-strawberry', 35, 42, 'strawberry'),
  balloonBear: gif('kw-balloon-bear', 120, 129, 'bear on balloons'),
  poolBear: gif('kw-pool-bear', 86, 88, 'bear in a paddling pool'),
  cupcake: gif('kw-cupcake', 29, 37, 'cupcake'),
  duckling: gif('kw-duckling', 75, 75, 'duckling'),
  shiba: gif('kw-shiba', 64, 70, 'shiba puppy'),
  pug: gif('kw-pug', 63, 70, 'pug'),
  fairy: gif('kw-fairy', 100, 75, 'fairy'),
  mochiStars: gif('kw-mochi-stars', 125, 70, 'mochi under stars'),
  angelBaby: gif('kw-angel-baby', 45, 48, 'angel baby'),
  butterflies: gif('kw-butterflies', 30, 27, 'butterfly'),
  pinkButterfly: gif('kw-pink-butterfly', 32, 32, 'pink butterfly'),
  bouquetCat: gif('kw-bouquet-cat', 44, 40, 'cat with a bouquet'),
  bunDiary: gif('kw-bun-diary', 91, 62, 'bun reading a diary'),
  bunTv: gif('kw-bun-tv', 99, 68, 'bun with a TV'),
  bunMail: gif('kw-bun-mail', 106, 69, 'bun posting a letter'),
  blushBun: gif('kw-blush-bun', 29, 38, 'blushing bun'),
  bluebird: gif('kw-bluebird', 46, 56, 'bluebird with a letter'),
} as const
