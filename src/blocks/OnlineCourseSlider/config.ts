import type { Block } from 'payload'

export const OnlineCourseSlider: Block = {
  slug: 'onlineCourseSlider',
  interfaceName: 'OnlineCourseSliderBlock',
  labels: {
    singular: 'Online Course Slider',
    plural: 'Online Course Sliders',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
      admin: {
        description: 'Small label above the heading (e.g. "Course Overview").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Section heading (e.g. "Course Modules").',
      },
    },
    {
      name: 'showComingSoon',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Coming Soon Courses',
      admin: {
        description: 'Also render coming-soon course cards below the active courses.',
      },
    },
    {
      name: 'comingSoonEyebrow',
      type: 'text',
      localized: true,
      label: 'Coming Soon Eyebrow',
      admin: {
        description: 'Eyebrow for the coming-soon section.',
        condition: (_, siblingData) => siblingData?.showComingSoon,
      },
    },
    {
      name: 'comingSoonHeading',
      type: 'text',
      localized: true,
      label: 'Coming Soon Heading',
      admin: {
        description: 'Heading for the coming-soon section (e.g. "More Courses on the Way").',
        condition: (_, siblingData) => siblingData?.showComingSoon,
      },
    },
    {
      name: 'comingSoonDescription',
      type: 'textarea',
      localized: true,
      label: 'Coming Soon Description',
      admin: {
        condition: (_, siblingData) => siblingData?.showComingSoon,
      },
    },
  ],
}
