import { isAdmin } from '@/access/isAdmin'
import { CollectionConfig } from 'payload'

export const WorkshopBookings: CollectionConfig = {
  slug: 'workshop-bookings',
  labels: {
    singular: 'Workshop Booking',
    plural: 'Workshop Bookings',
  },
  admin: {
    useAsTitle: 'workshopTitle',
    group: 'Workshops',
    defaultColumns: ['workshopTitle', 'date', 'firstName', 'lastName', 'email', 'guestCount', 'notes', 'status'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // ── Sidebar ────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Status',
      options: [
        { label: 'Pending (awaiting payment)', value: 'pending' },
        { label: 'Confirmed (payment received)', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Set to "Confirmed" for phone/manual bookings where payment was received outside of Stripe.',
      },
    },
    {
      name: 'appointmentId',
      type: 'text',
      label: 'Appointment ID',
      admin: {
        position: 'sidebar',
        description: 'ID of the WorkshopAppointment. Auto-populated for online bookings. For phone bookings: copy the ID from the correct appointment in the Workshop Appointments list — this is required for the booking to appear in the Roster dashboard.',
      },
    },
    {
      name: 'cartSlug',
      type: 'text',
      label: 'Cart ID',
      admin: {
        position: 'sidebar',
        description: 'Auto-populated for online bookings. Not needed for phone bookings.',
      },
    },
    {
      name: 'orderId',
      type: 'text',
      label: 'Order ID',
      admin: {
        position: 'sidebar',
        description: 'Set automatically when payment is confirmed via Stripe.',
        readOnly: true,
      },
    },
    {
      name: 'downloadToken',
      type: 'text',
      label: 'Receipt Download Token',
      admin: {
        position: 'sidebar',
        description: 'Auto-generated on confirmation. Used for the guest receipt download link.',
        readOnly: true,
      },
    },

    // ── Customer info (fills first — critical for phone bookings) ──
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      admin: {
        description: 'Customer first name. Auto-populated from checkout for online bookings.',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      admin: { description: 'Used to send the booking confirmation email.' },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Dietary Requirements / Special Requests',
      admin: {
        description: 'Dietary restrictions, allergies, intolerances, or any other special requests.',
      },
    },

    // ── Workshop & booking details ─────────────────────────────
    {
      name: 'workshopTitle',
      type: 'text',
      required: true,
      label: 'Workshop',
      admin: { description: 'e.g. "Kombucha Workshop"' },
    },
    {
      name: 'workshopSlug',
      type: 'text',
      required: true,
      label: 'Workshop Slug',
      admin: { description: 'e.g. "kombucha", "lakto", "tempeh"' },
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      label: 'Date',
      admin: { description: 'Formatted date string, e.g. "14. Juni 2026"' },
    },
    {
      name: 'time',
      type: 'text',
      required: true,
      label: 'Time',
      admin: { description: 'Formatted time string, e.g. "10:00 – 13:00"' },
    },
    {
      name: 'guestCount',
      type: 'number',
      required: true,
      label: 'Number of Guests',
      min: 1,
      max: 12,
    },
    {
      name: 'pricePerPerson',
      type: 'number',
      required: true,
      label: 'Price per Person (€)',
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
      label: 'Total Price (€)',
    },

    // ── Per-seat guest details ─────────────────────────────────
    {
      name: 'seats',
      type: 'array',
      label: 'Guests (per seat)',
      admin: {
        description:
          'One entry per booked seat. Seat 1 is the buyer. Additional seats can include a guest name and dietary notes. Confirmation emails go only to the buyer.',
      },
      fields: [
        {
          name: 'recipientName',
          type: 'text',
          label: 'Guest Name',
          admin: {
            description: 'Name of the person attending this seat (optional).',
          },
        },
        {
          name: 'giftNote',
          type: 'textarea',
          label: 'Dietary / Notes',
          maxLength: 500,
          admin: {
            description: 'Dietary requirements, allergies, or accessibility needs for this guest.',
          },
        },
        {
          name: 'seatStatus',
          type: 'select',
          defaultValue: 'active',
          label: 'Seat Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Cancelled — no refund', value: 'cancelled_no_refund' },
            { label: 'Rebooking pending', value: 'rebooking_pending' },
            { label: 'Rebooked', value: 'rebooked' },
            { label: 'Refund requested', value: 'refund_requested' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'Voucher issued (rebook later)', value: 'voucher_issued' },
            { label: 'Organiser-cancelled — awaiting customer choice', value: 'organiser_cancelled_pending' },
            { label: 'No-show', value: 'no_show' },
          ],
          admin: {
            description:
              'Lifecycle status of this individual seat — every seat resolves independently. Set automatically by the manage-booking flow; the booking-level Status field above is the order/payment state, not this.',
          },
        },
        {
          name: 'selfRebookingUsed',
          type: 'checkbox',
          defaultValue: false,
          label: 'Self-rebooking right used',
          admin: {
            description:
              'True once this seat has used its one-time rebooking right (AGB §4.6) — either rebook-now or rebook-later-via-code. No further self-service rebooking or refund is offered after this.',
          },
        },
        {
          name: 'cancelledAt',
          type: 'date',
          label: 'Cancelled At',
          admin: {
            description: 'When this seat was cancelled or its rebooking right exercised.',
            readOnly: true,
          },
        },
        {
          name: 'cancelledReason',
          type: 'select',
          label: 'Reason',
          options: [
            { label: 'Cannot attend', value: 'cannot_attend' },
            { label: 'Personal health', value: 'personal_health' },
            { label: 'Wrong workshop', value: 'wrong_workshop' },
            { label: 'Workshop cancelled by us', value: 'workshop_cancelled' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Reason the customer selected when cancelling/rebooking this seat.',
          },
        },
        {
          name: 'linkedVoucherId',
          type: 'relationship',
          relationTo: 'vouchers',
          label: 'Linked Voucher',
          admin: {
            description: 'Set when seatStatus = voucher_issued — the deferred-rebooking code issued for this seat.',
            readOnly: true,
          },
        },
        {
          name: 'linkedRefundRequestId',
          type: 'relationship',
          relationTo: 'refund-requests',
          label: 'Linked Refund Request',
          admin: {
            description: 'Set when a refund was requested for this seat.',
            readOnly: true,
          },
        },
        {
          name: 'rebookedToBookingId',
          type: 'text',
          label: 'Rebooked To Booking ID',
          admin: {
            description: 'Traceability — the new WorkshopBooking created when this seat was rebooked (rebook-now).',
            readOnly: true,
          },
        },
        {
          name: 'rebookedFromBookingId',
          type: 'text',
          label: 'Rebooked From Booking ID',
          admin: {
            description: 'Traceability — the original WorkshopBooking this seat was rebooked from, if this booking exists because of a rebooking.',
            readOnly: true,
          },
        },
        {
          name: 'rebookedFromSeatIndex',
          type: 'number',
          label: 'Rebooked From Seat Index',
          admin: {
            description:
              'Traceability — the specific seat index on the original booking this seat was rebooked from. Paired with rebookedFromBookingId so rebook-now can detect an interrupted request (new booking created but the original seat never got marked resolved) and resume instead of creating a duplicate.',
            readOnly: true,
          },
        },
        {
          name: 'isGift',
          type: 'checkbox',
          defaultValue: false,
          label: 'Legacy: Is a gift (unused)',
          admin: { hidden: true },
        },
        {
          name: 'recipientEmail',
          type: 'email',
          label: 'Legacy: Recipient Email (unused)',
          admin: { hidden: true },
        },
        {
          name: 'giftEmailSentAt',
          type: 'date',
          label: 'Legacy: Gift Email Sent At (unused)',
          admin: { hidden: true, readOnly: true },
        },
      ],
    },
  ],
  timestamps: true,
}
