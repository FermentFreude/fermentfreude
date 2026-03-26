import { Suspense } from 'react'
import type { Metadata } from 'next'
import { VoucherSuccessClient } from './VoucherSuccessClient'

export const metadata: Metadata = {
  title: 'Gutschein erfolgreich! | FermentFreude',
  description: 'Dein Geschenkgutschein wurde erstellt.',
  robots: { index: false },
}

export default function VoucherSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-ff-gold-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-sans text-body text-ff-gray-text">Wird geladen…</p>
          </div>
        </div>
      }
    >
      <VoucherSuccessClient />
    </Suspense>
  )
}
