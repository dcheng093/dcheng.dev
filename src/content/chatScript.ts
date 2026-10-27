import { pick, type Rng } from '../lib/random'

export const CHAT_GREETING = 'HELLO!!! WELCOME TO DANIEL CHENG’S WEB SITE!!! I AM DANIEL. HOW CAN I HELP YOU TODAY? (I CANNOT HELP YOU)'

const keyword: [RegExp, string[]][] = [
  [/\b(hi|hello|hey|yo|sup)\b/i, ['HELLO!!! :-)', 'hi. who is this. how did you get this number', 'GREETINGS, VISITOR #' + 1_000_000]],
  [/price|cost|how much|£|\$|cheap/i, ['FOR YOU? £69/month. FOR YOUR FRIEND? also £69/month.', 'PRICE ON APPLICATION. APPLICATION ON PRICE.', 'cheaper than a horse!!']],
  [/lease|buy|order|checkout/i, ['GREAT CHOICE!!! Taking you to checkout… (I am not)', 'Every Daniel comes with 0 year warranty.']],
  [/\bc\b|code|segfault|pointer|malloc|norm/i, ['segmentation fault (core dumped)', 'have you tried putting a semicolon there', 'norminette says no.']],
  [/horse/i, ['neigh', 'THE HORSES CANNOT STOP. THEY WILL NEVER STOP.']],
  [/kettle|tea/i, ['the kettle is always on', 'brb kettle']],
  [/real|human|bot|robot|ai\b/i, ['I am 100% real Daniel. beep.', 'no u']],
  [/contact|email|hire|job|work/i, ['For real business: there is a boring version of this site. Find it. (It is at the very bottom.)']],
  [/bye|leave|exit|quit/i, ['NOOO DON’T GO', 'are you sure? are you SURE sure?']],
]

const fallback = [
  'lol',
  'interesting!!! tell me more (do not)',
  'Daniel is away from keyboard. Daniel is also at keyboard.',
  'ERROR: REPLY NOT FOUND',
  'have you seen the dealership',
  'please sign my guestbook',
  'one moment, my modem is connecting… 🎶 eeeee kssshhhh',
  'k',
  '¯\\_(ツ)_/¯',
  'did you know this site is under construction',
]

export function pickReply(message: string, rng: Rng = Math.random): string {
  const hit = keyword.find(([re]) => re.test(message))
  return pick(hit ? hit[1] : fallback, rng)
}
