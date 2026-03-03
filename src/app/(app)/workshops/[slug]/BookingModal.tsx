'use client'

import { useEffect, useCallback } from 'react'
import type { WorkshopDetailData, WorkshopDate } from './workshop-data'

/* ═══════════════════════════════════════════════════════════════
 *  Booking Confirmation Modal
 *
 *  Shows workshop name, selected date, time, and total price.
 *  Two actions: Cancel and Confirm Booking.
 *  Closes on Escape key or overlay click.
 * ═══════════════════════════════════════════════════════════════ */

export function BookingModal({
  workshop,
  selectedDate,
  onClose,
  onConfirm,
}: {
  workshop: WorkshopDetailData
  selectedDate: WorkshopDate
  onClose: () => void
  onConfirm: () => void
}) {
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

  const formattedTotal = `${workshop.currency}${workshop.price}.00`

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
          <p className="text-body text-ff-gray-text-light">
            {workshop.confirmSubheading}
          </p>
        </div>

        {/* Booking details card */}
        <div className="mb-8 space-y-3 rounded-xl bg-[#f5f1e8] px-6 py-6 sm:px-8">
          <DetailRow label={workshop.workshopLabel} value={workshop.title} />
          <DetailRow label={workshop.dateLabel} value={selectedDate.date} />
          <DetailRow label={workshop.timeLabel} value={selectedDate.time} />
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

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-(--radius-pill) border border-ff-border-light px-6 py-3 font-display text-body font-medium text-ff-near-black transition-colors hover:bg-[#f5f1e8]"
          >
            {workshop.cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-(--radius-pill) bg-[#c1c1c1] px-8 py-3 font-display text-body font-medium text-ff-near-black transition-colors hover:bg-[#b3b3b3]"
          >
            {workshop.confirmLabel}
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
      <span className="font-display text-body font-medium text-ff-near-black">
        {value}
      </span>
    </div>
  )
}
