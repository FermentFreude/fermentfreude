import type { ReactNode } from 'react'

export const metadata = {
  title: 'FermentFreude Hub',
  description: 'Documentation and knowledge base for FermentFreude editors and developers.',
  robots: { index: false, follow: false },
}

export default function HubLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
