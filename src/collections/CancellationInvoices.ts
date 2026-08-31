import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { assignCancellationInvoiceNumber } from '@/hooks/assignCancellationInvoiceNumber'

/**
 * CancellationInvoices — STORNORECHNUNG documents. Kept separate from Orders
 * so cancelling never mutates or replaces the original order record — both
 * documents are meant to be kept together per the Hinweis box on the PDF.
 * Line items are snapshotted at cancellation time so the Storno stays
 * historically accurate even if product prices change later.
 */
export const CancellationInvoices: CollectionConfig = {
  slug: 'cancellation-invoices',
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'cancellationNumber',
    defaultColumns: ['cancellationNumber', 'originalInvoiceNumber', 'refundStatus', 'createdAt'],
    description: 'Stornorechnungen — stornieren die referenzierte Bestellung vollständig.',
  },
  fields: [
    {
      name: 'cancellationNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Auto-generated, erbt die Serie der Originalrechnung (MAN/WEB).' },
    },
    {
      name: 'issueDate',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      label: 'Originalbestellung',
    },
    {
      name: 'originalInvoiceNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'originalSeries',
      type: 'select',
      required: true,
      options: [
        { label: 'MAN', value: 'MAN' },
        { label: 'WEB', value: 'WEB' },
      ],
    },
    {
      name: 'originalIssueDate',
      type: 'date',
      required: true,
    },
    {
      name: 'reason',
      type: 'text',
      label: 'Stornoanlass (optional, kurz)',
    },
    {
      name: 'clientName',
      type: 'text',
      required: true,
    },
    {
      name: 'clientAddress',
      type: 'textarea',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true, defaultValue: 1 },
        { name: 'unitPriceCents', type: 'number', required: true },
      ],
    },
    {
      name: 'totalCents',
      type: 'number',
      required: true,
      admin: { description: 'Positive Cent-Summe — wird auf der PDF negativ dargestellt.' },
    },
    {
      name: 'refundStatus',
      type: 'select',
      required: true,
      defaultValue: 'offen',
      options: [
        { label: 'Offen', value: 'offen' },
        { label: 'Erstattet', value: 'erstattet' },
        { label: 'Verrechnet', value: 'verrechnet' },
      ],
      admin: {
        description:
          'Rein informativ — die tatsächliche Rückerstattung erfolgt manuell im Stripe-Dashboard bzw. per Überweisung.',
      },
    },
    {
      name: 'refundDate',
      type: 'date',
    },
    {
      name: 'refundMethodOrReference',
      type: 'text',
      label: 'Zahlungsart / Referenz',
    },
  ],
  hooks: {
    beforeChange: [assignCancellationInvoiceNumber],
  },
}
