import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { ElasticCursor } from '@/components/ElasticCursor'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { SplashScreen } from '@/components/SplashScreen'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getLocale } from '@/utilities/getLocale'
import './globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <InitTheme />
        <link rel="stylesheet" href="https://use.typekit.net/dtk7kir.css" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          <ElasticCursor />
          <SplashScreen />
          <AdminBar />
          <LivePreviewListener />

          {/* Skip-to-main-content link for keyboard / screen-reader users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10000 focus:rounded-md focus:bg-ff-charcoal focus:px-4 focus:py-2 focus:text-white focus:outline-none"
          >
            Skip to main content
          </a>

          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
