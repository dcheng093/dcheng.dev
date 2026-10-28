import { createContext, useContext } from 'react'

export type PopupVariant = 'normal' | 'multiply' | 'dodge'

export type Popup = {
  key: number
  /** An ad id from content/ads, or a special id like "business-card". */
  content: string
  variant: PopupVariant
  /** Position as fractions of the viewport so it survives resizes/orientation changes. */
  fx: number
  fy: number
}

export type PopupAction =
  | { type: 'spawn'; content: string; variant: PopupVariant; fx: number; fy: number }
  | { type: 'close'; key: number; rng?: () => number }
  | { type: 'move'; key: number; fx: number; fy: number }
  | { type: 'clear' }

export type PopupState = { popups: Popup[]; nextKey: number }

export const POPUP_CAP = 8

/** Popups that are more than an ad: little fake apps (drawn by SpecialPopup). `auto` ones join the random ambush. */
export const SPECIAL_POPUPS = {
  'business-card': { auto: false },
  'ip-alert': { auto: true },
  download: { auto: true },
  'friend-request': { auto: true },
  'quick-survey': { auto: true },
  'spin-to-win': { auto: true },
  'daniel-cam': { auto: true },
  // POPNUKE's own ad: turns up after the visitor has closed a few pop-ups (then joins the rotation).
  'popnuke-ad': { auto: false },
  // First of the three pop-ups that greet you when you uninstall POPNUKE.
  'welcome-back': { auto: false },
} satisfies Record<string, { auto: boolean }>

export type SpecialId = keyof typeof SPECIAL_POPUPS

export const isSpecial = (content: string): content is SpecialId => Object.hasOwn(SPECIAL_POPUPS, content)

export const initialPopupState: PopupState = { popups: [], nextKey: 1 }

export function popupReducer(state: PopupState, action: PopupAction): PopupState {
  switch (action.type) {
    case 'spawn': {
      if (state.popups.length >= POPUP_CAP) return state
      const { content, variant, fx, fy } = action
      return { popups: [...state.popups, { key: state.nextKey, content, variant, fx, fy }], nextKey: state.nextKey + 1 }
    }
    case 'close': {
      const closing = state.popups.find((p) => p.key === action.key)
      if (!closing) return state
      let next: PopupState = { ...state, popups: state.popups.filter((p) => p.key !== action.key) }
      // Closing a "multiply" popup spawns two plain ones in its place (cap still applies).
      if (closing.variant === 'multiply') {
        const rng = action.rng ?? Math.random
        for (const dx of [-0.08, 0.08]) {
          next = popupReducer(next, {
            type: 'spawn',
            content: closing.content,
            variant: 'normal',
            fx: clamp01(closing.fx + dx + (rng() - 0.5) * 0.05),
            fy: clamp01(closing.fy + 0.06),
          })
        }
      }
      return next
    }
    case 'move':
      return { ...state, popups: state.popups.map((p) => (p.key === action.key ? { ...p, fx: action.fx, fy: action.fy } : p)) }
    case 'clear':
      return { ...state, popups: [] }
  }
}

const clamp01 = (n: number) => Math.min(0.95, Math.max(0, n))

export type PopupApi = {
  open: (content: string, variant?: PopupVariant) => void
  /** Several pop-ups at once (POPNUKE's uninstall revenge); the first can be a specific one. */
  burst: (count: number, first?: string) => void
}

export const PopupContext = createContext<PopupApi>({ open: () => {}, burst: () => {} })
export const usePopups = () => useContext(PopupContext)
