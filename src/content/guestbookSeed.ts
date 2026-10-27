export type GuestEntry = {
  id: string
  name: string
  from: string
  date: string
  message: string
  foundVia: string
}

export const FOUND_VIA = ['webring', 'my dentist told me', 'a horse', 'I live here now', 'popup (it would not close)', 'search engine (lost)'] as const

export const guestbookSeed: GuestEntry[] = [
  { id: 's1', name: 'xX_ShadowKettle_Xx', from: 'The Kettle Kingdom', date: '03/14/1999', foundVia: 'webring', message: 'nice site. i am a kettle. please sign my guestbook back (i do not have one)' },
  { id: 's2', name: 'Grandma', from: 'AOL', date: '11/02/2001', foundVia: 'popup (it would not close)', message: 'DANIEL WHY IS YOUR FACE ON A CAR. CALL ME. LOVE GRANDMA. HOW DO I TURN OFF CAPITALS' },
  { id: 's3', name: 'the horse', from: 'the field', date: '07/07/2007', foundVia: 'a horse', message: 'neigh' },
  { id: 's4', name: 'Webmaster Steve', from: 'Steve’s Homepage of Links', date: '05/20/1998', foundVia: 'webring', message: 'Cool page!!! Added you to my links page under "Daniels". You are the only one.' },
  { id: 's5', name: 'norminette', from: 'line 26', date: '09/01/2023', foundVia: 'I live here now', message: 'Error: TOO_MANY_LINES. This guestbook entry is too long and I have decided to' },
  { id: 's6', name: 'a satisfied customer', from: 'Dealership lot 4', date: '12/25/2004', foundVia: 'search engine (lost)', message: 'Leased one Daniel. He works great. He keeps talking about pointers. 5 stars.' },
  { id: 's7', name: '~*~angel~*~', from: 'cloud 9 (the free one)', date: '02/14/2000', foundVia: 'webring', message: '~*~*~ luv ur site ~*~*~ ur gifs r so kewl ~*~*~ the tooth has shoes ~*~*~' },
  { id: 's8', name: 'the 1,000,000th visitor', from: 'still waiting', date: '01/01/2000', foundVia: 'popup (it would not close)', message: 'I clicked claim prize 400 times. Nothing happened. Ten stars.' },
  { id: 's9', name: 'Valgrind', from: '/usr/bin', date: '04/04/2024', foundVia: 'I live here now', message: '42 bytes in 1 blocks are definitely lost in loss record 1 of 1' },
  { id: 's10', name: 'anonymous coward', from: 'behind you', date: '10/31/2003', foundVia: 'my dentist told me', message: 'first' },
  { id: 's11', name: 'Daniel', from: 'here', date: 'today', foundVia: 'I live here now', message: 'testing testing is this thing on' },
]
