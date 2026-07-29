'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { SeatAction } from '@/lib/policyEngine'

type SeatBundle = {
  index: number
  recipientName: string
  seatStatus: string
  selfRebookingUsed: boolean
  options: SeatAction[]
}

type BookingSummary = {
  id: string
  workshopTitle?: string | null
  date?: string | null
  time?: string | null
  guestCount?: number | null
  pricePerPerson?: number | null
}

type AvailableDate = {
  appointmentId: string
  workshopTitle?: string
  date: string
  time: string
  availableSpots: number
}

type Outcome = {
  seatIndex: number
  heading: string
  body: string
  manageUrl?: string
}

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'cannot_attend', label: 'Ich kann nicht teilnehmen' },
  { value: 'personal_health', label: 'Gesundheitliche Gründe' },
  { value: 'wrong_workshop', label: 'Falscher Workshop gebucht' },
  { value: 'other', label: 'Sonstiges' },
]

const ACTION_COPY: Record<SeatAction, { title: string; description: string }> = {
  REQUEST_FULL_REFUND: {
    title: 'Geld zurück',
    description: 'Volle Rückerstattung auf dein ursprüngliches Zahlungsmittel.',
  },
  REBOOK_NOW: {
    title: 'Neuen Termin wählen',
    description: 'Direkt auf einen anderen Termin umbuchen — ohne neue Zahlung.',
  },
  REBOOK_LATER_VIA_CODE: {
    title: 'Code für später',
    description: '12 Monate gültiger Code — bei jedem unserer Workshops einlösbar.',
  },
  CANCEL_NO_REFUND: {
    title: 'Stornieren',
    description: 'Keine Erstattung, keine Umbuchung möglich.',
  },
  SELECT_REPLACEMENT_WORKSHOP: {
    title: 'Ersatztermin wählen',
    description: 'Wähle einen anderen Termin für diesen abgesagten Workshop.',
  },
  REQUEST_ORGANISER_CANCELLATION_REFUND: {
    title: 'Geld zurück',
    description: 'Volle Rückerstattung, da wir diesen Termin absagen mussten.',
  },
}

type Step =
  | 'seat-picker' // multi-seat only: "Wer kann nicht kommen?"
  | 'warning' // multi-seat only: irreversibility acknowledgment
  | 'reason'
  | 'options'
  | 'nothing-available'
  | 'rebook-date'
  | 'confirm-rebook-later'
  | 'confirm-refund'
  | 'success' // single-seat terminal
  | 'mixed-summary' // multi-seat terminal

