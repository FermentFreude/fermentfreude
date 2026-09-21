'use client'

import { accountI18n } from '@/app/(app)/account/i18n'
import { CalendarCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Opens over the confirmation page on arrival so the pickup booking is the
 * first thing the customer deals with.
 *
 * Deliberately shorter than the card underneath: the explanation of when slots
 * are available lives on the page, and repeating it here is what made the two
 * read as the same message twice. The dialog states the action and offers the
 * button — nothing else.
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
        className="absolute inset-0 h-full w-full cursor-default bg-ff-near-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-(--radius-card) bg-ff-near-black px-7 pb-8 pt-10 text-center shadow-2xl sm:px-9">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.pickupModalDismiss}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ff-gold"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <CalendarCheck className="mx-auto h-8 w-8 text-ff-gold" strokeWidth={1.5} />

        <h2
          id="pickup-modal-title"
          className="mt-5 text-balance font-display text-[1.6rem] font-bold leading-tight text-white"
        >
          {t.pickupCtaTitle}
        </h2>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-(--radius-pill) bg-ff-gold px-8 py-3.5 font-display text-base font-bold text-ff-near-black transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ff-gold"
        >
          <CalendarCheck className="h-4.5 w-4.5" />
          {t.pickupCtaButton}
        </a>

        <button
          type="button"
          onClick={dismiss}
          className="mt-4 text-body-sm text-white/50 underline underline-offset-4 transition-colors hover:text-white"
        >
          {t.pickupModalDismiss}
        </button>
      </div>
    </div>
  )
}
