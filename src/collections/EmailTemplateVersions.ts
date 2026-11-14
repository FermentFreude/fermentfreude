import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * Before-copies of Brevo email templates.
 *
 * Every save from the dashboard's "E-Mails" tab first stores the complete
 * template as it was (subject + HTML), so any change can be undone. Rows are
 * written once and never changed or deleted. Internal data, not localized.
 *
 * Note: the Brevo account is shared by staging and production, but each
 * environment keeps its own copies here (separate databases).
 */
export const EmailTemplateVersions: CollectionConfig = {
  slug: 'email-template-versions',
  labels: { singular: 'Email Template Version', plural: 'Email Template Versions' },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'templateName',
    group: 'Team',
    defaultColumns: ['templateId', 'templateName', 'reason', 'savedByName', 'createdAt'],
    description: 'Before-copies of the email templates, used by "Rückgängig" in the dashboard. Read-only.',
    hidden: true,
  },
  fields: [
    { name: 'templateId', type: 'number', required: true, index: true },
    { name: 'templateName', type: 'text' },
    { name: 'subject', type: 'text', required: true },
    { name: 'htmlContent', type: 'textarea', required: true },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Before an edit', value: 'before-edit' },
        { label: 'Before restoring an older version', value: 'before-restore' },
      ],
    },
    { name: 'savedByName', type: 'text' },
    { name: 'savedByEmail', type: 'text' },
  ],
}
