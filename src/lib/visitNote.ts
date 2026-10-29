import { CALENDAR } from '../content/calendar'
import { MAIL_VISITS } from '../content/desktop'

/** What today's note says, if anything: a special day beats new mail. Visit 1's letter needs no announcing. */
export function visitNote(visit: number, today: string): { title: string; text: string; link: string } | null {
  if (CALENDAR[today]) return { title: 'Today is special', text: CALENDAR[today], link: 'Open C:\\EVENTS' }
  if (visit > 1 && MAIL_VISITS.includes(visit)) return { title: "You've got mail!", text: `Welcome back! This is visit #${visit}. You've got mail on Daniel's Desktop (C:\\MAIL).`, link: 'Check the mail' }
  return null
}
