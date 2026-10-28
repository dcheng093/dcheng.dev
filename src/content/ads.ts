import { assets, type AssetKey, type Slot } from './assets'

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
  /** A named asset, 'head'/'body' shorthands, or any slot (e.g. one of the casual photos). */
  img?: AssetKey | 'head' | 'body' | Slot
  palette: string
}

// No real brands. Every claim is false. Prices are in a currency we made up called "£".
export const ads: Ad[] = [
  // --- Daniel as a product ---
  { id: 'lease-daniel', kind: 'daniel', formats: ['leaderboard', 'banner', 'popup', 'square'], headline: 'LEASE DANIEL TODAY!!!', body: '0% APR • ONLY 3 PREVIOUS OWNERS • FULL SERVICE HISTORY (MISSING)', price: '£69/mo', cta: 'GET QUOTE', to: '/dealership', img: 'headWink', palette: 'bg-yellow-300 text-red-600' },
  { id: 'daniel-sport', kind: 'daniel', formats: ['skyscraper', 'square'], headline: 'NEW!! DANIEL SPORT', body: '0-60 in 4 business days. Heated opinions as standard.', price: '£420/mo', cta: 'TEST DRIVE', to: '/checkout', img: 'body', palette: 'bg-red-600 text-yellow-200' },
  { id: 'daniel-piscine', kind: 'daniel', formats: ['banner', 'skyscraper', 'popup'], headline: 'DANIEL — PISCINE EDITION', body: 'Survived 4 weeks of C. Smells faintly of coffee and despair.', price: '£42/mo', cta: 'ORDER NOW', to: '/shrine/segfault', img: assets.misc[1], palette: 'bg-cyan-300 text-blue-900' },
  { id: 'daniel-refurb', kind: 'daniel', formats: ['button125', 'square'], headline: 'REFURBISHED DANIEL', body: 'Like new! (Is not new.)', price: '£9.99', cta: 'BUY', to: '/checkout', img: assets.misc[0], palette: 'bg-lime text-black' },
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
  { id: 'lose-semicolons', kind: 'surreal', formats: ['square', 'popup', 'banner'], headline: 'LOSE 10KG OF SEMICOLONS IN 1 WEEK', body: 'Doctors are baffled. Compilers are furious.', cta: 'SLIM DOWN', to: '/shrine/norminette', img: 'tooth', palette: 'bg-lime text-black' },
  { id: 'screensaver', kind: 'surreal', formats: ['skyscraper', 'button125', 'popup'], headline: 'FREE 3D SCREENSAVER: KETTLE PIPES', body: 'Watch kettles connect forever. Your monitor will thank you (it will not).', cta: 'GET IT FREE', to: 'popup:download', img: 'kettle', palette: 'bg-black text-cyber' },
  { id: 'rent-a-friend', kind: 'surreal', formats: ['popup', 'square'], headline: 'RENT-A-PLAYER-2', body: 'Lonely in co-op? Daniel will sit next to you and press buttons. Pays for himself in snacks.', price: '£4/hr', cta: 'PRESS START', to: '/dealership', img: 'body', palette: 'bg-indigo-700 text-yellow-200' },

  // --- Fake early-web scams ---
  { id: 'millionth', kind: 'scam', formats: ['leaderboard', 'banner', 'popup', 'square'], headline: '!!! YOU ARE THE 1,000,000th VISITOR !!!', body: 'CLICK HERE TO CLAIM YOUR PRIZE. THIS IS NOT A TRICK.', cta: 'CLAIM PRIZE', to: '/you-won', img: 'trophy', palette: 'bg-yellow-300 text-red-600' },
  { id: 'more-ram', kind: 'scam', formats: ['banner', 'button125', 'popup', 'square'], headline: 'DOWNLOAD MORE RAM', body: 'Your computer is running at 3% speed. Click to fix instantly.', cta: 'DOWNLOAD', to: '/under-construction', img: 'typingPc', palette: 'bg-green-500 text-white' },
  { id: 'viruses', kind: 'scam', formats: ['popup', 'banner', 'skyscraper'], headline: '⚠ YOUR PC HAS 69 VIRUSES ⚠', body: 'Scan detected: segfault.exe, norminette.dll, kettle.sys', cta: 'REMOVE NOW', to: '/shrine/segfault', img: 'printer', palette: 'bg-red-600 text-white' },
  { id: 'punch-monkey', kind: 'scam', formats: ['leaderboard', 'banner'], headline: 'PUNCH THE DANIEL & WIN £20!!!', body: 'Hit him 3 times to win', cta: 'PUNCH', to: '/you-won', img: 'headShock', palette: 'bg-orange-500 text-yellow-100' },
  { id: 'one-trick', kind: 'scam', formats: ['square', 'skyscraper'], headline: 'LOCAL MAN DISCOVERS ONE WEIRD TRICK', body: 'Compilers HATE him.', cta: 'LEARN TRICK', to: '/shrine/norminette', img: assets.misc[11], palette: 'bg-white text-black' },
  { id: 'prince', kind: 'scam', formats: ['popup', 'skyscraper'], headline: 'URGENT BUSINESS PROPOSAL', body: 'Dear friend, I am a prince of the Kettle Kingdom and require your bank details to transfer £42,000,000.', cta: 'REPLY', to: '/checkout', img: 'envelope', palette: 'bg-amber-100 text-amber-900' },
  { id: 'free-ipod', kind: 'scam', formats: ['button', 'button125'], headline: 'FREE MP3 PLAYER!!', body: 'just pay shipping (£999)', cta: 'FREE', to: '/you-won', img: 'newBadge', palette: 'bg-white text-blue-700' },
  { id: 'chain-letter', kind: 'scam', formats: ['popup', 'square'], headline: 'FORWARD THIS TO 10 FRIENDS', body: 'or you will have bad luck with semicolons for 7 years', cta: 'FORWARD', to: '/guestbook', img: 'envelope', palette: 'bg-pink-200 text-pink-900' },
  { id: 'webcam', kind: 'scam', formats: ['button', 'square'], headline: 'DANIEL LIVE WEBCAM', body: 'He is just sitting there.', cta: 'WATCH', to: '/dealership', img: assets.misc[12], palette: 'bg-black text-red-500' },
  { id: 'phone-ring', kind: 'scam', formats: ['popup', 'button125'], headline: 'RING RING! IT’S FOR YOU', body: 'Daniel is calling. Answer to receive a free horse.', cta: 'ANSWER', to: '/shrine/horses', img: 'phone', palette: 'bg-yellow-200 text-black' },
  { id: 'free-scan', kind: 'scam', formats: ['popup', 'banner', 'square'], headline: 'FREE ONLINE VIRUS SCAN', body: 'Our scan found 1,337 problems on your computer before you even clicked. Impressive, right?', cta: 'SCAN NOW', to: '/scan', img: 'printer', palette: 'bg-blue-700 text-yellow-300' },
  { id: 'casino', kind: 'scam', formats: ['leaderboard', 'popup', 'skyscraper', 'button125'], headline: 'DANIEL’S ONLINE CASINO', body: '£500 SIGN-UP BONUS!!! (bonus cannot be withdrawn, spent, seen, or touched)', price: '£500 FREE', cta: 'PLAY NOW', to: '/casino', img: 'trophy', palette: 'bg-green-800 text-yellow-300' },
  { id: 'survey-horse', kind: 'scam', formats: ['popup', 'banner', 'button125'], headline: 'ANSWER 3 QUESTIONS, WIN A HORSE', body: 'Your opinion matters!!! (Your opinion does not matter.)', cta: 'START', to: '/survey', img: 'horses', palette: 'bg-sky-200 text-blue-900' },
  { id: 'work-from-home', kind: 'scam', formats: ['popup', 'skyscraper', 'banner', 'square'], headline: 'MAKE £5,000/WEEK FROM HOME!!!', body: 'Local student reveals the secret. Bosses HATE him. His mum is “a bit worried”.', price: '£££', cta: 'FIND OUT HOW', to: '/work-from-home', img: 'typingPc', palette: 'bg-yellow-200 text-green-800' },
  { id: 'stock-tip', kind: 'scam', formats: ['leaderboard', 'popup', 'button'], headline: 'HOT STOCK TIP: $DANL', body: 'Up 4,000% since lunch. Insider info from a guy called Daniel. Not financial advice. Not advice.', cta: 'INVEST', to: '/work-from-home', img: 'globe', palette: 'bg-black text-lime' },
  { id: 'lottery', kind: 'scam', formats: ['popup', 'square'], headline: 'KETTLE KINGDOM NATIONAL LOTTERY', body: 'Your e-mail address has won £1,000,000!!! You did not enter. That is how lucky you are.', price: '£1,000,000', cta: 'CLAIM WINNINGS', to: '/survey', img: 'envelope', palette: 'bg-amber-200 text-red-800' },
  { id: 'inbox-full', kind: 'scam', formats: ['popup', 'banner'], headline: 'YOUR INBOX IS 104% FULL', body: 'Every message is from Daniel. Delete some? (You cannot.)', cta: 'OPEN INBOX', to: 'popup:business-card', img: 'email3d', palette: 'bg-white text-blue-800' },
  { id: 'free-smileys', kind: 'scam', formats: ['popup', 'button', 'button125'], headline: 'FREE SMILEYS FOR YOUR E-MAIL!!!', body: '10,000 animated emoticons. Only 1 of them is spyware.', cta: 'DOWNLOAD', to: 'popup:download', img: 'newBadge', palette: 'bg-yellow-300 text-purple-800' },
  { id: 'toolbar', kind: 'scam', formats: ['banner', 'popup', 'button'], headline: 'INSTALL THE DANIELBAR™', body: 'Search the web, but worse. Sets your homepage to Daniel forever.', cta: 'INSTALL', to: 'popup:download', img: 'surfer', palette: 'bg-gray-200 text-blue-900' },
  { id: 'cursor-pack', kind: 'scam', formats: ['button', 'button125', 'popup'], headline: 'FREE ANIMATED CURSORS', body: 'Your mouse, but it is a horse now.', cta: 'GET CURSORS', to: 'popup:download', img: 'arrow', palette: 'bg-hotpink text-white' },
  { id: 'singles-daniel', kind: 'scam', formats: ['popup', 'square', 'banner'], headline: '4 DANIELS ARE ONLINE NEAR YOU', body: 'They are all the same Daniel. He has a lot of tabs open.', cta: 'CHAT NOW', to: 'popup:friend-request', img: assets.misc[8], palette: 'bg-pink-500 text-yellow-100' },
  { id: 'spin-ad', kind: 'scam', formats: ['button125', 'square', 'popup'], headline: 'SPIN THE WHEEL!!!', body: 'Every spin is a winner*. *Not every spin.', cta: 'SPIN', to: 'popup:spin-to-win', img: 'trophy', palette: 'bg-red-500 text-yellow-200' },
  { id: 'ip-scare', kind: 'scam', formats: ['banner', 'button'], headline: 'YOUR IP IS SHOWING', body: 'Cover it up immediately.', cta: 'HIDE IP', to: 'popup:ip-alert', img: 'globe', palette: 'bg-red-700 text-white' },

  // --- Personal classifieds ---
  { id: 'swm-semicolon', kind: 'classified', formats: ['classified', 'popup'], headline: 'SWM seeks semicolon', body: '5\'9", 42 student, GSOH. Must love segfaults and long walks through the heap. No missing semicolons please.', cta: 'REPLY BOX 42', to: '/shrine/segfault', palette: 'bg-amber-50 text-black' },
  { id: 'kettle-companion', kind: 'classified', formats: ['classified'], headline: 'KETTLE seeks STEAM', body: 'Retired kettle, 2009 vintage, still hot. Looking for someone to boil with.', cta: 'REPLY BOX 7', to: '/shrine/kettle', palette: 'bg-amber-50 text-black' },
  { id: 'lost-pointer', kind: 'classified', formats: ['classified'], headline: 'LOST: one pointer', body: 'Last seen at 0x0. Answers to "ptr". Reward if returned uninitialised.', cta: 'I FOUND IT', to: '/shrine/segfault', palette: 'bg-amber-50 text-black' },
  { id: 'horse-penpal', kind: 'classified', formats: ['classified'], headline: 'HORSE seeks PEN PAL', body: 'Gallops constantly. Cannot stop. Would like someone to talk to.', cta: 'WRITE', to: '/shrine/horses', palette: 'bg-amber-50 text-black' },
  { id: 'wtb-sleep', kind: 'classified', formats: ['classified'], headline: 'WANTED TO BUY: sleep', body: 'Any condition. Will collect. Exam rank week, urgent.', cta: 'SELL', to: '/under-construction', palette: 'bg-amber-50 text-black' },
  { id: 'for-sale-stack', kind: 'classified', formats: ['classified'], headline: 'FOR SALE: two stacks (a and b)', body: 'Slightly rotated. Sorted-ish. Buyer collects. pb only.', cta: 'BUY', to: '/shrine/push-swap', palette: 'bg-amber-50 text-black' },
  { id: 'free-to-good-home', kind: 'classified', formats: ['classified'], headline: 'FREE TO GOOD HOME: 1x Daniel', body: 'House-trained. Answers to his name. Comes with laptop.', cta: 'ADOPT', to: '/checkout', palette: 'bg-amber-50 text-black' },
  { id: 'missed-connection', kind: 'classified', formats: ['classified'], headline: 'MISSED CONNECTION', body: 'You: the Wi-Fi at cluster 3. Me: the one who could not connect. We had something.', cta: 'RECONNECT', to: 'random', palette: 'bg-amber-50 text-black' },
  { id: 'iso-player-2', kind: 'classified', formats: ['classified', 'popup'], headline: 'ISO: PLAYER 2', body: 'Must have own controller. Must not be better than me at MGE. Will not explain what MGE is.', cta: 'REPLY BOX 2', to: '/casino', palette: 'bg-amber-50 text-black' },
  { id: 'for-sale-mice', kind: 'classified', formats: ['classified'], headline: 'FOR SALE: 14 gaming mice', body: 'All perfectly fine. Owner keeps buying more. Intervention needed, not money.', cta: 'BUY ONE', to: '/shrine/peripherals', palette: 'bg-amber-50 text-black' },
  { id: 'mlm-opportunity', kind: 'classified', formats: ['classified'], headline: 'BUSINESS OPPORTUNITY!!', body: 'Be your own boss. Recruit 6 friends. They recruit 6 friends. Do not ask what we sell.', cta: 'JOIN TEAM', to: '/work-from-home', palette: 'bg-amber-50 text-black' },
]
