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
    defaultColumns: ['workshopTitle', 'date', 'firstName', 'email', 'guestCount', 'status'],
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
      name: 'orderId',
      type: 'text',
      label: 'Order ID',
      admin: {
        description: 'ID of the order that confirmed this booking. Set automatically on payment.',
        readOnly: true,
      },
    },
    {
      name: 'seats',
      type: 'array',
      label: 'Guests (per seat)',
      admin: {
        description:
          'One entry per booked seat. Seat 1 is the buyer themselves. Additional seats may include the guest name and any note (e.g. dietary requirements like vegetarian, vegan, allergies). All confirmation emails are sent only to the buyer — guests do NOT receive separate emails.',
      },
      fields: [
        {
          name: 'isGift',
          type: 'checkbox',
          defaultValue: false,
          label: 'Legacy: Is a gift (unused)',
          admin: {
            description:
              'Legacy field. As of May 2026 we no longer send separate emails to guests — vouchers are the dedicated gift flow. Always false for new bookings.',
            hidden: true,
          },
        },
        {
          name: 'recipientName',
          type: 'text',
          label: 'Guest Name',
          admin: {
            description:
              'Name of the person attending in this seat (optional). Shown on the workshop attendee list.',
          },
        },
        {
          name: 'recipientEmail',
          type: 'email',
          label: 'Legacy: Recipient Email (unused)',
          admin: {
            description:
              'Legacy field. As of May 2026 we no longer collect or email guests directly. Always empty for new bookings.',
            hidden: true,
          },
        },
        {
          name: 'giftNote',
          type: 'textarea',
          label: 'Note (e.g. dietary requirements)',
          maxLength: 500,
          admin: {
            description:
              'Optional note about this guest — typically dietary requirements (vegetarian, vegan, gluten-free, allergies) or accessibility needs.',
          },
        },
        {
          name: 'giftEmailSentAt',
          type: 'date',
          label: 'Legacy: Gift Email Sent At (unused)',
          admin: {
            readOnly: true,
            hidden: true,
            description: 'Legacy field. No longer written — guest emails are disabled.',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
