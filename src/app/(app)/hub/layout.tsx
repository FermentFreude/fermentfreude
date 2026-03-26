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
      {/* Hide site header, footer & chrome on hub pages + restore cursor */}
      <style>{`
        #site-header,
        #site-footer,
        #site-admin-bar,
        #site-splash,
        #site-cursor { display: none !important; }
        #main-content { margin-top: 0 !important; padding-top: 0 !important; }
        .hub-shell, .hub-shell * { cursor: auto !important; }
        .hub-shell a, .hub-shell button, .hub-shell [role="button"] { cursor: pointer !important; }
      `}</style>
      <HubLocaleProvider>
        {children}
      </HubLocaleProvider>
    </>
  )
}
