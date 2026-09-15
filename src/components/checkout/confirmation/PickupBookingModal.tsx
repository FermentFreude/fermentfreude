'use client'

import { accountI18n } from '@/app/(app)/account/i18n'
import { CalendarCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Opens over the confirmation page on arrival so the pickup booking is the
 * first thing the customer deals with.
 *
 * Dismissal is remembered per order in sessionStorage, so going back to the
 * page (or a re-render) doesn't nag someone who already booked or chose to do
 * it later. The same CTA stays on the page underneath, which is what makes
 * dismissing safe — nothing is lost by closing this.
 */
export function PickupBookingModal({
  url,
  locale,
  orderId,
}: {
  url: string
  locale: 'de' | 'en'
  orderId?: string
}) {
  const t = locale === 'de' ? accountI18n.de : accountI18n.en
  const [open, setOpen] = useState(false)
  const storageKey = `ff-pickup-modal-dismissed:${orderId ?? 'unknown'}`

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = sessionStorage.getItem(storageKey) === '1'
    } catch {
      // Private mode / blocked storage — showing it once is the safe fallback.
    }
    if (!dismissed) setOpen(true)
  }, [storageKey])

  const dismiss = () => {
    setOpen(false)
    try {
      sessionStorage.setItem(storageKey, '1')
    } catch {
      // ignore — worst case it opens again on a later visit
    }
  }

  // Close on Escape, and don't let the page scroll behind the dialog.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pickup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label={t.pickupModalDismiss}
        onClick={dismiss}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50"
      />
      <div className="relative z-10 w-full max-w-md rounded-[--radius-lg] bg-white p-6 sm:p-8 shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.pickupModalDismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-ff-text-muted transition-colors hover:bg-ff-cream hover:text-ff-near-black"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ff-gold">
            <CalendarCheck className="h-7 w-7 text-ff-near-black" />
          </div>
          <h2
            id="pickup-modal-title"
            className="font-display text-2xl font-bold text-ff-near-black"
          >
            {t.pickupCtaTitle}
          </h2>
          <p className="text-body-sm text-ff-gray-text">{t.pickupCtaBody}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[--radius-pill] bg-ff-gold px-8 py-4 font-display text-lg font-bold text-ff-near-black transition-opacity hover:opacity-90"
          >
            <CalendarCheck className="h-5 w-5" />
            {t.pickupCtaButton}
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="text-body-sm text-ff-text-muted underline underline-offset-4 transition-colors hover:text-ff-near-black"
          >
            {t.pickupModalDismiss}
          </button>
        </div>
      </div>
    </div>
  )
}
