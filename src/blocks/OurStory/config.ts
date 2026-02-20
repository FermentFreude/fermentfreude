import type { Block } from 'payload'

export const OurStory: Block = {
  slug: 'ourStory',
  interfaceName: 'OurStoryBlock',
  labels: {
    singular: 'Our Story',
    plural: 'Our Story Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      label: 'Section Label',
      admin: {
        description: 'Small accent text above the heading (e.g. "Our Story", "Unsere Geschichte").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Main Heading',
      admin: {
        description: 'Large heading for the story section.',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Subheading',
      admin: {
        description: 'Subheading text shown below the main heading.',
      },
    },
    {
      name: 'paragraphs',
      type: 'array',
      label: 'Description Paragraphs',
      minRows: 1,
      maxRows: 5,
      required: true,
      admin: {
        description: 'Body text paragraphs describing the story.',
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Paragraph Text',
        },
      ],
    },
  ],
}
