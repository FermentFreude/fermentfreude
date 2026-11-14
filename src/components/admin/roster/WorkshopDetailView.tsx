'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { seatHoldsPlace, seatsHoldingPlace } from '@/lib/seatCapacity'

import {
  deleteManualWorkshopBooking,
  getAlternateAppointments,
  moveWorkshopBooking,
  moveWorkshopSeats,
  setAppointmentCapacity,
  alignAppointmentCounter,
  sendAlternateDateEmail,
  updateBookingSeatDetails,
} from './actions'
import { AddManualBookingForm } from './AddManualBookingForm'
import { addBookingSeats, cancelBookingSeat, releaseBookingSeats, updateBookingDetails } from './bookingEditActions'
import { CustomerProfileModal } from './CustomerProfile'
import { CHANNELS, ManualPaymentDialog, MP } from './ManualPayment'
import { bookingOrigin, type BookingOrigin } from './bookingOrigin'
import { sendChooseOwnDateLinks } from './chooseDateActions'
import { LOCALE, type Lang } from './rosterI18n'
import { useToast } from './RosterToast'
import { seatMismatch } from './seatCheck'
import type { AppointmentRow, BookingRow } from './types'
import { kindColor } from './workshopKind'

type Alt = Awaited<ReturnType<typeof getAlternateAppointments>>[number]
type Payment = NonNullable<BookingRow['payment']>

