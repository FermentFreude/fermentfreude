import type { Block } from 'payload'

import { blockVisible } from '@/fields/blockVisible'

/**
 * HelpFaqBlock — admin-editable Help & FAQ page content.
 * Composed of: hero (eyebrow/title/intro), table-of-contents label,
 * an array of FAQ sections (each with its own anchor key + Q/A items),
 * and a contact CTA at the bottom.
 *
 * Founders edit everything from /admin → Pages → Help → Content tab.
 */
export const HelpFaqBlock: Block = {
  slug: 'helpFaq',
  interfaceName: 'HelpFaqBlock',
  labels: {
    singular: 'Help & FAQ',
    plural: 'Help & FAQ',
  },
  fields: [
    blockVisible,
    {
      type: 'group',
      name: 'header',
      label: 'Header',
      admin: { description: 'Top of the Help page (eyebrow, title, intro).' },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
          localized: true,
          label: 'Eyebrow',
          admin: { description: 'Small label above the title (e.g. "HELP & SUPPORT").' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Title',
        },
        {
          name: 'intro',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Intro paragraph',
        },
        {
          name: 'tocLabel',
          type: 'text',
          required: true,
          localized: true,
          label: 'Table of contents label',
          admin: { description: 'e.g. "Topics on this page".' },
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'FAQ Sections',
      labels: { singular: 'Section', plural: 'Sections' },
      admin: {
        description:
          'Each section becomes a card on the page and an entry in the table of contents. Add, reorder, or delete sections freely.',
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          label: 'Anchor key',
          admin: {
            description:
              'URL anchor for this section (lowercase, no spaces — e.g. "account", "workshops", "vouchers"). Used in the table-of-contents links. Same value for both languages.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Section title',
        },
        {
          name: 'intro',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Section intro (optional)',
        },
        {
          name: 'items',
          type: 'array',
          label: 'Questions',
          labels: { singular: 'Q&A', plural: 'Q&As' },
          minRows: 1,
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
              localized: true,
              label: 'Question',
            },
            {
              name: 'answer',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Answer',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'contact',
      label: 'Contact CTA (bottom)',
      admin: { description: 'Dark card at the bottom inviting visitors to email.' },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Title',
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Body text',
        },
        {
          name: 'ctaLabel',
          type: 'text',
          required: true,
          localized: true,
          label: 'Button label',
        },
        {
          name: 'email',
          type: 'text',
          required: true,
          label: 'Contact email',
          admin: {
            description:
              'Email address shown next to the button and used for the mailto: link. Same for both languages.',
          },
        },
      ],
    },
  ],
}
