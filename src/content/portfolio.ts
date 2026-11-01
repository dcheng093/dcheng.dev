// THE BORING SITE (/boring): Daniel's real portfolio. Everything it says lives in this one file; edit freely.
// Professional only: no jokes and nothing from the fun site's voice.
//
// Quick updates:
//   • A 42 project validated? In `intra.projects`, give it a `score` and a `date` (and delete `status: 'ongoing'`).
//     The card works out the counts, categories, average and order by itself.
//   • Reached a new milestone? Change `intra.milestone`.
//   • New project for the carousel? Add it to `projects` (oldest first). `demo` picks its animation
//     (src/components/boring/demos/Demo.tsx); a new kind of animation needs a new demo there.

export type SocialId = 'github' | 'email' | 'discord' | 'youtube' | 'twitch' | 'soundcloud'

export const portfolio = {
  name: 'Daniel Cheng',
  greeting: ["HEY THERE,", "THE NAME'S…", 'DANIEL CHENG'],
  tagline: 'Software engineering student · 42 Kuala Lumpur',

  /** Shown in the hero (2 rows of 3) and the footer, in this order. Discord has no link: its button copies the name. */
  socials: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/dcheng093' },
    { id: 'email', label: 'Email', href: 'mailto:chengpeter37093@gmail.com' },
    { id: 'discord', label: 'Discord', copy: 'gholed' },
    { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@gholed' },
    { id: 'twitch', label: 'Twitch', href: 'https://www.twitch.tv/gholed_' },
    { id: 'soundcloud', label: 'SoundCloud', href: 'https://soundcloud.com/andrewbobert2013' },
  ] as { id: SocialId; label: string; href?: string; copy?: string }[],
  email: 'chengpeter37093@gmail.com',

  /** The About card. `strong` = his name, `accent` = highlighted words. */
  intro: [
    { text: "I'm " },
    { text: 'Daniel Cheng', strong: true },
    { text: ', a software engineering student at 42 Kuala Lumpur. I mostly write ' },
    { text: 'C', accent: true },
    { text: ' and ' },
    { text: 'Python', accent: true },
    { text: ", from re-implementing the C standard library to constraining a language model's output with a grammar, and I like problems where getting the details right is the whole job." },
  ] as { text: string; strong?: boolean; accent?: boolean }[],
  hobby:
    "Away from the keyboard I'm still at a keyboard: I play competitive FPS games and care far too much about the hardware behind them, from switches and mice to mousepads. Training aim taught me what 42 does too: small, deliberate practice compounds.",
  contactLine: "Have a question, an opportunity, or just want to connect? Send me an email or reach out on any of my socials and I'll get back to you as soon as I can.",

  /**
   * The tech orbit. `main` sits on the inner ring, `experienced` on the outer. `note` shows on hover.
   * `logo` is a file in public/boring/logos/ (trimmed, about 160px; originals in asset-originals/me/).
   */
  stack: [
    { name: 'C', level: 'main', note: 'main language', logo: 'c' },
    { name: 'Python', level: 'main', note: "42's Python track, A-Maze-ing, Call Me Maybe", logo: 'python' },
    { name: 'Ruby', level: 'experienced', note: 'The Descent (DragonRuby)', logo: 'ruby' },
    { name: 'Java', level: 'experienced', note: 'timebound, a Minecraft plugin', logo: 'java' },
    { name: 'Bash', level: 'experienced', note: 'shell scripting', logo: 'bash' },
    { name: 'Git', level: 'experienced', note: 'every project', logo: 'git' },
  ] as { name: string; level: 'main' | 'experienced'; note: string; logo: string }[],

  /** The 42 intra card. `date` is 'YYYY-MM'. Ongoing projects have no score and aren't counted as validated. */
  intra: {
    login: 'dcheng',
    campus: '42 Kuala Lumpur',
    milestone: 3,
    /** How many milestones the strip shows (0 up to this). */
    milestones: 6,
    projects: [
      { name: 'Libft', score: 125, date: '2026-01', kind: 'C' },
      { name: 'Born2beroot', score: 125, date: '2026-02', kind: 'System' },
      { name: 'ft_printf', score: 100, date: '2026-02', kind: 'C' },
      { name: 'get_next_line', score: 125, date: '2026-02', kind: 'C' },
      { name: 'push_swap', score: 100, date: '2026-06', kind: 'C' },
      { name: 'Python Module 00', score: 100, date: '2026-07', kind: 'Python' },
      { name: 'Python Module 01', score: 100, date: '2026-07', kind: 'Python' },
      { name: 'Python Module 02', score: 100, date: '2026-07', kind: 'Python' },
      { name: 'Python Module 03', score: 100, date: '2026-07', kind: 'Python' },
      { name: 'Exam Rank 02', score: 100, date: '2026-09', kind: 'Exam' },
      { name: 'Python Module 04', score: 100, date: '2026-10', kind: 'Python' },
      { name: 'Python Module 05', score: 100, date: '2026-10', kind: 'Python' },
      { name: 'Python Module 06', score: 100, date: '2026-10', kind: 'Python' },
      { name: 'Python Module 07', score: 100, date: '2026-10', kind: 'Python' },
      { name: 'Python Module 08', score: 100, date: '2026-10', kind: 'Python' },
      { name: 'Python Module 09', score: 100, date: '2026-10', kind: 'Python' },
      { name: 'Python Module 10', score: 100, date: '2026-10', kind: 'Python' },
      { name: 'A-Maze-ing', score: 110, date: '2026-10', kind: 'Python' },
      { name: 'Call-Me-Maybe', status: 'ongoing', kind: 'Python' },
    ] as IntraProject[],
  },

  /** The Featured Projects carousel, oldest first. */
  projects: [
    {
      repo: 'dcheng093/Libft',
      title: 'Libft',
      date: '2025-10',
      tag: '42 project',
      demo: 'libft',
      paragraphs: [
        'My own C library, written from scratch: 34 functions re-implementing parts of libc (memory, strings, characters and number conversions) plus a 9-function linked-list API.',
        'Every later C project at 42 is built on top of it. Validated at 125/100, bonus included.',
      ],
    },
    {
      repo: 'dcheng093/Printf',
      title: 'ft_printf',
      date: '2025-11',
      tag: '42 project',
      demo: 'printf',
      paragraphs: [
        'A re-implementation of printf: walks the format string, pulls each argument off the variadic list and prints %c %s %p %d %i %u %x %X and %%, returning the number of characters written like the original.',
        'Handles the edge cases the real one does, like (null) strings and (nil) pointers.',
      ],
    },
    {
      repo: 'dcheng093/get_next_line',
      title: 'get_next_line',
      date: '2025-11',
      tag: '42 project',
      demo: 'gnl',
      paragraphs: [
        'Reads a file descriptor one line at a time, whatever the BUFFER_SIZE: each call reads chunks into a static stash until it holds a newline, hands back the line and keeps the rest for next time.',
        'The bonus version keeps a stash per file descriptor, so several files can be read in turn. Validated at 125/100.',
      ],
    },
    {
      repo: 'dcheng093/push_swap',
      title: 'push_swap',
      date: '2026-01',
      tag: '42 project',
      demo: 'pushSwap',
      paragraphs: [
        'Sorts a list of integers with two stacks and eleven operations, printing as few operations as it can. Mine uses the "Turk" algorithm: for every number it prices moving it, and its target in the other stack, to the top, then makes the cheapest move.',
        'Sorts 100 numbers in well under the 700-operation mark. The animation here is that algorithm, ported line for line and running live.',
      ],
    },
    {
      repo: 'dcheng093/timebound',
      title: 'timebound',
      date: '2026-05',
      tag: 'side project',
      demo: 'timebound',
      paragraphs: [
        'A Paper plugin for Minecraft 1.21 (Java 21) built around time. Four time clocks, each with its own power: Lunar Dial freezes, Chrono Lock slows, Flashstep skips ahead and Requiem rewinds.',
        'Comes with matching weapons and world-wide ultimates, the top-tier Eternity item, rewind snapshots, a trust list, and a duplicate-item scanner that keeps every time item unique.',
      ],
    },
    {
      repo: 'dcheng093/A-Maze-ing',
      title: 'A-Maze-ing',
      date: '2026-04',
      tag: '42 project',
      demo: 'maze',
      paragraphs: [
        'A maze generator and solver in Python, built with a teammate: an iterative depth-first search carves a perfect maze around a 42 logo set in its centre, and a breadth-first search finds the shortest way through.',
        'Ships as a reusable mazegen package, with config files, seeds for reproducible mazes and a coloured terminal renderer. Validated at 110/100.',
      ],
    },
    {
      repo: 'dcheng093/Call-Me-Maybe',
      title: 'Call Me Maybe',
      date: '2026-08',
      tag: '42 project',
      ongoing: true,
      demo: 'callMe',
      paragraphs: [
        'Function calling with a small local language model (Qwen3-0.6B): a request like "What is the sum of 2 and 3?" becomes a JSON call to fn_add_numbers.',
        "Instead of asking the model nicely for JSON, a trie-based grammar masks every next token that would break the schema, so the output is always a valid call, then it's validated against the function definitions.",
      ],
    },
    {
      repo: 'dcheng093/the-descent',
      title: 'The Descent',
      date: '2026-10',
      tag: 'side project',
      demo: 'descent',
      paragraphs: [
        'A 2D top-down horror game in DragonRuby (Ruby). Explore a monastery and solve riddles to find the four relics that unlock the Ritual Gate.',
        "All the while, evade the Witness: an enemy that reads the evidence you leave behind to anticipate where you'll go.",
      ],
    },
  ] as PortfolioProject[],
}

export type IntraKind = 'C' | 'Python' | 'System' | 'Exam'
export type IntraProject = { name: string; kind: IntraKind } & ({ score: number; date: string; status?: undefined } | { status: 'ongoing'; score?: undefined; date?: string })

export type DemoId = 'libft' | 'printf' | 'gnl' | 'pushSwap' | 'timebound' | 'maze' | 'callMe' | 'descent'
export type PortfolioProject = {
  repo: string
  title: string
  date: string
  tag: '42 project' | 'side project'
  ongoing?: boolean
  demo: DemoId
  paragraphs: string[]
}

/** '2026-05' → 'May 2026' */
export const monthYear = (date: string) => {
  const [y, m] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
