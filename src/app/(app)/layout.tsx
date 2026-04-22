import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { ElasticCursor } from '@/components/ElasticCursor'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { OpeningPopups } from '@/components/OpeningPopups'
import { SplashScreen } from '@/components/SplashScreen'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getLocale } from '@/utilities/getLocale'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import './globals.css'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <InitTheme />
        <link rel="stylesheet" href="https://use.typekit.net/dtk7kir.css" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />

        {/* Google Tag Manager — initialise dataLayer before GTM script loads */}
        {GTM_ID && (
          <Script id="gtm-init" strategy="beforeInteractive">
            {`window.dataLayer = window.dataLayer || [];`}
          </Script>
        )}
      </head>
      <body suppressHydrationWarning={true}>
        {/* Google Tag Manager — main script (loads after page is interactive) */}
        {GTM_ID && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}

        {/* Google Tag Manager — noscript fallback (for browsers without JS) */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        )}

        <Providers>
          <div id="site-cursor" style={{ display: 'contents' }}><ElasticCursor /></div>
          <div id="site-splash" style={{ display: 'contents' }}><SplashScreen /></div>
          <div id="site-admin-bar" style={{ display: 'contents' }}><AdminBar /></div>
          <LivePreviewListener />

          {/* Skip-to-main-content link for keyboard / screen-reader users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10000 focus:rounded-md focus:bg-ff-charcoal focus:px-4 focus:py-2 focus:text-white focus:outline-none"
          >
            Skip to main content
          </a>

          <div id="site-header" style={{ display: 'contents' }}><Header /></div>
          <OpeningPopups locale={locale} />
          <main id="main-content">{children}</main>
          <div id="site-footer" style={{ display: 'contents' }}><Footer /></div>
        </Providers>

        {/* Vercel Analytics — cookieless, GDPR-compliant */}
        <Analytics />
        {/* Vercel Speed Insights — Core Web Vitals monitoring */}
        <SpeedInsights />
      </body>
    </html>
  )
}
