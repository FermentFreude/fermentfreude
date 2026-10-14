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
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Toggle off to hide this section on the page without deleting it.',
      },
    },
    {
      name: 'useGlobalData',
      type: 'checkbox',
      label: 'Use global content',
      defaultValue: false,
      admin: {
        description:
          '✅ ON = Uses shared content from Website → Workshop Slider (edit once, applies everywhere).\n❌ OFF = Use custom content just for this page (default).',
      },
    },
    {
      name: 'sectionLead',
      type: 'text',
      localized: true,
      label: 'Banner — big title',
      admin: {
        description:
          'Big ivory title of the dark banner above the workshops, e.g. "Tempeh, Kimchi & Kombucha selber machen. Lerne Fermentieren in Graz." Use words people search for.',
      },
    },
    {
      name: 'sectionHeading',
      type: 'text',
      localized: true,
      label: 'Banner — small gold line',
      admin: {
        description:
          'Smaller gold line under the big title, e.g. "Unsere nächsten Workshops". It links to the "All Workshops Link" below (default /workshops). Leave both banner fields empty to hide the banner.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'nextDateLabel',
          type: 'text',
          localized: true,
          label: 'Date badge — label',
          admin: {
            description: 'Small label in the gold box on each workshop, e.g. "Nächster Termin".',
            width: '50%',
          },
        },
        {
          name: 'noDateLabel',
          type: 'text',
          localized: true,
          label: 'Date badge — no date yet',
          admin: {
            description:
              'Shown instead of a date when a workshop has no bookable date, e.g. "Bald verfügbar".',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow Text',
      admin: {
        description:
          'Small uppercase text shown above each workshop slide (e.g. "Workshop Experience").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'workshops',
      type: 'array',
      label: 'Workshops',
      minRows: 0,
      maxRows: 6,
      required: false,
      admin: {
        description:
          'Add up to 6 workshop slides. Each slide has a title, description, features, image, and CTA.',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
      fields: [
        {
          name: 'title',
          type: 'textarea',
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
          label: 'Workshop Image (secondary)',
          admin: {
            description:
              'Optional second photo shown alongside the first. Falls back to the primary image when not set.',
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
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'allWorkshopsLink',
      type: 'text',
      localized: true,
      label: 'All Workshops Link',
      admin: {
        description: 'URL the "All Workshops" button links to (default: "/workshops").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
  ],
}