const T = {
  de: {
    back: '← Zurück',
    seats: 'Gebucht', free: 'Frei', held: 'Reserviert', heldHint: 'Plätze in noch nicht bezahlten Buchungen.',
    of: (c: number) => `von ${c} Plätzen`,
    mism: (s: number, e: number) => `Die Buchungsseite zeigt ${s} freie Plätze, laut Buchungen sollten es ${e} sein. Die Zahl wird nur angezeigt, hier wird nichts automatisch geändert.`,
    add: 'Person hinzufügen', copy: 'Liste kopieren', print: 'Tagesliste drucken', invAll: (n: number) => `Rechnungen (${n}) als ZIP`, mailAll: 'Anderen Termin mailen',
    copied: 'Liste in die Zwischenablage kopiert.', copyFail: 'Kopieren geht hier nicht. Bitte die Namen von Hand markieren.',
    sheet: 'Teilnehmende', cBy: 'Gebucht von', cSeats: 'Plätze', cSrc: 'Herkunft und Zahlung', cStatus: 'Status', cAct: 'Aktionen',
    seatN: (i: number) => `Platz ${i}`, guestOf: (n: string) => `Gast von ${n}`,
    gone: 'Nicht mehr auf diesem Termin',
    nothing: 'Noch niemand gebucht. Über „Person hinzufügen“ tragt ihr telefonische oder spontane Buchungen ein.',
    details: 'Details', edit: 'Bearbeiten', move: 'Verschieben', alt: 'Anderen Termin mailen', remove: 'Entfernen', inv: 'Rechnung',
    origin: { website: 'Online', manual: 'Manuell', wix: 'Wix-Import', unmarked: 'Herkunft unbekannt' } as Record<BookingOrigin, string>,
    originHint: {
      website: 'Über die Webseite gebucht.', manual: 'Von euch im Dashboard eingetragen.', wix: 'Aus dem alten Wix-Shop übernommen.',
      unmarked: 'Keine Bestellung oder Import-Notiz gefunden, daher ist unklar, wie dieser Platz gebucht wurde.',
    } as Record<BookingOrigin, string>,
    pay: { stripe: 'Stripe', voucher: 'Gutschein', manual: 'Zahlung nicht erfasst', wix: 'In Wix bezahlt', none: 'Kein Beleg' } as Record<Payment, string>,
    st: {
      active: 'Bestätigt', rebooked: 'Umgebucht', voucher_issued: 'Gutschein statt Termin', cancelled_no_refund: 'Storniert',
      refunded: 'Rückerstattet', no_show: 'Nicht erschienen', refund_requested: 'Rückerstattung angefragt',
      rebooking_pending: 'Umbuchung ausstehend', organiser_cancelled_pending: 'Von uns abgesagt, wartet auf Kunde',
    } as Record<string, string>,
    noEmail: 'keine E-Mail, keine Erinnerung',
    cancel: 'Abbrechen', close: 'Schließen', save: 'Speichern', saved: 'Gespeichert.',
    aT: 'Person hinzufügen', fullErr: 'Für diesen Termin sind keine Plätze mehr frei.',
    eT: 'Buchung bearbeiten', eHint: 'Name, E-Mail und Notiz für jeden Platz. Das könnt ihr jederzeit ändern, auch nach dem Workshop.',
    eName: 'Name', eMail: 'E-Mail', eNote: 'Notiz (z. B. Allergien)',
    mvT: 'Platz verschieben', mvFrom: (b: string, n: number) => `${b} · ${n} ${n === 1 ? 'Platz' : 'Plätze'}`,
    mvTo: 'Neuer Termin (auch ein anderer Workshop)', mvFree: (n: number) => `Hier werden ${n === 1 ? '1 Platz' : `${n} Plätze`} frei.`,
    mvTake: (w: string, n: number, f: number) => `Auf ${w} ${n === 1 ? 'wird 1 Platz' : `werden ${n} Plätze`} belegt (danach ${f} frei).`,
    mvOrder: 'Zuerst wird der neue Platz gesichert, dann der alte freigegeben. Der Eintrag bekommt einen Vermerk im Verlauf.',
    mvInv: 'Andere Workshop-Art: Der Preis wird auf den neuen Workshop angepasst (nur bei Buchungen ohne Online-Bestellung). Ob eine schon erstellte Rechnung korrigiert werden muss, bitte intern klären.',
    ePhone: 'Telefon', ePrice: 'Preis pro Person (€)', eChannel: 'Herkunft der Buchung', eSeats: 'Plätze',
    eAdd: 'Platz dazubuchen', eDrop: 'Platz streichen', eDropSure: 'Wirklich streichen?', eDropped: 'Platz gestrichen. Er ist wieder frei.', eAdded: 'Platz dazugebucht.',
    eLocked: 'Preis und Plätze lassen sich bei Buchungen mit Rechnung oder Online-Bestellung nicht ändern (dafür gibt es Umbuchung und Erstattung).',
    mvWho: 'Wer soll verschoben werden?', mvWhoHint: 'Wer nicht angehakt ist, bleibt auf diesem Termin.', movedSome: 'Verschoben. Die Person hat jetzt eine eigene Buchung am neuen Termin.',
    mvNotify: 'Die Person per E-Mail informieren', mvNotifyHint: 'Aus, wenn ihr es schon telefonisch besprochen habt.',
    mvYes: 'Ja, verschieben', moved: 'Verschoben. Beide Platzzahlen wurden angepasst.', mvNone: 'Es gibt keinen anderen Termin mit genug freien Plätzen.',
    mvMailFail: 'Verschoben, aber die E-Mail konnte nicht gesendet werden. Bitte die Person direkt informieren.',
    loading: 'Lädt …',
    gT: 'Anderen Termin anbieten', gSel: 'Wer soll die E-Mail bekommen', gAll: 'Alle', gNone: 'Keine', gNeed: 'Bitte mindestens eine Person auswählen.',
    m1: 'Alle wählen selbst einen neuen Termin (empfohlen)', m1s: 'Jede Person bekommt einen persönlichen Link mit allen freien Terminen dieses Workshops. Verschoben wird erst, wenn die Person gewählt hat.',
    m2: 'Einen bestimmten Termin vorschlagen', m2s: 'Die E-Mail nennt einen Termin. Niemand wird verschoben, bevor ihr es tut.',
    gDate: 'Angebotener Termin', gSend: 'E-Mails senden',
    gReason: 'Grund (steht in der E-Mail, optional)', gReasonPh: 'Wir müssen diesen Termin neu planen.',
    gNoMail: 'Personen ohne E-Mail-Adresse werden übersprungen und danach aufgelistet.',
    gSentLink: (n: number) => `Persönlicher Link an ${n} ${n === 1 ? 'Person' : 'Personen'} gesendet.`,
    gSentOne: (n: number) => `E-Mail an ${n} ${n === 1 ? 'Person' : 'Personen'} gesendet.`,
    gSkipped: (names: string) => `Nicht gesendet: ${names}`,
    aBtn: 'Zähler angleichen', aSure: (s: number, e: number) => `Die Website zeigt ${s}, laut Buchungen sind es ${e}. Auf ${e} setzen?`, aYes: 'Ja, angleichen', aDone: (s: number, e: number) => `Angeglichen: ${s} → ${e}. Die Änderung steht in den Notizen des Termins.`,
    cT: 'Kapazität dieses Termins', cLabel: 'Wie viele Personen können dabei sein?', cHint: (std: number) => `Leer lassen = Standard des Workshops (${std}). Die freien Plätze auf der Website passen sich automatisch an. Die Zahl kann nicht unter die schon gebuchten Plätze gesenkt werden.`, cSaved: 'Kapazität gespeichert. Die freien Plätze wurden angepasst.', cBtn: 'Kapazität', cOwn: 'eigene Kapazität',
    fT: 'Platz freigeben', fBtn: 'Platz freigeben', fWho: 'Wer kommt nicht?', fReason: 'Grund',
    fReasons: { no_show: 'Nicht erschienen', late_cancel: 'Zu spät abgesagt (keine Erstattung)', never_paid: 'Zahlung nie eingegangen', test: 'Test-Buchung', other: 'Sonstiges' } as Record<string, string>,
    fNote: 'Notiz (optional)', fInfo: 'Die Plätze werden wieder frei und die Person steht unter „Nicht mehr auf diesem Termin“. Die Buchung bleibt erhalten, eine vorhandene Rechnung wird nicht gelöscht. Eine Erstattung läuft getrennt über „Erstattungen“.', fYes: 'Ja, freigeben', fDone: 'Platz freigegeben. Er ist wieder frei.',
    rT: 'Buchung entfernen', rBody: (n: string, s: number) => `Die Buchung von ${n} wird entfernt. ${s === 1 ? '1 Platz wird' : `${s} Plätze werden`} wieder frei.`,
    rOnly: 'Entfernen löscht die Buchung ganz. Das geht nur ohne Bestellung oder Rechnung. Sonst bitte „Platz freigeben“ nutzen.',
    rYes: 'Ja, entfernen', removed: 'Entfernt. Die Plätze sind wieder frei.',
    printTitle: 'Tagesliste', printSig: 'Anwesend',
    pastNote: 'Dieser Termin liegt in der Vergangenheit.',
    bookedOn: (d: string) => `gebucht ${d}`,
  },
  en: {
    back: '← Back',
    seats: 'Booked', free: 'Free', held: 'Held', heldHint: 'Seats in bookings that are not paid yet.',
    of: (c: number) => `of ${c} seats`,
    mism: (s: number, e: number) => `The booking page shows ${s} free seats; according to the bookings it should be ${e}. The number is only displayed; nothing is changed automatically here.`,
    add: 'Add person', copy: 'Copy list', print: 'Print day sheet', invAll: (n: number) => `Invoices (${n}) as ZIP`, mailAll: 'Email another date',
    copied: 'List copied to the clipboard.', copyFail: 'Copying is not possible here. Please select the names by hand.',
    sheet: 'Participants', cBy: 'Booked by', cSeats: 'Seats', cSrc: 'Source and payment', cStatus: 'Status', cAct: 'Actions',
    seatN: (i: number) => `Seat ${i}`, guestOf: (n: string) => `Guest of ${n}`,
    gone: 'No longer on this date',
    nothing: 'Nobody has booked yet. Use "Add person" for phone or walk-in bookings.',
    details: 'Details', edit: 'Edit', move: 'Move', alt: 'Email another date', remove: 'Remove', inv: 'Invoice',
    origin: { website: 'Online', manual: 'Manual', wix: 'Wix import', unmarked: 'Unknown source' } as Record<BookingOrigin, string>,
    originHint: {
      website: 'Booked through the website.', manual: 'Entered by you in the dashboard.', wix: 'Taken over from the old Wix shop.',
      unmarked: 'No order or import note found, so it is unclear how this seat was booked.',
    } as Record<BookingOrigin, string>,
    pay: { stripe: 'Stripe', voucher: 'Voucher', manual: 'Payment not recorded', wix: 'Paid in Wix', none: 'No receipt' } as Record<Payment, string>,
    st: {
      active: 'Confirmed', rebooked: 'Rebooked', voucher_issued: 'Voucher instead', cancelled_no_refund: 'Cancelled',
      refunded: 'Refunded', no_show: 'No-show', refund_requested: 'Refund requested', rebooking_pending: 'Rebooking pending',
      organiser_cancelled_pending: 'Cancelled by us, waiting for customer',
    } as Record<string, string>,
    noEmail: 'no email, no reminder',
    cancel: 'Cancel', close: 'Close', save: 'Save', saved: 'Saved.',
    aT: 'Add person', fullErr: 'There are no free seats left on this date.',
    eT: 'Edit booking', eHint: 'Name, email and note for each seat. You can change this at any time, also after the workshop.',
    eName: 'Name', eMail: 'Email', eNote: 'Note (e.g. allergies)',
    mvT: 'Move seat', mvFrom: (b: string, n: number) => `${b} · ${n} ${n === 1 ? 'seat' : 'seats'}`,
    mvTo: 'New date (can be a different workshop)', mvFree: (n: number) => `${n === 1 ? '1 seat becomes' : `${n} seats become`} free here.`,
    mvTake: (w: string, n: number, f: number) => `On ${w} ${n === 1 ? '1 seat is' : `${n} seats are`} taken (${f} free afterwards).`,
    mvOrder: 'The new seat is secured first, then the old one is released. The booking gets a history note.',
    mvInv: 'Different workshop type: the price follows the new workshop (only for bookings without an online order). Whether an invoice that was already created needs a correction is for you to decide internally.',
    ePhone: 'Phone', ePrice: 'Price per person (€)', eChannel: 'How the booking came in', eSeats: 'Seats',
    eAdd: 'Add a seat', eDrop: 'Cancel seat', eDropSure: 'Really cancel?', eDropped: 'Seat cancelled. It is free again.', eAdded: 'Seat added.',
    eLocked: 'Price and seats cannot be changed for bookings with an invoice or an online order (use rebooking and refunds instead).',
    mvWho: 'Who should move?', mvWhoHint: 'Anyone left unticked stays on this date.', movedSome: 'Moved. The person now has their own booking on the new date.',
    mvNotify: 'Tell the person by email', mvNotifyHint: 'Off if you already agreed it by phone.',
    mvYes: 'Yes, move', moved: 'Moved. Both seat counts were updated.', mvNone: 'There is no other date with enough free seats.',
    mvMailFail: 'Moved, but the email could not be sent. Please contact the person directly.',
    loading: 'Loading…',
    gT: 'Offer another date', gSel: 'Who should get the email', gAll: 'All', gNone: 'None', gNeed: 'Please select at least one person.',
    m1: 'Everyone chooses a new date (recommended)', m1s: 'Each person gets a personal link with all free dates of this workshop. Nobody is moved until they have chosen.',
    m2: 'Suggest one specific date', m2s: 'The email names one date. Nobody is moved until you move them.',
    gDate: 'Offered date', gSend: 'Send emails',
    gReason: 'Reason (shown in the email, in German, optional)', gReasonPh: 'Wir müssen diesen Termin neu planen.',
    gNoMail: 'People without an email address are skipped and listed afterwards.',
    gSentLink: (n: number) => `Personal link sent to ${n} ${n === 1 ? 'person' : 'people'}.`,
    gSentOne: (n: number) => `Email sent to ${n} ${n === 1 ? 'person' : 'people'}.`,
    gSkipped: (names: string) => `Not sent: ${names}`,
    aBtn: 'Align counter', aSure: (s: number, e: number) => `The website shows ${s}, the bookings say ${e}. Set it to ${e}?`, aYes: 'Yes, align', aDone: (s: number, e: number) => `Aligned: ${s} → ${e}. The change is in the date's notes.`,
    cT: 'Capacity of this date', cLabel: 'How many people can take part?', cHint: (std: number) => `Leave empty = the workshop standard (${std}). The free seats on the website follow automatically. It cannot go below the seats already booked.`, cSaved: 'Capacity saved. The free seats were adjusted.', cBtn: 'Capacity', cOwn: 'own capacity',
    fT: 'Release seat', fBtn: 'Release seat', fWho: 'Who is not coming?', fReason: 'Reason',
    fReasons: { no_show: 'No show', late_cancel: 'Cancelled too late (no refund)', never_paid: 'Never paid', test: 'Test booking', other: 'Other' } as Record<string, string>,
    fNote: 'Note (optional)', fInfo: 'The places become free again and the person moves to "No longer on this date". The booking stays, and an existing invoice is not deleted. A refund is a separate step under "Refunds".', fYes: 'Yes, release', fDone: 'Seat released. It is free again.',
    rT: 'Remove booking', rBody: (n: string, s: number) => `The booking of ${n} will be removed. ${s === 1 ? '1 seat becomes' : `${s} seats become`} free again.`,
    rOnly: 'Removing deletes the booking completely. Only possible without an order or invoice. Otherwise use "Release seat".',
    rYes: 'Yes, remove', removed: 'Removed. The seats are free again.',
    printTitle: 'Day sheet', printSig: 'Present',
    pastNote: 'This date is in the past.',
    bookedOn: (d: string) => `booked ${d}`,
  },
}

