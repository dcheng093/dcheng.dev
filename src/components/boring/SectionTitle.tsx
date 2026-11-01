import type { ReactNode } from 'react'

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-10 text-center font-marker text-4xl text-white sm:text-5xl">{children}</h2>
}
