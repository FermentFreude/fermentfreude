import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { assignQuoteNumber } from '@/hooks/assignQuoteNumber'

/**
 * Quotes — ANGEBOT documents for not-yet-committed work (private/corporate
 * events, Sonderveranstaltungen). Deliberately NOT an Order — nothing has
 * been paid or booked yet, and an Order carries ecommerce-plugin machinery
 * (Stripe intents, inventory decrement, cart merge) that doesn't apply here.
 * Accepting a quote is a manual admin step: create the real Order/invoice
 * separately (no atomic cross-collection conversion on Atlas M0).
 */
export const Quotes: CollectionConfig = {
  slug: 'quotes',
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'quoteNumber',
    defaultColumns: ['quoteNumber', 'clientName', 'projectName', 'status', 'validUntil'],
    description: 'Angebote (Kostenvoranschläge) für Sonder-, Partner- oder Firmenveranstaltungen.',
  },
  fields: [
    {
      name: 'quoteNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Auto-generated, e.g. ANG-2026-0001.' },
    },
    {
      name: 'issueDate',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Offen', value: 'open' },
        { label: 'Angenommen', value: 'accepted' },
        { label: 'Abgelaufen', value: 'expired' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Rein informativ. Wird ein Angebot angenommen, erstellt ein Admin die reale Bestellung/Rechnung separat.',
      },
    },
    {
      name: 'validUntil',
      type: 'date',
      required: true,
      admin: { description: 'Gültig bis — standardmäßig 14 Tage ab Angebotsdatum.' },
    },
    {
      name: 'clientName',
      type: 'text',
      required: true,
      label: 'Firma / Name',
    },
    {
      name: 'contactPersonName',
      type: 'text',
      label: 'Ansprechperson (optional)',
    },
    {
      name: 'clientAddress',
      type: 'textarea',
      label: 'Adresse',
      admin: { description: 'Straße, PLZ Ort — eine Zeile pro Adressbestandteil.' },
    },
    {
      name: 'projectName',
      type: 'text',
      required: true,
      label: 'Projekt',
    },
    {
      name: 'clientReference',
      type: 'text',
      label: 'Kundenreferenz (optional)',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Position', plural: 'Positionen' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Leistung' },
        { name: 'note', type: 'text', label: 'Leistungsumfang / Beschreibung (optional)' },
        { name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1, label: 'Anzahl' },
        {
          name: 'unitPriceCents',
          type: 'number',
          required: true,
          min: 0,
          label: 'Einzelpreis (Cent)',
          admin: { description: 'In Cent, z.B. 45000 = € 450,00.' },
        },
      ],
    },
    {
      name: 'eventDateText',
      type: 'text',
      label: 'Termin / Zeitraum',
      admin: { description: 'Freitext, z.B. "voraussichtlich Oktober 2026".' },
    },
    {
      name: 'eventLocationText',
      type: 'text',
      label: 'Veranstaltungsort',
    },
    {
      name: 'participantCountText',
      type: 'text',
      label: 'Teilnehmerzahl',
    },
    {
      name: 'cancellationTermsText',
      type: 'text',
      label: 'Storno / Umbuchung',
      admin: { description: 'Standardmäßig "individuelle Vereinbarung" wenn leer.' },
    },
  ],
  hooks: {
    beforeChange: [assignQuoteNumber],
  },
}