const ORIGIN_TONE: Record<BookingOrigin, string> = { website: 'neu', manual: 'gold', wix: 'info', unmarked: 'warn' }
const PAY_TONE: Record<Payment, string> = { stripe: 'ok', voucher: 'gold', manual: 'gold', wix: 'info', none: 'warn' }
const ST_TONE: Record<string, string> = {
  active: 'ok', rebooked: 'info', voucher_issued: 'gold', cancelled_no_refund: 'bad', refunded: 'bad', no_show: 'neu',
  refund_requested: 'warn', rebooking_pending: 'warn', organiser_cancelled_pending: 'warn',
}

type Seat = { index: number; name: string; email: string; note: string; status: string; holds: boolean }

function buyerName(b: BookingRow) {
  return [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email || '—'
}

function seatsOf(b: BookingRow, guestOf: (n: string) => string): Seat[] {
  const buyer = buyerName(b)
  return Array.from({ length: Math.max(b.guestCount, 1) }, (_, i) => {
    const s = b.seats[i]
    const status = s?.seatStatus || 'active'
    return {
      index: i,
      name: s?.recipientName || (i === 0 ? buyer : guestOf(buyer)),
      email: i === 0 ? b.email : (s?.email ?? ''),
      note: s?.giftNote || (i === 0 ? b.notes.replace(/\[Wix Import[^\]]*\]/gi, '').trim() : ''),
      status,
      holds: seatHoldsPlace(status),
    }
  })
}

type Dialog =
  | { kind: 'add' }
  | { kind: 'edit'; booking: BookingRow }
  | { kind: 'move'; booking: BookingRow }
  | { kind: 'alt'; bookingIds: string[] }
  | { kind: 'remove'; booking: BookingRow }
  | { kind: 'pay'; booking: BookingRow }
  | { kind: 'release'; booking: BookingRow }
  | { kind: 'capacity' }
  | null

