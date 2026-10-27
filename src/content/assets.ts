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

// Webcore pass (GifCities; credits in public/gifs/CREDITS.md). Background tiles live in index.css instead.
export const icons = {
  kawaiiBlob: gif('ic-kawaii-blob', 50, 50, 'kawaii blob with flowers'),
  kidComputer: gif('ic-kid-computer', 107, 98, 'kid typing at a computer'),
  keyboard: gif('ic-keyboard', 100, 60, 'keyboard and mouse'),
  skull: gif('ic-skull', 102, 99, 'smoking skull'),
  siren: gif('ic-siren', 100, 157, 'flashing siren'),
  pancakes: gif('ic-pancakes', 80, 93, 'stack of pancakes'),
  teapot: gif('ic-teapot', 90, 90, 'steaming teapot'),
  rearingHorse: gif('ic-rearing-horse', 70, 100, 'rearing horse'),
  toothBuddy: gif('ic-tooth', 55, 68, 'tooth'),
  candle: gif('ic-candle', 22, 89, 'flickering candle'),
  floppy: gif('ic-floppy', 32, 32, 'floppy disk'),
  floppyGuy: gif('ic-floppy-guy', 80, 70, 'dancing floppy disk'),
  warning: gif('ic-warning', 64, 64, 'warning sign'),
  virus: gif('ic-virus', 26, 26, 'virus bug'),
  crying: gif('ic-crying', 50, 53, 'crying face'),
  question: gif('ic-question', 100, 100, 'neon question mark'),
  rocket: gif('ic-rocket', 70, 55, 'rocket'),
  flame: gif('ic-flame', 20, 20, 'little flame'),
  speaker: gif('ic-speaker', 30, 32, 'speaker'),
  cherry: gif('ic-cherry', 70, 70, 'cherries'),
  coffee: gif('ic-coffee', 54, 54, 'steaming coffee'),
  diamond: gif('ic-diamond', 60, 60, 'diamond'),
  horseRun: gif('ic-horse-run', 64, 44, 'galloping horse'),
  smiley: gif('ic-smiley', 48, 48, 'smiley'),
  moneyBag: gif('ic-money-bag', 64, 64, 'money bag'),
  online: gif('ic-online', 14, 14, 'green online light'),
} as const

/** Mouse cursors: browsers show only the first frame and want 32×32 or smaller. */
export const cursors = {
  star: gif('cur-star', 16, 21, 'star cursor'),
  pinkHeart: gif('cur-pink-heart', 30, 23, 'pink heart cursor'),
  skullSmall: gif('cur-skull-small', 17, 22, 'small skull cursor'),
  arcade: gif('cur-arcade', 28, 28, 'arcade button cursor'),
  car: gif('cur-car', 32, 32, 'car cursor'),
  starSmall: gif('cur-star-small', 12, 12, 'tiny star cursor'),
  bear: gif('cur-bear', 32, 32, 'teddy bear cursor'),
  atom: gif('cur-atom', 32, 31, 'atom cursor'),
  pencil: gif('cur-pencil', 27, 25, 'pencil cursor'),
  kawaiiBear: gif('cur-kawaii-bear', 30, 28, 'kawaii bear cursor'),
  joystick: gif('cur-joystick', 31, 26, 'joystick cursor'),
  mouse: gif('cur-mouse', 14, 19, 'computer mouse cursor'),
  skull: gif('cur-skull', 32, 32, 'skull and crossbones cursor'),
  pencilGuy: gif('cur-pencil-guy', 20, 32, 'pencil man cursor'),
  arrow: gif('cur-arrow', 32, 32, 'arrow cursor'),
  coffee: gif('cur-coffee', 29, 21, 'coffee cursor'),
  horse: gif('cur-horse', 32, 32, 'horse cursor'),
  grin: gif('cur-grin', 32, 32, 'grinning face cursor'),
  moneyBag: gif('cur-money-bag', 32, 32, 'money bag cursor'),
  fist: gif('cur-fist', 32, 32, 'fist cursor'),
  back: gif('cur-back', 32, 27, 'back arrow cursor'),
  coins: gif('cur-coins', 25, 25, 'coins cursor'),
  dice: gif('cur-dice', 30, 30, 'dice cursor'),
  pencilGreen: gif('cur-pencil-green', 32, 32, 'green pencil cursor'),
  coin: gif('cur-coin', 14, 14, 'coin cursor'),
  virus: gif('ic-virus', 26, 26, 'virus cursor'),
} as const

export const sparkles = [
  gif('sp-green', 15, 15, 'green sparkle'),
  gif('sp-cross', 23, 23, 'cross sparkle'),
  gif('sp-cyan', 22, 22, 'cyan sparkle'),
  gif('sp-twinkle', 32, 32, 'twinkle'),
  gif('sp-white', 25, 25, 'white sparkle'),
]

export const dividers = {
  rainbow: gif('hr-rainbow', 432, 14, 'rainbow bar'),
  flames: gif('hr-flames', 600, 50, 'flames bar'),
  flowers: gif('hr-flowers', 314, 50, 'flower garland'),
  beads: gif('hr-beads', 357, 12, 'bead string'),
  yellowDots: gif('hr-yellow-dots', 425, 20, 'yellow dots'),
  caution: gif('hr-caution', 574, 51, 'caution tape'),
  smileys: gif('hr-smileys', 384, 35, 'row of smileys'),
  sparkleFlowers: gif('hr-sparkle-flowers', 520, 60, 'sparkly flowers'),
  pinkDots: gif('hr-pink-dots', 382, 12, 'pink dots'),
  rainbowDots: gif('hr-rainbow-dots', 600, 23, 'rainbow dots'),
} as const

export const blinkies = {
  guestbook: gif('bl-guestbook', 150, 20, 'blinkie: Guestbook'),
  chaos: gif('bl-chaos', 150, 20, 'blinkie: Chaos, Panic, Disorder - my work here is done'),
  iBite: gif('bl-i-bite', 150, 20, 'blinkie: I bite'),
  addictedPc: gif('bl-addicted-pc', 150, 20, 'blinkie: Addicted to my PC'),
  iWillSurvive: gif('bl-i-will-survive', 150, 20, 'blinkie: I will survive'),
  ohBloodyHell: gif('bl-oh-bloody-hell', 150, 20, 'blinkie: Oh bloody hell!!'),
  trustNoOne: gif('bl-trust-no-one', 150, 20, 'blinkie: Trust no one'),
  niceToNerds: gif('bl-nice-to-nerds', 150, 20, 'blinkie: Be nice to nerds'),
  gamer: gif('bl-gamer', 150, 20, 'blinkie: Gamer!'),
  caffeine: gif('bl-caffeine', 150, 20, "blinkie: There's too much blood in my caffeine system"),
  rememberYou: gif('bl-remember-you', 150, 20, 'blinkie: I will remember you'),
  peopleStrange: gif('bl-people-strange', 150, 20, 'blinkie: People are strange'),
  metalRulz: gif('bl-metal-rulz', 150, 20, 'blinkie: Metal rulz'),
} as const

export const buttons88 = {
  click: gif('btn-click', 95, 38, 'CLICK button'),
  bestViewed: gif('btn-best-viewed', 88, 31, 'This page is best viewed with: button'),
  email: gif('btn-email', 84, 40, 'E-MAIL button'),
} as const
