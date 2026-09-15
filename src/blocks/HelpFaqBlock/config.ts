import type { Block } from 'payload'

import { blockVisible } from '@/fields/blockVisible'

/**
 * HelpFaqBlock — admin-editable Help & FAQ page content.
 * Hub layout: search hero, category cards, Q&A accordion, contact CTA.
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
      name: 'heroBackground',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero background image',
      admin: {
        description:
          'Full-bleed illustration behind the title and search. Leave empty for the charcoal gradient fallback.',
      },
    },
    {
      type: 'group',
      name: 'header',
      label: 'Header & search',
      admin: { description: 'Top of the Help page: title and search field.' },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: 'Eyebrow',
          admin: { description: 'Optional small label above the title (e.g. "HELP & SUPPORT").' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Title',
          admin: { description: 'e.g. "Hello, how can we help?"' },
        },
        {
          name: 'intro',
          type: 'textarea',
          localized: true,
          label: 'Intro paragraph',
          admin: { description: 'Optional line under the title. Leave empty to hide.' },
        },
        {
          name: 'searchPlaceholder',
          type: 'text',
          localized: true,
          label: 'Search placeholder',
          admin: { description: 'Placeholder inside the search field (e.g. "Search").' },
        },
        {
          name: 'commonSearchesLabel',
          type: 'text',
          localized: true,
          label: 'Popular searches label',
          admin: {
            description: 'Unused on the current hub layout (chips removed).',
            hidden: true,
          },
        },
        {
          name: 'commonSearches',
          type: 'array',
          label: 'Popular searches',
          labels: { singular: 'Chip', plural: 'Chips' },
          maxRows: 6,
          admin: {
            description: 'Unused on the current hub layout (chips removed).',
            hidden: true,
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: 'Label',
            },
          ],
        },
        {
          name: 'backLabel',
          type: 'text',
          localized: true,
          label: 'Back button label',
          admin: { description: 'Shown when a topic is open (e.g. "All topics").' },
        },
        {
          name: 'resultsLabel',
          type: 'text',
          localized: true,
          label: 'Search results label',
          admin: { description: 'e.g. "Search results".' },
        },
        {
          name: 'emptyResultsLabel',
          type: 'text',
          localized: true,
          label: 'No results message',
          admin: { description: 'Shown when a search has no matches.' },
        },
        {
          name: 'questionCountSingular',
          type: 'text',
          localized: true,
          label: 'Question count (singular)',
          admin: {
            description: 'Word after the number when there is 1 question (e.g. "Frage" / "question").',
          },
        },
        {
          name: 'questionCountPlural',
          type: 'text',
          localized: true,
          label: 'Question count (plural)',
          admin: {
            description: 'Word after the number when there are multiple questions (e.g. "Fragen" / "questions").',
          },
        },
        {
          name: 'tocLabel',
          type: 'text',
          localized: true,
          label: 'Topics label (unused in hub layout)',
          admin: {
            description:
              'Kept for existing content. The hub layout uses category cards instead of a table of contents.',
            hidden: true,
          },
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'FAQ topics',
      labels: { singular: 'Topic', plural: 'Topics' },
      admin: {
        description:
          'Each topic becomes a card on the Help page. Clicking it opens that topic’s questions.',
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          label: 'Anchor key',
          admin: {
            description:
              'URL anchor for this topic (lowercase, no spaces — e.g. "account", "workshops"). Same value for both languages.',
          },
        },
        {
          name: 'icon',
          type: 'select',
          label: 'Icon',
          defaultValue: 'help-circle',
          admin: {
            description: 'Icon shown on the topic card.',
          },
          options: [
            { label: 'User / Account', value: 'user' },
            { label: 'Calendar / Workshops', value: 'calendar' },
            { label: 'Gift / Vouchers', value: 'gift' },
            { label: 'Shopping bag / Shop', value: 'shopping-bag' },
            { label: 'Truck / Shipping', value: 'truck' },
            { label: 'Credit card / Payment', value: 'credit-card' },
            { label: 'Utensils / Gastronomy', value: 'utensils' },
            { label: 'Wrench / Technical', value: 'wrench' },
            { label: 'Book / Courses', value: 'book-open' },
            { label: 'Lock / Security', value: 'lock' },
            { label: 'Star', value: 'star' },
            { label: 'Question mark', value: 'help-circle' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Topic title',
        },
        {
          name: 'intro',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Topic intro (optional)',
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
      label: 'Contact line (under topics)',
      admin: {
        description:
          'Quiet line under the topic cards, e.g. "Schreib uns – wir helfen gerne. Kontakt".',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: 'Title (unused)',
          admin: {
            description: 'Kept for existing content. Not shown on the current layout.',
            hidden: true,
          },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Body text',
          admin: { description: 'e.g. "Schreib uns – wir helfen gerne."' },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          required: true,
          localized: true,
          label: 'Link label',
          admin: { description: 'e.g. "Kontakt".' },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link URL',
          defaultValue: '/contact',
          admin: {
            description:
              'Where the link goes (e.g. "/contact"). Same for both languages. Use a full mailto: only if you want email instead.',
          },
        },
        {
          name: 'email',
          type: 'text',
          label: 'Contact email (optional)',
          admin: {
            description:
              'Optional. Only used if Link URL is empty — then we fall back to mailto: this address.',
          },
        },
      ],
    },
  ],
}
