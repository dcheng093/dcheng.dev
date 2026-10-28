import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useStored } from '../../hooks/useLocalStorage'
import { DEFAULT_SETTINGS, mergeSettings, type Settings } from '../../lib/settings'
import { useCursor } from './cursors'
import { SettingsContext } from './settingsState'

/**
 * Stores the Control Panel's settings and applies the site-wide ones: the theme, Comic Sans Mode and the cursor
 * are attributes on <html> that index.css styles. `active` is false on /boring, which stays boring.
 */
export function SettingsProvider({ active = true, children }: { active?: boolean; children: ReactNode }) {
  const [stored, setStored] = useStored<Settings>('settings', DEFAULT_SETTINGS)
  const settings = useMemo(() => mergeSettings(stored), [stored])
  const update = useCallback((patch: Partial<Settings>) => setStored((s) => ({ ...mergeSettings(s), ...patch })), [setStored])
  const cursor = useCursor(settings.cursor)

  useEffect(() => {
    const html = document.documentElement
    const on = active
    toggle(html, 'theme', on && settings.theme !== 'classic' ? settings.theme : null)
    toggle(html, 'font', on && settings.comicSans ? 'comic' : null)
    toggle(html, 'cursor', on && cursor ? settings.cursor : null)
    if (on && cursor) html.style.setProperty('--site-cursor', cursor)
    else html.style.removeProperty('--site-cursor')
  }, [active, settings.theme, settings.comicSans, settings.cursor, cursor])

  // Comic Neue stands in where Comic Sans isn't installed (Linux, Android); only fetched once someone wants it.
  useEffect(() => {
    if (active && settings.comicSans) void import('@fontsource/comic-neue/700.css')
  }, [active, settings.comicSans])

  const api = useMemo(() => ({ settings, update }), [settings, update])
  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>
}

function toggle(el: HTMLElement, key: string, value: string | null) {
  if (value === null) delete el.dataset[key]
  else el.dataset[key] = value
}
