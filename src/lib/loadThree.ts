type Three = typeof import('../three/mount')

let job: Promise<Three> | null = null

/** Resolves once the page has finished loading and the browser has a quiet moment (at most ~1.5s after load). */
function afterLoadAndIdle() {
  return new Promise<void>((resolve) => {
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 1500 }) : setTimeout(resolve, 800))
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
  })
}

/**
 * The 3D engine (three.js and everything built on it, the biggest download on the site), fetched once and only after
 * the page itself is up: it never competes with the first paint. The objects and worlds just arrive a moment later.
 */
export const loadThree = () => (job ??= afterLoadAndIdle().then(() => import('../three/mount')))
