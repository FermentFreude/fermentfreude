import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * ActivityEvents — powers the Roster "Activity / Benachrichtigungen" feed
 * (plan §10). A generalized log, not refund-specific: every booking,
 * purchase, voucher, and refund event the founders should be aware of.
 *
 * Deliberately simple — no websockets/push. This is a periodically-checked
 * internal tool, not a live ops console; `readBy` + an unread badge is enough.
 */
export const ActivityEvents: CollectionConfig = {
  slug: 'activity-events',
  labels: {
    singular: 'Activity Event',
    plural: 'Activity Events',
  },
  admin: {
    useAsTitle: 'summary',
    group: 'Refunds & Rebooking',
    defaultColumns: ['type', 'summary', 'createdAt'],
    description: 'Audit trail powering the Roster dashboard\'s Activity feed. Written by hooks — not intended for manual editing.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Order placed', value: 'order_placed' },
        { label: 'Voucher purchased', value: 'voucher_purchased' },
        { label: 'Voucher redeemed', value: 'voucher_redeemed' },
        { label: 'Booking rebooked', value: 'booking_rebooked' },
        { label: 'Booking cancelled — no refund', value: 'booking_cancelled_no_refund' },
        { label: 'Refund requested', value: 'refund_requested' },
        { label: 'Refund completed', value: 'refund_completed' },
        { label: 'Appointment cancelled by organiser', value: 'appointment_cancelled_by_organiser' },
      ],
    },
    {
      name: 'refId',
      type: 'text',
      label: 'Reference ID',
      admin: { description: 'The order / booking / voucher / refund-request id this event is about.' },
    },
    {
      name: 'summary',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable one-liner, e.g. "Thomas Huber — Kombucha 12.9., €99 refund requested".',
      },
    },
    {
      name: 'readBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Admin users who have seen this event — drives the unread-count badge on the Roster nav item.',
      },
    },
  ],
  timestamps: true,
}
