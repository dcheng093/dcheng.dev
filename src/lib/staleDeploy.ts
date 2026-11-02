// A tab opened before a deploy still asks for the old build's page chunks (/assets/Page-<hash>.js). The new deploy no
// longer has them, and the host answers unknown paths with index.html (wrangler.jsonc, single-page-application), so the
// browser refuses the "module" and the page's lazy import fails. The cure is loading the page again, fresh.

// How each browser words a dynamic import that failed (Chromium, Firefox, Safari), and the MIME refusal itself.
const CHUNK_ERRORS = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Expected a JavaScript',
  'is not a valid JavaScript MIME type',
]

/** Whether `err` is a page's code failing to load (almost always: a deploy happened since this tab opened). */
export function isChunkLoadError(err: unknown) {
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  return CHUNK_ERRORS.some((m) => message.includes(m))
}

const KEY = 'stale-deploy-reload'
/** One reload per this long: if the fresh page fails the same way, it's really broken, and looping won't help. */
export const RELOAD_WINDOW_MS = 10_000

/**
 * Loads the current address again, fresh from the server, unless that was already tried in the last few seconds.
 * A replace, not location.reload(): main.tsx treats a reload as a fresh visit (the enter gate again, fun pages back to
 * the home page), and this visitor was only going somewhere. Returns whether it reloaded.
 */
export function reloadForNewDeploy(now = Date.now(), go = () => location.replace(location.href)) {
  try {
    const last = Number(sessionStorage.getItem(KEY))
    if (last && now - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(KEY, String(now))
  } catch {
    // Blocked storage: no way to tell a second try from the first, so don't risk a loop.
    return false
  }
  go()
  return true
}
