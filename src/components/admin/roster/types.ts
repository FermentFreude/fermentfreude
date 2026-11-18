export type RosterStats = {
  upcomingWorkshops: number
  totalParticipants: number
  openPickups: number
  workshopRevenue: number
}

export type AppointmentRow = {
  id: string
  workshopTitle: string
  workshopDescription: string
  dateTime: string
  date: string
  time: string
  locationName: string
  pricePerPerson: number
  totalBooked: number
  capacity: number
  /** This date's own capacity, if the founders set one (null = the workshop's standard applies). */
  ownCapacity?: number | null
  /** Internal note on the date (CMS "notes"), e.g. capacity exceptions. */
  internalNote?: string
  /** The workshop's standard capacity. */
  standardCapacity?: number
  isPast: boolean
  /** Free places the public booking page currently shows (null = unknown). */
  counterFree?: number | null
  /** Places held by unpaid (pending) bookings. */
  pendingSeats?: number
}

export type SeatEntry = {
  recipientName: string
  email: string
  giftNote: string
  seatStatus?: string
  cancelledAt?: string
  cancelledReason?: string
}

export type BookingHistoryEntry = {
  id: string
  at: string
  type: string
  summary: string
  by: string
}

export type BookingRow = {
  id: string
  /** The workshop date this booking is on ('' = unknown). */
  appointmentId?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  guestCount: number
  notes: string
  seats: SeatEntry[]
  createdAt: string
  orderId: string
  workshopTitle: string
  workshopSlug: string
  date: string
  time: string
  pricePerPerson: number
  totalPrice: number
  status: string
  /** Append-only "Verlauf" — oldest first, as stored. */
  history: BookingHistoryEntry[]
  /** Invoice number of the linked order ('' = none). Filled for upcoming dates. */
  invoiceNumber?: string
  /** How the booking was paid (see archive). */
  payment?: 'stripe' | 'voucher' | 'mixed' | 'manual' | 'wix' | 'none'
  /** Only for seats added by hand: how it came in and how it was paid. */
  manual?: {
    channel: string
    paymentStatus: '' | 'paid' | 'open'
    paymentMethod: string
    voucherCode: string
    paymentNote: string
  }
}

export type ParticipantRow = {
  name: string
  email: string
  phone: string
  workshopTitle: string
  bookingDate: string
  status: 'confirmed' | 'pending' | 'cancelled'
  /** This person's own seat — 'rebooked', 'refunded' etc. means they're no longer on this date. */
  seatStatus: string
  isBuyer: boolean
  /** True when someone registered a shop account with this email. Otherwise a guest (booking record only). */
  hasAccount: boolean
  guestOfName: string
  orderRef: string
  booking: BookingRow
}

export type PickupItem = {
  title: string
  qty: number
  price: number
}

export type PickupOrderRow = {
  id: string
  invoiceNumber: string
  createdAt: string
  customerFirstName: string
  customerLastName: string
  email: string
  phone: string
  items: PickupItem[]
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  pickupStatus: 'pending' | 'ready' | 'collected'
  totalAmount: number
  notes: string
}

export type VoucherRow = {
  id: string
  code: string
  value: number
  status: 'active' | 'redeemed' | 'expired'
  purchaserName: string
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  personalNote: string
  deliveryMethod: string
  redeemedOn: string
  redeemedForWorkshop: string
  invoiceNumber: string
  createdAt: string
}

export type RefundRequestRow = {
  id: string
  customerName: string
  customerEmail: string
  workshopTitle: string
  workshopDate: string
  seatIndex: number
  amount: number // cents
  /** What really went back (cents) once closed — can be less than `amount` (partial refund). */
  refundedAmount: number | null
  status: 'requested' | 'acknowledged' | 'processing' | 'completed' | 'failed' | 'resolved'
  stripePaymentIntentId: string
  requestedAt: string
  completedAt: string
  daysPending: number
  /** How the founders handled it ('' = not handled yet). */
  resolution: '' | 'refunded' | 'partial' | 'voucher' | 'rebooked' | 'declined' | 'other'
  resolutionNote: string
  handledByName: string
  /** Date it was handled (de-DE) and the days since — drives the "Stripe has not confirmed" reminder. */
  handledAt: string
  daysSinceHandled: number
  /** The Stornorechnung a founder made for this request ('' = none yet). Never made automatically. */
  stornoId: string
  stornoNumber: string
  /** The customer's reason from their booking link ('' if none). */
  reason: string
}

export type OrderRow = {
  id: string
  invoiceNumber: string
  customerName: string
  customerEmail: string
  amount: number // cents
  status: 'processing' | 'completed' | 'cancelled' | 'refunded' | ''
  itemsSummary: string
  createdAt: string
  cancellationInvoiceId: string | null
  cancellationNumber: string | null
}

export type QuoteRow = {
  id: string
  quoteNumber: string
  clientName: string
  projectName: string
  status: 'open' | 'accepted' | 'expired'
  totalAmount: number // cents
  validUntil: string
  createdAt: string
}

export type ActivityEventRow = {
  id: string
  type: string
  refId: string
  summary: string
  createdAt: string
  isUnread: boolean
  /** The customer's reason from their booking link ('' if none). */
  reason: string
  /** Founder who made an exception; '' = the customer did it. */
  actorName: string
}

import type { AttentionNoteRow, TeamMember } from './attentionTypes'

export type RosterData = {
  stats: RosterStats
  appointments: AppointmentRow[]
  bookingsByAppointment: Record<string, BookingRow[]>
  participants: ParticipantRow[]
  pickupOrders: PickupOrderRow[]
  orders: OrderRow[]
  quotes: QuoteRow[]
  vouchers: VoucherRow[]
  refundRequests: RefundRequestRow[]
  activityEvents: ActivityEventRow[]
  activityUnreadCount: number
  attentionNotes: AttentionNoteRow[]
  /** Keys of automatic items someone marked as known. */
  attentionAcks: string[]
  /** Admin users (for conversations). */
  team: TeamMember[]
  /** Current user's id ('' in the server-rendered first paint). */
  me: string
}
