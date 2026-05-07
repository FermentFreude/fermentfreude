'use client'

/* ═══════════════════════════════════════════════════════════════
 *  WorkshopSeatsEditor — "Your guests" editor
 *
 *  Founders' decision (May 2026):
 *  ──────────────────────────────
 *  - All workshop confirmations, .ics calendar files and invoices
 *    go ONLY to the buyer/payer.
 *  - We do NOT send any separate emails to guests / recipients.
 *  - The buyer forwards information to their guests themselves.
 *  - Vouchers (separate flow) are how someone gives a workshop
 *    "as a gift". This editor is only for booking SEATS the buyer
 *    is taking together with companions ("guests").
 *  - We still capture optional guest names so the founders see who
 *    is attending in the admin / attendee list.
 *
 *  Persistence (unchanged):
 *    1. localStorage.workshopBookings[appointmentId].seats
 *    2. POST /api/cart/update-seats { bookingId, seats } (debounced 600ms)
 *
 *  Schema compatibility:
 *    The SeatDraft fields stay the same so the existing API and
 *    workshop-bookings collection don't need a migration. We simply
 *    write isGift=false and leave recipientEmail empty for every
 *    seat — that disables the legacy gift-email branch in
 *    confirmWorkshopBookings.
 * ═══════════════════════════════════════════════════════════════ */

import { useLocale } from '@/providers/Locale'
import { useCallback, useEffect, useRef, useState } from 'react'

export type SeatDraft = {
  isGift: boolean
  recipientName: string
  recipientEmail: string
  giftNote: string
}

const COPY_DE = {
  buyerSeat: 'Sitz 1 — Du (Buchende:r)',
  buyerHint: 'Du erhältst alle Bestätigungen und Tickets per E-Mail.',
  guestSeat: (n: number) => `Gast ${n}`,
  guestNameLabel: 'Name (optional)',
  guestNamePlaceholder: 'z. B. Anna Müller',
  guestNoteLabel: 'Hinweise / Ernährung (optional)',
  guestNotePlaceholder: 'z. B. vegetarisch, vegan, glutenfrei, Allergien …',
  charCount: (n: number) => `${n} / 200`,
  saving: 'Wird gespeichert…',
  saved: 'Gespeichert',
  saveError: 'Speichern fehlgeschlagen',
  footerHint:
    'Hinweis: Alle Bestätigungen, Tickets und der Kalendereintrag werden ausschließlich an dich als Buchende:n gesendet. Du kannst die Informationen anschließend selbst an deine Gäste weiterleiten.',
}

const COPY_EN = {
  buyerSeat: 'Seat 1 — You (the buyer)',
  buyerHint: 'You will receive all confirmations and tickets by email.',
  guestSeat: (n: number) => `Guest ${n}`,
  guestNameLabel: 'Name (optional)',
  guestNamePlaceholder: 'e.g. Anna Müller',
  guestNoteLabel: 'Notes / dietary (optional)',
  guestNotePlaceholder: 'e.g. vegetarian, vegan, gluten-free, allergies …',
  charCount: (n: number) => `${n} / 200`,
  saving: 'Saving…',
  saved: 'Saved',
  saveError: 'Save failed',
  footerHint:
    'Note: All confirmations, tickets and the calendar invite are sent only to you as the buyer. You can then forward the details to your guests yourself.',
}

function emptySeat(): SeatDraft {
  return { isGift: false, recipientName: '', recipientEmail: '', giftNote: '' }
}

interface Props {
  appointmentId: string
  bookingId: string | null
  guestCount: number
  initialSeats?: SeatDraft[]
  onSeatsChange?: (seats: SeatDraft[]) => void
}

