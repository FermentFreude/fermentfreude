import { adminOnly } from '@/access/adminOnly'
import { sendVoucherPurchaseEmail } from '@/hooks/brevo/sendVoucherPurchaseEmail'
import crypto from 'crypto'
import type { CollectionConfig } from 'payload'

/**
 * Generate a cryptographically-strong voucher code.
 * Format: FF-GIFT-{RANDOM_8}  e.g. FF-GIFT-A7K3M2X9
 */
function generateVoucherCode(): string {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `FF-GIFT-${randomPart}`
}

export const Vouchers: CollectionConfig = {
  slug: 'vouchers',
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'code',
    defaultColumns: ['code', 'value', 'status', 'purchaserEmail', 'createdAt'],
    description:
      'Geschenkgutscheine — generische €99 Workshop-Erlebnis Gutscheine. Käufer wählt keinen Workshop; Empfänger löst den Gutschein beim Checkout für einen beliebigen Workshop ein.',
  },
  fields: [
    /* ── Voucher Identity ── */
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated unique voucher code (e.g. FF-GIFT-A7K3M2X9)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Aktiv / Active', value: 'active' },
        { label: 'Eingelöst / Redeemed', value: 'redeemed' },
        { label: 'Abgelaufen / Expired', value: 'expired' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Voucher lifecycle status',
      },
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      defaultValue: 99,
      min: 1,
      admin: {
        description: 'Voucher value in EUR (default €99 for workshop experience)',
      },
    },

    /* ── Purchaser Details ── */
    {
      name: 'purchaserName',
      type: 'text',
      admin: {
        description:
          'Full name of the buyer (used in greeting of confirmation email). Optional for legacy vouchers.',
      },
    },
    {
      name: 'purchaserEmail',
      type: 'email',
      required: true,
      admin: { description: 'Email of the buyer (receives purchase confirmation)' },
    },

    /* ── Recipient Details ── */
    {
      name: 'recipientEmail',
      type: 'email',
      admin: {
        description: 'Email of the recipient (receives voucher code if email delivery)',
      },
    },

    /* ── Delivery ── */
    {
      name: 'deliveryMethod',
      type: 'select',
      required: true,
      defaultValue: 'email',
      options: [
        { label: 'E-Mail', value: 'email' },
        { label: 'Abholung / Pickup', value: 'pickup' },
      ],
      admin: { description: 'How the voucher is delivered to the recipient' },
    },

    /* ── Payment Reference ── */
    {
      name: 'stripeSessionId',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Stripe Checkout Session ID for payment verification',
      },
    },

    /* ── Redemption Tracking ── */
    {
      name: 'redeemed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Automatically set to true when voucher is used',
      },
    },
    {
      name: 'redeemedOn',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Date when voucher was redeemed',
      },
    },
    {
      name: 'redeemedForWorkshop',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Workshop name when voucher was redeemed at checkout',
      },
    },
    {
      name: 'redeemedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'User who redeemed the voucher',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this voucher',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && !data?.code) {
          data.code = generateVoucherCode()
        }
        return data
      },
    ],
    afterChange: [sendVoucherPurchaseEmail],
  },
}
