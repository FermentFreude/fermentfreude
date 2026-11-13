import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * Internal "Needs a look" items for the founders' dashboard.
 *  - kind "note": a note written by an admin (shown to all admins, editable, closable).
 *  - kind "ack":  "known, ignore" for an item the dashboard detected automatically.
 * Internal admin data, written once — deliberately NOT localized.
 * Managed only through the Roster dashboard, so the default Payload UI is hidden.
 */
export const AttentionNotes: CollectionConfig = {
  slug: 'attention-notes',
  labels: { singular: 'Attention Note', plural: 'Attention Notes' },
  access: { create: adminOnly, read: adminOnly, update: adminOnly, delete: adminOnly },
  admin: {
    useAsTitle: 'title',
    group: 'Team',
    defaultColumns: ['title', 'kind', 'severity', 'status', 'createdByName'],
    description: 'Notes and acknowledgements behind the "Needs a look" list. Managed in the Roster dashboard.',
    hidden: true,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'note',
      options: [
        { label: 'Note', value: 'note' },
        { label: 'Acknowledged automatic item', value: 'ack' },
      ],
    },
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea' },
    {
      name: 'severity',
      type: 'select',
      defaultValue: 'attention',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Attention', value: 'attention' },
        { label: 'Urgent', value: 'urgent' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Done', value: 'done' },
      ],
    },
    { name: 'appointmentId', type: 'text', admin: { description: 'Optional link to a workshop date.' } },
    { name: 'bookingId', type: 'text', admin: { description: 'Optional link to a booking.' } },
    { name: 'dueDate', type: 'date' },
    { name: 'autoKey', type: 'text', index: true, admin: { description: 'Key of the automatic item (kind "ack" only).' } },
    { name: 'createdByName', type: 'text' },
    { name: 'doneByName', type: 'text' },
    { name: 'doneAt', type: 'date' },
  ],
}
