import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    {
      name: 'announcementBar',
      type: 'group',
      label: 'Announcement Bar',
      admin: {
        description:
          'The banner shown at the very top of the site. Use it to highlight promotions, events, or important messages.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show Announcement Bar',
          admin: {
            description: 'Toggle the announcement bar on or off site-wide.',
          },
        },
        {
          name: 'text',
          type: 'text',
          required: true,
          localized: true,
          label: 'Announcement Text',
          admin: {
            description:
              'The message displayed in the announcement bar (e.g. "New workshops available!").',
          },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link URL',
          admin: {
            description:
              'URL the announcement links to (e.g. "/workshops"). Leave empty for no link.',
          },
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Items',
      admin: {
        description:
          'The main navigation links shown in the header. Drag to reorder. Each item can optionally have a dropdown with sub-items.',
      },
      fields: [
        link({
          appearances: false,
          overrides: {
            fields: [
              {
                type: 'row',
                fields: [
                  {
                    name: 'type',
                    type: 'radio',
                    admin: { layout: 'horizontal', width: '50%' },
                    defaultValue: 'reference',
                    options: [
                      { label: 'Internal link', value: 'reference' },
                      { label: 'Custom URL', value: 'custom' },
                    ],
                  },
                  {
                    name: 'newTab',
                    type: 'checkbox',
                    admin: { style: { alignSelf: 'flex-end' }, width: '50%' },
                    label: 'Open in new tab',
                  },
                ],
              },
              {
                type: 'row',
                fields: [
                  {
                    name: 'reference',
                    type: 'relationship',
                    admin: {
                      condition: (
                        _: Record<string, unknown>,
                        siblingData: Record<string, unknown>,
                      ) => siblingData?.type === 'reference',
                    },
                    label: 'Document to link to',
                    maxDepth: 1,
                    relationTo: ['pages'],
                    required: true,
                  },
                  {
                    name: 'url',
                    type: 'text',
                    admin: {
                      condition: (
                        _: Record<string, unknown>,
                        siblingData: Record<string, unknown>,
                      ) => siblingData?.type === 'custom',
                    },
                    label: 'Custom URL',
                    required: true,
                  },
                  {
                    name: 'label',
                    type: 'text',
                    admin: { width: '50%' },
                    label: 'Label',
                    required: true,
                    localized: true,
                  },
                ],
              },
            ],
          },
        }),
        {
          name: 'dropdownItems',
          type: 'array',
          label: 'Dropdown Sub-Items',
          admin: {
            description:
              'Optional sub-items shown in a dropdown menu. If empty, the nav item renders as a simple link.',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
              label: 'URL',
            },
            {
              name: 'description',
              type: 'text',
              label: 'Subtitle',
              localized: true,
              admin: {
                description: 'Short description shown below the label in the dropdown.',
              },
            },
          ],
        },
      ],
      maxRows: 6,
    },
  ],
}
