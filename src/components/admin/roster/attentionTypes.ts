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
  createdById: string
  /** user id, 'all', or '' */
  assignedTo: string
  messages: NoteMessage[]
  /** How many messages the current user has seen. */
  seenCount: number
}

export type NoteMessage = {
  byId: string
  byName: string
  at: string
  text: string
  images: { id: string; url: string; thumb: string }[]
  event: '' | 'asked' | 'done' | 'reopened'
  eventTo: string
}

export type TeamMember = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  emailPref: 'all' | 'urgent' | 'off'
}

export type AutoAttentionItem = {
  key: string
  severity: AttentionSeverity
  /** Which rule found it — decides the wording. */
  rule: 'seat-mismatch' | 'no-receipt' | 'refund-open'
  appointmentId?: string
  params: Record<string, string | number>
}