export function WorkshopDetailView({
  appointment,
  bookings,
  lang,
  onBack,
  onRefresh,
  onOpenProfile,
  onOpenWorkshop,
}: {
  appointment: AppointmentRow
  bookings: BookingRow[]
  lang: Lang
  onBack: () => void
  onRefresh: () => void | Promise<void>
  /** Opens the person's full profile (Teilnehmer). */
  onOpenProfile?: (email: string) => void
  /** Opens another workshop date's day sheet. */
  onOpenWorkshop?: (appointmentId: string) => void
}) {
  const t = T[lang]
  const toast = useToast()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [detail, setDetail] = useState<BookingRow | null>(null)
  const [alignAsk, setAlignAsk] = useState(false)
  const [aligning, setAligning] = useState(false)
  const color = kindColor(appointment.workshopTitle)

  const held = appointment.totalBooked
  const pending = appointment.pendingSeats ?? 0
  const free = Math.max(appointment.capacity - held - pending, 0)
  const pct = appointment.capacity ? Math.min(100, Math.round((held / appointment.capacity) * 100)) : 0
  const mism = seatMismatch(appointment)

  const dt = new Date(appointment.dateTime)
  const dateLong = dt.toLocaleDateString(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vienna' })
  const timeStr = dt.toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Vienna' })

  const rows = useMemo(() => {
    const list = bookings.map((b) => ({ b, seats: seatsOf(b, t.guestOf), held: seatsHoldingPlace(b) }))
    return { here: list.filter((r) => r.held > 0), gone: list.filter((r) => r.held === 0) }
  }, [bookings, t])

  const invoiceIds = rows.here.filter((r) => r.b.orderId && r.b.invoiceNumber).map((r) => r.b.orderId)

  const copyList = async () => {
    const lines = rows.here.flatMap((r) => r.seats.filter((s) => s.holds).map((s) => `${s.name}${s.note ? ` (${s.note})` : ''}`))
    const text = `${appointment.workshopTitle} · ${dateLong} · ${timeStr}\n\n${lines.map((l, i) => `${i + 1}. ${l}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      toast(t.copied)
    } catch {
      toast(t.copyFail)
    }
  }

  const done = async (msg: string) => {
    setDialog(null)
    toast(msg)
    await onRefresh()
  }

  let printNo = 0

  return (
    <div className="ff-page is-wide" style={{ maxWidth: 1240 }}>
      <button type="button" className="ff-link ff-noprint" onClick={onBack} style={{ marginBottom: 14 }}>
        {t.back}
      </button>

      <section className="ff-panel ff-dayhead" style={{ ['--c' as string]: color }}>
        <div>
          <div className="ff-eyebrow">{dateLong}</div>
          <h1>{appointment.workshopTitle}</h1>
          <div className="ff-muted" style={{ marginTop: 4 }}>
            {timeStr} {lang === 'de' ? 'Uhr' : ''} · {appointment.locationName}
          </div>
        </div>
        <div className="ff-dstats">
          <div>
            <b>{held}</b>
            <span>{t.seats}</span>
          </div>
          <div>
            <b>{free}</b>
            <span>{t.free}</span>
          </div>
          {pending > 0 && (
            <div title={t.heldHint}>
              <b>{pending}</b>
              <span>{t.held}</span>
            </div>
          )}
        </div>
        <div className="ff-bar is-wide" aria-label={`${held} ${t.of(appointment.capacity)}`}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="ff-dact ff-noprint">
          {!appointment.isPast && (
            <button type="button" className="ff-btn is-gold" onClick={() => setDialog({ kind: 'add' })} disabled={free <= 0} title={free <= 0 ? t.fullErr : undefined}>
              + {t.add}
            </button>
          )}
          {!appointment.isPast && (
            <button type="button" className="ff-btn" onClick={() => setDialog({ kind: 'capacity' })} title={appointment.ownCapacity ? t.cOwn : undefined}>
              {t.cBtn}: {appointment.capacity}
            </button>
          )}
          <button type="button" className="ff-btn" onClick={() => window.print()}>
            {t.print}
          </button>
          <button type="button" className="ff-btn" onClick={copyList} disabled={rows.here.length === 0}>
            {t.copy}
          </button>
          {invoiceIds.length > 0 && (
            <a
              className="ff-btn"
              href={`/api/admin/orders/receipt-bulk?ids=${invoiceIds.join(',')}&label=${encodeURIComponent(`${appointment.workshopTitle}-${dt.toISOString().slice(0, 10)}`)}`}
            >
              {t.invAll(invoiceIds.length)}
            </a>
          )}
          {!appointment.isPast && rows.here.length > 0 && (
            <button type="button" className="ff-btn" onClick={() => setDialog({ kind: 'alt', bookingIds: rows.here.map((r) => r.b.id) })}>
              {t.mailAll}
            </button>
          )}
        </div>
      </section>

      {mism && (
        <div className="ff-note ff-noprint" style={{ marginTop: 14 }}>
          {t.mism(mism.shown, mism.expected)}
          <div style={{ marginTop: 8 }}>
            {alignAsk ? (
              <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <b>{t.aSure(mism.shown, mism.expected)}</b>
                <button
                  type="button"
                  className="ff-btn is-sm is-gold"
                  disabled={aligning}
                  onClick={async () => {
                    setAligning(true)
                    const r = await alignAppointmentCounter({ appointmentId: appointment.id, seen: mism.shown })
                    setAligning(false)
                    setAlignAsk(false)
                    if (r.ok) await done(t.aDone(r.from, r.to))
                    else toast(r.error)
                  }}
                >
                  {aligning ? '…' : t.aYes}
                </button>
                <button type="button" className="ff-btn is-sm" onClick={() => setAlignAsk(false)}>{t.cancel}</button>
              </span>
            ) : (
              <button type="button" className="ff-btn is-sm" onClick={() => setAlignAsk(true)}>{t.aBtn}</button>
            )}
          </div>
        </div>
      )}
      {appointment.isPast && <div className="ff-info ff-noprint" style={{ marginTop: 14 }}>{t.pastNote}</div>}

      <div className="ff-printonly" style={{ margin: '18px 0 8px' }}>
        <strong>{t.printTitle}</strong> · {held} {t.of(appointment.capacity)}
      </div>

      <h2 className="ff-noprint" style={{ fontSize: 18, margin: '28px 0 12px' }}>{t.sheet}</h2>

      {rows.here.length === 0 ? (
        <div className="ff-panel" style={{ padding: 24 }}>
          <p className="ff-muted" style={{ margin: 0 }}>{t.nothing}</p>
        </div>
      ) : (
        <div className="ff-panel ff-sheet">
          <div className="ff-srow ff-shead" aria-hidden>
            <span>{t.cBy}</span>
            <span>{t.cSeats}</span>
            <span>{t.cSrc}</span>
            <span>{t.cStatus}</span>
            <span className="ff-noprint" style={{ textAlign: 'right' }}>{t.cAct}</span>
          </div>
          {rows.here.map(({ b, seats, held: n }) => {
            const origin = bookingOrigin(b)
            const pay = b.payment ?? 'none'
            const statuses = [...new Set(seats.map((s) => s.status))]
            return (
              <div key={b.id} className="ff-srow">
                <div className="c-n">
                  {seats.map((s) => (
                    <div key={s.index} className={`ff-seat${s.holds ? '' : ' is-gone'}`}>
                      <span className="ff-printno" aria-hidden>{s.holds ? ++printNo : '–'}</span>
                      <span style={{ minWidth: 0 }}>
                        <button type="button" className="nm ff-namebtn" onClick={() => setDetail(b)} title={t.details}>{s.name}</button>
                        {seats.length > 1 && <span className="ff-muted" style={{ fontSize: 12 }}> · {t.seatN(s.index + 1)}</span>}
                        {s.note && <span className="ff-allergy">{s.note}</span>}
                      </span>
                      <span className="ff-printonly ff-tick" aria-hidden />
                    </div>
                  ))}
                  <span className="ff-muted ff-noprint" style={{ fontSize: 12 }}>
                    {b.email || <span style={{ color: 'var(--ff-warn-fg)' }}>⚠ {t.noEmail}</span>}
                    {b.phone ? ` · ${b.phone}` : ''}
                    {b.createdAt ? ` · ${t.bookedOn(new Date(b.createdAt).toLocaleDateString(LOCALE[lang], { timeZone: 'Europe/Vienna' }))}` : ''}
                  </span>
                </div>
                <div className="c-s">
                  <b>{n}</b>
                </div>
                <div className="c-p">
                  <span className={`ff-pill ${ORIGIN_TONE[origin]}`} title={t.originHint[origin]}>{t.origin[origin]}</span>
                  {origin === 'website' && <span className={`ff-pill ${PAY_TONE[pay]}`}>{t.pay[pay]}</span>}
                  {origin !== 'website' && b.manual?.channel && <span className="ff-pill neu">{MP[lang].channels[b.manual.channel] ?? b.manual.channel}</span>}
                  {origin !== 'website' && b.manual?.paymentStatus === 'open' && <span className="ff-pill warn">{MP[lang].open}</span>}
                  {origin !== 'website' && b.manual?.paymentStatus === 'paid' && (
                    <span className="ff-pill ok">{MP[lang].paid}{b.manual.paymentMethod ? `: ${MP[lang].methods[b.manual.paymentMethod] ?? b.manual.paymentMethod}` : ''}{b.manual.voucherCode ? ` (${b.manual.voucherCode})` : ''}</span>
                  )}
                  {origin !== 'website' && !b.manual?.paymentStatus && (origin === 'wix' ? <span className="ff-pill ok">{t.pay.wix}</span> : <span className="ff-pill gold">{t.pay.manual}</span>)}
                  {b.orderId && b.invoiceNumber && (
                    <a className="ff-link ff-noprint" style={{ fontSize: 12 }} href={`/api/admin/orders/${b.orderId}/receipt`} target="_blank" rel="noopener">
                      {b.invoiceNumber}
                    </a>
                  )}
                </div>
                <div className="c-t">
                  {statuses.map((st) => (
                    <span key={st} className={`ff-pill ${ST_TONE[st] ?? 'neu'}`}>{t.st[st] ?? st}</span>
                  ))}
                </div>
                <div className="c-a ff-noprint">
                  <button type="button" className="ff-btn is-sm" onClick={() => setDetail(b)}>{t.details}</button>
                  <button type="button" className="ff-btn is-sm" onClick={() => setDialog({ kind: 'edit', booking: b })}>{t.edit}</button>
                  <button type="button" className="ff-btn is-sm" onClick={() => setDialog({ kind: 'move', booking: b })}>{t.move}</button>
                  {!appointment.isPast && (
                    <button type="button" className="ff-btn is-sm" onClick={() => setDialog({ kind: 'alt', bookingIds: [b.id] })} disabled={!b.email}>{t.alt}</button>
                  )}
                  {origin !== 'website' && (
                    <button type="button" className="ff-btn is-sm" onClick={() => setDialog({ kind: 'pay', booking: b })}>{lang === 'de' ? 'Zahlung' : 'Payment'}</button>
                  )}
                  {seats.some((x) => x.holds) && (
                    <button type="button" className="ff-btn is-sm is-danger" onClick={() => setDialog({ kind: 'release', booking: b })}>{t.fBtn}</button>
                  )}
                  {!b.orderId && origin !== 'website' && (
                    <button type="button" className="ff-btn is-sm is-danger" onClick={() => setDialog({ kind: 'remove', booking: b })}>{t.remove}</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {rows.gone.length > 0 && (
        <div className="ff-noprint">
          <h2 style={{ fontSize: 15, margin: '26px 0 10px' }} className="ff-muted">{t.gone}</h2>
          <div className="ff-panel ff-sheet" style={{ opacity: 0.75 }}>
            {rows.gone.map(({ b, seats }) => (
              <div key={b.id} className="ff-srow">
                <div className="c-n">
                  {seats.map((s) => (
                    <div key={s.index} className="ff-seat is-gone"><span className="nm">{s.name}</span></div>
                  ))}
                </div>
                <div className="c-s"><b>0</b></div>
                <div className="c-p"><span className={`ff-pill ${ORIGIN_TONE[bookingOrigin(b)]}`}>{t.origin[bookingOrigin(b)]}</span></div>
                <div className="c-t">
                  {[...new Set(seats.map((s) => s.status))].map((st) => (
                    <span key={st} className={`ff-pill ${ST_TONE[st] ?? 'neu'}`}>{t.st[st] ?? st}</span>
                  ))}
                </div>
                <div className="c-a">
                  <button type="button" className="ff-btn is-sm" onClick={() => setDetail(b)}>{t.details}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {detail && (
        <CustomerProfileModal
          bookingId={detail.id}
          title={buyerName(detail)}
          lang={lang}
          onClose={() => setDetail(null)}
          onOpenProfile={onOpenProfile ? (email: string) => { setDetail(null); onOpenProfile(email) } : undefined}
          onOpenWorkshop={(id: string) => { setDetail(null); if (id !== appointment.id) onOpenWorkshop?.(id) }}
        />
      )}

      {dialog?.kind === 'add' && (
        <Modal title={t.aT} onClose={() => setDialog(null)} wide>
          <AddManualBookingForm appointmentId={appointment.id} remainingSpots={free} lang={lang} onDone={(m) => done(m || t.saved)} />
        </Modal>
      )}
      {dialog?.kind === 'capacity' && (
        <CapacityDialog t={t} appointment={appointment} onClose={() => setDialog(null)} onDone={(m) => done(m)} />
      )}
      {dialog?.kind === 'release' && (
        <ReleaseDialog t={t} booking={dialog.booking} onClose={() => setDialog(null)} onDone={(m) => done(m)} />
      )}
      {dialog?.kind === 'pay' && (
        <ManualPaymentDialog booking={dialog.booking} lang={lang} onClose={() => setDialog(null)} onDone={(m) => done(m)} />
      )}
      {dialog?.kind === 'edit' && <EditDialog t={t} lang={lang} booking={dialog.booking} onClose={() => setDialog(null)} onDone={(m) => done(m || t.saved)} />}
      {dialog?.kind === 'move' && (
        <MoveDialog t={t} lang={lang} booking={dialog.booking} appointment={appointment} onClose={() => setDialog(null)} onDone={done} />
      )}
      {dialog?.kind === 'alt' && (
        <AltDialog
          t={t}
          lang={lang}
          appointment={appointment}
          candidates={rows.here.map((r) => r.b)}
          preselected={dialog.bookingIds}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      )}
      {dialog?.kind === 'remove' && (
        <RemoveDialog t={t} booking={dialog.booking} onClose={() => setDialog(null)} onDone={() => done(t.removed)} />
      )}
    </div>
  )
}

type Dict = (typeof T)['de']

function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="ff-modal" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ff-dlg${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}

function EditDialog({ t, lang, booking, onClose, onDone }: { t: Dict; lang: Lang; booking: BookingRow; onClose: () => void; onDone: (msg?: string) => void }) {
  const initial = seatsOf(booking, t.guestOf).map((s) => ({
    index: s.index,
    name: booking.seats[s.index]?.recipientName || (s.index === 0 ? buyerName(booking) : ''),
    email: s.email,
    note: s.note,
    holds: s.holds,
  }))
  const [seats, setSeats] = useState(initial)
  const [phone, setPhone] = useState(booking.phone)
  const [price, setPrice] = useState(String(booking.pricePerPerson ?? 0))
  const [channel, setChannel] = useState(booking.manual?.channel ?? '')
  const [dropAsk, setDropAsk] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const locked = Boolean(booking.orderId)
  const canChannel = bookingOrigin(booking) !== 'website'
  const live = seats.filter((s) => s.holds).length

  const run = async (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, msg: string) => {
    setBusy(true)
    setErr('')
    const r = await fn()
    if (!r.ok) {
      setErr(r.error)
      setBusy(false)
      return
    }
    onDone(msg)
  }
  const save = async () => {
    setBusy(true)
    setErr('')
    try {
      // Booking-level details first (phone, price, source), then each seat. Sequential writes (MongoDB Atlas M0, no transactions).
      const priceNum = Number(price.replace(',', '.'))
      const r = await updateBookingDetails({
        bookingId: booking.id,
        phone,
        ...(!locked && Number.isFinite(priceNum) ? { pricePerPerson: priceNum } : {}),
        ...(canChannel && channel ? { channel: channel as never } : {}),
      })
      if (!r.ok) throw new Error(r.error)
      for (const s of seats) {
        const before = initial[s.index]
        if (s.name === before.name && s.email === before.email && s.note === before.note) continue
        // The sheet hides the "[Wix Import …]" marker from the note — put it back, or saving would erase where this booking came from.
        const marker = s.index === 0 ? (booking.notes.match(/\[Wix Import[^\]]*\]/gi) ?? []).join(' ') : ''
        await updateBookingSeatDetails({ bookingId: booking.id, seatIndex: s.index, name: s.name, email: s.email, notes: [s.note.trim(), marker].filter(Boolean).join(' ') })
      }
      onDone()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }
  return (
    <Modal title={t.eT} onClose={onClose} wide>
      <p className="ff-muted" style={{ marginTop: 0 }}>{t.eHint}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 6 }}>
        <label className="ff-field"><span>{t.ePhone}</span>
          <input className="ff-input" value={phone} maxLength={40} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="ff-field"><span>{t.ePrice}</span>
          <input className="ff-input" inputMode="decimal" value={price} disabled={locked} onChange={(e) => setPrice(e.target.value)} />
        </label>
        {canChannel && (
          <label className="ff-field"><span>{t.eChannel}</span>
            <select className="ff-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="">{MP[lang].pick}</option>
              {CHANNELS.map((c) => <option key={c} value={c}>{MP[lang].channels[c]}</option>)}
            </select>
          </label>
        )}
      </div>
      {locked && <p className="ff-muted" style={{ fontSize: 12, margin: '0 0 6px' }}>{t.eLocked}</p>}
      {seats.map((s, i) => (
        <fieldset key={s.index} style={{ border: 0, borderTop: '1px solid var(--ff-line)', padding: '12px 0', margin: 0, display: 'grid', gap: 8, opacity: s.holds ? 1 : 0.55 }}>
          <legend style={{ fontWeight: 700, padding: 0, marginBottom: 4 }}>
            {t.seatN(s.index + 1)}{!s.holds && <span className="ff-muted" style={{ fontWeight: 400 }}> · {t.st[booking.seats[s.index]?.seatStatus || 'active'] ?? ''}</span>}
          </legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
            <label className="ff-field"><span>{t.eName}</span>
              <input className="ff-input" value={s.name} onChange={(e) => setSeats((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            </label>
            <label className="ff-field"><span>{t.eMail}</span>
              <input className="ff-input" type="email" value={s.email} onChange={(e) => setSeats((p) => p.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
            </label>
          </div>
          <label className="ff-field"><span>{t.eNote}</span>
            <textarea className="ff-input" rows={2} value={s.note} onChange={(e) => setSeats((p) => p.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
          </label>
          {!locked && s.holds && live > 1 && (
            <div>
              {dropAsk === s.index ? (
                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <b>{t.eDropSure}</b>
                  <button type="button" className="ff-btn is-sm is-danger" disabled={busy} onClick={() => run(() => cancelBookingSeat({ bookingId: booking.id, seatIndex: s.index }), t.eDropped)}>{t.rYes}</button>
                  <button type="button" className="ff-btn is-sm" onClick={() => setDropAsk(null)}>{t.cancel}</button>
                </span>
              ) : (
                <button type="button" className="ff-btn is-sm is-danger" disabled={busy} onClick={() => setDropAsk(s.index)}>{t.eDrop}</button>
              )}
            </div>
          )}
        </fieldset>
      ))}
      {!locked && (
        <div style={{ borderTop: '1px solid var(--ff-line)', paddingTop: 12 }}>
          <button type="button" className="ff-btn is-sm" disabled={busy || seats.length >= 12} onClick={() => run(() => addBookingSeats({ bookingId: booking.id, count: 1 }), t.eAdded)}>+ {t.eAdd}</button>
        </div>
      )}
      {err && <div className="ff-err">{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={save} disabled={busy}>{busy ? '…' : t.save}</button>
      </div>
    </Modal>
  )
}

function altLabel(a: Alt, lang: Lang, withTitle: boolean) {
  const d = new Date(a.dateTime)
  const date = d.toLocaleDateString(LOCALE[lang], { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Vienna' })
  const time = d.toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Vienna' })
  const freeN = Math.max(a.capacity - a.totalBooked, 0)
  return `${withTitle ? `${a.workshopTitle} · ` : ''}${date} · ${time} · ${lang === 'de' ? `${freeN} frei` : `${freeN} free`}`
}

function MoveDialog({
  t, lang, booking, appointment, onClose, onDone,
}: {
  t: Dict; lang: Lang; booking: BookingRow; appointment: AppointmentRow; onClose: () => void; onDone: (msg: string) => void
}) {
  const movable = useMemo(() => seatsOf(booking, t.guestOf).filter((s) => s.holds), [booking, t])
  const [picked, setPicked] = useState<Set<number>>(() => new Set(movable.map((s) => s.index)))
  const n = picked.size
  const [alts, setAlts] = useState<Alt[] | null>(null)
  const [to, setTo] = useState('')
  const [notify, setNotify] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => {
    getAlternateAppointments(appointment.id, { anyWorkshop: true })
      .then((r) => {
        const fit = r.filter((a) => a.capacity - a.totalBooked >= Math.max(n, 1))
        setAlts(fit)
        const same = fit.find((a) => a.workshopTitle === appointment.workshopTitle)
        setTo((cur) => (fit.some((a) => a.id === cur) ? cur : ((same ?? fit[0])?.id ?? '')))
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
  }, [appointment.id, appointment.workshopTitle, n])
  const target = alts?.find((a) => a.id === to)
  const otherKind = target && target.workshopTitle !== appointment.workshopTitle
  const move = async () => {
    if (!to || n === 0) return
    setBusy(true)
    setErr('')
    try {
      const partial = n < movable.length
      const r = partial
        ? await moveWorkshopSeats({ bookingId: booking.id, seatIndexes: [...picked], newAppointmentId: to, notifyCustomer: notify })
        : await moveWorkshopBooking({ bookingId: booking.id, newAppointmentId: to, notifyCustomer: notify })
      onDone(notify && r.emailSent !== true ? t.mvMailFail : partial ? t.movedSome : t.moved)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }
  const groups = useMemo(() => {
    const m = new Map<string, Alt[]>()
    for (const a of alts ?? []) m.set(a.workshopTitle, [...(m.get(a.workshopTitle) ?? []), a])
    return [...m.entries()].sort(([x], [y]) => Number(y === appointment.workshopTitle) - Number(x === appointment.workshopTitle))
  }, [alts, appointment.workshopTitle])
  return (
    <Modal title={t.mvT} onClose={onClose}>
      <p style={{ marginTop: 0 }}><strong>{t.mvFrom(buyerName(booking), n)}</strong></p>
      {movable.length > 1 && (
        <fieldset style={{ border: 0, padding: 0, margin: '0 0 12px', display: 'grid', gap: 6 }}>
          <legend style={{ fontWeight: 700, marginBottom: 4, padding: 0 }}>{t.mvWho}</legend>
          {movable.map((s) => (
            <label key={s.index} className="ff-chk">
              <input
                type="checkbox"
                checked={picked.has(s.index)}
                onChange={(e) => setPicked((prev) => { const next = new Set(prev); if (e.target.checked) next.add(s.index); else next.delete(s.index); return next })}
              />
              <span>{s.name}{s.note ? <span className="ff-muted"> · {s.note}</span> : null}</span>
            </label>
          ))}
          <span className="ff-muted" style={{ fontSize: 12 }}>{t.mvWhoHint}</span>
        </fieldset>
      )}
      {alts === null && !err && <p className="ff-muted">{t.loading}</p>}
      {alts && alts.length === 0 && <div className="ff-info">{t.mvNone}</div>}
      {alts && alts.length > 0 && (
        <>
          <label className="ff-field"><span>{t.mvTo}</span>
            <select className="ff-input" value={to} onChange={(e) => setTo(e.target.value)}>
              {groups.map(([title, list]) => (
                <optgroup key={title} label={title}>
                  {list.map((a) => <option key={a.id} value={a.id}>{altLabel(a, lang, false)}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          {target && (
            <ul style={{ margin: '14px 0 0', paddingLeft: 18, display: 'grid', gap: 6 }}>
              <li>{t.mvFree(n)}</li>
              <li>{t.mvTake(altLabel(target, lang, true).split(' · ').slice(0, 3).join(' · '), n, target.capacity - target.totalBooked - n)}</li>
              <li className="ff-muted">{t.mvOrder}</li>
              {otherKind && <li style={{ color: 'var(--ff-warn-fg)' }}>{t.mvInv}</li>}
            </ul>
          )}
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 14, cursor: booking.email ? 'pointer' : 'default' }}>
            <input type="checkbox" checked={notify} disabled={!booking.email} onChange={(e) => setNotify(e.target.checked)} style={{ marginTop: 3 }} />
            <span><strong>{t.mvNotify}</strong><br /><span className="ff-muted" style={{ fontSize: 13 }}>{booking.email ? t.mvNotifyHint : t.noEmail}</span></span>
          </label>
        </>
      )}
      {err && <div className="ff-err" style={{ marginTop: 12 }}>{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={move} disabled={busy || !to || n === 0}>{busy ? '…' : t.mvYes}</button>
      </div>
    </Modal>
  )
}

function AltDialog({
  t, lang, appointment, candidates, preselected, onClose, onDone,
}: {
  t: Dict; lang: Lang; appointment: AppointmentRow; candidates: BookingRow[]; preselected: string[]
  onClose: () => void; onDone: (msg: string) => void
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set(preselected))
  const [mode, setMode] = useState<'choose' | 'one'>('choose')
  const [alts, setAlts] = useState<Alt[] | null>(null)
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => {
    getAlternateAppointments(appointment.id)
      .then((r) => {
        const open = r.filter((a) => a.capacity - a.totalBooked > 0)
        setAlts(open)
        setTo(open[0]?.id ?? '')
      })
      .catch(() => setAlts([]))
  }, [appointment.id])
  const send = async () => {
    const ids = candidates.filter((b) => picked.has(b.id)).map((b) => b.id)
    if (ids.length === 0) return setErr(t.gNeed)
    setBusy(true)
    setErr('')
    try {
      if (mode === 'choose') {
        const r = await sendChooseOwnDateLinks({ appointmentId: appointment.id, bookingIds: ids, reason })
        if (!r.ok) throw new Error(r.error)
        const msg = t.gSentLink(r.data.sent.length) + (r.data.skipped.length ? ` ${t.gSkipped(r.data.skipped.join(', '))}` : '')
        onDone(msg)
      } else {
        const r = await sendAlternateDateEmail({ bookingIds: ids, newAppointmentId: to })
        onDone(t.gSentOne(r.sent.length) + (r.skippedNoEmail.length ? ` ${t.gSkipped(r.skippedNoEmail.join(', '))}` : ''))
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }
  return (
    <Modal title={t.gT} onClose={onClose} wide>
      <p className="ff-muted" style={{ marginTop: 0 }}>
        {appointment.workshopTitle} · {appointment.date} · {appointment.time}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <strong>{t.gSel}</strong>
        <span style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="ff-link" onClick={() => setPicked(new Set(candidates.map((b) => b.id)))}>{t.gAll}</button>
          <button type="button" className="ff-link" onClick={() => setPicked(new Set())}>{t.gNone}</button>
        </span>
      </div>
      <div className="ff-pick">
        {candidates.map((b) => (
          <label key={b.id} className="ff-chk">
            <input
              type="checkbox"
              checked={picked.has(b.id)}
              onChange={(e) => setPicked((p) => { const n = new Set(p); if (e.target.checked) n.add(b.id); else n.delete(b.id); return n })}
            />
            <span>{buyerName(b)} <span className="ff-muted">· {seatsHoldingPlace(b)} · {b.email || t.noEmail}</span></span>
          </label>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
        <label className="ff-pick2">
          <input type="radio" name="amode" checked={mode === 'choose'} onChange={() => setMode('choose')} />
          <span><b>{t.m1}</b><small>{t.m1s}</small></span>
        </label>
        <label className="ff-pick2" aria-disabled={!alts?.length}>
          <input type="radio" name="amode" checked={mode === 'one'} disabled={!alts?.length} onChange={() => setMode('one')} />
          <span><b>{t.m2}</b><small>{alts && alts.length === 0 ? t.mvNone : t.m2s}</small></span>
        </label>
      </div>
      {mode === 'choose' && (
        <label className="ff-field" style={{ marginTop: 12 }}><span>{t.gReason}</span>
          <input className="ff-input" value={reason} maxLength={200} placeholder={t.gReasonPh} onChange={(e) => setReason(e.target.value)} />
        </label>
      )}
      {mode === 'one' && alts && alts.length > 0 && (
        <label className="ff-field" style={{ marginTop: 12 }}><span>{t.gDate}</span>
          <select className="ff-input" value={to} onChange={(e) => setTo(e.target.value)}>
            {alts.map((a) => <option key={a.id} value={a.id}>{altLabel(a, lang, false)}</option>)}
          </select>
        </label>
      )}
      <p className="ff-muted" style={{ fontSize: 13, marginBottom: 0 }}>{t.gNoMail}</p>
      {err && <div className="ff-err" style={{ marginTop: 12 }}>{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={send} disabled={busy || picked.size === 0 || (mode === 'one' && !to)}>{busy ? '…' : t.gSend}</button>
      </div>
    </Modal>
  )
}

function CapacityDialog({ t, appointment, onClose, onDone }: { t: Dict; appointment: AppointmentRow; onClose: () => void; onDone: (msg: string) => void }) {
  const standard = appointment.standardCapacity ?? appointment.capacity
  const [value, setValue] = useState(appointment.ownCapacity ? String(appointment.ownCapacity) : '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const save = async () => {
    const trimmed = value.trim()
    const cap = trimmed === '' ? null : Number(trimmed)
    if (cap !== null && (!Number.isInteger(cap) || cap < 1)) return setErr(t.cLabel)
    setBusy(true)
    setErr('')
    const r = await setAppointmentCapacity({ appointmentId: appointment.id, capacity: cap })
    if (!r.ok) {
      setErr(r.error)
      setBusy(false)
      return
    }
    onDone(t.cSaved)
  }
  return (
    <Modal title={t.cT} onClose={onClose}>
      <label className="ff-field"><span>{t.cLabel}</span>
        <input className="ff-input" inputMode="numeric" value={value} placeholder={String(standard)} onChange={(e) => setValue(e.target.value)} />
      </label>
      <p className="ff-muted" style={{ fontSize: 13 }}>{t.cHint(standard)}</p>
      {err && <div className="ff-err">{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={save} disabled={busy}>{busy ? '…' : t.save}</button>
      </div>
    </Modal>
  )
}

function ReleaseDialog({ t, booking, onClose, onDone }: { t: Dict; booking: BookingRow; onClose: () => void; onDone: (msg: string) => void }) {
  const live = seatsOf(booking, t.guestOf).filter((s) => s.holds)
  const [picked, setPicked] = useState<Set<number>>(() => new Set(live.map((s) => s.index)))
  const [reason, setReason] = useState('no_show')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const go = async () => {
    if (picked.size === 0) return
    setBusy(true)
    setErr('')
    const r = await releaseBookingSeats({ bookingId: booking.id, seatIndexes: [...picked], reason: reason as never, note })
    if (!r.ok) {
      setErr(r.error)
      setBusy(false)
      return
    }
    onDone(t.fDone)
  }
  return (
    <Modal title={t.fT} onClose={onClose}>
      <p style={{ marginTop: 0 }}><strong>{buyerName(booking)}</strong></p>
      <fieldset style={{ border: 0, padding: 0, margin: '0 0 12px', display: 'grid', gap: 6 }}>
        <legend style={{ fontWeight: 700, marginBottom: 4, padding: 0 }}>{t.fWho}</legend>
        {live.map((s) => (
          <label key={s.index} className="ff-chk">
            <input
              type="checkbox"
              checked={picked.has(s.index)}
              onChange={(e) => setPicked((prev) => { const next = new Set(prev); if (e.target.checked) next.add(s.index); else next.delete(s.index); return next })}
            />
            <span>{s.name}</span>
          </label>
        ))}
      </fieldset>
      <label className="ff-field"><span>{t.fReason}</span>
        <select className="ff-input" value={reason} onChange={(e) => setReason(e.target.value)}>
          {Object.entries(t.fReasons).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="ff-field" style={{ marginTop: 10 }}><span>{t.fNote}</span>
        <input className="ff-input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
      </label>
      <p className="ff-muted" style={{ fontSize: 13 }}>{t.fInfo}</p>
      {err && <div className="ff-err">{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-danger" onClick={go} disabled={busy || picked.size === 0}>{busy ? '…' : t.fYes}</button>
      </div>
    </Modal>
  )
}

function RemoveDialog({ t, booking, onClose, onDone }: { t: Dict; booking: BookingRow; onClose: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const remove = async () => {
    setBusy(true)
    try {
      await deleteManualWorkshopBooking(booking.id)
      onDone()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }
  return (
    <Modal title={t.rT} onClose={onClose}>
      <p style={{ marginTop: 0 }}>{t.rBody(buyerName(booking), seatsHoldingPlace(booking))}</p>
      <p className="ff-muted" style={{ fontSize: 13 }}>{t.rOnly}</p>
      {err && <div className="ff-err">{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-danger" onClick={remove} disabled={busy}>{busy ? '…' : t.rYes}</button>
      </div>
    </Modal>
  )
}
