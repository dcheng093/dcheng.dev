import { useEffect, useState } from 'react'
import { openPage, type SealedPage } from '../lib/hunt'

/** What's at an unknown address: still deriving the key, a sealed page, or nothing (so: the crash screen). */
export type SealedLookup = { status: 'opening' } | { status: 'open'; page: SealedPage } | { status: 'none' }

/**
 * Tries to open a sealed page at `pathname` (only when `active`: the catch-all route matched). The address is the
 * key, so the only way to know a page is there is to already know where it is.
 */
export function useSealedPage(pathname: string, active: boolean): SealedLookup {
  const [found, setFound] = useState<{ path: string; page: SealedPage | null } | null>(null)
  useEffect(() => {
    if (!active) return
    let live = true
    void openPage(pathname).then((page) => live && setFound({ path: pathname, page }))
    return () => {
      live = false
    }
  }, [pathname, active])
  if (!active || (found && found.path === pathname && !found.page)) return { status: 'none' }
  return found?.path === pathname && found.page ? { status: 'open', page: found.page } : { status: 'opening' }
}
