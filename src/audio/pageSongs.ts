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

export const pageSong = (pathname: string): MixId | undefined => PAGE_SONGS[pathname.toLowerCase().replace(/\/+$/, '') || '/']
