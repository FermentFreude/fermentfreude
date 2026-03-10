'use client'

import { useCallback, useEffect, useState } from 'react'
import type { WorkshopDate, WorkshopDetailData } from './workshop-data'

/* ═══════════════════════════════════════════════════════════════
 *  Booking Confirmation Modal
 *
 *  Shows workshop name, selected date, time, guest count selector,
 *  and total price. Two actions: Cancel and Add to Cart.
 *  Closes on Escape key or overlay click.
 * ═══════════════════════════════════════════════════════════════ */

export function BookingModal({
  workshop,
  selectedDate,
  maxCapacity = 12,
  onClose,
  onConfirm,
  onSelectDifferentDate,
}: {
  workshop: WorkshopDetailData
  selectedDate: WorkshopDate
  maxCapacity?: number
  onClose: () => void
  onConfirm: (guestCount: number) => Promise<void>
  onSelectDifferentDate?: () => void
}) {
  const [guestCount, setGuestCount] = useState(1)
  const [showWarning, setShowWarning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableSpots = selectedDate.availableSpots ?? selectedDate.spotsLeft
  const canBook = guestCount <= availableSpots

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const handleGuestCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(newCount, maxCapacity))
    setGuestCount(clamped)

    // Show warning if trying to book more than available
    if (clamped > availableSpots) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }

  const handleReduceToAvailable = () => {
    setGuestCount(availableSpots)
    setShowWarning(false)
  }

  const handleChooseDifferentDate = () => {
    setShowWarning(false)
    onClose()
    onSelectDifferentDate?.()
  }

  const handleAddToCart = async () => {
    if (!canBook || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirm(guestCount)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setIsSubmitting(false)
      // Keep modal open on error so user can retry
    }
  }

  const totalPrice = workshop.price * guestCount
  const formattedTotal = `${workshop.currency}${totalPrice}.00`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className="relative mx-4 w-full max-w-152 rounded-2xl border border-ff-border-light bg-ff-cream p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-sm p-1 text-ff-near-black/70 transition-colors hover:text-ff-near-black"
          aria-label="Close"
        >
          <svg
            className="size-5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 5l10 10" />
            <path d="M15 5L5 15" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1">
          <h2
            id="booking-modal-title"
            className="font-display text-subheading font-semibold text-ff-near-black"
          >
            {workshop.confirmHeading}
          </h2>
          <p className="text-body text-ff-gray-text-light">{workshop.confirmSubheading}</p>
        </div>

        {/* Booking details card */}
        <div className="mb-4 space-y-3 rounded-xl bg-[#f5f1e8] px-6 py-6 sm:px-8">
          <DetailRow label={workshop.workshopLabel} value={workshop.title} />
          <DetailRow label={workshop.dateLabel} value={selectedDate.date} />
          <DetailRow label={workshop.timeLabel} value={selectedDate.time} />

          {/* Guest count selector */}
          <div className="border-t border-ff-border-light pt-5">
            <div className="mb-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#9a9a9a]">
                Anzahl Personen
              </label>
              <div className="flex items-center justify-center gap-4 rounded-lg bg-white p-4">
                <button
                  onClick={() => handleGuestCountChange(guestCount - 1)}
                  disabled={guestCount <= 1}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-[#e8e4d9] bg-white text-[#555954] transition-all hover:border-[#555954] hover:bg-[#f9f7f3] disabled:opacity-30 disabled:hover:border-[#e8e4d9] disabled:hover:bg-white"
                  aria-label="Reduce guest count"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M5 10h10" />
                  </svg>
                </button>
                <span className="min-w-12 text-center font-display text-3xl font-bold text-[#1a1a1a]">
                  {guestCount}
                </span>
                <button
                  onClick={() => handleGuestCountChange(guestCount + 1)}
                  disabled={guestCount >= maxCapacity}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-[#e8e4d9] bg-white text-[#555954] transition-all hover:border-[#555954] hover:bg-[#f9f7f3] disabled:opacity-30 disabled:hover:border-[#e8e4d9] disabled:hover:bg-white"
                  aria-label="Increase guest count"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M10 5v10M5 10h10" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-sm text-[#9a9a9a]">
                Verfügbar für dieses Datum:{' '}
                <span className="font-bold text-[#555954]">
                  {availableSpots - guestCount} Plätze
                </span>
              </p>
            </div>
          </div>

          {/* Total price */}
          <div className="border-t border-ff-border-light pt-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-body-lg font-medium text-ff-near-black">
                {workshop.totalLabel}
              </span>
              <span className="font-display text-subheading font-medium text-ff-near-black">
                {formattedTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Warning if trying to book more than available */}
        {showWarning && (
          <div className="mb-6 rounded-xl border-2 border-yellow-500/30 bg-yellow-50 px-5 py-4">
            <p className="mb-3 text-body font-medium text-ff-near-black">
              ⚠️ Sie möchten {guestCount} Plätze buchen, aber nur {availableSpots} sind verfügbar.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleReduceToAvailable}
                className="rounded-full bg-ff-near-black px-5 py-2 font-display text-body-sm font-medium text-white transition-colors hover:bg-ff-near-black/80"
              >
                Auf {availableSpots} reduzieren
              </button>
              {onSelectDifferentDate && (
                <button
                  onClick={handleChooseDifferentDate}
                  className="rounded-full border border-ff-border-light px-5 py-2 font-display text-body-sm font-medium text-ff-near-black transition-colors hover:bg-ff-warm-gray"
                >
                  Anderes Datum wählen
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-(--radius-pill) border border-ff-border-light px-6 py-3 font-display text-body font-medium text-ff-near-black transition-colors hover:bg-[#f5f1e8] disabled:opacity-50"
          >
            {workshop.cancelLabel}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!canBook || isSubmitting}
            className="rounded-(--radius-pill) bg-[#c1c1c1] px-8 py-3 font-display text-body font-medium text-ff-near-black transition-colors hover:bg-[#b3b3b3] disabled:opacity-50 disabled:hover:bg-[#c1c1c1]"
          >
            {isSubmitting ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Row ─────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body text-ff-gray-text-light">{label}</span>
      <span className="font-display text-body font-medium text-ff-near-black">{value}</span>
    </div>
  )
}
