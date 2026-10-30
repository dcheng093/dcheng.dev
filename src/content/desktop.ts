// Words for Daniel's Desktop (/desktop). Daniel's voice; edit freely.
import { assets, type Slot } from './assets'
import { daniel } from './daniel'

export const drives = [
  { letter: 'A:', name: '3½ Floppy', detail: 'Empty. Like my fridge.' },
  { letter: 'C:', name: 'DANIEL (C:)', detail: '98% full. 97% of that is screenshots of my Aimlabs scores.' },
  { letter: 'D:', name: "Now That's What I Call Daniel Vol. 42", detail: 'CD-ROM. Skips on track 3 (the good one).' },
  { letter: 'E:', name: 'USB Stick (unlabelled)', detail: 'Found in a 42 cluster. Contains one file: libft_but_better.c. It is not better.' },
]

export const recycled = [
  'homework_FINAL_final_v7_REAL.c',
  'norminette_appeal_letter.txt',
  'my_mixtape (unreleased).mid',
  'ranked_replays_where_i_lost.zip',
  'diet_plan.doc',
  'feelings.exe',
]

export const restoreErrors = [
  'Cannot restore file: it is in use by Daniel.',
  'Restore failed. This file has been deleted for your own protection.',
  'Error 42: The file does not want to come back.',
  'feelings.exe could not be restored. Please try again never.',
]

export const diaryStart = `dear diary,

today i opened notepad. this is notepad. hi notepad.

(this diary saves itself. type anything. nobody will ever see it except you, on this computer.)
`

// ——— The filesystem behind My Computer ———
// Paths are the names joined with backslashes, drives first: C:\SCHOOL\42. Anything marked TODO(daniel) is a
// placeholder in Daniel's voice waiting for the real thing.

export type FsKind = 'drive' | 'folder' | 'txt' | 'img' | 'link' | 'exe' | 'audio'
export type FsNode = {
  name: string
  kind: FsKind
  children?: FsNode[]
  /** A txt's contents; an exe's error message; a drive's one-line description. */
  text?: string
  /** An img's picture. */
  slot?: Slot
  /** A link's page on the site. */
  to?: string
  /** An audio file's URL. */
  src?: string
  /** Only with View → Show hidden files. */
  hidden?: boolean
  /**
   * Password-protected. What's inside is sealed (src/sealed/hunt.json, id `seal`) and only exists once the right
   * answer opens it, so the folder's files and its password are nowhere in the bundle.
   */
  lock?: { seal: string; hint: string }
  /** The end of the hunt (only ever inside a sealed folder): running it plays the ending. Carries the phrase to send. */
  ending?: { phrase: string }
  /** Turns up on this visit (browser session) and every one after. */
  fromVisit?: number
  /** Only there 10pm–5am. */
  nightOnly?: boolean
  /** Only there on this date, 'MM-DD'. */
  onDate?: string
}

const txt = (name: string, text: string, o: Partial<FsNode> = {}): FsNode => ({ name, kind: 'txt', text, ...o })
const img = (name: string, slot: Slot, o: Partial<FsNode> = {}): FsNode => ({ name, kind: 'img', slot, ...o })
const lnk = (name: string, to: string, o: Partial<FsNode> = {}): FsNode => ({ name, kind: 'link', to, ...o })
const wav = (name: string, src: string, o: Partial<FsNode> = {}): FsNode => ({ name, kind: 'audio', src, ...o })
const exe = (name: string, text: string, o: Partial<FsNode> = {}): FsNode => ({ name, kind: 'exe', text, ...o })
const dir = (name: string, children: FsNode[], o: Partial<FsNode> = {}): FsNode => ({ name, kind: 'folder', children, ...o })
/** A locked folder: empty until its seal is opened. */
const locked = (name: string, seal: string, hint: string, o: Partial<FsNode> = {}): FsNode => dir(name, [], { lock: { seal, hint }, ...o })

/**
 * Hints the Object Dex hands out as you catch its specimens: a second way into the side branches' locked folders.
 * (Never the passwords themselves: those are sealed.)
 */
export const DEX_MILESTONES = [
  { pct: 25, folder: 'C:\\MY DOCUMENTS\\private', hint: 'Its hint is written backwards through the alphabet. A is Z, B is Y.' },
  { pct: 50, folder: 'C:\\GAMES\\replays_i_won', hint: 'A picture can keep talking after it ends. Open replay_001.jpg in something that reads bytes, not pixels.' },
  { pct: 75, folder: 'D:\\BONUS TRACK', hint: 'Some sounds are meant to be seen. Put track_3_raw.wav through a spectrogram.' },
  { pct: 100, folder: 'C:\\DANIEL', hint: 'Every specimen carries an old letter. Only those who have heard the song with no name can see them.' },
] as const

