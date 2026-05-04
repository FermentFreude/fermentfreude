import type { Block } from 'payload'

export const CourseWaitlistCta: Block = {
  slug: 'courseWaitlistCta',
  interfaceName: 'CourseWaitlistCtaBlock',
  labels: {
    singular: 'Course Waitlist CTA',
    plural: 'Course Waitlist CTAs',
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
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Main headline for the waitlist section.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Supporting text (use a blank line between paragraphs).',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      localized: true,
      admin: {
        description:
          'Optional. Landscape photo (~5×3) works best: left column on desktop, below headline on mobile. Alt text is edited on the Media entry.',
      },
    },
    {
      name: 'emailPlaceholder',
      type: 'text',
      required: true,
      localized: true,
      label: 'Email field placeholder',
      admin: {
        description: 'Placeholder inside the email input.',
      },
    },
    {
      name: 'submitLabel',
      type: 'text',
      required: true,
      localized: true,
      label: 'Submit button label',
      admin: {
        description: 'Label on the primary button (e.g. “Join the waitlist”).',
      },
    },
    {
      name: 'successMessage',
      type: 'text',
      required: true,
      localized: true,
      label: 'Success message',
      admin: {
        description:
          'Shown after the visitor’s email app opens (mailto to kontakt@fermentfreude.at). Explain that they should send the pre-filled message — no server/API.',
      },
    },
  ],
}
