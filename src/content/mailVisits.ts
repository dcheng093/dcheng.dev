/**
 * The visits on which a new letter turns up in Daniel's Desktop (C:\MAIL). Kept apart from content/desktop.ts so the
 * visit note, which loads with every page, doesn't pull the whole fake filesystem in with it. A test keeps the two
 * in step.
 */
export const MAIL_VISITS: readonly number[] = [1, 2, 3, 5, 8, 13, 21]
