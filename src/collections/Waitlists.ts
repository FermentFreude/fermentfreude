import type { CollectionConfig } from 'payload'

export const Waitlists: CollectionConfig = {
  slug: 'waitlists',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'courseTitle', 'courseSlug', 'status', 'createdAt'],
    description:
      'People who clicked "Notify Me When Available" for upcoming online courses.',
  },
  access: {
    read: () => false,
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
      admin: {
        description: 'We will notify this address when the course is available.',
      },
    },
    {
      name: 'courseSlug',
      type: 'text',
      required: true,
      label: 'Course slug',
      admin: {
        description: 'Internal slug, e.g. "advanced-miso-koji-mastery".',
      },
    },
    {
      name: 'courseTitle',
      type: 'text',
      required: true,
      label: 'Course title',
    },
    {
      name: 'locale',
      type: 'text',
      required: false,
      label: 'Locale',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Notified', value: 'notified' },
      ],
    },
  ],
}

