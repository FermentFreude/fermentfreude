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
          name: 'audienceTag',
          type: 'text',
          localized: true,
          label: 'Audience Tag',
          admin: {
            description:
              'Small label shown at the top of the info card (e.g. "For Chefs and Food Professionals").',
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
          name: 'theme',
          type: 'select',
          label: 'Slide Theme',
          defaultValue: 'light',
          options: [
            { label: 'Light (ivory card, dark text)', value: 'light' },
            { label: 'Dark (charcoal card, light text)', value: 'dark' },
          ],
          admin: {
            description:
              'Visual theme for this slide. Light = ivory feature card with dark text. Dark = charcoal feature card with cream text.',
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
          label: 'Workshop Image (primary)',
          admin: {
            description:
              'First workshop photo — shown full height in the gallery with the title overlay.',
          },
        },
        {
          name: 'image2',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (secondary / featured dish)',
          admin: {
            description:
              'Featured image for "Our Workshop" section (e.g. plated dish). Also used as gallery thumbnail.',
          },
        },
        {
          name: 'image3',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (gallery 3)',
        },
        {
          name: 'image4',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (gallery 4)',
        },
        {
          name: 'image5',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (gallery 5)',
        },
        {
          name: 'image6',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (gallery 6)',
        },
        {
          name: 'image7',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (gallery 7)',
        },
        {
          name: 'image8',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (gallery 8)',
        },
        {
          name: 'image9',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Workshop Image (gallery 9)',
        },
        {
          name: 'price',
          type: 'text',
          localized: true,
          label: 'Price',
          admin: { description: 'e.g. "Ab 199,00 € / Person"' },
        },
        {
          name: 'duration',
          type: 'text',
          localized: true,
          label: 'Duration',
          admin: { description: 'e.g. "3 Stunden"' },
        },
        {
          name: 'format',
          type: 'text',
          localized: true,
          label: 'Format',
          admin: { description: 'e.g. "Online" or "Vor Ort"' },
        },
        {
          name: 'location',
          type: 'text',
          localized: true,
          label: 'Location',
          admin: { description: 'e.g. "Berlin-Neukölln"' },
        },
        {
          name: 'groupSize',
          type: 'text',
          localized: true,
          label: 'Group Size',
          admin: { description: 'e.g. "6-12 Personen"' },
        },
        {
          name: 'dates',
          type: 'text',
          localized: true,
          label: 'Dates',
          admin: { description: 'e.g. "Termine folgen" or specific dates' },
        },
        {
          name: 'topics',
          type: 'array',
          label: 'Workshop Topics / Benefits',
          admin: {
            description:
              'Expandable cards: "Was du lernst", "Was du bekommst", "Für wen ist der Kurs", etc.',
          },
          fields: [
            { name: 'title', type: 'text', localized: true, required: true, label: 'Title' },
            { name: 'description', type: 'textarea', localized: true, label: 'Description' },
          ],
        },
        {
          name: 'learnList',
          type: 'array',
          label: '"In diesem Workshop lernst du..." items',
          admin: { description: 'Bullet list shown in workshop module' },
          fields: [
            { name: 'text', type: 'text', localized: true, required: true, label: 'Item' },
          ],
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
