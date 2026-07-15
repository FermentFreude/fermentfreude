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
    hidden: true, // custom Backlog board (/admin/backlog) is the only intended UI — default Payload CRUD stays API-only
  },
  fields: [
    {
      name: 'itemId',
      type: 'text',
      required: true,
      unique: true,
      label: 'Item ID',
      admin: { description: 'e.g. WEB-001', readOnly: true },
    },
    {
      name: 'board',
      type: 'select',
      required: true,
      defaultValue: 'roadmap',
      options: [
        { label: 'Main Roadmap', value: 'roadmap' },
        { label: 'Backlog (bugs & maintenance)', value: 'backlog' },
        { label: 'New Features', value: 'features' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'folderLabel',
      type: 'text',
      label: 'Folder name',
      admin: {
        description:
          'Only used when this item acts as a folder in the Features/Backlog folder view (i.e. it has 2+ children) — a broader, friendlier name for the whole initiative (e.g. "Refund & Cancellation Architecture"). Leave blank to just use the title above. Never overrides the title itself, so a Roadmap item stays an exact match to the spreadsheet.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'feature',
      options: [
        { label: 'Organization', value: 'org' },
        { label: 'Bug Fix', value: 'bug' },
        { label: 'Content', value: 'content' },
        { label: 'Legal', value: 'legal' },
        { label: 'CRM / Brevo', value: 'crm' },
        { label: 'Shop', value: 'shop' },
        { label: 'Analytics / Tracking', value: 'analytics' },
        { label: 'Performance', value: 'performance' },
        { label: 'SEO', value: 'seo' },
        { label: 'UX / Design', value: 'design' },
        { label: 'Dashboard / CMS', value: 'dashboard' },
        { label: 'Security', value: 'security' },
        { label: 'Feature', value: 'feature' },
        { label: 'Future Feature', value: 'future' },
      ],
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
      options: ['XS', 'S', 'M', 'L', 'XL', 'Unknown'],
    },
    {
      name: 'businessValue',
      type: 'select',
      label: 'Business value',
      admin: {
        description: 'From the roadmap spreadsheet — how much this matters to the business, separate from build effort',
      },
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    {
      name: 'billingScope',
      type: 'select',
      required: true,
      defaultValue: 'included',
      label: 'Billing scope',
      options: [
        { label: 'Included — monthly retainer', value: 'included' },
        { label: 'Extra — outside partnership scope', value: 'extra' },
      ],
      admin: {
        description:
          'Is this covered by the monthly retainer, or does it need a separate agreement/billing with David & Marcel?',
      },
    },
    {
      name: 'owners',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Dev', value: 'dev' },
        { label: 'Admin', value: 'admin' },
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
      admin: { description: 'e.g. WEB-033 — a loose "see also" pointer. For real parent/child structure, use Parent item below instead.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'backlog-items',
      label: 'Parent item',
      admin: {
        description:
          'Structural parent — e.g. a Case breakdown (New Features) belongs under its Main Roadmap epic. Drives the sub-items rollup shown on the parent.',
      },
    },
    {
      name: 'plannedFor',
      type: 'text',
      label: 'Planned for',
      admin: {
        description: 'Which week/month this is committed for, e.g. "Week of Jul 14" or "August batch" — leave blank if not yet scheduled.',
      },
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
      name: 'area',
      type: 'text',
      label: 'Area / URL',
      admin: { description: 'From the roadmap spreadsheet — which systems or pages this touches' },
    },
    {
      name: 'sourceContext',
      type: 'text',
      label: 'Source / context',
      admin: { description: 'From the roadmap spreadsheet — why this item exists' },
    },
    {
      name: 'dependencies',
      type: 'text',
      admin: { description: 'From the roadmap spreadsheet — what this needs before it can be built' },
    },
    {
      name: 'nextActionText',
      type: 'text',
      label: 'Next action',
      admin: { description: 'From the roadmap spreadsheet — the immediate next step' },
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
      name: 'links',
      type: 'array',
      label: 'Links',
      admin: {
        description: 'Reference links only — Google Drive, Figma, Notion, screenshots, docs. Not uploaded files. Add as many as needed.',
      },
      fields: [
        { name: 'label', type: 'text', label: 'Label (optional)' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'decision',
      type: 'json',
      label: 'Decision (question / options / choice / notes)',
      admin: {
        description:
          'Optional — attach an open architecture decision to this item (question + options + recommended pick). Edited via the Backlog board decision widget.',
      },
    },
  ],
}
