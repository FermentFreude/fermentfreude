import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

export const BrevoTemplates: CollectionConfig = {
  slug: 'brevo-templates',
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Integrations',
    description: 'Brevo email templates. Edit content and it syncs to Brevo API.',
    useAsTitle: 'templateName',
    defaultColumns: ['templateName', 'brevoTemplateId', 'syncStatus', 'updatedAt'],
  },
  fields: [
    {
      name: 'brevoTemplateId',
      type: 'number',
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: 'templateName',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'triggerDescription',
      type: 'text',
      localized: true,
      admin: { description: 'When is this email sent?' },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'heroIcon',
      type: 'text',
      admin: { description: 'Emoji for hero section' },
    },
    {
      name: 'heroHeading',
      type: 'text',
      localized: true,
    },
    {
      name: 'heroSubheading',
      type: 'text',
      localized: true,
    },
    {
      name: 'greeting',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'bodySection1',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'bodySection2',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'bodySection3',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'bodySection4',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'ctaHeading',
      type: 'text',
      localized: true,
    },
    {
      name: 'ctaText',
      type: 'text',
      localized: true,
    },
    {
      name: 'ctaUrl',
      type: 'text',
      localized: true,
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'footerContent',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'syncStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Synced', value: 'synced' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'pending',
      admin: { readOnly: true },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'syncError',
      type: 'textarea',
      admin: { readOnly: true },
    },
  ],
}
