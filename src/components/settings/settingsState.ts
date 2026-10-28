import { createContext, useContext } from 'react'
import { DEFAULT_SETTINGS, type Settings } from '../../lib/settings'

export type SettingsApi = {
  settings: Settings
  /** Changes some settings (and saves them for next time). */
  update: (patch: Partial<Settings>) => void
}

// Without a provider (unit tests of single components) the site behaves as it always did.
export const SettingsContext = createContext<SettingsApi>({ settings: DEFAULT_SETTINGS, update: () => {} })

export const useSettings = () => useContext(SettingsContext)
