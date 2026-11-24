import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * Contact messages — every message sent through the website's contact forms
 * (/contact, /about and the Gastronomy inquiry form).
 *
 * Safety net only: /api/contact saves the message here, emails it to
 * kontakt@, and DELETES it again once Brevo accepted the email (no message
 * storage on the free-tier DB). So this list is normally EMPTY — anything in
 * it is a message whose email failed and has not reached the inbox.
 * Until Nov 2026 the forms were not wired to anything and every message was
 * silently dropped.
 *
 * Writes only happen from /api/contact via the Local API (overrideAccess).
 * Public REST/GraphQL access is closed on purpose (adminOnly everywhere).
 */
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Kontaktanfrage', plural: 'Kontaktanfragen' },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Inhalt',
    useAsTitle: 'email',
    defaultColumns: ['createdAt', 'name', 'email', 'subject', 'source'],
    description:
      'Normalerweise leer. Nachrichten aus den Kontaktformularen gehen per E-Mail an kontakt@fermentfreude.at und werden danach hier gelöscht. Steht hier etwas, ist die E-Mail fehlgeschlagen – bitte dem Kunden direkt antworten und den Eintrag dann löschen.',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'source',
      type: 'select',
      label: 'Formular',
      required: true,
      options: [
        { label: 'Kontaktformular', value: 'contact' },
        { label: 'Gastronomie-Anfrage', value: 'gastronomy' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'pagePath',
      type: 'text',
      label: 'Seite',
      admin: { position: 'sidebar', readOnly: true, description: 'Auf welcher Seite abgeschickt.' },
    },
    {
      name: 'locale',
      type: 'text',
      label: 'Sprache',
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'name', type: 'text', label: 'Name', required: true, admin: { readOnly: true } },
    { name: 'email', type: 'email', label: 'E-Mail', required: true, admin: { readOnly: true } },
    { name: 'phone', type: 'text', label: 'Telefon', admin: { readOnly: true } },
    { name: 'company', type: 'text', label: 'Firma / Betrieb', admin: { readOnly: true } },
    { name: 'subject', type: 'text', label: 'Betreff / Anliegen', admin: { readOnly: true } },
    {
      name: 'details',
      type: 'textarea',
      label: 'Weitere Angaben',
      admin: {
        readOnly: true,
        description: 'Zusätzliche Felder (z. B. Betriebsart, Menge bei Gastronomie-Anfragen).',
      },
    },
    { name: 'message', type: 'textarea', label: 'Nachricht', admin: { readOnly: true } },
  ],
}