export function WorkshopSeatsEditor({
  appointmentId,
  bookingId,
  guestCount,
  initialSeats,
  onSeatsChange,
}: Props) {
  const { locale } = useLocale()
  const t = locale === 'de' ? COPY_DE : COPY_EN

  const [seats, setSeats] = useState<SeatDraft[]>(() =>
    Array.from({ length: guestCount }, (_, i) => initialSeats?.[i] ?? emptySeat()),
  )
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedJsonRef = useRef<string>('')

  // Adjust array length when guestCount changes externally (e.g. plus/minus).
  useEffect(() => {
    setSeats((prev) => {
      if (prev.length === guestCount) return prev
      if (prev.length < guestCount) {
        return [...prev, ...Array.from({ length: guestCount - prev.length }, () => emptySeat())]
      }
      return prev.slice(0, guestCount)
    })
  }, [guestCount])

  const persist = useCallback(
    (next: SeatDraft[]) => {
      // 1) localStorage update (always)
      try {
        const raw = localStorage.getItem('workshopBookings')
        const all = raw ? (JSON.parse(raw) as Record<string, Record<string, unknown>>) : {}
        if (all[appointmentId]) {
          all[appointmentId].seats = next
          localStorage.setItem('workshopBookings', JSON.stringify(all))
        }
      } catch {
        /* swallow */
      }
      onSeatsChange?.(next)

      // 2) server save (debounced, only if we have a bookingId)
      if (!bookingId) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        // Force isGift=false and clear recipientEmail — founders' decision: no
        // separate emails to guests. We only persist the optional name & note
        // so the founders see who is attending in the admin.
        const payload = next.map((s) => ({
          isGift: false,
          recipientName: s.recipientName.trim() || undefined,
          recipientEmail: undefined,
          giftNote: s.giftNote.trim() || undefined,
        }))
        const json = JSON.stringify(payload)
        if (json === lastSavedJsonRef.current) return
        setSaveStatus('saving')
        try {
          const res = await fetch('/api/cart/update-seats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, seats: payload }),
          })
          if (res.ok) {
            lastSavedJsonRef.current = json
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 1500)
          } else {
            setSaveStatus('error')
          }
        } catch {
          setSaveStatus('error')
        }
      }, 600)
    },
    [appointmentId, bookingId, onSeatsChange],
  )

  const updateSeat = (idx: number, patch: Partial<SeatDraft>) => {
    setSeats((prev) => {
      const next = prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
      persist(next)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Seat 1 — buyer (locked) */}
      <div className="rounded-lg border border-ff-border-light bg-ff-surface-soft px-4 py-3">
        <p className="font-display text-body-sm font-bold text-ff-near-black">{t.buyerSeat}</p>
        <p className="mt-1 text-caption text-ff-gray-text-light">{t.buyerHint}</p>
      </div>

      {/* Seats 2..N — guests (optional names + notes) */}
      {seats.slice(1).map((seat, sliceIdx) => {
        const idx = sliceIdx + 1
        const seatNumber = idx + 1
        return (
          <div
            key={idx}
            className="rounded-lg border border-ff-border-light bg-white px-4 py-4"
          >
            <p className="mb-3 font-display text-body-sm font-bold text-ff-near-black">
              {t.guestSeat(idx)}{' '}
              <span className="text-caption font-normal text-ff-gray-text-light">
                · {locale === 'de' ? `Sitz ${seatNumber}` : `Seat ${seatNumber}`}
              </span>
            </p>
            <div className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1 block text-caption text-ff-gray-text-light">
                  {t.guestNameLabel}
                </span>
                <input
                  type="text"
                  value={seat.recipientName}
                  onChange={(e) => updateSeat(idx, { recipientName: e.target.value.slice(0, 120) })}
                  placeholder={t.guestNamePlaceholder}
                  maxLength={120}
                  className="w-full rounded-md border border-ff-border-light bg-white px-3 py-2 text-body-sm text-ff-near-black placeholder:text-ff-gray-text-light focus:border-ff-near-black focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-caption text-ff-gray-text-light">
                  {t.guestNoteLabel}
                </span>
                <input
                  type="text"
                  value={seat.giftNote}
                  onChange={(e) => updateSeat(idx, { giftNote: e.target.value.slice(0, 200) })}
                  placeholder={t.guestNotePlaceholder}
                  maxLength={200}
                  className="w-full rounded-md border border-ff-border-light bg-white px-3 py-2 text-body-sm text-ff-near-black placeholder:text-ff-gray-text-light focus:border-ff-near-black focus:outline-none"
                />
                <span className="mt-1 block text-right text-caption text-ff-gray-text-light">
                  {t.charCount(seat.giftNote.length)}
                </span>
              </label>
            </div>
          </div>
        )
      })}

      <p className="text-caption text-ff-gray-text-light">{t.footerHint}</p>

      <div
        aria-live="polite"
        className="min-h-[1em] text-right text-caption text-ff-gray-text-light"
      >
        {saveStatus === 'saving' && t.saving}
        {saveStatus === 'saved' && t.saved}
        {saveStatus === 'error' && <span className="text-red-600">{t.saveError}</span>}
      </div>
    </div>
  )
}
