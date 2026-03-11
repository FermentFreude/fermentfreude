import type { GlobalConfig } from 'payload'

import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const BasicFermentationCourse: GlobalConfig = {
  slug: 'basic-fermentation-course',
  label: 'Basic Fermentation Course (Curriculum Page)',
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  admin: {
    description:
      'Content for the course curriculum page at /courses/basic-fermentation. Hero, modules with lessons, and What You\'ll Learn.',
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero Section',
      admin: { initCollapsed: false },
      fields: [
        { name: 'heroEyebrow', type: 'text', required: false, localized: true, label: 'Eyebrow', admin: { description: 'e.g. "Course"' } },
        { name: 'heroTitle', type: 'text', required: true, localized: true, label: 'Title', admin: { description: 'e.g. "The Complete Fermentation Course"' } },
        { name: 'heroSubtitle', type: 'text', required: false, localized: true, label: 'Subtitle' },
        { name: 'heroDescription', type: 'textarea', required: false, localized: true, label: 'Description' },
        { name: 'heroRating', type: 'text', required: false, localized: true, label: 'Rating text', admin: { description: 'e.g. "4.8 rating"' } },
        { name: 'heroStudentsCount', type: 'text', required: false, localized: true, label: 'Students count', admin: { description: 'e.g. "12,847+ Happy students"' } },
        { name: 'heroDuration', type: 'text', required: false, localized: true, label: 'Duration', admin: { description: 'e.g. "5h 15m"' } },
        { name: 'heroLessonsCount', type: 'text', required: false, localized: true, label: 'Lessons count', admin: { description: 'e.g. "48 Lessons"' } },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Hero Image',
          admin: { description: 'Large image (e.g. jars of fermented foods).' },
        },
        {
          name: 'heroProgressHeading',
          type: 'text',
          required: false,
          localized: true,
          label: 'Progress bar heading',
          admin: { description: 'Label above the progress bar, e.g. "Your Progress" / "Dein Fortschritt".' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Course Curriculum',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'curriculumHeading',
          type: 'text',
          required: false,
          localized: true,
          label: 'Section Heading',
          admin: { description: 'e.g. "Course Curriculum"' },
        },
        {
          name: 'modules',
          type: 'array',
          required: false,
          minRows: 0,
          maxRows: 20,
          label: 'Modules',
          admin: { description: 'Course modules with lessons (title, description, duration).' },
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, label: 'Module Title' },
            { name: 'description', type: 'textarea', required: false, localized: true, label: 'Module Description' },
            {
              name: 'lessons',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 30,
              label: 'Lessons',
              fields: [
                { name: 'title', type: 'text', required: true, localized: true, label: 'Lesson Title' },
                { name: 'description', type: 'textarea', required: false, localized: true, label: 'Lesson Description' },
                {
                  name: 'durationMinutes',
                  type: 'number',
                  required: false,
                  label: 'Duration (minutes)',
                  admin: { description: 'e.g. 5' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: "What You'll Learn",
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'learnHeading',
          type: 'text',
          required: false,
          localized: true,
          label: 'Section Heading',
          admin: { description: 'e.g. "What You\'ll Learn"' },
        },
        {
          name: 'learnItems',
          type: 'array',
          required: false,
          minRows: 0,
          maxRows: 12,
          label: 'Learning outcomes',
          fields: [
            { name: 'text', type: 'text', required: true, localized: true, label: 'Item' },
          ],
        },
      ],
    },
  ],
}
