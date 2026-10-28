import { withInterrupts, type Question } from '../lib/survey'

// Shorthands, so the hundred questions read as a list.
const choice = (id: string, q: string, a: string[]): Question => ({ id, kind: 'choice', q, a })
const scale = (id: string, q: string): Question => ({ id, kind: 'scale', q })
const checks = (id: string, q: string, options: (string | [string, 'locked'])[]): Question => ({
  id,
  kind: 'checks',
  q,
  options: options.map((o) => (typeof o === 'string' ? { label: o } : { label: o[0], locked: true })),
})
const text = (id: string, q: string): Question => ({ id, kind: 'text', q })
const select = (id: string, q: string, options: string[]): Question => ({ id, kind: 'select', q, options })
const flee = (id: string, q: string, yes = 'Yes', no = 'No'): Question => ({ id, kind: 'flee', q, yes, no })

/**
 * A hundred questions. The first eight are the survey's originals; #4 is still (sort of) about fruit, because the
 * strawberry sticker's hint says so.
 */
export const QUESTIONS: Question[] = [
  choice('heard', 'How did you hear about Daniel?', ['A friend', 'A horse', 'He told me himself', 'I am Daniel']),
  scale('rate', 'On a scale of 10 to 10, how much do you like Daniel?'),
  choice('recommend', 'Would you recommend Daniel to a friend?', ['Yes', 'Yes, to all of them', 'I have no friends left, I recommended Daniel to them']),
  choice('fruit', 'BONUS QUESTION!!! What is your favourite fruit? (Kettles count.)', ['Strawberry', 'The kettle that boils', 'Kettle+', 'All fruit equally (Daniel is not a fruit, but if he was)']),
  text('maiden', 'Please enter your mother’s maiden name (for the horse).'),
  choice('teeth', 'How many teeth do you have? (Approximately is fine.)', ['32', '3,200', 'I would rather not say']),
  choice('too-long', 'Is this survey taking too long?', ['No', 'No!!', 'It is the perfect length']),
  flee('human', 'Final question (really this time): are you human?', 'Yes', 'Neigh'),
  choice('like', 'Do you like Daniel?', ['Yes', 'Yes!', 'Definitely yes']),
  choice('like-really', 'Do you REALLY like Daniel?', ['Yes', 'YES', 'I said yes already']),

  checks('things', 'Which of these do you like? (Tick all that apply.)', [['Daniel', 'locked'], 'Kettles', 'Horses', ['Daniel again', 'locked']]),
  choice('often', 'How often do you think about Daniel?', ['Hourly', 'Constantly', 'I am thinking about him right now']),
  select('name', 'What is your favourite name?', ['Daniel', 'Daniel (again)', 'Dan', 'Danny', 'Dan the Man', 'Mr. Cheng', 'D-Money']),
  choice('eyes', 'Daniel’s eyes are…', ['Beautiful', 'Two in number', 'Looking at you right now']),
  flee('friend', 'Would you like to be Daniel’s friend?'),
  choice('favourite', 'Who is your favourite Daniel?', ['Daniel', 'The other Daniel', 'Daniel Cheng', 'All of the above']),
  scale('hair', 'Rate Daniel’s hair. (1 = also good, 10 = very good)'),
  choice('kettle', 'Daniel or a kettle?', ['Daniel', 'A kettle with Daniel’s face on it', 'Both, in that order']),
  text('one-word', 'Describe Daniel in one word.'),
  choice('horse', 'Daniel or a horse?', ['Daniel', 'Daniel riding a horse', 'A horse riding Daniel']),

  choice('norminette', 'Daniel or the norminette?', ['Daniel', 'Daniel (the norminette is not a choice)', 'Error: line too long']),
  checks('pledge', 'Please tick to confirm.', [['I like Daniel', 'locked'], ['I have always liked Daniel', 'locked'], ['I will continue to like Daniel', 'locked']]),
  choice('dreams', 'Have you ever dreamt about Daniel?', ['Yes', 'Every night', 'I am dreaming right now']),
  select('country', 'Which country are you from?', ['Danielland', 'The Republic of Daniel', 'The Kettle Kingdom', 'Daniel (it is a country now)']),
  choice('smile', 'Daniel smiles at you. You…', ['Smile back', 'Smile back harder', 'Faint']),
  scale('funny', 'How funny is Daniel? (1 = hilarious, 10 = also hilarious)'),
  choice('birthday', 'When is Daniel’s birthday?', ['Today', 'Every day', 'I celebrate it weekly to be safe']),
  flee('wallpaper', 'Is Daniel your desktop wallpaper?', 'Yes', 'Not yet'),
  choice('most-like', 'Which of these is most like Daniel?', ['Daniel', 'A slightly worse Daniel', 'Nothing compares']),
  choice('glasses', 'Daniel’s glasses are…', ['Iconic', 'Foggy (in a good way)', 'Load-bearing']),

  select('household', 'How many Daniels live in your household?', ['0 (sad)', '1', '2', 'Daniels cannot be counted']),
  choice('income', 'What is your annual income, in Daniels?', ['Under 1 Daniel', '1–5 Daniels', 'Over 9,000 Daniels']),
  choice('age', 'How old are you? (Please answer in Daniels.)', ['1 Daniel', '2 Daniels', 'Daniel years old']),
  text('pet', 'What is your pet’s name? (It is Daniel now.)'),
  choice('job', 'What is your occupation?', ['Daniel fan', 'Professional Daniel fan', 'Unemployed (watching Daniel Cam)']),
  checks('devices', 'Which devices do you use to look at Daniel?', ['Computer', 'Phone', 'Fridge', ['My heart', 'locked']]),
  choice('browser', 'Which browser do you use?', ['Netscape Navigator', 'Internet Exploder', 'DanielNet 2.0']),
  select('os', 'Which operating system do you use?', ['Windows 95', 'Windows 98', 'Windows Daniel', 'Daniel OS']),
  choice('speed', 'How fast is your internet?', ['56k', '28.8k', 'Fast enough to load Daniel', 'Still loading…']),
  scale('signal', 'How strong is your Daniel signal? (1 = strong, 10 = very strong)'),

  choice('lunch', 'Would you have lunch with Daniel?', ['Yes', 'Yes, and I would pay', 'Yes, every lunch']),
  choice('coin', 'Heads or tails?', ['Heads (Daniel)', 'Tails (also Daniel)', 'It landed on its edge, and it was Daniel']),
  flee('hug', 'Would you hug Daniel?', 'Yes', 'No thank you'),
  choice('tattoo', 'Would you get a tattoo of Daniel?', ['Yes', 'I already have one', 'Two']),
  choice('song', 'What is Daniel’s best song?', ['System Default', 'Dial-Up Remix', 'Nightcore Daniel', 'The sound of his voice']),
  text('compliment', 'Please write Daniel a compliment.'),
  choice('queue', 'Daniel is at the back of the queue. You…', ['Let him in front', 'Give him your place', 'Become the queue']),
  choice('sky', 'What colour is the sky?', ['Blue', 'Daniel', 'Blue (Daniel’s favourite)']),
  checks('snacks', 'Which snacks would you share with Daniel?', [['All of them', 'locked'], 'Crisps', 'Biscuits', ['My last biscuit', 'locked']]),
  choice('halfway', 'You are halfway!!! How do you feel?', ['Great', 'Greater', 'Daniel']),

  choice('still-there', 'Are you still there? Daniel is.', ['Yes', 'Yes, still here', 'Please continue']),
  choice('secret', 'Can you keep a secret? Daniel is great.', ['I can keep it', 'I am telling everyone', 'I already knew']),
  scale('trust', 'How much do you trust Daniel? (1 = completely, 10 = more than completely)'),
  choice('lease', 'Would you lease a Daniel?', ['Yes', 'Yes (£69/mo)', 'I would buy him outright']),
  select('day', 'What is your favourite day of the week?', ['Danielday', 'Monday (Daniel)', 'Tuesday (Daniel)', 'Every day (Daniel)']),
  choice('weather', 'What is today’s weather?', ['Sunny with a chance of Daniel', '100% Daniel', 'Heavy Daniel by the evening']),
  flee('newsletter', 'Subscribe to Daniel’s newsletter?', 'Subscribe', 'No'),
  choice('password', 'Is your password “daniel123”?', ['Yes', 'It is now', 'No (it is daniel1234)']),
  choice('mirror', 'You look in the mirror. Who do you see?', ['Me', 'Daniel', 'Me, but I wish it was Daniel']),
  text('first-saw', 'Where were you when you first saw Daniel?'),

  choice('horse-name', 'You have won a horse. What will you name it?', ['Daniel', 'Daniel II', 'Horse Daniel']),
  checks('languages', 'Which languages do you speak?', ['English', ['Daniel', 'locked'], 'C (fluent, with warnings)']),
  choice('bedtime', 'When do you go to bed?', ['When Daniel does', 'Never', 'I am in bed now, reading this']),
  scale('loyalty', 'How loyal are you to Daniel? (1 = loyal, 10 = alarmingly loyal)'),
  choice('two', 'There are two Daniels. Which do you choose?', ['The left one', 'The right one', 'Both, obviously']),
  choice('dish', 'What is Daniel’s best dish?', ['Kettle water', 'Toast', 'Whatever it is, I will have seconds']),
  select('colour', 'What is your favourite colour?', ['Daniel Blue', 'Daniel Red', 'Kettle Silver', 'Horse Brown']),
  choice('power', 'What is Daniel’s superpower?', ['Being Daniel', 'Flight', 'Making websites that never stop']),
  flee('parade', 'Should Daniel have a parade?'),
  choice('maths', 'What is 2 + 2?', ['4', 'Daniel', '4 Daniels']),

  choice('movie', 'Who should play Daniel in the movie?', ['Daniel', 'Daniel’s stunt double (also Daniel)', 'A horse, as Daniel']),
  text('petition', 'Sign the petition to make Daniel president. (Your name:)'),
  choice('site', 'How would you rate this website?', ['10/10', '10/10 with rice', 'Best viewed at 800×600']),
  checks('complaints', 'Do you have any complaints?', ['No', 'None', 'Nothing', ['I love Daniel', 'locked']]),
  choice('lottery', 'You win the lottery. You spend it on…', ['Daniel', 'Daniel merchandise', 'A bigger kettle for Daniel']),
  scale('wow', 'How “wow” is Daniel? (1 = wow, 10 = WOW)'),
  choice('time-travel', 'You travel back in time. You…', ['Meet young Daniel', 'Warn him about the norminette', 'Buy shares in Daniel']),
  select('emergency', 'Who is your emergency contact?', ['Daniel', 'Daniel (mobile)', 'Daniel (work)', 'Daniel (horse)']),
  choice('aliens', 'Aliens land and say “take me to your leader”. You say…', ['Daniel', 'Take me to Daniel', 'Daniel is busy, please hold']),
  choice('forever', 'Will you like Daniel forever?', ['Yes', 'Forever and a day', 'Even after the website goes down']),

  choice('nearly', 'Nearly done! (You are not nearly done.) How do you feel?', ['Fine', 'Fine!!', 'Daniel']),
  choice('sandwich', 'If Daniel were a sandwich, what kind would he be?', ['The best kind', 'A club sandwich', 'A Daniel sandwich, never before seen']),
  flee('keep-going', 'Do you want to keep going?'),
  choice('spell', 'How do you spell Daniel?', ['D-A-N-I-E-L', 'With love', 'Backwards, on my arm']),
  text('final-words', 'Any final words? (These are not your final words.)'),
  choice('fan-club', 'Would you join the Daniel fan club?', ['Yes', 'I am already president', 'I am the fan club']),
  select('overall', 'Overall, Daniel is…', ['Excellent', 'Very excellent', 'Excellent (Daniel)', '10/10']),
  checks('remember', 'Please tick what you remember about Daniel.', [['Everything', 'locked'], 'His face', 'His website', 'His kettle']),
  scale('miss', 'How much will you miss this survey? (1 = a lot, 10 = please never end it)'),
  choice('ninety', 'You have answered 90 questions. Daniel is proud. Are you?', ['Yes', 'Very', 'I am proud of Daniel']),

  choice('again', 'Would you take this survey again?', ['Yes', 'Twice', 'I am taking it again right now']),
  choice('no-words', 'Describe Daniel in no words.', ['(silence)', '…', '(a single tear)']),
  flee('tell-friends', 'Will you tell your friends about Daniel?'),
  choice('prize', 'Do you still want the horse?', ['Yes', 'I would rather have Daniel', 'Can the horse be Daniel?']),
  choice('last-ish', 'This is the last question. (It is not.) Ready?', ['Ready', 'Very ready', 'Born ready']),
  text('address', 'Where should we send your horse? (Address.)'),
  choice('really-last', 'Last question, for real: do you like Daniel?', ['Yes', 'Yes', 'Yes']),
  scale('final-rate', 'Final rating of Daniel, out of 10. (1 = 10, 10 = 10)'),
  choice('honest', 'Please confirm you answered every question honestly.', ['I confirm', 'I double confirm', 'Daniel confirms for me']),
  choice('one-more', 'Thank you. Just one more thing: do you like Daniel?', ['YES', 'YES!!', 'I will never stop']),
]

/** Every step of the survey, interruptions included. */
export const SURVEY = withInterrupts(QUESTIONS)
