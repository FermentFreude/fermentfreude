import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { ownCourseProgress } from '@/access/ownCourseProgress'
import { sendEnrollmentEmail } from '@/hooks/brevo/sendEnrollmentEmail'

/**
 * Enrollments — one record per user per course.
 * Created automatically by the Orders afterChange hook when
 * stripeStatus transitions to "succeeded" and the order contains
 * a product with a courseSlug.
 *
 * Also used by the /account/learning page to show enrolled courses.
 */
export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  hooks: {
    afterChange: [sendEnrollmentEmail],
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
    read: ownCourseProgress, // same rule: user === record.user
    update: adminOnly,
  },
  admin: {
    group: 'Workshops & Kurse',
    defaultColumns: ['user', 'courseSlug', 'createdAt'],
    description: 'One enrollment per user per course. Auto-created on successful order payment.',
    useAsTitle: 'courseSlug',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { description: 'The enrolled user.' },
    },
    {
      name: 'courseSlug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description:
          'e.g. "basic-fermentation". Matches product courseSlug and CourseProgress.courseSlug.',
      },
    },
    {
      name: 'orderId',
      type: 'text',
      required: false,
      admin: {
        description: 'The Payload order ID that triggered this enrollment.',
      },
    },
    {
      name: 'enrolledAt',
      type: 'date',
      required: false,
      admin: {
        description: 'When the enrollment was created.',
      },
    },
  ],
  timestamps: true,
}
