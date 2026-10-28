import type { ObjSize, ObjSpec, PageScene, ShapeId, TexRef } from '../three/pageScenes'
import type { Personality, Reaction } from '../lib/personality'

// Every 3D object on the site. Names and lore show in the info window when clicked; personalities never
// show anywhere, you only feel them. Daniel's voice; edit freely. Anchors sit in the page margins,
// drifters roam the screen behind the content (phones only get the drifters).

type Opts = { tex?: TexRef; text?: string; photo?: number; reaction?: Reaction; spot?: [string, string]; rarity?: ObjSpec['rarity'] }

function obj(id: string, name: string, shape: ShapeId, personality: Personality, size: ObjSize, madeOf: string, lore: string, o: Opts = {}): ObjSpec {
  return {
    id,
    name,
    lore,
    madeOf,
    shape,
    tex: o.tex,
    text: o.text,
    photo: o.photo,
    personality,
    reaction: o.reaction,
    size,
    role: o.spot ? 'anchor' : 'drifter',
    spot: o.spot ? { top: o.spot[0], left: o.spot[1] } : undefined,
    rarity: o.rarity ?? 'common',
  }
}

// Margin spots, as [top, left] percentages of the page.
const L = (top: number): [string, string] => [`${top}%`, '6%']
const R = (top: number): [string, string] => [`${top}%`, '94%']
// For full-width layouts (the dealership, the desktop) with only a thin strip of margin.
const LL = (top: number): [string, string] => [`${top}%`, '3.6%']
const RR = (top: number): [string, string] => [`${top}%`, '96.4%']

