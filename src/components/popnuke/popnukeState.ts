import { createContext, useContext } from 'react'

export type PopnukeApi = {
  installed: boolean
  /** Pop-ups blocked since install. */
  blocked: number
  install: () => void
  uninstall: () => void
  countBlocked: () => void
  /** Pop-ups closed this visit, and whether the POPNUKE ad has had its turn (it then joins the rotation). */
  closed: number
  noteClosed: () => void
  adShown: boolean
  markAdShown: () => void
}

export const PopnukeContext = createContext<PopnukeApi>({
  installed: false,
  blocked: 0,
  install: () => {},
  uninstall: () => {},
  countBlocked: () => {},
  closed: 0,
  noteClosed: () => {},
  adShown: false,
  markAdShown: () => {},
})

export const usePopnuke = () => useContext(PopnukeContext)
