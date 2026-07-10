import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const BacklogItems: CollectionConfig = {
  slug: 'backlog-items',
  labels: {
    singular: 'Backlog Item',
    plural: 'Backlog Items',
  },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Team',
    defaultColumns: ['itemId', 'title', 'priority', 'status', 'board'],
    description:
      'Internal team backlog — bugs, features, decisions and next steps. Managed via the Backlog board (sidebar), not this default admin form.',
    hidden: false,
  },
  fields: [
    {
      name: 'itemId',
      type: 'text',
      required: true,
      unique: true,
      label: 'Item ID',
      admin: { description: 'e.g. WEB-001, CASE-01, DEC-01', readOnly: true },
    },
    {
      name: 'board',
      type: 'select',
      required: true,
      defaultValue: 'current',
      options: [
        { label: 'Current Backlog', value: 'current' },
        { label: "New — David's Brief", value: 'new' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'feature',
      options: ['bug', 'feature', 'content', 'legal', 'org', 'performance', 'design', 'decision'],
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'must',
      options: ['critical', 'must', 'should', 'nice'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: ['open', 'partial', 'their-action', 'blocked', 'done', 'future'],
    },
    {
      name: 'effort',
      type: 'select',
      required: true,
      defaultValue: 'M',
      options: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
      name: 'owners',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Dev (Rafaela)', value: 'dev' },
        { label: "Ala'a", value: 'alaa' },
        { label: 'David', value: 'david' },
        { label: 'Marcel', value: 'marcel' },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Page slug',
      admin: { description: 'Where on the site this relates to, without leading slash' },
    },
    {
      name: 'related',
      type: 'text',
      label: 'Related item ID',
      admin: { description: 'e.g. WEB-033 — links this item to another one on the board' },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'response',
      type: 'textarea',
      label: 'Response / plan',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Private notes',
    },
    {
      name: 'todos',
      type: 'array',
      label: 'Next steps',
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'done', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'decision',
      type: 'json',
      label: 'Decision (question / options / choice / notes)',
      admin: {
        description: 'Only used for category=decision items. Edited via the Backlog board decision widget.',
        condition: (data) => data?.category === 'decision',
      },
    },
  ],
}
