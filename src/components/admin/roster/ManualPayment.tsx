'use client'

import React, { useState } from 'react'

import { updateManualPayment } from './manualBookingActions'
import { bookingOrigin } from './bookingOrigin'
import type { Lang } from './rosterI18n'
import type { BookingRow } from './types'

/**
 * Source + payment for seats the founders add by hand. Used twice: inside
 * "Person hinzufügen" and later in "Zahlung" (add or change it any time,
 * create the invoice, send the confirmation).
 */

export type PaymentForm = {
  status: '' | 'paid' | 'open'
  method: string
  voucherCode: string
  note: string
  invoice: boolean
  confirm: boolean
}

export const EMPTY_PAYMENT: PaymentForm = { status: '', method: '', voucherCode: '', note: '', invoice: false, confirm: false }

export const CHANNELS = ['email', 'phone', 'inperson', 'wix', 'other'] as const
export const METHODS = ['transfer', 'cash', 'card_onsite', 'voucher_wix', 'voucher_shop', 'wix_paid', 'other'] as const

export const MP = {
  de: {
    channel: 'Wie ist die Buchung zustande gekommen?', pick: '– bitte wählen –',
    channels: { email: 'Per E-Mail', phone: 'Telefon', inperson: 'Vor Ort / im Shop', wix: 'Über Wix', other: 'Sonstiges' } as Record<string, string>,
    status: 'Zahlung', paid: 'Bezahlt', open: 'Noch offen (Reservierung)',
    method: 'Zahlungsart',
    methods: { transfer: 'Überweisung', cash: 'Bar', card_onsite: 'Karte vor Ort', voucher_wix: 'Wix-Gutschein', voucher_shop: 'Gutschein (Shop / Website)', wix_paid: 'Bereits in Wix bezahlt', other: 'Sonstiges' } as Record<string, string>,
    code: 'Gutschein-Code', note: 'Notiz zur Zahlung (optional)', notePh: 'z. B. Überweisung am 12.11. eingegangen',
    invoice: 'Rechnung erstellen', invoiceHint: 'Optional, geht auch später. Nur für bezahlte Plätze.',
    invoiceVoucher: 'Bei Gutscheinen gibt es die Rechnung meist schon beim Gutscheinkauf.',
    confirm: 'Bestätigung per E-Mail senden', confirmHint: 'Optional, geht auch später.', noEmail: 'Dafür wird eine E-Mail-Adresse gebraucht.',
    title: 'Zahlung und Herkunft', save: 'Speichern', cancel: 'Abbrechen', saved: 'Gespeichert.',
    needStatus: 'Bitte angeben, ob bezahlt oder noch offen.', needMethod: 'Bitte die Zahlungsart wählen.', needCode: 'Bitte den Gutschein-Code eintragen.',
    hasInvoice: 'Es gibt schon eine Rechnung.', wixInvoice: 'Aus Wix übernommen: Zahlung und Rechnung laufen über Wix.',
  },
  en: {
    channel: 'How did the booking come in?', pick: '– please choose –',
    channels: { email: 'By email', phone: 'Phone', inperson: 'In person / in the shop', wix: 'Via Wix', other: 'Other' } as Record<string, string>,
    status: 'Payment', paid: 'Paid', open: 'Not paid yet (reservation)',
    method: 'Payment method',
    methods: { transfer: 'Bank transfer', cash: 'Cash', card_onsite: 'Card on site', voucher_wix: 'Wix voucher', voucher_shop: 'Voucher (shop / website)', wix_paid: 'Already paid in Wix', other: 'Other' } as Record<string, string>,
    code: 'Voucher code', note: 'Payment note (optional)', notePh: 'e.g. transfer received on 12 Nov',
    invoice: 'Create invoice', invoiceHint: 'Optional, can be done later. Paid seats only.',
    invoiceVoucher: 'For vouchers the invoice usually exists from the voucher purchase.',
    confirm: 'Send confirmation email', confirmHint: 'Optional, can be done later.', noEmail: 'This needs an email address.',
    title: 'Payment and source', save: 'Save', cancel: 'Cancel', saved: 'Saved.',
    needStatus: 'Please say whether it is paid or still open.', needMethod: 'Please choose the payment method.', needCode: 'Please enter the voucher code.',
    hasInvoice: 'An invoice already exists.', wixInvoice: 'Imported from Wix: payment and invoice are handled in Wix.',
  },
}

export function validatePayment(p: PaymentForm, lang: Lang): string {
  const t = MP[lang]
  if (!p.status) return t.needStatus
  if (p.status === 'paid') {
    if (!p.method) return t.needMethod
    if ((p.method === 'voucher_wix' || p.method === 'voucher_shop') && !p.voucherCode.trim()) return t.needCode
  }
  return ''
}

export function toPaymentInput(p: PaymentForm) {
  return p.status === 'open'
    ? { paymentStatus: 'open' as const, paymentNote: p.note.trim() || undefined }
    : {
        paymentStatus: 'paid' as const,
        paymentMethod: p.method as never,
        voucherCode: p.voucherCode.trim() || undefined,
        paymentNote: p.note.trim() || undefined,
      }
}