export function ManageBookingClient({
  token,
  scope,
  booking,
  seats: initialSeats,
}: {
  token: string
  scope: string
  booking: BookingSummary
  seats: SeatBundle[]
}) {
  const guestCount = booking.guestCount ?? initialSeats.length ?? 1
  const isMultiSeat = guestCount > 1
  const isOrganiserCancellation = scope === 'organiser-cancellation'

  const [seats, setSeats] = useState(initialSeats)
  const [seatIndex, setSeatIndex] = useState<number | null>(isMultiSeat ? null : 0)
  const [step, setStep] = useState<Step>(isMultiSeat ? 'seat-picker' : 'reason')
  const [reason, setReason] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState<AvailableDate[]>([])
  const [successDetails, setSuccessDetails] = useState<Outcome | null>(null)

  // Multi-seat only: which seats were picked in step 1, and where we are in
  // working through them one at a time (each seat's sub-flow is identical to
  // the single-seat flow — plan §6 "sub-flows identical to single-seat, run
  // once per affected seat").
  const [selectedSeatIndices, setSelectedSeatIndices] = useState<number[]>([])
  const [queuePosition, setQueuePosition] = useState(0)
  const [warningAcknowledged, setWarningAcknowledged] = useState(false)
  const [outcomes, setOutcomes] = useState<Outcome[]>([])

  const activeSeat = seatIndex !== null ? seats.find((s) => s.index === seatIndex) : undefined

  async function refreshSeats(): Promise<SeatBundle[]> {
    try {
      const res = await fetch(`/api/manage-booking/${token}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setSeats(json.seats)
        return json.seats as SeatBundle[]
      }
    } catch {
      // non-fatal — keep showing what we have
    }
    return seats
  }

  function toggleSeatSelection(idx: number) {
    setSelectedSeatIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    )
  }

  function confirmSeatSelection() {
    if (selectedSeatIndices.length === 0) {
      setError('Bitte wähle mindestens einen Platz aus.')
      return
    }
    setError(null)
    setStep('warning')
  }

  function confirmWarning() {
    if (!warningAcknowledged) return
    setError(null)
    setQueuePosition(0)
    setSeatIndex(selectedSeatIndices[0])
    setReason('')
    setStep('reason')
  }

  async function confirmReason() {
    if (!reason) {
      setError('Bitte wähle einen Grund aus.')
      return
    }
    setError(null)
    // Re-fetch fresh — never trust the seats snapshot from initial page load
    // or an earlier step; time keeps moving while the customer clicks through.
    const freshSeats = await refreshSeats()
    const seat = freshSeats.find((s) => s.index === seatIndex)
    if (seat && seat.options.length === 1 && seat.options[0] === 'CANCEL_NO_REFUND') {
      setStep('nothing-available')
      return
    }
    setStep('options')
  }

  async function chooseAction(action: SeatAction) {
    setError(null)
    if (action === 'REBOOK_NOW' || action === 'SELECT_REPLACEMENT_WORKSHOP') {
      setLoading(true)
      try {
        const res = await fetch(`/api/manage-booking/${token}/available-dates`)
        const json = await res.json()
        setDates(json.dates ?? [])
      } finally {
        setLoading(false)
      }
      setStep('rebook-date')
      return
    }
    if (action === 'REBOOK_LATER_VIA_CODE') {
      setStep('confirm-rebook-later')
      return
    }
    if (action === 'REQUEST_FULL_REFUND' || action === 'REQUEST_ORGANISER_CANCELLATION_REFUND') {
      setStep('confirm-refund')
      return
    }
  }

  async function submitMutation(path: string, extraBody: Record<string, unknown> = {}) {
    if (seatIndex === null) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/manage-booking/${token}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIndex, reason, ...extraBody }),
      })
      const json = await res.json()
      if (!json.success) {
        if (json.error === 'action_not_allowed') {
          setError('Diese Aktion ist für diesen Platz nicht mehr verfügbar — die Seite wird aktualisiert.')
          await refreshSeats()
          setStep('options')
        } else {
          setError(json.message || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.')
        }
        return
      }
      return json
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.')
      return undefined
    } finally {
      setLoading(false)
    }
  }

  /**
   * Called once a seat's action has actually succeeded server-side. In the
   * single-seat flow this is the end — show the success screen. In the
   * multi-seat flow it moves to the next selected seat's reason picker, or
   * to the mixed-outcome summary once every selected seat is done.
   */
  function finishSeatAction(outcome: Omit<Outcome, 'seatIndex'>) {
    if (seatIndex === null) return
    const full: Outcome = { ...outcome, seatIndex }

    if (!isMultiSeat) {
      setSuccessDetails(full)
      setStep('success')
      return
    }

    setOutcomes((prev) => [...prev, full])
    const nextPosition = queuePosition + 1
    if (nextPosition < selectedSeatIndices.length) {
      setQueuePosition(nextPosition)
      setSeatIndex(selectedSeatIndices[nextPosition])
      setReason('')
      setStep('reason')
    } else {
      setStep('mixed-summary')
    }
  }

  async function doCancelNoRefund() {
    const json = await submitMutation('cancel-no-refund')
    if (!json) return
    finishSeatAction({
      heading: 'Storniert',
      body: 'Deine Buchung wurde storniert. Vergiss nicht: Du kannst dein Ticket jederzeit kostenlos an jemand anderen weitergeben.',
    })
  }

  async function doRebookLater() {
    const json = await submitMutation('rebook-later')
    if (!json) return
    finishSeatAction({
      heading: 'Code ausgestellt',
      body: `Code ${json.voucherCode} · 12 Monate gültig, wurde dir per E-Mail zugeschickt. Einlösbar bei jedem unserer Workshops.`,
    })
  }

  async function doRequestRefund() {
    const json = await submitMutation('request-refund')
    if (!json) return
    finishSeatAction({
      heading: 'Rückerstattung angefragt',
      body: 'Wird bearbeitet und innerhalb von 14 Tagen auf dein ursprüngliches Zahlungsmittel gebucht. Bestätigung folgt per E-Mail.',
    })
  }

  async function doRebookNow(newAppointmentId: string) {
    const json = await submitMutation('rebook-now', { newAppointmentId })
    if (!json) return
    finishSeatAction({
      heading: 'Umgebucht',
      body: 'Neuer Termin bestätigt — keine neue Zahlung nötig. Bestätigung mit allen Details per E-Mail.',
      manageUrl: json.manageUrl,
    })
  }

  const seatLabel = (idx: number) => {
    const s = seats.find((x) => x.index === idx)
    return `Platz ${idx + 1}${s?.recipientName ? ` — ${s.recipientName}` : ''}`
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-tight mb-1">
            Buchung verwalten
          </h1>
          <p className="text-[14px] text-[#626160]">
            {booking.workshopTitle} · {booking.date} {booking.time}
          </p>
          {isMultiSeat && step !== 'seat-picker' && step !== 'warning' && step !== 'mixed-summary' && (
            <p className="text-[12px] text-[#626160] mt-1">
              Platz {queuePosition + 1} von {selectedSeatIndices.length} · {seatIndex !== null ? seatLabel(seatIndex) : ''}
            </p>
          )}
        </div>

        {isOrganiserCancellation && (
          <div className="mb-6 rounded-xl border border-[#e8e4d9] bg-white px-4 py-3 text-[13px] text-[#1a1a1a]">
            Dieser Termin musste leider von uns abgesagt werden. Wähle einen Ersatztermin oder
            erhalte dein Geld zurück — beides ohne zusätzliche Kosten.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </div>
        )}

        {step === 'seat-picker' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-1">Wer kann nicht kommen?</h2>
            <p className="text-[13px] text-[#626160] mb-4">
              Wähle einen oder mehrere Plätze — jeder Platz wird unabhängig behandelt und kann
              eine andere Lösung erhalten.
            </p>
            <div className="space-y-2 mb-6">
              {seats.map((seat) => (
                <label
                  key={seat.index}
                  className={`flex items-center gap-3 px-4 py-3 border rounded-xl ${
                    seat.options.length > 0
                      ? 'border-[#e8e4d9] cursor-pointer hover:bg-[#faf9f7]'
                      : 'border-[#f0ede7] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={seat.options.length === 0}
                    checked={selectedSeatIndices.includes(seat.index)}
                    onChange={() => toggleSeatSelection(seat.index)}
                  />
                  <span className="text-[14px] text-[#1a1a1a] flex-1">
                    {seatLabel(seat.index)}
                  </span>
                  {seat.options.length === 0 && (
                    <span className="text-[12px] text-[#626160]">{seat.seatStatus}</span>
                  )}
                </label>
              ))}
            </div>
            <Button onClick={confirmSeatSelection} disabled={loading}>
              Weiter
            </Button>
          </div>
        )}

        {step === 'warning' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">Bist du sicher?</h2>
            <p className="text-[13px] text-[#626160] mb-4">
              Du bearbeitest {selectedSeatIndices.length} Platz{selectedSeatIndices.length === 1 ? '' : 'plätze'}:{' '}
              {selectedSeatIndices.map(seatLabel).join(', ')}. Jede Entscheidung ist{' '}
              <strong>endgültig</strong> — sobald du eine Option für einen Platz gewählt hast, kann
              sie nicht rückgängig gemacht werden.
            </p>
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={warningAcknowledged}
                onChange={(e) => setWarningAcknowledged(e.target.checked)}
              />
              <span className="text-[13px] text-[#1a1a1a]">
                Ich verstehe, dass diese Auswahl endgültig ist.
              </span>
            </label>
            <Button onClick={confirmWarning} disabled={!warningAcknowledged || loading}>
              Weiter
            </Button>
          </div>
        )}

        {step === 'reason' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">
              Was ist der Grund?
            </h2>
            <div className="space-y-2 mb-6">
              {REASON_OPTIONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 px-4 py-3 border border-[#e8e4d9] rounded-xl cursor-pointer hover:bg-[#faf9f7]"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  <span className="text-[14px] text-[#1a1a1a]">{r.label}</span>
                </label>
              ))}
            </div>
            <Button onClick={confirmReason} disabled={loading}>
              Weiter
            </Button>
          </div>
        )}

        {step === 'options' && activeSeat && (
          <div className="space-y-3">
            {activeSeat.options.map((action) => (
              <button
                key={action}
                onClick={() => chooseAction(action)}
                disabled={loading}
                className="w-full text-left bg-white border border-[#e8e4d9] rounded-2xl p-5 hover:bg-[#faf9f7]"
              >
                <div className="text-[15px] font-semibold text-[#1a1a1a] mb-1">
                  {ACTION_COPY[action].title}
                </div>
                <div className="text-[13px] text-[#626160]">{ACTION_COPY[action].description}</div>
              </button>
            ))}
          </div>
        )}

        {step === 'nothing-available' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">
              Für diesen Termin ist keine Stornierung mehr möglich
            </h2>
            <p className="text-[13px] text-[#626160] mb-2">
              Da der Workshop in weniger als 14 Tagen stattfindet, gibt es laut unseren AGB keine
              Rückerstattung, keine Umbuchung und keinen Gutschein-Code.
            </p>
            <p className="text-[13px] text-[#626160] mb-6">
              Du kannst dein Ticket aber jederzeit kostenlos an jemand anderen weitergeben — gib
              einfach deine Buchungsdetails weiter, es ist keine Namensänderung nötig.
            </p>
            <Button onClick={doCancelNoRefund} disabled={loading} variant="outline">
              Verstanden, trotzdem stornieren
            </Button>
          </div>
        )}

        {step === 'rebook-date' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">
              Neuen Termin wählen
            </h2>
            {loading && <p className="text-[13px] text-[#626160]">Lade verfügbare Termine…</p>}
            {!loading && dates.length === 0 && (
              <p className="text-[13px] text-[#626160]">
                Aktuell sind keine anderen Termine für diesen Workshop verfügbar. Bitte wähle
                stattdessen &bdquo;Code für später&ldquo;.
              </p>
            )}
            <div className="space-y-2">
              {dates.map((d) => (
                <button
                  key={d.appointmentId}
                  onClick={() => doRebookNow(d.appointmentId)}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 border border-[#e8e4d9] rounded-xl hover:bg-[#faf9f7]"
                >
                  <span className="text-[14px] text-[#1a1a1a]">
                    {d.workshopTitle ? `${d.workshopTitle} — ` : ''}
                    {d.date}, {d.time}
                  </span>
                  <span className="text-[12px] text-[#626160] ml-2">
                    ({d.availableSpots} Plätze frei)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'confirm-rebook-later' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">
              Code für später erhalten
            </h2>
            <p className="text-[13px] text-[#626160] mb-6">
              Du erhältst einen Code im Wert von €{booking.pricePerPerson ?? '99'}, gültig 12
              Monate ab heute — einlösbar bei jedem unserer Workshops, wann immer es dir passt.
            </p>
            <Button onClick={doRebookLater} disabled={loading}>
              Code jetzt anfordern
            </Button>
          </div>
        )}

        {step === 'confirm-refund' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">
              Rückerstattung bestätigen
            </h2>
            <p className="text-[13px] text-[#626160] mb-6">
              Du erhältst €{booking.pricePerPerson ?? ''} zurück auf dein ursprüngliches
              Zahlungsmittel — die Bearbeitung dauert bis zu 14 Tage.
            </p>
            <Button onClick={doRequestRefund} disabled={loading}>
              Rückerstattung anfragen
            </Button>
          </div>
        )}

        {step === 'success' && successDetails && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">
              {successDetails.heading}
            </h2>
            <p className="text-[13px] text-[#626160] mb-4">{successDetails.body}</p>
            {successDetails.manageUrl && (
              <a
                href={successDetails.manageUrl}
                className="text-[13px] text-[#1a1a1a] underline"
              >
                Neue Buchung verwalten
              </a>
            )}
          </div>
        )}

        {step === 'mixed-summary' && (
          <div className="bg-white border border-[#e8e4d9] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#f5f3f0]">
              <h2 className="text-[16px] font-semibold text-[#1a1a1a]">Alle Plätze bearbeitet</h2>
              <p className="text-[13px] text-[#626160] mt-1">
                Hier ist eine Übersicht, was für jeden Platz passiert ist.
              </p>
            </div>
            {outcomes.map((o, i) => (
              <div
                key={o.seatIndex}
                className={`p-6 ${i < outcomes.length - 1 ? 'border-b border-[#f5f3f0]' : ''}`}
              >
                <div className="text-[13px] font-semibold text-[#626160] mb-1">
                  {seatLabel(o.seatIndex)}
                </div>
                <div className="text-[15px] font-semibold text-[#1a1a1a] mb-1">{o.heading}</div>
                <p className="text-[13px] text-[#626160]">{o.body}</p>
                {o.manageUrl && (
                  <a href={o.manageUrl} className="text-[13px] text-[#1a1a1a] underline mt-1 inline-block">
                    Neue Buchung verwalten
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
