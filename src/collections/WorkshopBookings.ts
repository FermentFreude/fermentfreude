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
