import type { Field } from 'payload'

/** First field on layout blocks: hide a section on the site without removing it from the page. */
export const blockVisible: Field = {
  name: 'visible',
  type: 'checkbox',
  label: 'Show this section',
  defaultValue: true,
  admin: {
    description: 'Toggle off to hide this section on the page without deleting it.',
  },
}
