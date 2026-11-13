export type AttentionSeverity = 'info' | 'attention' | 'urgent'

export type AttentionNoteRow = {
  id: string
  title: string
  body: string
  severity: AttentionSeverity
  status: 'open' | 'done'
  appointmentId: string
  bookingId: string
  /** ISO date (yyyy-mm-dd) or empty. */
  dueDate: string
  createdByName: string
  createdAt: string
  doneByName: string
  doneAt: string
}

export type AutoAttentionItem = {
  key: string
  severity: AttentionSeverity
  /** Which rule found it — decides the wording. */
  rule: 'seat-mismatch' | 'no-receipt' | 'refund-open'
  appointmentId?: string
  params: Record<string, string | number>
}
