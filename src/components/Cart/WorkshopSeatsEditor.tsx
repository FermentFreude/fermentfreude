'use client'

/* ═══════════════════════════════════════════════════════════════
 *  WorkshopSeatsEditor — Sprint 3
 *
 *  Lets the buyer optionally turn each seat in a workshop booking
 *  into a gift seat. For each gift seat the recipient receives
 *  their own confirmation + .ics (without price) after Stripe
 *  payment succeeds.
 *
 *  - Seats are persisted in two places:
 *      1. localStorage.workshopBookings[appointmentId].seats
 *         → so the cart drawer keeps state across reloads
 *      2. POST /api/cart/update-seats { bookingId, seats }
 *         → so the workshop-bookings record on the server has
 *           the right seats[] when Stripe confirmation triggers
 *           the gift-email loop in confirmWorkshopBookings.
 *
 *  - Debounced 600ms server save while the buyer types.
 *  - Bilingual DE (default) / EN.
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
  toggle: 'Geschenk-Sitze hinzufügen',
  helper: 'Markiere Sitze als Geschenk, damit der/die Empfänger:in eine eigene Bestätigung erhält.',
  seat: (n: number) => `Sitz ${n}`,
  forMe: 'Für mich',
  forGift: 'Geschenk',
  recipientName: 'Name Empfänger:in',
  recipientEmail: 'E-Mail Empfänger:in',
  giftNote: 'Persönliche Notiz (optional)',
  notePlaceholder: 'Eine kurze Nachricht für die Geschenkbestätigung…',
  charCount: (n: number) => `${n} / 500`,
  saving: 'Wird gespeichert…',
  saved: 'Gespeichert',
  saveError: 'Speichern fehlgeschlagen',
  emailHint:
    'Wir senden eine separate Bestätigung + Kalendereintrag (ohne Preis) an diese Adresse.',
}

const COPY_EN = {
  toggle: 'Add gift seats',
  helper: 'Mark seats as a gift so the recipient receives their own confirmation email.',
  seat: (n: number) => `Seat ${n}`,
  forMe: 'For me',
  forGift: 'Gift',
  recipientName: 'Recipient name',
  recipientEmail: 'Recipient email',
  giftNote: 'Personal note (optional)',
  notePlaceholder: 'A short message included in the gift confirmation…',
  charCount: (n: number) => `${n} / 500`,
  saving: 'Saving…',
  saved: 'Saved',
  saveError: 'Save failed',
  emailHint: 'We send a separate confirmation + calendar invite (without price) to this address.',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const [expanded, setExpanded] = useState(() => Boolean(initialSeats?.some((s) => s.isGift)))
  const [seats, setSeats] = useState<SeatDraft[]>(() => {
    const base = Array.from({ length: guestCount }, (_, i) => initialSeats?.[i] ?? emptySeat())
    return base
  })
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
        // Only send seats that have meaningful info — server tolerates either way.
        const payload = next.map((s) => ({
          isGift: s.isGift,
          recipientName: s.recipientName.trim() || undefined,
          recipientEmail: s.recipientEmail.trim() || undefined,
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

  const giftCount = seats.filter((s) => s.isGift).length

  return (
    <div className="mt-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40 px-3 py-2 text-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left font-medium text-neutral-900 dark:text-neutral-100"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden>🎁</span>
          {t.toggle}
          {giftCount > 0 && (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              {giftCount}
            </span>
          )}
        </span>
        <span aria-hidden className="text-neutral-500">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.helper}</p>
          {seats.map((seat, idx) => {
            const seatNumber = idx + 1
            const emailInvalid =
              seat.isGift &&
              seat.recipientEmail.trim().length > 0 &&
              !EMAIL_RE.test(seat.recipientEmail.trim())
            return (
              <div
                key={idx}
                className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {t.seat(seatNumber)}
                  </span>
                  <div className="flex gap-1 rounded-full border border-neutral-200 dark:border-neutral-700 p-0.5">
                    <button
                      type="button"
                      onClick={() => updateSeat(idx, { isGift: false })}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        !seat.isGift
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {t.forMe}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSeat(idx, { isGift: true })}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        seat.isGift
                          ? 'bg-amber-500 text-white'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {t.forGift}
                    </button>
                  </div>
                </div>

                {seat.isGift && (
                  <div className="mt-3 space-y-2">
                    <label className="block">
                      <span className="block text-xs text-neutral-600 dark:text-neutral-300 mb-0.5">
                        {t.recipientName}
                      </span>
                      <input
                        type="text"
                        value={seat.recipientName}
                        onChange={(e) => updateSeat(idx, { recipientName: e.target.value })}
                        maxLength={250}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm focus:border-neutral-900 dark:focus:border-neutral-200 focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs text-neutral-600 dark:text-neutral-300 mb-0.5">
                        {t.recipientEmail}
                      </span>
                      <input
                        type="email"
                        value={seat.recipientEmail}
                        onChange={(e) => updateSeat(idx, { recipientEmail: e.target.value })}
                        maxLength={250}
                        className={`w-full rounded-md border bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm focus:outline-none ${
                          emailInvalid
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-200'
                        }`}
                      />
                      <span className="mt-1 block text-[11px] text-neutral-500 dark:text-neutral-400">
                        {t.emailHint}
                      </span>
                    </label>
                    <label className="block">
                      <span className="block text-xs text-neutral-600 dark:text-neutral-300 mb-0.5">
                        {t.giftNote}
                      </span>
                      <textarea
                        value={seat.giftNote}
                        onChange={(e) =>
                          updateSeat(idx, { giftNote: e.target.value.slice(0, 500) })
                        }
                        rows={2}
                        maxLength={500}
                        placeholder={t.notePlaceholder}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm focus:border-neutral-900 dark:focus:border-neutral-200 focus:outline-none resize-none"
                      />
                      <span className="mt-0.5 block text-right text-[11px] text-neutral-500 dark:text-neutral-400">
                        {t.charCount(seat.giftNote.length)}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )
          })}
          <div className="text-right text-[11px] min-h-[1em] text-neutral-500 dark:text-neutral-400">
            {saveStatus === 'saving' && t.saving}
            {saveStatus === 'saved' && t.saved}
            {saveStatus === 'error' && <span className="text-red-500">{t.saveError}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