export const PAGE_3D: Record<string, PageScene> = {
  '/dealership': {
    objects: [
      obj('daniel-mobile', 'The Daniel-Mobile', 'car', 'showoff', 's', 'caution tape, optimism', 'Comes free with every lease. Has never been driven. Has been pushed.', { spot: RR(30) }),
      obj('salesman-portrait', 'Salesman of the Month', 'portrait', 'watcher', 's', 'gold leaf, photo #6', 'Every month. Every single month. Nobody else works here.', { photo: 5, spot: LL(18) }),
      obj('delivery-globe', 'Worldwide Delivery Globe', 'globe', 'lazy', 's', 'the whole Earth, a world map stand', 'We deliver anywhere on this globe. He walks. It takes a while.', { spot: LL(62) }),
      obj('sale-sign', 'SALE', 'text', 'excitable', 'm', 'solid gold pixels', 'The sale ends in 00:30. The sale has always ended in 00:30.', { text: 'SALE', tex: 'goldMetal' }),
      obj('deal-gem', 'Diamond Deal', 'gem', 'shy', 's', 'lava lamps', 'A real diamond (lava lamp). Scared of commitment, like every customer.', { tex: 'lava' }),
    ],
  },
  '/guestbook': {
    objects: [
      obj('open-book', 'The Big Book of Visitors', 'book', 'lazy', 'm', 'lined paper, red leather', 'Every name ever signed is in here. It is mostly Grandma.', { spot: L(22) }),
      obj('quill', 'Quill of Signing', 'quill', 'nervous', 's', 'one (1) feather', 'Signs things by itself when nobody is looking. Has forged several guestbook entries.', { spot: R(35) }),
      obj('envelope', 'Unopened Letter', 'envelope', 'curious', 's', 'paper, a heart-shaped seal', 'It says "do not open". It has been opened 1,337 times.', { spot: R(70) }),
      obj('guest-cube', 'Daniel Photo Cube', 'photoCube', 'showoff', 'm', 'six photos of Daniel', 'Six Daniels, one cube, zero personal space.', { photo: 0 }),
    ],
  },
  '/under-construction': {
    objects: [
      obj('traffic-cone', 'Supervisor Cone', 'cone', 'watcher', 'm', 'orange plastic, authority', 'In charge of the site. Has done no work. Will be promoted.', { spot: L(30) }),
      obj('hard-hat', 'Safety Hat', 'hardHat', 'nervous', 's', 'yellow plastic', 'Mandatory on site. Nobody on site wears it. It is upset about this.', { spot: R(25) }),
      obj('bricks', 'Load-Bearing Bricks', 'bricks', 'lazy', 'm', 'bricks (drawn by hand)', 'Holding the entire website up. Do not click these. (You can click these.)', { spot: R(68) }),
      obj('foreman', 'Foreman Daniel', 'head', 'dramatic', 'm', 'Daniel, cut out, no hard hat', 'In charge of building the site. Refuses to wear the hat. See above.', { photo: 1 }),
      obj('wip-sign', 'WIP', 'text', 'shy', 'm', 'caution-stripe pixels', 'Work In Progress since 1999. Progress: 4%.', { text: 'WIP', tex: 'proc:caution' }),
    ],
  },
  '/you-won': {
    objects: [
      obj('trophy', 'The Prize Trophy', 'trophy', 'showoff', 'l', 'brushed gold', 'You won this. You cannot have it. It is very shiny though.', { spot: L(26) }),
      obj('gift', 'Mystery Prize Box', 'gift', 'excitable', 'm', 'gift wrap, hope', 'Contains your prize. The prize is this box.', { spot: R(40) }),
      obj('coin-stack', 'Your Winnings', 'coinStack', 'nervous', 's', 'gold coins (chocolate)', '£1,000,000 in coins. Each coin is worth £0.01. There are six.', { spot: R(78) }),
      obj('winner-head', 'Excited Daniel', 'head', 'curious', 'm', 'Daniel, cut out', 'He is so happy for you. He has no idea what you won either.', { photo: 1 }),
      obj('winner-text', 'WINNER', 'text', 'dramatic', 'm', 'gold pixels', 'WINNER!!! (terms apply) (the terms are that you did not win)', { text: 'WINNER', tex: 'goldMetal' }),
    ],
  },
  '/checkout': {
    objects: [
      obj('credit-card', "Daniel's Credit Card", 'creditCard', 'shy', 's', 'plastic, debt', 'Card number 4242 4242 4242 4242. Expired in 1999. Still tries.', { spot: L(30) }),
      obj('receipt', 'The Receipt', 'receipt', 'lazy', 'm', 'thermal paper', 'TOTAL £123. Includes a £42 fee for having a receipt.', { spot: R(28) }),
      obj('barcode', 'Mystery Barcode', 'barcode', 'watcher', 's', 'stripes', 'Scans as "DANIEL". Every product here scans as "DANIEL".', { spot: R(66) }),
      obj('checkout-portrait', 'Cashier of the Year', 'portrait', 'curious', 'm', 'gold frame, photo #4', 'He will be serving you today. He served you yesterday. He is always serving you.', { photo: 3 }),
    ],
  },
  '/scan': {
    objects: [
      obj('virus', 'Trojan.Daniel.exe', 'virus', 'curious', 'm', 'pure plasma', 'It is not a virus. It is a feature with feelings.', { spot: L(24) }),
      obj('patient-zero', 'Patient Zero', 'head', 'nervous', 'm', 'Daniel, cut out, infected', 'The first Daniel to catch Trojan.Daniel.exe. He is fine. He is Daniel.', { photo: 1, spot: R(30) }),
      obj('magnifier', 'Deep Scan Lens', 'magnifier', 'watcher', 's', 'glass, wood', 'Found 1,337 problems before you clicked. Is looking at you now.', { spot: R(72) }),
      obj('binary-knot', 'Corrupted Data', 'knot', 'nervous', 's', 'binary', '01010100 01001111 01010000 00100000 00110001 00100000 01001101 01000111 01000101. It is trying to tell you something.', { tex: 'binary' }),
      obj('error-text', 'ERROR', 'text', 'excitable', 'm', 'red-hot pixels', 'An error has occurred. The error is that you are having fun.', { text: 'ERROR', tex: 'streaks' }),
    ],
  },
  '/casino': {
    objects: [
      obj('dice-a', 'Lucky Die', 'dice', 'excitable', 'm', 'red resin, pips', 'Always rolls a 7. This is not possible on a die. It does it anyway.', { spot: L(14) }),
      obj('dice-b', 'Unlucky Die', 'dice', 'shy', 's', 'red resin, pips', "The lucky die's twin. Has never once been lucky.", { spot: R(46) }),
      obj('high-roller', 'The High Roller', 'portrait', 'showoff', 'm', 'gold frame, photo #9', 'Sunglasses indoors. Bets everything on red. The wheel is all green.', { photo: 8, spot: R(80) }),
      obj('ace', 'Ace of Hearts', 'playingCard', 'curious', 'm', 'card stock', 'Up his sleeve. Up every sleeve. There are 14 aces in this deck.'),
      obj('pounds', '£££', 'text', 'dramatic', 'm', 'gold-plated pixels', 'Money! (Not real) (Not yours) (Not anyone\'s)', { text: '£££', tex: 'goldMetal' }),
    ],
  },
  '/survey': {
    objects: [
      obj('clipboard', 'The Survey Clipboard', 'clipboard', 'watcher', 'm', 'wood, lined paper', 'Question 1 of 47. All 47 questions are "Do you like Daniel?"', { spot: L(26) }),
      obj('checkbox', 'Pre-Ticked Box', 'checkbox', 'lazy', 's', 'one green tick', 'You agreed to this. You agreed to everything. It was already ticked.', { spot: R(30) }),
      obj('pencil', 'No. 2 Pencil', 'pencil', 'nervous', 's', 'wood, graphite, eraser', 'Has never been sharpened. Writes anyway, out of spite.', { spot: R(70) }),
      obj('survey-head', 'Surveyed Daniel', 'head', 'curious', 'm', 'Daniel, cut out', 'He is the survey. He has questions. Mostly about you.', { photo: 0 }),
      obj('question', '?', 'text', 'shy', 's', 'confused pixels', 'The only honest question in the survey.', { text: '?', tex: 'tieDye' }),
    ],
  },
  '/work-from-home': {
    objects: [
      obj('cash-stack', 'Passive Income', 'cash', 'lazy', 'm', 'dollar bills (a GIF)', 'Made from the comfort of a bedroom. Smells faintly of kettle.', { spot: L(30) }),
      obj('laptop', 'The Money Laptop', 'laptop', 'watcher', 'm', 'RGB keys, kaleidoscope screen', 'Open it and earn £5,000. Close it and also earn £5,000. Results not typical.', { spot: R(34) }),
      obj('wfh-coin', 'Daniel Coin', 'coin', 'excitable', 's', 'gold', 'A cryptocurrency. Worth one (1) Daniel. Daniels are not worth much.', { spot: R(74) }),
      obj('wfh-cube', 'Success Cube', 'photoCube', 'showoff', 'm', 'six photos of a successful man', 'Six photos of Daniel at his desk, being successful (sitting).', { photo: 6 }),
      obj('five-k', '£5000', 'text', 'dramatic', 'm', 'gold pixels', 'A week! From my bedroom! And so can YOU (you cannot).', { text: '£5000', tex: 'goldMetal' }),
    ],
  },
  '/arcade': {
    world: 'neon',
    objects: [
      obj('arcade-coin', 'Insert Coin', 'coin', 'excitable', 'm', 'gold', 'The coin the arcade has been waiting for. Free play is on, so it is useless.', { spot: L(8) }),
      obj('arcade-gem', 'Bonus Gem', 'gem', 'shy', 's', 'rainbow triangles', '+1000 points. Hard to catch. Doesn\'t want to be points.', { tex: 'triangles', spot: R(60) }),
      obj('joystick', 'Ol\' Reliable', 'joystick', 'showoff', 'm', 'plastic, a red ball', 'Has only ever pushed left. Has won every game by pushing left.', { spot: R(22) }),
      obj('one-up', '1UP', 'text', 'curious', 's', 'gold pixels', 'An extra life. Daniel has used all of his.', { text: '1UP', tex: 'goldMetal' }),
      obj('arcade-head', 'Player One', 'head', 'dramatic', 'm', 'Daniel, cut out', 'Grandmaster at Aimlabs. Cannot aim at this.', { photo: 2 }),
    ],
  },
  '/desktop': {
    objects: [
      obj('desk-floppy', 'DANIEL.EXE (Floppy)', 'floppy', 'nervous', 's', 'plastic, magnetism', '1.44MB. Contains the entire website, uncompressed. Somehow.', { spot: RR(8) }),
      obj('crt', 'The CRT', 'monitor', 'watcher', 'm', 'beige plastic, a kaleidoscope screen', 'It hums. It has always hummed. It watches you back.', { tex: 'kaleidoscope' }),
      obj('desk-mouse', 'Two-Button Mouse', 'mouse', 'shy', 's', 'grey plastic', 'Has a ball inside. The ball is dirty. Do not ask about the ball.', { spot: LL(70) }),
      obj('desk-keyboard', 'Clacky Keyboard', 'keyboard', 'lazy', 's', 'RGB keycaps', 'Every key is RGB. Including the ones that do not work.', { spot: RR(55) }),
      obj('wallpaper', 'WALLPAPER.BMP', 'portrait', 'watcher', 's', 'gold frame, photo #2', 'The desktop wallpaper. Daniel set it himself. It is Daniel.', { photo: 1, spot: LL(30) }),
    ],
  },
  '/radio': {
    objects: [
      obj('radio-cd', "Now That's What I Call Daniel", 'cd', 'showoff', 'm', 'a real CD photo', 'Track 3 skips. Track 3 is the good one. It has always skipped.', { spot: R(4) }),
      obj('cassette', 'Daniel Mix Vol. 1', 'cassette', 'lazy', 'm', 'magnetic tape, a handwritten label', 'Recorded off the radio. You can hear the DJ talking over every song.', { spot: L(30) }),
      obj('vinyl', 'Rare Pressing', 'vinyl', 'excitable', 's', 'vinyl', 'Only one copy exists. It is scratched. That is the rare part.', { spot: R(55) }),
      obj('music-note', 'Lost Note', 'note', 'curious', 's', 'pure sound', 'Escaped from the System Default song. Will not go back.'),
      obj('dj-portrait', 'DJ Daniel', 'portrait', 'watcher', 'm', 'gold frame, photo #13', 'Live from the bedroom studio. The only DJ. The only listener.', { photo: 12, spot: L(70) }),
    ],
  },
  '/oracle': {
    world: 'mystic',
    objects: [
      obj('crystal-ball', 'The Seeing Ball', 'crystal', 'watcher', 'm', 'purple blobs, gold', 'Sees the future. The future is mostly the kettle.', { tex: 'blobs', spot: L(6) }),
      obj('tarot', 'The Kettle (Major Arcana)', 'tarot', 'dramatic', 'm', 'card, gold ink', 'Card XXII. Not in any real deck. Means "put the kettle on".', { spot: R(40) }),
      obj('eye', 'The Eye That Sees', 'eye', 'watcher', 's', 'an eye', 'It is watching. It is always watching. It thinks you look nice.', { spot: R(12) }),
      obj('candle', 'Ritual Candle', 'candle', 'nervous', 's', 'wax, a flame', 'Has been burning since the site launched. Has not got any shorter.'),
      obj('vision', 'A Vision of Daniel', 'head', 'lazy', 'm', 'Daniel, cut out, prophesied', 'The crystal ball showed this face. Then it showed it again. It only shows this face.', { photo: 2, spot: L(70) }),
    ],
  },
  '/blinkie-maker': {
    objects: [
      obj('palette', "Artist's Palette", 'palette', 'showoff', 'm', 'wood, five paints', 'Used to paint every blinkie on the site. All five colours. Only those five.', { spot: L(30) }),
      obj('voxel-heart', 'Pixel Heart', 'voxelHeart', 'excitable', 'm', 'tie-dye voxels', '42 cubes of love. Stays square no matter how you feel.', { spot: R(30) }),
      obj('blink-pencil', 'Pixel Pencil', 'pencil', 'nervous', 's', 'wood, one pixel of graphite', 'Draws one pixel at a time. Has drawn 1,048,576 of them.', { spot: R(72) }),
      obj('blink-text', 'BLINK', 'text', 'shy', 's', 'pink glitter pixels', 'Blinks at 2.5 times a second. Slower than you\'d think. Safe for your eyes.', { text: 'BLINK', tex: 'tieDye' }),
      obj('blinkie-model', 'The Blinkie Model', 'photoCube', 'showoff', 's', 'six photos of Daniel', 'Every blinkie on this site was modelled on him. Six angles, all his good side.', { photo: 9, spot: L(70) }),
    ],
  },
  '/popnuke': {
    objects: [
      obj('popnuke-disk', 'POPNUKE Disk 1 of 1', 'floppy', 'nervous', 's', 'plastic, 1.44 MB of pure nuke', 'The whole product, on one floppy. Do not put it near a magnet. Or the kettle.', { spot: L(30) }),
      obj('installer-cd', 'POPNUKE Installer CD', 'cd', 'showoff', 'm', 'a real CD photo', 'Autorun.inf launches the installer, then a second installer, then a toolbar.', { spot: R(40) }),
      obj('nuke-shield', 'The Nuke Shield', 'shield', 'watcher', 'm', 'purple metal, radiation', 'Stands between you and the pop-ups. Has never once blinked.'),
      obj('ceo-portrait', 'Daniel Cheng, CEO', 'portrait', 'lazy', 's', 'gold frame, photo #3', 'Founder, CEO, CFO, CTO and receptionist of Daniel Cheng Software Ltd.', { photo: 2, spot: R(75) }),
    ],
  },
  '/settings': {
    objects: [
      obj('settings-ini', 'SETTINGS.INI', 'floppy', 'nervous', 's', 'plastic, 2KB of opinions', 'Every setting you have ever changed, saved on a floppy that nobody will ever open again.', { spot: L(30) }),
      obj('control-keyboard', 'The Control Keyboard', 'keyboard', 'showoff', 'm', 'beige plastic, one sticky key', 'Ctrl, Alt and Delete all at once is not a setting. Daniel checked.', { spot: R(35) }),
      obj('selfie-cube', 'Selfie Cube', 'photoCube', 'curious', 's', 'six close-ups of Daniel', 'Six angles, all of them too close. This is what 100% Daniel Density looks like.', { photo: 13, spot: R(75) }),
      obj('runaway-mouse', 'The Mouse That Got Away', 'mouse', 'shy', 's', 'grey plastic, a ball inside', 'Changed its own pointer speed to MAXIMUM and left.'),
    ],
  },
  '/stickers': {
    objects: [
      obj('sticker-star', 'Gold Star', 'star', 'showoff', 'm', 'purple blobs', 'You get one of these for finding all the stickers. You do not get this one.', { tex: 'blobs', spot: R(4) }),
      obj('sticker-heart', 'Puffy Heart', 'heart', 'curious', 'm', 'tie-dye', 'A puffy sticker. Do not peel. It will not come off cleanly.', { tex: 'tieDyeCircle', spot: L(40) }),
      obj('sticker-cloud', 'Scratch-and-Sniff Cloud', 'cloud', 'lazy', 'm', 'sky', 'Smells like rain. Actually smells like kettle.'),
      obj('sticker-cube', 'Sticker Photo Cube', 'photoCube', 'shy', 's', 'six photos of Daniel', 'Collect all six sides!', { photo: 7, spot: R(75) }),
    ],
  },
  '/leave': {
    mood: 'sad',
    objects: [
      obj('door', 'The Exit Door', 'door', 'dramatic', 'm', 'wood', 'You could walk through it. Please don\'t.', { spot: L(30) }),
      obj('suitcase', 'Packed Suitcase', 'suitcase', 'lazy', 'm', 'leather, regret', 'Already packed. It doesn\'t want to go either.', { spot: R(30) }),
      obj('sad-face', ':(', 'sadFace', 'shy', 'm', 'a single tear', 'This is how the website feels about you leaving.'),
      obj('bye', 'BYE', 'text', 'nervous', 's', 'wobbly pixels', 'Do not say it back.', { text: 'BYE', tex: 'swirls' }),
      obj('watching-you-go', 'Daniel, Watching You Go', 'head', 'watcher', 'm', 'Daniel, cut out, devastated', 'He is not crying. It is the kettle steam.', { photo: 1, spot: R(70) }),
    ],
  },
  bsod: {
    mood: 'crashed',
    objects: [
      obj('crashed-crt', 'Crashed Monitor', 'monitor', 'lazy', 'm', 'beige plastic, a fatal exception', 'It saw something it should not have. Now it shows only blue.', { spot: L(20) }),
      obj('crashed-floppy', 'Corrupted Floppy', 'floppy', 'nervous', 's', '1.44MB of nothing', 'Abort, Retry, Fail? Yes.', { spot: R(30) }),
      obj('fatal', 'FATAL', 'text', 'dramatic', 'm', 'error pixels', 'A fatal exception 0E has occurred at DANIEL:0042C0FFEE.', { text: 'FATAL', tex: 'streaks' }),
      obj('error-404', '404', 'text', 'shy', 's', 'missing pixels', 'This object could not be found. You found it anyway.', { text: '404', tex: 'swirls', reaction: 'secret' }),
      obj('crashed-daniel', 'Daniel.dmp', 'photoCube', 'lazy', 's', 'six photos, one memory dump', 'What was in memory when it crashed. All of it was Daniel.', { photo: 11, spot: L(70) }),
    ],
  },
  '/shrine/chiikawa': {
    world: 'painted',
    objects: [
      obj('chii-heart', 'Big Soft Heart', 'heart', 'curious', 'l', 'tie-dye', 'Chiikawa is trying its best. So is this heart.', { tex: 'tieDyeSpiral', spot: L(14) }),
      obj('chii-cloud', 'Nap Cloud', 'cloud', 'lazy', 'm', 'a sky', 'For napping on between episodes. Every episode is one minute.'),
      obj('chii-cube', 'Merch Cube', 'photoCube', 'shy', 's', 'six photos of Daniel', 'Daniel, surrounded by plushies, every side.', { photo: 2, spot: R(40) }),
      obj('chii-star', 'Limited Edition Star', 'star', 'excitable', 's', 'tie-dye', 'Limited edition. Limited by Daniel\'s wallet.', { tex: 'tieDye', spot: R(75) }),
    ],
  },
  '/shrine/battlestation': {
    world: 'space',
    objects: [
      obj('bs-monitor', 'Monitor #3', 'monitor', 'watcher', 'm', 'kaleidoscope, plastic', 'One monitor is for the game. One for the wiki. This one is for vibes.', { spot: L(12) }),
      obj('bs-keyboard', 'Endgame Keyboard', 'keyboard', 'showoff', 'm', 'bronze, RGB', 'The last keyboard he will ever buy. (He has said this 9 times.)', { tex: 'bronze', spot: R(36) }),
      obj('bs-headset', 'Gamer Headset', 'headset', 'excitable', 's', 'gold metal', 'Can hear footsteps through walls. Cannot hear his mum calling.', { tex: 'goldMetal' }),
      obj('rgb-knot', 'RGB Cable Management', 'knot', 'nervous', 's', 'kaleidoscope', 'This is what the cables behind the desk look like. Do not look.', { tex: 'kaleidoscope', spot: R(78) }),
      obj('logged-in', 'Daniel (Logged In)', 'head', 'watcher', 'm', 'Daniel, cut out, in space', 'Has been online for 300 hours. The battlestation is now in orbit.', { photo: 1 }),
    ],
  },
  '/shrine/peripherals': {
    objects: [
      obj('per-mouse', 'Mouse #27', 'mouse', 'shy', 's', 'copper', 'He has two hands and too many mice. This is mouse twenty-seven.', { spot: L(20) }),
      obj('per-keyboard', 'Keyboard With Feelings', 'keyboard', 'excitable', 'm', 'purple metal, RGB', 'Clacks louder when it is happy. It is always happy.', { tex: 'purpleMetal', spot: R(30) }),
      obj('per-headset', 'Headset (Spare)', 'headset', 'lazy', 'm', 'copper', 'The spare headset for when the main headset needs a break.', { tex: 'copper', spot: L(66) }),
      obj('per-mousepad', 'XXL Mousepad', 'mousepad', 'dramatic', 'm', 'kaleidoscope', 'Covers the entire desk. And the floor. And part of the hallway.'),
      obj('per-portrait', 'Portrait of a Peripheral Collector', 'portrait', 'watcher', 's', 'gold, photo #8', 'Taken moments after buying another mouse.', { photo: 7, spot: R(74) }),
    ],
  },
  '/shrine/segfault': {
    world: 'glitch',
    objects: [
      obj('seg-knot', 'The Core Dump', 'knot', 'nervous', 'm', 'red-grey streaks', 'Core dumped. Here it is. Nobody knows how to read it.', { tex: 'streaks', spot: R(8) }),
      obj('skull', 'Dangling Pointer', 'skull', 'watcher', 'm', 'bone', 'It points at nothing. It has always pointed at nothing.', { spot: L(16) }),
      obj('seg-virus', 'Memory Leak', 'virus', 'curious', 's', 'plasma', 'Valgrind says 42 bytes definitely lost. They are in here.'),
      obj('gdb-cube', 'Daniel in gdb', 'photoCube', 'nervous', 's', 'six photos of a man reading a backtrace', 'Six frames of the call stack. Every frame is Daniel.', { photo: 10, spot: L(62) }),
      obj('segfault-text', 'SEGFAULT', 'text', 'dramatic', 'm', 'corrupted pixels', 'Segmentation fault (core dumped). The most honest sentence in C.', { text: 'SEGFAULT', tex: 'lightning', reaction: 'secret' }),
    ],
  },
  '/shrine/norminette': {
    objects: [
      obj('norm-slab', 'The Norm Tablet', 'normSlab', 'watcher', 'm', 'stone, error messages', 'Handed down from the mountain. Every rule is "no".', { spot: L(24) }),
      obj('red-x', 'KO', 'redX', 'dramatic', 'm', 'red plastic', 'Norme: KO. The two most feared letters at 42.', { spot: R(34) }),
      obj('norm-warning', 'Line 26', 'warning', 'nervous', 's', 'yellow plastic', 'TOO_MANY_LINES. It was 26 lines. The limit is 25.', { spot: R(72) }),
      obj('norm-text', 'NORM', 'text', 'lazy', 's', 'code pixels', 'Spaces, not tabs. Tabs, not spaces. Nobody knows anymore.', { text: 'NORM', tex: 'proc:code' }),
      obj('norm-cube', 'Daniel After Norminette', 'photoCube', 'shy', 's', 'six photos of a defeated man', 'Six faces of a man who forgot a newline at end of file.', { photo: 8 }),
    ],
  },
  '/shrine/push-swap': {
    objects: [
      obj('number-stack', 'Stack A', 'numberStack', 'nervous', 'm', 'numbered blocks', '5, 2, 8, 1. Sort it in under 700 moves. He used 701.', { spot: L(26) }),
      obj('arrows', 'pa / pb', 'arrows', 'excitable', 's', 'green and red plastic', 'Push to A. Push to B. Push to A. Push to B. Forever.', { spot: R(32) }),
      obj('ps-cube', 'Debugging Cube', 'photoCube', 'shy', 's', 'six photos of a debugging man', 'Six hours of debugging, one face per side.', { photo: 4, spot: R(70) }),
      obj('pb-text', 'PB', 'text', 'showoff', 's', 'gold pixels', 'Personal best. Also push b. Mostly push b.', { text: 'PB', tex: 'goldMetal' }),
    ],
  },
  '/shrine/kettle': {
    objects: [
      obj('kettle-teapot', 'The Teapot (Not The Kettle)', 'teapot', 'lazy', 'l', 'marble', 'A teapot in the kettle shrine. A controversial choice. It knows.', { tex: 'marble', spot: R(14) }),
      obj('mug', 'Favourite Mug', 'mug', 'curious', 'm', 'ceramic, tea', 'Has not been washed since 2024. Tastes better that way (it does not).', { spot: L(30) }),
      obj('tea-bag', 'Single-Use Tea Bag', 'teaBag', 'shy', 's', 'paper, tea', 'Has been used 14 times. Still trying its best.', { spot: L(72) }),
      obj('sugar-cube', 'One Sugar', 'sugarCube', 'nervous', 's', 'sugar', 'Always one. Never two. Two would be madness.'),
      obj('kettle-enjoyer', 'Kettle Enjoyer (Portrait)', 'portrait', 'lazy', 's', 'gold frame, photo #11', 'Painted at the exact moment the kettle clicked off. Bliss.', { photo: 10, spot: R(60) }),
    ],
  },
  '/shrine/horses': {
    world: 'meadow',
    objects: [
      obj('horseshoe', 'Lucky Horseshoe', 'horseshoe', 'showoff', 'm', 'steel', 'Hangs the right way up. All the luck stays in. None has come out yet.', { spot: L(14) }),
      obj('carrot', 'The Carrot', 'carrot', 'curious', 's', 'carrot', 'Every horse wants it. Every horse is a GIF and cannot eat it.', { spot: R(30) }),
      obj('hay', 'Hay Bale', 'hayBale', 'lazy', 'm', 'hay', 'Horse snack. Also a chair.', { spot: R(70) }),
      obj('neigh', 'NEIGH', 'text', 'excitable', 'm', 'horse-coloured pixels', 'Neigh neigh. Neigh. — The Horses', { text: 'NEIGH', tex: 'proc:hay' }),
      obj('horse-whisperer', 'The Horse Whisperer', 'head', 'curious', 'm', 'Daniel, cut out', 'He speaks horse. He only knows one word. It is "neigh".', { photo: 2 }),
    ],
  },
  '/shrine/teeth': {
    objects: [
      obj('tooth', 'The Molar', 'tooth', 'watcher', 'l', 'enamel', 'Lost in 2009. Tooth fairy paid £1. Daniel is still owed interest.', { spot: L(18) }),
      obj('toothbrush', 'Electric Toothbrush (Off)', 'toothbrush', 'nervous', 's', 'plastic, bristles', 'Electric. Has never been charged. Manual mode only.', { spot: R(30) }),
      obj('dentures', 'Spare Teeth', 'dentures', 'excitable', 'm', 'gum-pink plastic, enamel', 'Just in case. You never know.', { spot: R(70) }),
      obj('mouthwash', 'Minty Mouthwash', 'mouthwash', 'shy', 's', 'mint, regret', 'Burns for 30 seconds. Recommended: 30 seconds. Daniel lasts 4.'),
      obj('big-grin', 'The Big Grin', 'head', 'excitable', 'm', 'Daniel, cut out, all teeth', 'Every tooth on this shrine, in one place, at once.', { photo: 0, spot: L(55) }),
    ],
  },
}

