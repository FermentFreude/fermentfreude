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
    defaultColumns: ['workshopTitle', 'date', 'guestCount', 'totalPrice', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
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
        description:
          'Auto-set to pending on cart add. Transitions to confirmed after Stripe payment succeeds.',
      },
    },
    {
      name: 'workshopSlug',
      type: 'text',
      required: true,
      label: 'Workshop Slug',
      admin: { description: 'e.g. "kombucha", "lakto", "tempeh"' },
    },
    {
      name: 'appointmentId',
      type: 'text',
      required: true,
      label: 'Appointment ID',
      admin: { description: 'ID of the WorkshopAppointment' },
    },
    {
      name: 'workshopTitle',
      type: 'text',
      required: true,
      label: 'Workshop Title',
      admin: { description: 'e.g. "Kombucha Workshop"' },
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      label: 'Appointment Date',
      admin: { description: 'Formatted date string' },
    },
    {
      name: 'time',
      type: 'text',
      required: true,
      label: 'Appointment Time',
      admin: { description: 'Formatted time string' },
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
    {
      name: 'cartSlug',
      type: 'text',
      label: 'Temporary Cart ID',
      admin: { description: 'For linking to cart items (temporary until checkout)' },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Customer Email',
      admin: { description: 'Email for booking confirmation' },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'Customer First Name',
      admin: { description: 'For personalizing the booking confirmation email' },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Customer Last Name',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      admin: { description: 'Optional contact number' },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Special Requests / Notes',
      admin: { description: 'Any dietary restrictions, allergies, or special requests' },
    },
    {
      name: 'downloadToken',
      type: 'text',
      label: 'Receipt Download Token',
      admin: {
        description:
          'Secure token for guest receipt download link. Auto-generated on confirmation.',
        readOnly: true,
      },
    },
    {
      name: 'seats',
      type: 'array',
      label: 'Per-Seat Recipient Details',
      admin: {
        description:
          'Optional per-seat info collected at checkout. If a seat is marked as a gift and has a recipient email, the gift notification email (without price) is sent to that address. Otherwise the booking confirmation goes only to the payer.',
      },
      fields: [
        {
          name: 'isGift',
          type: 'checkbox',
          defaultValue: false,
          label: 'Is a gift',
          admin: {
            description:
              'When true, the recipient gets the gift notification email instead of the payer receiving an extra confirmation.',
          },
        },
        {
          name: 'recipientName',
          type: 'text',
          label: 'Recipient Name',
          admin: {
            description: 'Name shown on the gift email and on the workshop attendee list.',
          },
        },
        {
          name: 'recipientEmail',
          type: 'email',
          label: 'Recipient Email',
          admin: {
            description:
              'If supplied with isGift, recipient receives the gift notification + .ics. Otherwise ignored.',
          },
        },
        {
          name: 'giftNote',
          type: 'textarea',
          label: 'Personal Gift Note',
          maxLength: 500,
          admin: {
            description: 'Optional personal note from the buyer (max 500 chars).',
          },
        },
        {
          name: 'giftEmailSentAt',
          type: 'date',
          label: 'Gift Email Sent At',
          admin: {
            readOnly: true,
            description: 'Set after the gift notification has been dispatched.',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
