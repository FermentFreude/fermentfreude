import type { Block } from 'payload'

export const ContactBlock: Block = {
  slug: 'contactBlock',
  interfaceName: 'ContactBlock',
  labels: {
    singular: 'Contact Page',
    plural: 'Contact Pages',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      admin: {
        description: 'Heading and subtext shown above the contact form.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Background Image',
          admin: {
            description: 'Full-width background for the hero. Leave empty for cream background.',
          },
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Hero Heading',
          admin: {
            description: 'Main heading (e.g., "Kontakt" or "Get in Touch").',
          },
        },
        {
          name: 'subtext',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Hero Subtext',
          admin: {
            description: 'Optional supporting text below the heading.',
          },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'CTA Button Label',
          admin: {
            description: 'Optional CTA button (e.g., "Explore Workshops").',
          },
        },
        {
          name: 'buttonHref',
          type: 'text',
          required: false,
          label: 'CTA Button URL',
          admin: {
            description: 'URL for the CTA button.',
          },
        },
      ],
    },
    {
      name: 'contactImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Contact Card Image',
      admin: {
        description: 'Image displayed on the left side of the contact form card (e.g., team at workshop).',
      },
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact Form Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Form Heading',
          admin: {
            description: 'Heading above the form (e.g., "Kontakt").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Intro Description',
          admin: {
            description: 'Short intro text above the form fields.',
          },
        },
      ],
    },
    {
      name: 'contactForm',
      type: 'group',
      label: 'Contact Form Fields',
      fields: [
        {
          name: 'form',
          type: 'relationship',
          relationTo: 'forms',
          label: 'Form',
          admin: {
            description:
              'Optional: Link to a Payload Form Builder form. If not set, a static form will be displayed.',
          },
        },
        {
          name: 'placeholders',
          type: 'group',
          label: 'Form Placeholders',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
              localized: true,
              label: 'First Name Placeholder',
              admin: {
                description: 'Placeholder for first name (e.g., "Vorname").',
              },
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
              localized: true,
              label: 'Last Name Placeholder',
              admin: {
                description: 'Placeholder for last name (e.g., "Nachname").',
              },
            },
            {
              name: 'email',
              type: 'text',
              required: true,
              localized: true,
              label: 'Email Placeholder',
              admin: {
                description: 'Placeholder for email field.',
              },
            },
            {
              name: 'message',
              type: 'text',
              required: true,
              localized: true,
              label: 'Message Placeholder',
              admin: {
                description: 'Placeholder for message textarea.',
              },
            },
          ],
        },
        {
          name: 'subjectOptions',
          type: 'group',
          label: 'Subject Dropdown',
          fields: [
            {
              name: 'default',
              type: 'text',
              required: true,
              localized: true,
              label: 'Default Option',
              admin: {
                description: 'Default option shown in subject dropdown (e.g., "Betreff").',
              },
            },
            {
              name: 'options',
              type: 'array',
              label: 'Subject Options',
              minRows: 1,
              maxRows: 10,
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Option Label',
                },
              ],
            },
          ],
        },
        {
          name: 'submitButton',
          type: 'text',
          required: true,
          localized: true,
          label: 'Submit Button Text',
          admin: {
            description: 'Text on the submit button (e.g., "Submit Now").',
          },
        },
      ],
    },
    {
      name: 'ctaBanner',
      type: 'group',
      label: 'Promotional CTA Banner',
      admin: {
        description: 'Dark banner below the contact form (e.g., "For Chefs and Food Professionals").',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Banner Heading',
          admin: {
            description: 'Main heading in golden accent (e.g., "For Chefs and Food Professionals").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Banner Description',
          admin: {
            description: 'Supporting text in white.',
          },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          required: true,
          localized: true,
          label: 'Button Label',
          admin: {
            description: 'CTA button text (e.g., "Get to know more here").',
          },
        },
        {
          name: 'buttonHref',
          type: 'text',
          required: true,
          label: 'Button URL',
          admin: {
            description: 'URL the button links to (e.g., "/gastronomy").',
          },
        },
      ],
    },
    {
      name: 'mapEmbedUrl',
      type: 'text',
      required: false,
      label: 'Map Embed URL',
      admin: {
        description:
          'Google Maps embed URL (iframe src). Get from Google Maps → Share → Embed a map. Leave empty to hide map.',
      },
    },
  ],
}
