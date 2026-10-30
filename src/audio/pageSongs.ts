import type { MixId } from './tracks'

/**
 * Each page's theme song. Arriving on a page switches to it unless the visitor has 📌 locked their own pick.
 * /radio is deliberately missing: that's where you choose for yourself.
 */
export const PAGE_SONGS: Record<string, MixId> = {
  '/': 'system-default',
  '/dealership': 'dealership-jingle',
  '/shrine/kettle': 'kettle-blues',
  '/shrine/segfault': 'segfault-sonata',
  '/shrine/battlestation': 'insert-coin',
  '/shrine/peripherals': 'pixel-pusher',
  '/shrine/norminette': 'norminette-nightmare',
  '/shrine/push-swap': 'segfault-sonata',
  '/shrine/horses': 'dealership-jingle',
  '/shrine/teeth': 'elevator',
  '/shrine/chiikawa': 'guestbook-waltz',
  '/guestbook': 'guestbook-waltz',
  '/under-construction': 'dial-up',
  '/you-won': 'nightcore',
  '/casino': 'nightcore',
  '/checkout': 'norminette-nightmare',
  '/scan': 'norminette-nightmare',
  '/survey': 'elevator',
  '/work-from-home': 'elevator',
  '/leave': 'lofi-debug',
  '/arcade': 'insert-coin',
  '/blinkie-maker': 'pixel-pusher',
  '/oracle': 'steam-prophecy',
  '/desktop': 'startup-funk',
  '/stickers': 'sticker-pop',
  '/dex': 'pixel-pusher',
  '/popnuke': 'nuke-it',
  // Control Panel music: the sound of fiddling with settings at 2am.
  '/settings': 'lofi-debug',
}

const key = (pathname: string) => pathname.toLowerCase().replace(/\/+$/, '') || '/'
export const pageSong = (pathname: string): MixId | undefined => PAGE_SONGS[key(pathname)]

/** The possessed site's songs, page by page (src/audio/synth.ts, `possessed: true`). Anywhere else: the quiet one. */
export const POSSESSED_PAGE_SONGS: Record<string, MixId> = {
  '/': 'p-lullaby',
  '/dealership': 'p-carousel',
  '/guestbook': 'p-heartbeat',
  '/under-construction': 'p-knocking',
  '/you-won': 'p-carousel',
  '/checkout': 'p-procession',
  '/scan': 'p-static-hymn',
  '/casino': 'p-carousel',
  '/survey': 'p-heartbeat',
  '/work-from-home': 'p-knocking',
  '/arcade': 'p-music-box',
  '/desktop': 'p-quiet',
  '/oracle': 'p-static-hymn',
  '/blinkie-maker': 'p-music-box',
  '/stickers': 'p-lullaby',
  '/dex': 'p-quiet',
  '/popnuke': 'p-procession',
  '/settings': 'p-quiet',
  '/leave': 'p-heartbeat',
  '/shrine/chiikawa': 'p-lullaby',
  '/shrine/battlestation': 'p-knocking',
  '/shrine/peripherals': 'p-static-hymn',
  '/shrine/segfault': 'p-static-hymn',
  '/shrine/norminette': 'p-procession',
  '/shrine/push-swap': 'p-knocking',
  '/shrine/kettle': 'p-music-box',
  '/shrine/horses': 'p-carousel',
  '/shrine/teeth': 'p-heartbeat',
}
export const possessedPageSong = (pathname: string): MixId => POSSESSED_PAGE_SONGS[key(pathname)] ?? 'p-quiet'
