import type { ReactNode } from 'react'

import { HubLocaleProvider } from './HubShell'

export const metadata = {
  title: 'FermentFreude Hub',
  description: 'Documentation and knowledge base for FermentFreude editors and developers.',
  robots: { index: false, follow: false },
}

export default function HubLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Hide site header, footer & chrome on hub pages */}
      <style>{`
        #site-header,
        #site-footer,
        #site-splash { display: none !important; }
        #main-content { margin-top: 0 !important; padding-top: 0 !important; }
      `}</style>
      <HubLocaleProvider>
        {children}
      </HubLocaleProvider>
    </>
  )
}
