import { useMemo, type ReactNode } from 'react'
import { useStored } from '../../hooks/useLocalStorage'
import { PopnukeContext } from './popnukeState'

/**
 * One source of truth for POPNUKE, shared by the pop-up ambush, the Virus Alert, the tray badge and the
 * POPNUKE page. Installing is saved for good (this browser); the closed-pop-up count is per visit.
 */
export function PopnukeProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useStored('popnuke', false)
  const [blocked, setBlocked] = useStored('popnukeBlocked', 0)
  const [closed, setClosed] = useStored('popnukeClosed', 0, 'session')
  const [adShown, setAdShown] = useStored('popnukeAdShown', false, 'session')
  const api = useMemo(
    () => ({
      installed,
      blocked,
      install: () => setInstalled(true),
      uninstall: () => {
        setInstalled(false)
        setBlocked(0)
      },
      countBlocked: () => setBlocked((n) => n + 1),
      closed,
      noteClosed: () => setClosed((n) => n + 1),
      adShown,
      markAdShown: () => setAdShown(true),
    }),
    [installed, blocked, closed, adShown, setInstalled, setBlocked, setClosed, setAdShown],
  )
  return <PopnukeContext.Provider value={api}>{children}</PopnukeContext.Provider>
}
