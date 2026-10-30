// ALL personal copy lives here. Anything marked TODO(q#) is placeholder waiting on the
// content questionnaire in the plan; the number is the question it answers.

export const daniel = {
  name: 'Daniel Cheng',
  siteTitle: "DANIEL CHENG'S WORLD WIDE WEB SITE",

  profile: {
    age: '19',
    location: 'Earth',
    mood: 'wow',
    sex: 'a lot',
  },

  emoticons: [':3', ';-)', ':-P', '8)', ':-O', '>:-(', '(o_O)', '\\(^o^)/', '<(-_-)>', ':^)'],

  coding: {
    school: '42',
    projects: ['libft', 'push_swap', 'get_next_line', 'A-Maze-ing', 'Call_Me_Maybe'],
    milestone: 'Milestone 3 (allegedly)',
    examStory: 'i memorized all 55 questions to finish the exam in 10 minutes',
    norminetteHaiku: [
      'TOO_MANY_LINES',
      'MISALIGNED_VAR_DECL',
      'NO_NEWLINE_EOF',
    ],
  },

  games: [
    { name: 'Team Fortress 2', pitch: 'TOP 1 IN MGE WORLDWIDE', slot: 'game-tf2.webp' },
    { name: 'Valorant', pitch: 'TOP 3200 IN APAC', slot: 'game-valorant.webp' },
    { name: 'Counter-Strike 2', pitch: 'GLOBAL ELITE.', slot: 'game-cs.webp' },
    { name: 'Apex Legends', pitch: 'DIAMOND IN 50 HOURS', slot: 'game-apex.webp' },
    { name: 'Aimlabs', pitch: 'GRANDMASTER 1 IN 100 HOURS AND TOP 700 OUT OF 6 MILLION PLAYERS', slot: 'game-aimlabs.webp' }
  ],

  // Order matches assets.hobbies (HOBBY-1..3.jpg).
  hobbies: [
    { title: 'CHIIKAWA', detail: 'Watching every episode. Buying every plush. No regrets.', shrine: 'chiikawa' },
    { title: 'GAMING', detail: 'This is my setup. I live here now.', shrine: 'battlestation' },
    { title: 'PERIPHERALS', detail: 'Keyboards, mice, mousepads. I have two hands and too many mice.', shrine: 'peripherals' },
  ],

  foods: ['Siu Yuk Fan', 'Carbonara spaghetti', 'Pepperoni pizza'],

  roots: {
    // TODO(q3) hometown / pets / optional greeting — only what Daniel wants shown
    hometown: 'HOMETOWN',
    family: 'tiny involuntary cult',
    pets: null as null,
    language: null as null | { greeting: string; translation: string },
  },

  /** Melly, Daniel's Gify pet (gify.pet), shown in the floating pet window. */
  petUrl:
    'https://gify.pet/pet/pet.html?name=Melly&dob=1793163836&gender=m&element=Fire&pet=melon.gif&map=hills.jpg&background=1995.png&tablecolor=%23529d32&textcolor=black',

  /** Real links for /boring and the business-card popup. */
  links: {
    email: 'chengpeter37093@gmail.com',
    github: 'https://github.com/dcheng093',
    linkedin: null as string | null,
    resume: null as string | null,
  },

  boringBio:
    'Daniel Cheng | Software Engineering Student at 42KL (C/Python) & Gaming Peripheral Enthusiast.\n[You are viewing the plain version of this site]',
}
