import { adminOnly } from '@/access/adminOnly'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import type { CollectionConfig } from 'payload'

export const OnlineCourses: CollectionConfig = {
  slug: 'online-courses',
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [autoTranslateCollection],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'courseSlug', 'isActive', 'isComingSoon', 'sortOrder'],
    group: 'Shop',
    description:
      'Online courses — everything in one place: card info, hero, modules with lessons & videos, and "What You\'ll Learn".',
  },
  fields: [
    /* ────────── Card / Listing ────────── */
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly identifier (e.g. "basic-fermentation-course").',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Course Title',
      admin: { description: 'Main title on the card AND the course viewer hero.' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Short Description',
      admin: { description: 'Brief text shown on the course card on /courses.' },
    },
    {
      name: 'cardImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Card Image',
      admin: { description: 'Image on the course card (listing page & coming-soon cards).' },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Linked Product',
      admin: {
        description: 'Product for price display and checkout. Leave empty for coming-soon courses.',
      },
    },
    {
      name: 'courseSlug',
      type: 'text',
      label: 'Course Slug',
      admin: {
        description:
          'Matches the product courseSlug and the viewer URL segment (e.g. "basic-fermentation").',
      },
    },
    {
      name: 'courseViewerUrl',
      type: 'text',
      label: 'Course Viewer URL',
      admin: {
        description: 'e.g. "/courses/basic-fermentation#curriculum". CTA link on the card.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Show on /courses.', width: '33%' },
        },
        {
          name: 'isComingSoon',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Shows "Notify Me" instead of "Buy".', width: '33%' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          admin: { description: 'Lower = first.', width: '33%' },
        },
      ],
    },
    {
      name: 'comingSoonBadge',
      type: 'text',
      localized: true,
      label: 'Coming Soon Badge',
      admin: {
        description: 'e.g. "Summer 2026".',
        condition: (_, siblingData) => siblingData?.isComingSoon,
      },
    },
    {
      name: 'instructor',
      type: 'text',
      localized: true,
      label: 'Instructor',
      admin: { description: 'e.g. "David Heider & Marcel Rauminger".' },
    },
    {
      name: 'durationText',
      type: 'text',
      localized: true,
      label: 'Duration Text',
      admin: { description: 'e.g. "10 hours of content".' },
    },
    {
      name: 'levelText',
      type: 'text',
      localized: true,
      label: 'Level Text',
      admin: { description: 'e.g. "Beginner Level".' },
    },

    /* ────────── Course Viewer — Hero ────────── */
    {
      type: 'collapsible',
      label: 'Course Viewer — Hero',
      admin: {
        description:
          'Hero section shown on the full course viewer page (e.g. /courses/basic-fermentation).',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'heroEyebrow',
          type: 'text',
          localized: true,
          label: 'Eyebrow',
          admin: { description: 'e.g. "Course" / "Kurs".' },
        },
        { name: 'heroSubtitle', type: 'text', localized: true, label: 'Subtitle' },
        {
          name: 'heroDescription',
          type: 'textarea',
          localized: true,
          label: 'Hero Description',
          admin: { description: 'Longer text under the title on the viewer page.' },
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Image',
          admin: { description: 'Large image on the viewer page hero.' },
        },
        {
          name: 'heroDuration',
          type: 'text',
          localized: true,
          label: 'Duration badge',
          admin: { description: 'e.g. "5h 15m".' },
        },
        {
          name: 'heroLessonsCount',
          type: 'text',
          localized: true,
          label: 'Lessons count badge',
          admin: { description: 'e.g. "48 Lessons".' },
        },
        {
          name: 'heroProgressHeading',
          type: 'text',
          localized: true,
          label: 'Progress heading',
          admin: { description: 'e.g. "Your Progress" / "Dein Fortschritt".' },
        },
      ],
    },

    /* ────────── Course Viewer — Curriculum heading ────────── */
    {
      name: 'curriculumHeading',
      type: 'text',
      localized: true,
      label: 'Curriculum Heading',
      admin: { description: 'e.g. "Course Curriculum" / "Kurs Lehrplan".' },
    },

    /* ────────── Modules & Lessons ────────── */
    {
      type: 'collapsible',
      label: 'Modules & Lessons',
      admin: {
        description:
          'Full curriculum with descriptions, durations, and videos. Used on both the /courses listing (accordion preview) and the course viewer page.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'modules',
          type: 'array',
          minRows: 0,
          maxRows: 20,
          label: 'Modules',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, label: 'Module Title' },
            { name: 'description', type: 'textarea', localized: true, label: 'Module Description' },
            {
              name: 'lessons',
              type: 'array',
              minRows: 0,
              maxRows: 30,
              label: 'Lessons',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Lesson Title',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                  label: 'Lesson Description',
                },
                {
                  name: 'durationMinutes',
                  type: 'number',
                  label: 'Duration (minutes)',
                  admin: { description: 'e.g. 5' },
                },
                {
                  name: 'video',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Lesson Video',
                  admin: { description: 'Upload MP4/WebM here. Displayed in the course viewer.' },
                },
                {
                  name: 'locked',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Locked (preview only)',
                  admin: {
                    description: 'Locked lessons show a lock icon on the /courses listing card.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    /* ────────── What You'll Learn ────────── */
    {
      type: 'collapsible',
      label: "What You'll Learn",
      admin: {
        description: 'Learning outcomes shown on the course viewer page.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'learnHeading',
          type: 'text',
          localized: true,
          label: 'Section Heading',
          admin: { description: 'e.g. "What You\'ll Learn".' },
        },
        {
          name: 'learnItems',
          type: 'array',
          minRows: 0,
          maxRows: 12,
          label: 'Learning outcomes',
          fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Item' }],
        },
      ],
    },
  ],
}
