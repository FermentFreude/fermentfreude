import type { ReactNode } from 'react'

export const metadata = {
  title: 'FermentFreude — Wartung / Maintenance',
  robots: { index: false, follow: false },
}

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#faf9f6',
          color: '#1a1a1a',
        }}
      >
        {children}
      </body>
    </html>
  )
}
