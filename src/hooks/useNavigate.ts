import { useCallback } from 'react'
import { useNavigate as useRouterNavigate, type NavigateOptions, type To } from 'react-router-dom'

/** The router's navigate, cross-fading like every Link does (see components/Link). */
export function useNavigate() {
  const navigate = useRouterNavigate()
  return useCallback((to: To, opts?: NavigateOptions) => navigate(to, { viewTransition: true, ...opts }), [navigate])
}
