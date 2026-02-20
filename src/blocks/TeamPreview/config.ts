import type { Block } from 'payload'

export const TeamPreview: Block = {
  slug: 'teamPreview',
  interfaceName: 'TeamPreviewBlock',
  labels: {
    singular: 'Team Preview',
    plural: 'Team Previews',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow Text',
      admin: {
        description: 'Small uppercase text above the heading (e.g. "Our Team").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Main heading (e.g. "Only The Best Instructors").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Body text describing the team.',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'CTA button text (e.g. "About us").',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      localized: true,
      label: 'Button Link',
      admin: {
        description: 'URL the button links to (e.g. "/about").',
      },
    },
    {
      name: 'members',
      type: 'array',
      label: 'Team Members',
      minRows: 1,
      maxRows: 4,
      required: true,
      admin: {
        description: 'Team members to display. Typically 2 members with large portrait photos.',
      },
      fields: [
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
          localized: true,
          label: 'Role',
          admin: {
            description: 'Role title (e.g. "Instructor").',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Photo',
          admin: {
            description: 'Portrait photo. Tall aspect ratio recommended.',
          },
        },
      ],
    },
  ],
}
