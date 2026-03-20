import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { ownCourseProgress } from '@/access/ownCourseProgress'

export const CourseProgress: CollectionConfig = {
  slug: 'course-progress',
  access: {
    create: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
    read: ownCourseProgress,
    update: ownCourseProgress,
  },
  admin: {
    group: 'Workshops & Kurse',
    defaultColumns: ['user', 'courseSlug', 'updatedAt'],
    description:
      'Stores which lessons a user has completed per course. Used for "Dein Fortschritt" on course pages.',
    useAsTitle: 'courseSlug',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { description: 'The user this progress belongs to.' },
      index: true,
    },
    {
      name: 'courseSlug',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "basic-fermentation". One document per user per course.' },
      index: true,
    },
    {
      name: 'completedLessonIds',
      type: 'array',
      required: false,
      label: 'Completed lesson IDs',
      admin: {
        description:
          'Payload array item IDs for completed lessons. Updated when user marks a lesson done.',
      },
      fields: [
        {
          name: 'lessonId',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
}
