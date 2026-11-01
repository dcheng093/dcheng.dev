import { matchRoutes, type RouteObject } from 'react-router-dom'

/**
 * Starts loading a page's code the moment the visitor shows intent (pointer over a link, focus on it, a finger on it),
 * so by the click it's already here: the only wait left is the site's own dial-up. Each page is fetched once.
 */
export function prefetchOnIntent(routes: RouteObject[]) {
  const done = new Set<string>()
  const onIntent = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a) return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin || done.has(url.pathname)) return
    done.add(url.pathname)
    for (const m of matchRoutes(routes, url.pathname) ?? []) {
      const lazy = m.route.lazy
      if (typeof lazy === 'function') void (lazy as () => Promise<unknown>)()
    }
  }
  for (const type of ['pointerover', 'focusin', 'touchstart'] as const) document.addEventListener(type, onIntent, { passive: true })
}
