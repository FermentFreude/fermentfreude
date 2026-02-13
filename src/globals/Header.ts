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
      name: 'navItems',
      type: 'array',
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