const LETTERS = [
  [1, 'hi. you found my mail folder. there is one letter in here.\n\ncome back another day. there might be more.\n\n- daniel'],
  [2, 'oh you came back. ok.\n\nhere is a fact: the kettle in the kettle shrine is a real kettle. i have it. it is on right now.\n\n- daniel'],
  [3, 'third visit. you are now a regular. regulars get a tip:\n\nthings come out at night on this website. i am not saying what. stay up late.\n\n- daniel'],
  [5, 'five visits. at this point you have spent more time on my website than i have.\n\nthe floppy drive (A:) might work now. try it.\n\n- daniel'],
  [8, 'eight. i made you something: nothing. it is in the recycle bin. (it is not.)\n\nhave you tried right... no. there is no right click. sorry.\n\nhave you tried View > Show hidden files though. some drives are less empty than they look.\n\n- daniel'],
  [13, 'thirteen visits. unlucky for some. lucky for the goose.\n\nLook, if you have not met the goose yet: keep clicking things.\nIn the dex, the cards with a moon only come out late.\nSome of the music has no name. that one is not mine.\nTurn it up. count the beeps.\nEverything here means something. even this letter.\nNo, especially this letter.\n\n- daniel'],
  [21, 'twenty-one. ok you are actually my best friend now. i dont know who you are but tell me you saw this to claim my best friend voucher\n\n.\n\n- daniel'],
] as const

/** The visits a new letter turns up on (the return-visit note says so). */
export const MAIL_VISITS: readonly number[] = LETTERS.map(([visit]) => visit)

