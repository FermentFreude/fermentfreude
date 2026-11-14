'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { seatHoldsPlace, seatsHoldingPlace } from '@/lib/seatCapacity'

import {
  deleteManualWorkshopBooking,
  getAlternateAppointments,
  moveWorkshopBooking,
  sendAlternateDateEmail,
  updateBookingSeatDetails,
} from './actions'
import { AddManualBookingForm } from './AddManualBookingForm'
import { BookingDetailModal } from './BookingDetailModal'
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
    mvInv: 'Andere Workshop-Art: Die Rechnung nennt weiterhin den ersten Workshop.',
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
    rT: 'Manuelle Buchung entfernen', rBody: (n: string, s: number) => `Die Buchung von ${n} wird entfernt. ${s === 1 ? '1 Platz wird' : `${s} Plätze werden`} wieder frei.`,
    rOnly: 'Nur von Hand eingetragene Buchungen lassen sich entfernen. Online bezahlte Buchungen laufen über Rückerstattungen.',
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
    mvInv: 'Different workshop type: the invoice still names the first workshop.',
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
    rT: 'Remove manual booking', rBody: (n: string, s: number) => `The booking of ${n} will be removed. ${s === 1 ? '1 seat becomes' : `${s} seats become`} free again.`,
    rOnly: 'Only bookings you entered by hand can be removed. Bookings paid online go through refunds.',
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
  | null

export function WorkshopDetailView({
  appointment,
  bookings,
  lang,
  onBack,
  onRefresh,
}: {
  appointment: AppointmentRow
  bookings: BookingRow[]
  lang: Lang
  onBack: () => void
  onRefresh: () => void | Promise<void>
}) {
  const t = T[lang]
  const toast = useToast()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [detail, setDetail] = useState<BookingRow | null>(null)
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

      {mism && <div className="ff-note ff-noprint" style={{ marginTop: 14 }}>{t.mism(mism.shown, mism.expected)}</div>}
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
                        <span className="nm">{s.name}</span>
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
                  {!appointment.isPast && (
                    <>
                      <button type="button" className="ff-btn is-sm" onClick={() => setDialog({ kind: 'move', booking: b })}>{t.move}</button>
                      <button type="button" className="ff-btn is-sm" onClick={() => setDialog({ kind: 'alt', bookingIds: [b.id] })} disabled={!b.email}>{t.alt}</button>
                    </>
                  )}
                  {!b.orderId && origin === 'manual' && (
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

      {detail && <BookingDetailModal booking={detail} onClose={() => setDetail(null)} />}

      {dialog?.kind === 'add' && (
        <Modal title={t.aT} onClose={() => setDialog(null)} wide>
          <AddManualBookingForm appointmentId={appointment.id} remainingSpots={free} onDone={() => done(t.saved)} />
        </Modal>
      )}
      {dialog?.kind === 'edit' && <EditDialog t={t} booking={dialog.booking} onClose={() => setDialog(null)} onDone={() => done(t.saved)} />}
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

function EditDialog({ t, booking, onClose, onDone }: { t: Dict; booking: BookingRow; onClose: () => void; onDone: () => void }) {
  const initial = seatsOf(booking, t.guestOf).map((s) => ({
    index: s.index,
    name: booking.seats[s.index]?.recipientName || (s.index === 0 ? buyerName(booking) : ''),
    email: s.email,
    note: s.note,
  }))
  const [seats, setSeats] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const save = async () => {
    setBusy(true)
    setErr('')
    try {
      // Sequential writes (MongoDB Atlas M0, no transactions).
      for (const s of seats) {
        const before = initial[s.index]
        if (s.name === before.name && s.email === before.email && s.note === before.note) continue
        await updateBookingSeatDetails({ bookingId: booking.id, seatIndex: s.index, name: s.name, email: s.email, notes: s.note })
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
      {seats.map((s, i) => (
        <fieldset key={s.index} style={{ border: 0, borderTop: '1px solid var(--ff-line)', padding: '12px 0', margin: 0, display: 'grid', gap: 8 }}>
          <legend style={{ fontWeight: 700, padding: 0, marginBottom: 4 }}>{t.seatN(s.index + 1)}</legend>
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
        </fieldset>
      ))}
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
  const n = seatsHoldingPlace(booking)
  const [alts, setAlts] = useState<Alt[] | null>(null)
  const [to, setTo] = useState('')
  const [notify, setNotify] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => {
    getAlternateAppointments(appointment.id, { anyWorkshop: true })
      .then((r) => {
        const fit = r.filter((a) => a.capacity - a.totalBooked >= n)
        setAlts(fit)
        const same = fit.find((a) => a.workshopTitle === appointment.workshopTitle)
        setTo((same ?? fit[0])?.id ?? '')
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
  }, [appointment.id, appointment.workshopTitle, n])
  const target = alts?.find((a) => a.id === to)
  const otherKind = target && target.workshopTitle !== appointment.workshopTitle
  const move = async () => {
    if (!to) return
    setBusy(true)
    setErr('')
    try {
      const r = await moveWorkshopBooking({ bookingId: booking.id, newAppointmentId: to, notifyCustomer: notify })
      onDone(notify && r.emailSent !== true ? t.mvMailFail : t.moved)
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
        <button type="button" className="ff-btn is-gold" onClick={move} disabled={busy || !to}>{busy ? '…' : t.mvYes}</button>
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
