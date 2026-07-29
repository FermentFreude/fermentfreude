import crypto from 'crypto'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * BookingMagicLinks — token-secured, no-login access to a booking's
 * self-service (or organiser-cancellation) manage screen.
 *
 * Reuses the exact pattern already proven by Orders.downloadToken /
 * WorkshopBookings.downloadToken: a random UUID stored server-side, compared
 * against the client-supplied token inside a route that calls
 * `overrideAccess: true` — Payload's collection access rules below are
 * intentionally admin-only, since customers never touch this collection
 * directly through the API.
 */
export const BookingMagicLinks: CollectionConfig = {
  slug: 'booking-magic-links',
  labels: {
    singular: 'Booking Magic Link',
    plural: 'Booking Magic Links',
  },
  admin: {
    useAsTitle: 'token',
    group: 'Refunds & Rebooking',
    defaultColumns: ['token', 'bookingId', 'scope', 'issuedAt', 'expiresAt'],
    description:
      'Tokens behind the "Buchung verwalten" links sent to customers. The underlying entitlement never expires — only the link does; an expired link is reissued (new row, same bookingId), never edited in place.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated unique token (UUID) — the credential in the manage-booking link.',
      },
    },
    {
      name: 'bookingId',
      type: 'relationship',
      relationTo: 'workshop-bookings',
      required: true,
      label: 'Booking',
    },
    {
      name: 'scope',
      type: 'select',
      required: true,
      defaultValue: 'self-service',
      options: [
        { label: 'Self-service (customer-initiated)', value: 'self-service' },
        { label: 'Organiser cancellation', value: 'organiser-cancellation' },
      ],
      admin: {
        description:
          'Which branch of seatActionOptions() this link resolves to — organiser-cancellation links are only valid while the appointment is CANCELLED_BY_ORGANISER.',
      },
    },
    {
      name: 'issuedAt',
      type: 'date',
      required: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description:
          'Nullable — leave empty for no expiry. When set and passed, the route rejects the token and the customer must be issued a new link (via the confirmation email\'s "resend" path or an admin action) — the underlying entitlement is untouched.',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data) {
          if (!data.token) data.token = crypto.randomUUID()
          if (!data.issuedAt) data.issuedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  timestamps: true,
}
