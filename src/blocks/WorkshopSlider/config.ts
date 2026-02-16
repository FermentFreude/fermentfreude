import type { Block } from 'payload'

export const WorkshopSlider: Block = {
  slug: 'workshopSlider',
  interfaceName: 'WorkshopSliderBlock',
  labels: {
    singular: 'Workshop Slider',
    plural: 'Workshop Sliders',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow Text',
      admin: {
        description:
          'Small uppercase text shown above each workshop slide (e.g. "Workshop Experience").',
      },
    },
    {
      name: 'workshops',
      type: 'array',
      label: 'Workshops',
      minRows: 1,
      maxRows: 6,
      required: true,
      admin: {
        description:
          'Add up to 6 workshop slides. Each slide has a title, description, features, image, and CTA.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: 'Workshop Title',
          admin: {
            description: 'Workshop name displayed as the main heading (e.g. "Lakto-Gemüse").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          required: true,
          label: 'Workshop Description',
          admin: {
            description: 'Short description of the workshop (1–2 sentences).',
          },
        },
        {
          name: 'features',
          type: 'array',
          label: 'Features',
          minRows: 1,
          maxRows: 6,
          admin: {
            description:
              'Numbered feature list (e.g. "Duration: approx. 3 hours"). Shown with 01, 02, 03, … numbering.',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              localized: true,
              required: true,
              label: 'Feature Text',
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Workshop Image',
          admin: {
            description: 'Product/workshop photo displayed on the right side of the slide.',
          },
        },
        {
          name: 'ctaLink',
          type: 'text',
          localized: true,
          label: 'Workshop Details Link',
          admin: {
            description:
              'URL the "Workshop Details" button links to (e.g. "/workshops/lakto-gemuese").',
          },
        },
        {
          name: 'detailsButtonLabel',
          type: 'text',
          localized: true,
          label: 'Details Button Label',
          admin: {
            description:
              'Label for the button linking to this workshop\'s detail page (e.g. "Workshop Details").',
          },
        },
      ],
    },
    {
      name: 'allWorkshopsButtonLabel',
      type: 'text',
      localized: true,
      label: 'All Workshops Button Label',
      admin: {
        description:
          'Label for the button linking to the main workshops page (e.g. "All Workshops").',
      },
    },
    {
      name: 'allWorkshopsLink',
      type: 'text',
      localized: true,
      label: 'All Workshops Link',
      admin: {
        description: 'URL the "All Workshops" button links to (default: "/workshops").',
      },
    },
  ],
}
