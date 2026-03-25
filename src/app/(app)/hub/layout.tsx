import type { ReactNode } from 'react'

export const metadata = {
  title: 'FermentFreude Hub',
  description: 'Documentation and knowledge base for FermentFreude editors and developers.',
  robots: { index: false, follow: false },
}

export default function HubLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Hide site header & footer on hub pages */}
      <style>{`
        body > div > header,
        body > div > div > header,
        #main-content ~ footer,
        body > div > footer,
        body > div > div > footer,
        [class*="AdminBar"],
        [class*="SplashScreen"] { display: none !important; }
        #main-content { margin-top: 0 !important; padding-top: 0 !important; }
      `}</style>
      {children}
    </>
  )
}
