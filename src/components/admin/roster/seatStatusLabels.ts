import { STATUS } from './rosterTheme'

/** One label per seat status — used on roster cards, the participants list and the booking detail. */
export const SEAT_STATUS_LABELS: Record<string, { label: string; tone: keyof typeof STATUS }> = {
  active: { label: 'Bestätigt', tone: 'success' },
  cancelled_no_refund: { label: 'Storniert — keine Rückerstattung', tone: 'danger' },
  rebooking_pending: { label: 'Umbuchung ausstehend', tone: 'warning' },
  rebooked: { label: 'Umgebucht auf anderen Termin', tone: 'info' },
  refund_requested: { label: 'Rückerstattung angefragt', tone: 'warning' },
  refunded: { label: 'Rückerstattet', tone: 'danger' },
  voucher_issued: { label: 'Gutschein statt Termin', tone: 'purple' },
  organiser_cancelled_pending: { label: 'Von uns abgesagt — wartet auf Kunde', tone: 'warning' },
  no_show: { label: 'Nicht erschienen', tone: 'neutral' },
}

export function seatStatusLabel(status: string | null | undefined) {
  return SEAT_STATUS_LABELS[status || 'active'] ?? SEAT_STATUS_LABELS.active!
}
