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
    /** Discord username (shown with a copy button: there's no profile link without a numeric user ID). */
    discord: 'gholed',
    linkedin: null as string | null,
    resume: null as string | null,
  },

  /**
   * The boring site (/boring): Daniel's real portfolio. Professional only: no jokes, nothing from the fun site.
   * Drafted from his repos and his 42 intra; lines marked DRAFT are for him to check.
   */
  boring: {
    greeting: ["HEY THERE,", "THE NAME'S…", 'DANIEL CHENG'],
    tagline: 'Software engineering student · 42 Kuala Lumpur',
    // DRAFT: check
    intro: [
      { text: "I'm " },
      { text: 'Daniel Cheng', strong: true },
      { text: ', a software engineering student at 42 Kuala Lumpur. I mostly write ' },
      { text: 'C', accent: true },
      { text: ' and ' },
      { text: 'Python', accent: true },
      { text: ", from re-implementing the C standard library to constraining a language model's output with a grammar, and I like problems where getting the details right is the whole job." },
    ],
    // DRAFT: check
    hobby:
      "Away from the keyboard I'm still at a keyboard: I play competitive FPS games and care far too much about the hardware behind them, from switches and mice to mousepads. Training aim taught me what 42 does too: small, deliberate practice compounds.",
    contactLine: "Have a question, an opportunity, or just want to connect? Send me an email or reach out on any of my socials and I'll get back to you as soon as I can.",
    stack: ['C', 'Python', 'Bash', 'Git', 'Make', 'Linux', 'TypeScript', 'React', 'three.js', 'Tailwind'],
    /** From the 42 intra (Nov 2026). Months are approximate, from its "n months ago". */
    intra: {
      login: 'dcheng',
      campus: '42 Kuala Lumpur',
      projects: [
        { name: 'Libft', score: 125, when: 'Dec 2025', kind: 'C' },
        { name: 'Born2beroot', score: 125, when: 'Jan 2026', kind: 'System' },
        { name: 'ft_printf', score: 100, when: 'Jan 2026', kind: 'C' },
        { name: 'get_next_line', score: 125, when: 'Jan 2026', kind: 'C' },
        { name: 'push_swap', score: 100, when: 'Jun 2026', kind: 'C' },
        { name: 'Python Modules 00–03', score: 100, when: 'Jul 2026', kind: 'Python', count: 4 },
        { name: 'Exam Rank 02', score: 100, when: 'Sep 2026', kind: 'Exam' },
        { name: 'Python Modules 04–10', score: 100, when: 'Oct 2026', kind: 'Python', count: 7 },
        { name: 'A-Maze-ing', score: 110, when: 'Oct 2026', kind: 'Python' },
      ],
    },
    /** The Featured Projects carousel, oldest first. `demo` picks its animation (src/components/boring/demos). */
    projects: [
      {
        repo: 'Libft',
        title: 'Libft',
        when: 'Oct 2025',
        demo: 'libft',
        paragraphs: [
          'My own C library, written from scratch: 34 functions re-implementing parts of libc (memory, strings, characters and number conversions) plus a 9-function linked-list API.',
          'Every later C project at 42 is built on top of it. Validated at 125/100, bonus included.',
        ],
      },
      {
        repo: 'Printf',
        title: 'ft_printf',
        when: 'Nov 2025',
        demo: 'printf',
        paragraphs: [
          "A re-implementation of printf: walks the format string, pulls each argument off the variadic list and prints %c %s %p %d %i %u %x %X and %%, returning the number of characters written like the original.",
          'Handles the edge cases the real one does, like (null) strings and (nil) pointers.',
        ],
      },
      {
        repo: 'get_next_line',
        title: 'get_next_line',
        when: 'Nov 2025',
        demo: 'gnl',
        paragraphs: [
          'Reads a file descriptor one line at a time, whatever the BUFFER_SIZE: each call reads chunks into a static stash until it holds a newline, hands back the line and keeps the rest for next time.',
          'The bonus version keeps a stash per file descriptor, so several files can be read in turn. Validated at 125/100.',
        ],
      },
      {
        repo: 'push_swap',
        title: 'push_swap',
        when: 'Jan 2026',
        demo: 'pushSwap',
        paragraphs: [
          'Sorts a list of integers with two stacks and eleven operations, printing as few operations as it can. Mine uses the "Turk" algorithm: for every number it prices moving it, and its target in the other stack, to the top, then makes the cheapest move.',
          'Sorts 100 numbers in well under the 700-operation mark. The animation here is that algorithm, ported line for line and running live.',
        ],
      },
      {
        repo: 'A-Maze-ing',
        title: 'A-Maze-ing',
        when: 'Apr 2026',
        demo: 'maze',
        paragraphs: [
          'A maze generator and solver in Python, built with a teammate: an iterative depth-first search carves a perfect maze around a 42 logo set in its centre, and a breadth-first search finds the shortest way through.',
          'Ships as a reusable mazegen package, with config files, seeds for reproducible mazes and a coloured terminal renderer. Validated at 110/100.',
        ],
      },
      {
        repo: 'Call-Me-Maybe',
        title: 'Call Me Maybe',
        when: 'Aug 2026',
        demo: 'callMe',
        paragraphs: [
          'Function calling with a small local language model (Qwen3-0.6B): a request like "What is the sum of 2 and 3?" becomes a JSON call to fn_add_numbers.',
          "Instead of asking the model nicely for JSON, a trie-based grammar masks every next token that would break the schema, so the output is always a valid call, then it's validated against the function definitions.",
        ],
      },
    ],
  },
}
