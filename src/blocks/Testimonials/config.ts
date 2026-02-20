import type { Block } from 'payload'

export const Testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    singular: 'Testimonials',
    plural: 'Testimonials',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow Text',
      admin: {
        description: 'Small text above the heading (e.g. "Testimonials").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Section heading (e.g. "What They Like About Our Fermentation Class").',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'Optional "View All" button text. Leave empty to hide.',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      localized: true,
      label: 'Button Link',
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Testimonials',
      minRows: 1,
      maxRows: 10,
      required: true,
      admin: {
        description: 'Individual testimonial entries displayed as a slider.',
      },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Quote',
          admin: {
            description: 'The testimonial text.',
          },
        },
        {
          name: 'authorName',
          type: 'text',
          required: true,
          localized: true,
          label: 'Author Name',
        },
        {
          name: 'authorRole',
          type: 'text',
          localized: true,
          label: 'Author Role',
          admin: {
            description: 'Optional role/title of the author (e.g. "Artist").',
          },
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Star Rating',
          min: 1,
          max: 5,
          defaultValue: 5,
          admin: {
            description: 'Star rating from 1 to 5.',
          },
        },
      ],
    },
  ],
}
