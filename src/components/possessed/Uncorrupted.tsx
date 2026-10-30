import type { ReactNode } from 'react'
import { UncorruptedCtx } from '../../lib/uncorrupted'

/** Keeps its contents readable while the site is possessed (see src/lib/uncorrupted.ts). */
export function Uncorrupted({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <UncorruptedCtx.Provider value>
      <div data-uncorrupted="" className={className ?? 'contents'}>
        {children}
      </div>
    </UncorruptedCtx.Provider>
  )
}
