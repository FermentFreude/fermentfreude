import type { ReactNode } from 'react'

export const metadata = {
  title: 'Fermentfreude Wartung',
  robots: { index: false, follow: false },
}

/**
 * Maintenance screen shell (/wartung). Own <html>, like /maintenance, so it never
 * needs the database or the site header/footer — it must keep working while the
 * rest of the site is being updated. Brand font from Typekit, same as the site.
 */
export default function WartungLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/dtk7kir.css" />
      </head>
      <body style={{ margin: 0, background: '#4B4F4A' }}>{children}</body>
    </html>
  )
}