export function PaymentFields({
  value, onChange, lang, hasEmail, canInvoice = true, invoiceNote,
}: {
  value: PaymentForm
  onChange: (v: PaymentForm) => void
  lang: Lang
  hasEmail: boolean
  /** False when an invoice already exists. */
  canInvoice?: boolean
  invoiceNote?: string
}) {
  const t = MP[lang]
  const set = (patch: Partial<PaymentForm>) => onChange({ ...value, ...patch })
  const isVoucher = value.method === 'voucher_wix' || value.method === 'voucher_shop'
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <label className="ff-field"><span>{t.status} *</span>
          <select className="ff-input" value={value.status} onChange={(e) => set({ status: e.target.value as PaymentForm['status'], ...(e.target.value !== 'paid' ? { invoice: false } : {}) })}>
            <option value="">{t.pick}</option>
            <option value="paid">{t.paid}</option>
            <option value="open">{t.open}</option>
          </select>
        </label>
        {value.status === 'paid' && (
          <label className="ff-field"><span>{t.method} *</span>
            <select className="ff-input" value={value.method} onChange={(e) => set({ method: e.target.value })}>
              <option value="">{t.pick}</option>
              {METHODS.map((m) => <option key={m} value={m}>{t.methods[m]}</option>)}
            </select>
          </label>
        )}
        {value.status === 'paid' && isVoucher && (
          <label className="ff-field"><span>{t.code} *</span>
            <input className="ff-input" value={value.voucherCode} onChange={(e) => set({ voucherCode: e.target.value })} />
          </label>
        )}
      </div>
      {value.status && (
        <label className="ff-field"><span>{t.note}</span>
          <input className="ff-input" value={value.note} maxLength={300} placeholder={t.notePh} onChange={(e) => set({ note: e.target.value })} />
        </label>
      )}
      <label className="ff-chk" style={{ opacity: value.status === 'paid' && canInvoice ? 1 : 0.5 }}>
        <input type="checkbox" checked={value.invoice} disabled={value.status !== 'paid' || !canInvoice} onChange={(e) => set({ invoice: e.target.checked })} />
        <span>
          <b>{t.invoice}</b>
          <span className="ff-muted" style={{ display: 'block', fontSize: 12 }}>
            {!canInvoice ? (invoiceNote ?? t.hasInvoice) : t.invoiceHint}
            {isVoucher && canInvoice && ` ${t.invoiceVoucher}`}
          </span>
        </span>
      </label>
      <label className="ff-chk" style={{ opacity: hasEmail ? 1 : 0.5 }}>
        <input type="checkbox" checked={value.confirm} disabled={!hasEmail} onChange={(e) => set({ confirm: e.target.checked })} />
        <span>
          <b>{t.confirm}</b>
          <span className="ff-muted" style={{ display: 'block', fontSize: 12 }}>{hasEmail ? t.confirmHint : t.noEmail}</span>
        </span>
      </label>
    </div>
  )
}

/** "Zahlung" on the day sheet: add or change how a hand-entered seat was paid, then optionally invoice and confirm. */
export function ManualPaymentDialog({
  booking, lang, onClose, onDone,
}: { booking: BookingRow; lang: Lang; onClose: () => void; onDone: (message: string) => void }) {
  const t = MP[lang]
  const m = booking.manual
  const isWix = bookingOrigin(booking) === 'wix'
  const [form, setForm] = useState<PaymentForm>({
    ...EMPTY_PAYMENT,
    status: m?.paymentStatus || (isWix ? 'paid' : ''),
    method: m?.paymentMethod || (isWix ? 'wix_paid' : ''),
    voucherCode: m?.voucherCode ?? '',
    note: m?.paymentNote ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const save = async () => {
    const problem = validatePayment(form, lang)
    if (problem) return setErr(problem)
    setBusy(true)
    setErr('')
    const r = await updateManualPayment({
      bookingId: booking.id,
      payment: toPaymentInput(form),
      createInvoice: form.invoice,
      sendConfirmation: form.confirm,
    })
    if (!r.ok) {
      setErr(r.error)
      setBusy(false)
      return
    }
    onDone([r.message, ...r.warnings.map((w) => `⚠ ${w}`)].join(' · '))
  }
  return (
    <div className="ff-modal" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ff-dlg" role="dialog" aria-modal="true" aria-label={t.title}>
        <h3>{t.title}</h3>
        <p className="ff-muted" style={{ marginTop: 0 }}>
          {[booking.firstName, booking.lastName].filter(Boolean).join(' ') || booking.email}
          {m?.channel ? ` · ${t.channels[m.channel] ?? m.channel}` : ''}
        </p>
        <PaymentFields value={form} onChange={setForm} lang={lang} hasEmail={Boolean(booking.email)} canInvoice={!booking.orderId && !isWix} invoiceNote={isWix ? t.wixInvoice : undefined} />
        {err && <div className="ff-err">{err}</div>}
        <div className="ff-acts">
          <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
          <button type="button" className="ff-btn is-gold" onClick={save} disabled={busy}>{busy ? '…' : t.save}</button>
        </div>
      </div>
    </div>
  )
}
