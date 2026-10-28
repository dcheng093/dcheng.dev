/**
 * POPNUKE, the pop-up blocker that actually works (on this site). Pure rules, unit-tested:
 * when the ad for it turns up, and what each tick of the random pop-up ambush does.
 */
export const AD_AFTER_CLOSES = 3

/** The ad appears once a visitor has closed enough pop-ups to be annoyed (and only if they haven't got it). */
export const shouldShowAd = (closed: number, adShown: boolean, installed: boolean) => !installed && !adShown && closed >= AD_AFTER_CLOSES

export type AmbushOutcome = 'blocked' | 'popnuke-ad' | 'normal'

/** One tick of the random ambush: blocked if installed, the POPNUKE ad if annoyed, otherwise a normal pop-up. */
export const ambush = (installed: boolean, closed: number, adShown: boolean): AmbushOutcome =>
  installed ? 'blocked' : shouldShowAd(closed, adShown, installed) ? 'popnuke-ad' : 'normal'
