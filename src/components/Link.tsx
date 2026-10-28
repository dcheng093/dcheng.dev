import { forwardRef, type ComponentProps } from 'react'
import { Link as RouterLink } from 'react-router-dom'

/**
 * The router's Link, but page changes cross-fade (View Transitions) under the Win95 blinds. Browsers without
 * View Transitions just get the blinds.
 */
export const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof RouterLink>>(function Link({ viewTransition = true, ...props }, ref) {
  return <RouterLink ref={ref} viewTransition={viewTransition} {...props} />
})
