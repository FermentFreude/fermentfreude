import type { Block } from 'payload'

export const AboutBlock: Block = {
  slug: 'aboutBlock',
  interfaceName: 'AboutBlock',
  labels: {
    singular: 'About Page',
    plural: 'About Pages',
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Hero Banner Image',
      admin: {
        description: 'Background image displayed at the top of the about page.',
      },
    },
    {
      name: 'ourStory',
      type: 'group',
      label: 'Our Story Section',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Section Label',
          admin: {
            description: 'Small label text shown above the heading (e.g., "Our Story").',
          },
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Main Heading',
          admin: {
            description: 'Large heading for the Our Story section.',
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
          name: 'description',
          type: 'array',
          label: 'Description Paragraphs',
          minRows: 1,
          maxRows: 5,
          fields: [
            {
              name: 'paragraph',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Paragraph Text',
              admin: {
                description: 'A paragraph of text describing the story.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'team',
      type: 'group',
      label: 'Our Team Section',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Section Label',
          admin: {
            description: 'Small label text shown above the heading (e.g., "Our Team").',
          },
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Team Heading',
          admin: {
            description: 'Main heading for the team section.',
          },
        },
        {
          name: 'members',
          type: 'array',
          label: 'Team Members',
          minRows: 1,
          maxRows: 10,
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: false,
              label: 'Member Photo',
              admin: {
                description:
                  'Optional. If empty, the about page uses a fallback image for this slot.',
              },
            },
            {
              name: 'name',
              type: 'text',
              required: true,
              localized: true,
              label: 'Name',
            },
            {
              name: 'role',
              type: 'text',
              required: true,
              localized: true,
              label: 'Role/Title',
              admin: {
                description: 'Job title or role (e.g., "Fermentation Specialist & Chef").',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Description',
              admin: {
                description: 'Biography or description of the team member.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'sponsors',
      type: 'group',
      label: 'Sponsors Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Heading',
          admin: {
            description: 'Heading text for the sponsors section.',
          },
        },
        {
          name: 'logos',
          type: 'array',
          label: 'Sponsor Logos',
          minRows: 0,
          maxRows: 10,
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Logo Image',
            },
            {
              name: 'alt',
              type: 'text',
              required: true,
              localized: true,
              label: 'Alt Text',
              admin: {
                description: 'Alternative text for the logo image.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Contact Heading',
          admin: {
            description: 'Heading for the contact section.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Contact Description',
          admin: {
            description: 'Description text explaining how to contact.',
          },
        },
        {
          name: 'labels',
          type: 'group',
          label: 'Contact Labels',
          fields: [
            {
              name: 'location',
              type: 'text',
              required: true,
              localized: true,
              label: 'Location Label',
              admin: {
                description: 'Label for the location field (e.g., "Location").',
              },
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              localized: true,
              label: 'Phone Label',
              admin: {
                description: 'Label for the phone field (e.g., "Phone").',
              },
            },
            {
              name: 'email',
              type: 'text',
              required: true,
              localized: true,
              label: 'Email Label',
              admin: {
                description: 'Label for the email field (e.g., "Mail").',
              },
            },
          ],
        },
        {
          name: 'location',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Location Address',
          admin: {
            description: 'Physical address (can include line breaks).',
          },
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: 'Phone Number',
          admin: {
            description: 'Contact phone number (not localized as it is a number).',
          },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Email Address',
          admin: {
            description: 'Contact email address (not localized).',
          },
        },
        {
          name: 'socialMedia',
          type: 'group',
          label: 'Social Media Links',
          fields: [
            {
              name: 'facebook',
              type: 'text',
              required: true,
              label: 'Facebook URL',
            },
            {
              name: 'twitter',
              type: 'text',
              required: true,
              label: 'Twitter/X URL',
            },
            {
              name: 'pinterest',
              type: 'text',
              required: true,
              label: 'Pinterest URL',
            },
            {
              name: 'youtube',
              type: 'text',
              required: true,
              label: 'YouTube URL',
            },
          ],
        },
      ],
    },
    {
      name: 'contactForm',
      type: 'group',
      label: 'Contact Form',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Form Heading',
          admin: {
            description: 'Heading text above the contact form.',
          },
        },
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
              name: 'name',
              type: 'text',
              required: true,
              localized: true,
              label: 'Name Placeholder',
              admin: {
                description: 'Placeholder text for the name input field.',
              },
            },
            {
              name: 'email',
              type: 'text',
              required: true,
              localized: true,
              label: 'Email Placeholder',
              admin: {
                description: 'Placeholder text for the email input field.',
              },
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              localized: true,
              label: 'Phone Placeholder',
              admin: {
                description: 'Placeholder text for the phone input field.',
              },
            },
            {
              name: 'message',
              type: 'text',
              required: true,
              localized: true,
              label: 'Message Placeholder',
              admin: {
                description: 'Placeholder text for the message textarea field.',
              },
            },
          ],
        },
        {
          name: 'subjectOptions',
          type: 'group',
          label: 'Subject Dropdown Options',
          fields: [
            {
              name: 'default',
              type: 'text',
              required: true,
              localized: true,
              label: 'Default Option',
              admin: {
                description:
                  'Default option shown in the subject dropdown (e.g., "Subject").',
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
            description: 'Text displayed on the submit button.',
          },
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Ready to Learn CTA Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: 'CTA Heading',
          admin: {
            description: 'Heading for the call-to-action section.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'CTA Description',
          admin: {
            description: 'Description text for the CTA section.',
          },
        },
        {
          name: 'workshopsButton',
          type: 'group',
          label: 'Workshops Button',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: 'Button Label',
            },
            {
              name: 'href',
              type: 'text',
              required: true,
              label: 'Button URL',
              admin: {
                description: 'URL the button links to (e.g., "/workshops").',
              },
            },
          ],
        },
        {
          name: 'coursesButton',
          type: 'group',
          label: 'Courses Button',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: 'Button Label',
            },
            {
              name: 'href',
              type: 'text',
              required: true,
              label: 'Button URL',
              admin: {
                description: 'URL the button links to (e.g., "/courses").',
              },
            },
          ],
        },
      ],
    },
  ],
}