export const FILESYSTEM: FsNode[] = [
  {
    name: 'A:',
    kind: 'drive',
    text: drives[0].detail,
    // Empty (so "not ready") until a later visit.
    children: [txt('floppy_from_the_past.txt', 'this floppy has been in the drive since 1998.\n\nit contains: this file.\n\nthat is all a floppy can hold if you write this much.', { fromVisit: 5 })],
  },
  {
    name: 'C:',
    kind: 'drive',
    text: drives[1].detail,
    children: [
      dir('SCHOOL', [
        dir('42', [
          txt('libft_notes.txt', 'ft_strlen: counts until it finds a 0. like me at the gym.\nft_split: works. do not ask how. do not look at it.\nft_memmove: memcpy but it cares about your feelings.'),
          txt('norminette.log', 'Error: TOO_MANY_LINES      (line 26)\nError: MISALIGNED_VAR_DECL (line 3)\nError: NO_NEWLINE_EOF     (line 1)\nError: SPACE_REPLACE_TAB  (everywhere)\n\nNorme: KO\n\n(the file was 4 lines long)'),
          txt('push_swap_moves.txt', 'pb\npb\npa\nra\nrra\npb\n...\n(701 moves. the limit is 700. we do not talk about it.)'),
          txt('get_next_line.c', 'char\t*get_next_line(int fd)\n{\n\t// it gets the next line.\n\t// sometimes it gets the line after that.\n\t// once it got a line from a different file.\n}'),
          locked('exam_answers', 'exam', 'The answer to life, the universe, and everything.'),
          lnk('segfault shrine.lnk', '/shrine/segfault'),
          lnk('norminette shrine.lnk', '/shrine/norminette'),
        ]),
        txt('timetable.txt', 'MON  code\nTUE  code\nWED  code, segfault\nTHU  code\nFRI  evaluate someone, get evaluated, cry\nSAT  ranked\nSUN  ranked (recovery)'),
      ]),
      dir('GAMES', [
        txt('ranks.txt', 'TF2 ........ top 1 MGE worldwide\nValorant ... top 3200 APAC\nCS2 ........ global elite\nApex ....... diamond in 50 hours\nAimlabs .... grandmaster 1, top 700 of 6 million'),
        img('setup.jpg', assets.hobbies[1]),
        locked('ranked', 'ranked', 'Something on the virus scan page has been trying to tell you this. In binary.'),
        img('replay_001.jpg', { src: '/me/replay_001.jpg', w: 400, h: 300, label: 'a replay' }),
        locked('replays_i_won', 'replays', 'The replay is in the picture. Look past its end.'),
        lnk('arcade.lnk', '/arcade'),
      ]),
      dir('MY DOCUMENTS', [
        txt('foods_ranked.txt', `${daniel.foods.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n(the list is final. the list has always been final.)`),
        img('me.jpg', assets.headshot),
        img('me_again.jpg', assets.misc[4]),
        txt('mice.txt', 'MY PERSONAL MOUSE RANKING\n\nmouse #1 VXE MAD R (really lightweight and nice switches)\nmouse #2 EWEADN S9 Ultra (big and fits my hand, but 60 grams... removed the battery for less weight)\nmouse #3 EGG OP1 8k (small but amazing, warped base though and cannot be used on glasspad)\nmouse #4 Attack Shark R5 Ultra (switches wobble a lot and have tons of post-travel)\n mouse #5 VXE R1 SE+ (amazing budget option, feels more premium than 100 dollar mice)\nmouse #6 Logitech G502 Hero (brick but comfortable asf)\nmouse #7 Logitech G Pro X Superlight (really expensive and a potato-like shape)'),
        locked('private', 'private', 'zgyzhs: gsv nvolm dsl dzgxsvh blf.'),
        lnk('sticker book.lnk', '/stickers'),
      ]),
      dir('MAIL', LETTERS.map(([visit, text], i) => txt(`letter_0${i + 1}.txt`, text, i ? { fromVisit: visit } : {}))),
      dir('NIGHT', [
        txt('dreams.txt', 'for some reason the 2 times i had a "false awakening" was in sunway. while i was staying in a room, not big enough for me to even stretch my arms out, i experienced this weird dream where i would notice something off around the place. i would then hear a scream and be "woken up" again, only to keep looping through this until i went mad. the other time was in 42, all of their faces were melting, the layout of the building kept changing, all i heard was whispers.'),
        txt('why_are_you_up.txt', 'it is late. go to sleep.\n\n(after you have found the night objects. they only come out now.)'),
      ], { nightOnly: true }),
      dir('EVENTS', [
        txt('halloween.txt', 'happy halloween. the skull on the segfault shrine is real. the pointer was dangling.', { onDate: '10-31' }),
        txt('april_fools.txt', 'this file is not here.', { onDate: '04-01' }),
        txt('new_year.txt', 'new year, same mouse count (plus one).', { onDate: '01-01' }),
        txt('nothing_today.txt', 'nothing is happening today. check back on a special day.'),
      ]),
      locked('DANIEL', 'daniel', 'A word, then a number. Both are found in the dark.'),
      txt('desktop.ini', '[.ShellClassInfo]\nIconResource=daniel.ico\nVibe=immaculate', { hidden: true }),
      txt('Thumbs.db', 'thumbs: 👍👍\n(this is what Thumbs.db has always been)', { hidden: true }),
      txt('.secret', 'you turned on hidden files. nice.\n\nhint: the ranked folder password is hiding in plain sight on /scan. it is wearing 1s and 0s.', { hidden: true }),
    ],
  },
  {
    name: 'D:',
    kind: 'drive',
    text: drives[2].detail,
    children: [
      txt('TRACKS.txt', "1. Intro (Kettle Boiling)\n2. System Default\n3. THE GOOD ONE (skips)\n4. Push Swap (Club Mix)\n5. Norminette Says No\n6. Outro (Kettle Clicks Off)"),
      lnk('track 3 (the good one).lnk', '/radio'),
      wav('track_3_raw.wav', '/me/track_3_raw.wav'),
      locked('BONUS TRACK', 'bonus', "Track 3 skips because something is written in it. Look at track_3_raw.wav. Don't listen to it."),
      exe('AUTORUN.EXE', 'AUTORUN.EXE wants to install 4 toolbars. Daniel 95 said no.'),
      locked('HIDDEN TRACK', 'hidden-track', 'Listen to the song with no name. Then listen harder.'),
    ],
  },
  {
    name: 'E:',
    kind: 'drive',
    text: drives[3].detail,
    children: [
      txt('libft_but_better.c', '#include "libft.h"\n\nsize_t\tft_strlen_but_better(const char *s)\n{\n\treturn (ft_strlen(s));\n}\n\n/* it is not better. */'),
      img('found_in_cluster.jpg', assets.misc[7]),
      locked('RECYCLED', 'recycled', 'Five words, taken from his own files.', { hidden: true }),
    ],
  },
]

/** Restored from the bin (only works at night): where feelings.exe goes. */
export const restoredFeelings = txt('feelings.txt', 'you restored my feelings.\n\nthey were in the bin because i thought i did not need them. turns out i do. thanks.\n\n- daniel, at night')
