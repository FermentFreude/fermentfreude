import type { Metadata } from 'next'
import { Suspense } from 'react'

import { VoucherCheckoutClient } from './VoucherCheckoutClient'

export const metadata: Metadata = {
  title: 'Gutschein kaufen | FermentFreude',
  description: 'Bezahle deinen Geschenkgutschein sicher mit Karte.',
  robots: { index: false },
}

export default function VoucherCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-ff-gold-accent border-t-transparent rounded-full mx-auto mb-4" />
          </div>
        </div>
      }
    >
      <VoucherCheckoutClient />
    </Suspense>
  )
}
