import type { Block } from 'payload'

export const TeamCards: Block = {
  slug: 'teamCards',
  interfaceName: 'TeamCardsBlock',
  labels: {
    singular: 'Team Cards',
    plural: 'Team Cards Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      label: 'Section Label',
      admin: {
        description: 'Small accent text above the heading (e.g. "Our Team").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Main heading for the team section.',
      },
    },
    {
      name: 'members',
      type: 'array',
      label: 'Team Members',
      minRows: 1,
      maxRows: 10,
      required: true,
      admin: {
        description: 'Team member cards with photo, name, role, and biography.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Portrait Photo',
          admin: {
            description: 'Team member portrait. If empty, a neutral placeholder is shown.',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
          label: 'Name',
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          localized: true,
          label: 'Role / Title',
          admin: {
            description: 'Job title (e.g. "Fermentation Specialist & Chef").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Biography',
          admin: {
            description: 'Short biography or description of the team member.',
          },
        },
      ],
    },
  ],
}