/** The three legendaries. They turn up rarely, glowing, and unlock their own page when clicked. */
export const LEGENDARIES: ObjSpec[] = [
  obj('beef', 'The Beef', 'beef', 'dramatic', 'l', 'prime beef, one bone', 'Nobody knows where it came from. Nobody knows why it glows. It is very good beef.', { rarity: 'legendary', tex: 'beef' }),
  obj('planet-daniel', 'Planet Daniel', 'planet', 'lazy', 'l', 'the whole Earth, one moon (Daniel)', 'Population: 1. The moon is Daniel. He orbits himself.', { rarity: 'legendary', tex: 'earth' }),
  obj('goose', 'The Goose', 'goose', 'shy', 'l', 'one goose', 'The goose has been seen. The goose sees you too. Honk.', { rarity: 'legendary' }),
]

export const legendary = (id: string | undefined) => LEGENDARIES.find((l) => l.id === id)

/** Chance a legendary turns up on any given page view. */
export const LEGENDARY_CHANCE = 0.05

/** Rolls for a legendary on a page view (never on Home, /boring or the gag pages). */
export function rollLegendary(pathname: string, rng: () => number = Math.random): ObjSpec | undefined {
  if (pathname === '/' || pathname === '/boring' || pathname === '/leave' || pathname.startsWith('/legendary')) return undefined
  if (rng() >= LEGENDARY_CHANCE) return undefined
  return LEGENDARIES[Math.floor(rng() * LEGENDARIES.length)]
}

export const sceneFor = (key: string): PageScene | undefined => PAGE_3D[key === 'bsod' ? key : key.toLowerCase().replace(/\/+$/, '') || '/']
