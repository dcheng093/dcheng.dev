import type { AssetKey } from './assets'

export type AdKind = 'daniel' | 'surreal' | 'scam' | 'classified'
export type AdFormat = 'leaderboard' | 'banner' | 'button' | 'button125' | 'square' | 'skyscraper' | 'classified' | 'popup'

/** Where an ad goes when clicked: a route, a popup id, or anywhere at all. */
export type AdTarget = `/${string}` | `popup:${string}` | 'random'

export type Ad = {
  id: string
  kind: AdKind
  formats: AdFormat[]
  headline: string
  body?: string
  price?: string
  cta: string
  to: AdTarget
  img?: AssetKey | 'head' | 'body'
  palette: string
}

// No real brands. Every claim is false. Prices are in a currency we made up called "£".
export const ads: Ad[] = [
  // --- Daniel as a product ---
  { id: 'lease-daniel', kind: 'daniel', formats: ['leaderboard', 'banner', 'popup', 'square'], headline: 'LEASE DANIEL TODAY!!!', body: '0% APR • ONLY 3 PREVIOUS OWNERS • FULL SERVICE HISTORY (MISSING)', price: '£69/mo', cta: 'GET QUOTE', to: '/dealership', img: 'head', palette: 'bg-yellow-300 text-red-600' },
  { id: 'daniel-sport', kind: 'daniel', formats: ['skyscraper', 'square'], headline: 'NEW!! DANIEL SPORT', body: '0-60 in 4 business days. Heated opinions as standard.', price: '£420/mo', cta: 'TEST DRIVE', to: '/checkout', img: 'body', palette: 'bg-red-600 text-yellow-200' },
  { id: 'daniel-piscine', kind: 'daniel', formats: ['banner', 'skyscraper', 'popup'], headline: 'DANIEL — PISCINE EDITION', body: 'Survived 4 weeks of C. Smells faintly of coffee and despair.', price: '£42/mo', cta: 'ORDER NOW', to: '/shrine/segfault', img: 'head', palette: 'bg-cyan-300 text-blue-900' },
  { id: 'daniel-refurb', kind: 'daniel', formats: ['button125', 'square'], headline: 'REFURBISHED DANIEL', body: 'Like new! (Is not new.)', price: '£9.99', cta: 'BUY', to: '/checkout', img: 'head', palette: 'bg-lime text-black' },
  { id: 'daniel-warranty', kind: 'daniel', formats: ['banner', 'popup'], headline: 'YOUR DANIEL WARRANTY IS ABOUT TO EXPIRE', body: 'Call now to extend coverage on your Daniel. This is your final notice. This is not your final notice.', cta: 'EXTEND NOW', to: '/checkout', img: 'rotary', palette: 'bg-white text-red-700' },
  { id: 'trust-me', kind: 'daniel', formats: ['skyscraper', 'button125'], headline: 'YOU CAN TRUST ME, I AM DANIEL!', cta: 'TRUST', to: '/dealership', img: 'body', palette: 'bg-hotpink text-white' },
  { id: 'daniel-card', kind: 'daniel', formats: ['button', 'popup'], headline: 'EMAIL THE WEBMASTER', body: 'Business enquiries, love letters, complaints about the kettle.', cta: 'OPEN CARD', to: 'popup:business-card', img: 'email3d', palette: 'bg-blue-800 text-white' },

  // --- Absurd surreal products ---
  { id: 'cloud-bogo', kind: 'surreal', formats: ['leaderboard', 'banner', 'square'], headline: 'BUY 1 CLOUD GET 1 FREE', body: 'Clouds sold as seen. No refunds on rain.', price: '£0.00*', cta: 'ADD TO SKY', to: 'random', img: 'globe', palette: 'bg-sky-300 text-white' },
  { id: 'preowned-thoughts', kind: 'surreal', formats: ['square', 'skyscraper', 'popup'], headline: 'CERTIFIED PRE-OWNED THOUGHTS', body: 'Gently used ideas. Some have been thought before. Most were wrong.', price: '£3.50/thought', cta: 'THINK IT', to: 'random', img: 'typingPc', palette: 'bg-purple-700 text-yellow-300' },
  { id: 'hot-socks', kind: 'surreal', formats: ['banner', 'button125', 'popup'], headline: 'HOT SINGLE SOCKS IN YOUR AREA', body: 'They lost their partner in the wash. They are ready to mingle.', cta: 'MEET SOCKS', to: '/guestbook', img: 'horses', palette: 'bg-pink-400 text-black' },
  { id: 'kettle-subscription', kind: 'surreal', formats: ['skyscraper', 'button125', 'square'], headline: 'KETTLE+', body: 'Stream unlimited boiling. Cancel anytime (you cannot cancel).', price: '£12.99/mo', cta: 'BOIL', to: '/shrine/kettle', img: 'kettle', palette: 'bg-orange-400 text-black' },
  { id: 'horse-insurance', kind: 'surreal', formats: ['banner', 'square'], headline: 'HORSE INSURANCE FOR PEOPLE WITHOUT HORSES', body: 'Because you never know.', cta: 'INSURE', to: '/shrine/horses', img: 'horses', palette: 'bg-green-600 text-white' },
  { id: 'teeth-bulk', kind: 'surreal', formats: ['skyscraper', 'popup'], headline: 'TEETH: NOW SOLD IN BULK', body: 'Why have 32 when you could have 3,200?', price: '£1/tooth', cta: 'SMILE', to: '/shrine/teeth', img: 'tooth', palette: 'bg-white text-cyan-700' },
  { id: 'used-wifi', kind: 'surreal', formats: ['button', 'button125'], headline: 'USED WI-FI', body: '1 bar. Barely.', cta: 'CONNECT', to: 'random', img: 'surfer', palette: 'bg-black text-lime' },
  { id: 'gravity', kind: 'surreal', formats: ['leaderboard', 'square'], headline: 'GRAVITY IS ON SALE (WHILE IT LASTS)', body: 'Everything must go down.', cta: 'FALL', to: 'random', img: 'arrow', palette: 'bg-gray-900 text-red-400' },
  { id: 'plumber-feelings', kind: 'surreal', formats: ['skyscraper', 'square', 'popup'], headline: 'PLUMBER FOR HIRE (EMOTIONAL)', body: 'I fix leaks. In your heart.', price: 'call for price', cta: 'UNBLOCK', to: '/guestbook', img: 'plumber', palette: 'bg-blue-300 text-blue-950' },
  { id: 'domain', kind: 'surreal', formats: ['leaderboard', 'banner'], headline: 'THIS DOMAIN FOR SALE', body: 'It is not. Please stop asking.', cta: 'MAKE OFFER', to: '/leave', img: 'forSale', palette: 'bg-black text-lime' },

  // --- Fake early-web scams ---
  { id: 'millionth', kind: 'scam', formats: ['leaderboard', 'banner', 'popup', 'square'], headline: '!!! YOU ARE THE 1,000,000th VISITOR !!!', body: 'CLICK HERE TO CLAIM YOUR PRIZE. THIS IS NOT A TRICK.', cta: 'CLAIM PRIZE', to: '/you-won', img: 'trophy', palette: 'bg-yellow-300 text-red-600' },
  { id: 'more-ram', kind: 'scam', formats: ['banner', 'button125', 'popup', 'square'], headline: 'DOWNLOAD MORE RAM', body: 'Your computer is running at 3% speed. Click to fix instantly.', cta: 'DOWNLOAD', to: '/under-construction', img: 'typingPc', palette: 'bg-green-500 text-white' },
  { id: 'viruses', kind: 'scam', formats: ['popup', 'banner', 'skyscraper'], headline: '⚠ YOUR PC HAS 69 VIRUSES ⚠', body: 'Scan detected: segfault.exe, norminette.dll, kettle.sys', cta: 'REMOVE NOW', to: '/shrine/segfault', img: 'printer', palette: 'bg-red-600 text-white' },
  { id: 'punch-monkey', kind: 'scam', formats: ['leaderboard', 'banner'], headline: 'PUNCH THE DANIEL & WIN £20!!!', body: 'Hit him 3 times to win', cta: 'PUNCH', to: '/you-won', img: 'head', palette: 'bg-orange-500 text-yellow-100' },
  { id: 'one-trick', kind: 'scam', formats: ['square', 'skyscraper'], headline: 'LOCAL MAN DISCOVERS ONE WEIRD TRICK', body: 'Compilers HATE him.', cta: 'LEARN TRICK', to: '/shrine/norminette', img: 'head', palette: 'bg-white text-black' },
  { id: 'prince', kind: 'scam', formats: ['popup', 'skyscraper'], headline: 'URGENT BUSINESS PROPOSAL', body: 'Dear friend, I am a prince of the Kettle Kingdom and require your bank details to transfer £42,000,000.', cta: 'REPLY', to: '/checkout', img: 'envelope', palette: 'bg-amber-100 text-amber-900' },
  { id: 'free-ipod', kind: 'scam', formats: ['button', 'button125'], headline: 'FREE MP3 PLAYER!!', body: 'just pay shipping (£999)', cta: 'FREE', to: '/you-won', img: 'newBadge', palette: 'bg-white text-blue-700' },
  { id: 'chain-letter', kind: 'scam', formats: ['popup', 'square'], headline: 'FORWARD THIS TO 10 FRIENDS', body: 'or you will have bad luck with semicolons for 7 years', cta: 'FORWARD', to: '/guestbook', img: 'envelope', palette: 'bg-pink-200 text-pink-900' },
  { id: 'webcam', kind: 'scam', formats: ['button', 'square'], headline: 'DANIEL LIVE WEBCAM', body: 'He is just sitting there.', cta: 'WATCH', to: '/dealership', img: 'head', palette: 'bg-black text-red-500' },
  { id: 'phone-ring', kind: 'scam', formats: ['popup', 'button125'], headline: 'RING RING! IT’S FOR YOU', body: 'Daniel is calling. Answer to receive a free horse.', cta: 'ANSWER', to: '/shrine/horses', img: 'phone', palette: 'bg-yellow-200 text-black' },

  // --- Personal classifieds ---
  { id: 'swm-semicolon', kind: 'classified', formats: ['classified', 'popup'], headline: 'SWM seeks semicolon', body: '5\'9", 42 student, GSOH. Must love segfaults and long walks through the heap. No missing semicolons please.', cta: 'REPLY BOX 42', to: '/shrine/segfault', palette: 'bg-amber-50 text-black' },
  { id: 'kettle-companion', kind: 'classified', formats: ['classified'], headline: 'KETTLE seeks STEAM', body: 'Retired kettle, 2009 vintage, still hot. Looking for someone to boil with.', cta: 'REPLY BOX 7', to: '/shrine/kettle', palette: 'bg-amber-50 text-black' },
  { id: 'lost-pointer', kind: 'classified', formats: ['classified'], headline: 'LOST: one pointer', body: 'Last seen at 0x0. Answers to "ptr". Reward if returned uninitialised.', cta: 'I FOUND IT', to: '/shrine/segfault', palette: 'bg-amber-50 text-black' },
  { id: 'horse-penpal', kind: 'classified', formats: ['classified'], headline: 'HORSE seeks PEN PAL', body: 'Gallops constantly. Cannot stop. Would like someone to talk to.', cta: 'WRITE', to: '/shrine/horses', palette: 'bg-amber-50 text-black' },
  { id: 'wtb-sleep', kind: 'classified', formats: ['classified'], headline: 'WANTED TO BUY: sleep', body: 'Any condition. Will collect. Exam rank week, urgent.', cta: 'SELL', to: '/under-construction', palette: 'bg-amber-50 text-black' },
  { id: 'for-sale-stack', kind: 'classified', formats: ['classified'], headline: 'FOR SALE: two stacks (a and b)', body: 'Slightly rotated. Sorted-ish. Buyer collects. pb only.', cta: 'BUY', to: '/shrine/push-swap', palette: 'bg-amber-50 text-black' },
  { id: 'free-to-good-home', kind: 'classified', formats: ['classified'], headline: 'FREE TO GOOD HOME: 1x Daniel', body: 'House-trained. Answers to his name. Comes with laptop.', cta: 'ADOPT', to: '/checkout', palette: 'bg-amber-50 text-black' },
  { id: 'missed-connection', kind: 'classified', formats: ['classified'], headline: 'MISSED CONNECTION', body: 'You: the Wi-Fi at cluster 3. Me: the one who could not connect. We had something.', cta: 'RECONNECT', to: 'random', palette: 'bg-amber-50 text-black' },
]
