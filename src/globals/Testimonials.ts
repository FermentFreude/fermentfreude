import type { GlobalConfig } from 'payload'

export const TestimonialsGlobal: GlobalConfig = {
  slug: 'testimonials-global',
  label: 'Testimonials',
  admin: {
    group: 'Website',
    description:
      'Global testimonials section used across Home, Courses, and Workshops pages. Edit once, appears everywhere.',
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
        description: 'Section heading (e.g. "What Our Community Says").',
      },
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
            description: 'Optional role/title of the author (e.g. "Workshop Participant").',
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
