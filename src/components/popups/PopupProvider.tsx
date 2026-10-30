import { useCallback, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { ads } from '../../content/ads'
import { useRandomInterval } from '../../hooks/useRandomInterval'
import { pick } from '../../lib/random'
import { useSfx } from '../../audio/audioContext'
import { PopupContext, SPECIAL_POPUPS, initialPopupState, popupReducer, type PopupVariant } from './popupState'
import { PopupWindow } from './PopupWindow'
import { usePopnuke } from '../popnuke/popnukeState'
import { chaosScale } from '../../lib/settings'
import { useSettings } from '../settings/settingsState'
import { ambush } from '../../lib/popnuke'
import { pickAmbush } from '../ads/pickAd'

/** Everything the random ambush can throw: popup-format ads plus the interactive specials. */
const ambushPool = [
  ...ads.filter((a) => a.formats.includes('popup')).map((a) => a.id),
  ...Object.entries(SPECIAL_POPUPS).filter(([, s]) => s.auto).map(([id]) => id),
]

/** Owns every floating window. `auto` turns on the random ambush spawner. */
export function PopupProvider({ auto, children }: { auto: boolean; children: ReactNode }) {
  const [state, dispatch] = useReducer(popupReducer, initialPopupState)
  const sfx = useSfx()

  const open = useCallback(
    (content: string, variant: PopupVariant = 'normal') => {
      sfx('ding')
      dispatch({ type: 'spawn', content, variant, fx: Math.random() * 0.6 + 0.05, fy: Math.random() * 0.5 + 0.08 })
    },
    [sfx],
  )

  const nuke = usePopnuke()
  // What the last ambush was: the sponsor gets about a quarter of them, never two in a row.
  const last = useRef<string | null>(null)
  // Chaos dial: half as many ambushes when calm, twice as many at MAXIMUM.
  const ambushRate = chaosScale(useSettings().settings.chaos).ambushRate
  useRandomInterval(
    () => {
      switch (ambush(nuke.installed, nuke.closed, nuke.adShown)) {
        case 'blocked': // POPNUKE ate it
          return nuke.countBlocked()
        case 'popnuke-ad':
          nuke.markAdShown()
          return open('popnuke-ad')
        case 'normal':
          // Once it has had its turn, the POPNUKE ad is just one of the crowd.
          last.current = pickAmbush(nuke.adShown ? [...ambushPool, 'popnuke-ad'] : ambushPool, last.current)
          return open(last.current, pick<PopupVariant>(['normal', 'normal', 'multiply', 'dodge']))
      }
    },
    auto ? 14_000 / ambushRate : null,
    auto ? 32_000 / ambushRate : null,
  )

  const burst = useCallback(
    (count: number, first?: string) => {
      for (let i = 0; i < count; i++) window.setTimeout(() => open(i === 0 && first ? first : pick(ambushPool)), i * 150)
    },
    [open],
  )
  const api = useMemo(() => ({ open, burst }), [open, burst])

  return (
    <PopupContext.Provider value={api}>
      {children}
      {state.popups.map((p, i) => (
        <PopupWindow
          key={p.key}
          popup={p}
          z={60 + i}
          onClose={() => {
            nuke.noteClosed()
            sfx('error')
            dispatch({ type: 'close', key: p.key })
          }}
          onMove={(fx, fy) => dispatch({ type: 'move', key: p.key, fx, fy })}
        />
      ))}
    </PopupContext.Provider>
  )
}
