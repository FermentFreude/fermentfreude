import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * RefundRequests — replaces the dormant CancellationRequests/ReturnRequests
 * (create: adminOnly there too, so customers could never create one via the
 * API at all — dead scaffolding, not worth patching). This collection is
 * seat-scoped from the start, matching the "one seat = one independent
 * lifecycle" architecture principle (plan §3). The old two collections stay
 * registered (not deleted) — they may hold historical rows.
 *
 * MVP scope (plan §8): no Stripe API refund call is made from this app.
 * Rows here exist to (a) notify the founders with everything they need to
 * issue the refund manually in Stripe's dashboard, and (b) get reconciled to
 * `completed` by the existing charge.refunded webhook once they do.
 */
export const RefundRequests: CollectionConfig = {
  slug: 'refund-requests',
  labels: {
    singular: 'Refund Request',
    plural: 'Refund Requests',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Refunds & Rebooking',
    defaultColumns: ['status', 'policyResult', 'requestedAmount', 'stripePaymentIntentId', 'requestedAt'],
    description:
      'Refund requests created by customers (self-service) or admins (organiser cancellation, goodwill). No refund is issued automatically — a founder actions it in Stripe\'s dashboard using the PaymentIntent ID here; the charge.refunded webhook then marks this row completed.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'workshop-bookings',
      required: true,
      label: 'Booking',
    },
    {
      name: 'seatIndex',
      type: 'number',
      required: true,
      label: 'Seat Index',
      admin: {
        description: '0-based index into the booking\'s seats[] array — identifies exactly which seat this request is for.',
      },
    },
    {
      name: 'seatId',
      type: 'text',
      label: 'Seat Row ID',
      admin: {
        description: 'The seats[] array item\'s own Payload-generated id, for a lookup that survives array reordering.',
      },
    },
    {
      name: 'policyResult',
      type: 'select',
      required: true,
      options: [
        { label: 'Full refund', value: 'full_refund' },
        { label: 'Rebook now', value: 'rebook_now' },
        { label: 'Rebook later (voucher)', value: 'rebook_later_voucher' },
        { label: 'No entitlement', value: 'no_entitlement' },
        { label: 'Organiser cancellation — refund', value: 'organiser_cancellation_refund' },
        { label: 'Organiser cancellation — rebook', value: 'organiser_cancellation_rebook' },
        { label: 'Goodwill (admin-only)', value: 'goodwill' },
      ],
      admin: {
        description: 'Which policy-engine outcome produced this row — see docs/REFUND_REBOOKING_SYSTEM_PLAN.md §5.',
      },
    },
    {
      name: 'requestedAmount',
      type: 'number',
      label: 'Requested Amount (cents)',
      admin: {
        description:
          'Calculated from the seat\'s actually-paid components — never the current list price (matters if a price-adjusted rebooking already happened on this seat).',
      },
    },
    {
      name: 'paymentSource',
      type: 'select',
      options: [
        { label: 'Card (Stripe)', value: 'card' },
        { label: 'Purchased voucher', value: 'purchased_voucher' },
        { label: 'Mixed', value: 'mixed' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'requested',
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Acknowledged', value: 'acknowledged' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
        description:
          '"Completed" is set automatically by the charge.refunded webhook once Stripe confirms the refund — founders don\'t need to set this manually.',
      },
    },
    {
      name: 'initiatedBy',
      type: 'select',
      required: true,
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Admin', value: 'admin' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      label: 'Stripe PaymentIntent ID',
      admin: {
        description: 'For founders\' manual Stripe lookup — included in the admin alert email.',
      },
    },
    {
      name: 'stripeRefundId',
      type: 'text',
      label: 'Stripe Refund ID',
      admin: {
        readOnly: true,
        description: 'Filled once the charge.refunded webhook reconciles this row.',
      },
    },
    {
      name: 'requestedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'acknowledgedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.requestedAt) {
          data.requestedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  timestamps: true,
}
