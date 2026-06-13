import { adminOnly } from '@/access/adminOnly'
import { assignInvoiceNumber } from '@/hooks/assignInvoiceNumber'
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
      admin: { description: 'Email of the buyer (receives purchase confirmation). Leave blank for manually-created vouchers.' },
    },

    /* ── Recipient Details ── */
    {
      name: 'recipientName',
      type: 'text',
      admin: {
        description: 'Name of the recipient (used on the gift card and in the email greeting).',
      },
    },
    {
      name: 'recipientEmail',
      type: 'email',
      admin: {
        description: 'Email of the recipient (used when deliveryMethod = email-recipient).',
      },
    },
    {
      name: 'personalNote',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description:
          'Optional personal note from the buyer printed on the gift card (max 500 chars).',
      },
    },

    /* ── Delivery ── */
    {
      name: 'deliveryMethod',
      type: 'select',
      required: true,
      defaultValue: 'email-self',
      options: [
        // Sprint 3 — Rare-Beauty-style three options.
        { label: 'Direkt an Empfänger:in / Direct to recipient', value: 'email-recipient' },
        { label: 'An mich (zum Weiterleiten) / To me (forward later)', value: 'email-self' },
        { label: 'PDF zum Ausdrucken / PDF to print', value: 'pdf' },
        // Legacy values kept for backwards compatibility with existing vouchers.
        { label: 'E-Mail (legacy)', value: 'email' },
        { label: 'Abholung / Pickup (legacy)', value: 'pickup' },
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
      name: 'invoiceNumber',
      type: 'text',
      label: 'Invoice Number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Sequential invoice number (e.g. FF-2026-0001). Assigned automatically on purchase.',
      },
    },
    /* ── PDF Download (admin-only button) ── */
    {
      name: 'downloadPdf',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/admin/VoucherDownloadButton#VoucherDownloadButton',
        },
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
    beforeValidate: [
      // Code generation MUST run before validation — code is required+unique,
      // but the client never sends it. beforeChange runs after validation in
      // Payload 3.x, so we generate here instead.
      async ({ data, operation }) => {
        if (operation === 'create' && data && !data.code) {
          data.code = generateVoucherCode()
        }
        return data
      },
    ],
    beforeChange: [
      assignInvoiceNumber,
    ],
    afterChange: [sendVoucherPurchaseEmail],
  },
}
