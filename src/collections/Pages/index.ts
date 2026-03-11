import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { ContactBlock } from '@/blocks/ContactBlock/config'
import { Content } from '@/blocks/Content/config'
import { FeatureCards } from '@/blocks/FeatureCards/config'
import { FormBlock } from '@/blocks/Form/config'
import { HeroBanner } from '@/blocks/HeroBanner/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { OurStory } from '@/blocks/OurStory/config'
import { ProductSlider } from '@/blocks/ProductSlider/config'
import { ReadyToLearnCTA } from '@/blocks/ReadyToLearnCTA/config'
import { SponsorsBar } from '@/blocks/SponsorsBar/config'
import { TeamCards } from '@/blocks/TeamCards/config'
import { TeamPreview } from '@/blocks/TeamPreview/config'
import { Testimonials } from '@/blocks/Testimonials/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { VoucherCta } from '@/blocks/VoucherCta/config'
import { WorkshopPhases } from '@/blocks/WorkshopPhases/config'
import { WorkshopSlider } from '@/blocks/WorkshopSlider/config'
import { hero } from '@/fields/hero'
import { shopPageFields } from '@/fields/shopPageFields'
import { workshopDetailFields } from '@/fields/workshopDetailFields'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    group: 'content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'publishedOn',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                ContactBlock,
                CallToAction,
                Content,
                FeatureCards,
                HeroBanner,
                MediaBlock,
                Archive,
                Carousel,
                OurStory,
                ReadyToLearnCTA,
                SponsorsBar,
                TeamCards,
                TeamPreview,
                Testimonials,
                ThreeItemGrid,
                Banner,
                FormBlock,
                ProductSlider,
                VoucherCta,
                WorkshopSlider,
                WorkshopPhases,
              ],
              required: false,
              admin: {
                description:
                  'Content blocks. Leave empty for Voucher, Gastronomy, and Fermentation pages (they use dedicated tabs).',
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'gastronomy',
          label: 'Gastronomy Page',
          admin: {
            description:
              'Content for the Gastronomy page (/gastronomy). Only applies when slug is "gastronomy".',
            // When true, gastronomy fields are validated. Use false during seed to skip validation.
            condition: (data, siblingData) => {
              if (process.env.PAYLOAD_SKIP_GASTRONOMY_CONDITION === '1') return false
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'gastronomy'
            },
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'gastronomyHeroTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Hero Title',
                  admin: {
                    description: 'Main heading (e.g., "Elevate Your Gastronomy Business").',
                  },
                },
                {
                  name: 'gastronomyHeroCtaLabel',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'CTA Button Label',
                  admin: { description: 'Button text (e.g., "Take a look").' },
                },
                {
                  name: 'gastronomyHeroCtaUrl',
                  type: 'text',
                  required: false,
                  label: 'CTA Button URL',
                  admin: { description: 'Where the button links (e.g., "#offer").' },
                },
              ],
            },
            {
              name: 'gastronomyOfferSectionTitle',
              type: 'text',
              required: false,
              localized: true,
              label: 'Offer Section Title',
              admin: { description: 'Heading above the offer cards (e.g., "What we offer").' },
            },
            {
              name: 'gastronomyOfferCards',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 3,
              label: 'Offer Cards',
              admin: { description: 'Three service cards.' },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Image',
                },
                { name: 'title', type: 'text', required: true, localized: true, label: 'Title' },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  label: 'Description',
                },
              ],
            },
            {
              name: 'gastronomyQuoteText',
              type: 'textarea',
              required: false,
              localized: true,
              label: 'Quote Text',
            },
            {
              name: 'gastronomyQuoteSubtext',
              type: 'text',
              required: false,
              localized: true,
              label: 'Quote Subtext',
            },
            {
              name: 'gastronomyWorkshopSectionTitle',
              type: 'text',
              required: true,
              localized: true,
              label: 'Workshop Section Title',
            },
            {
              name: 'gastronomyWorkshopSectionSubtitle',
              type: 'text',
              required: false,
              localized: true,
              label: 'Workshop Section Subtitle',
            },
            {
              name: 'gastronomyWorkshopClarification',
              type: 'textarea',
              required: false,
              localized: true,
              label: 'Workshop Clarification',
              admin: {
                description:
                  'Optional text below workshop subtitle explaining who can attend (e.g. chefs welcome, custom workshops available).',
              },
            },
            {
              name: 'gastronomyWorkshopNextDateLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'Next Appointment Label',
              admin: { description: 'e.g. "Nächster Termin:" / "Next Appointment:"' },
            },
            {
              name: 'gastronomyWorkshopCards',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 3,
              label: 'Workshop Cards',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Image',
                },
                { name: 'title', type: 'text', required: true, localized: true, label: 'Title' },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  label: 'Description',
                },
                { name: 'price', type: 'text', required: true, label: 'Price' },
                {
                  name: 'priceSuffix',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Price Suffix',
                  admin: { description: 'e.g. "pro Person" / "per Person"' },
                },
                {
                  name: 'buttonLabel',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Button Label',
                },
                { name: 'buttonUrl', type: 'text', required: true, label: 'Button URL' },
                { name: 'duration', type: 'text', required: false, label: 'Duration' },
                {
                  name: 'nextDate',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Next Appointment',
                  admin: { description: 'e.g. "February 15, 2026"' },
                },
              ],
            },
            {
              name: 'gastronomyOfferDetailsTitle',
              type: 'text',
              required: false,
              localized: true,
              label: 'Offer Details Section Title',
            },
            {
              name: 'gastronomyOfferDetails',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 8,
              label: 'Offer Details',
              fields: [
                { name: 'title', type: 'text', required: true, localized: true, label: 'Title' },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  label: 'Description',
                },
              ],
            },
            {
              name: 'gastronomyCollaborateImage',
              type: 'upload',
              relationTo: 'media',
              required: false,
              label: 'Collaborate CTA Background Image',
            },
            {
              name: 'gastronomyCollaborateTitle',
              type: 'text',
              required: true,
              localized: true,
              label: 'Collaborate CTA Title',
            },
            {
              name: 'gastronomyCollaborateSubtitle',
              type: 'text',
              required: false,
              localized: true,
              label: 'Collaborate CTA Subtitle',
            },
            {
              name: 'gastronomyContactImage',
              type: 'upload',
              relationTo: 'media',
              required: false,
              label: 'Contact Section Image',
            },
            {
              name: 'gastronomyContactTitle',
              type: 'text',
              required: true,
              localized: true,
              label: 'Contact Form Heading',
            },
            {
              name: 'gastronomyContactDescription',
              type: 'textarea',
              required: false,
              localized: true,
              label: 'Contact Form Description',
            },
            {
              name: 'gastronomyFormPlaceholders',
              type: 'group',
              label: 'Form Placeholders',
              fields: [
                {
                  name: 'firstName',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'First Name',
                },
                {
                  name: 'lastName',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Last Name',
                },
                { name: 'email', type: 'text', required: false, localized: true, label: 'Email' },
                {
                  name: 'message',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Message',
                },
              ],
            },
            {
              name: 'gastronomySubjectOptions',
              type: 'group',
              label: 'Subject Dropdown',
              fields: [
                {
                  name: 'default',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Default Option',
                },
                {
                  name: 'options',
                  type: 'array',
                  label: 'Options',
                  minRows: 0,
                  fields: [{ name: 'label', type: 'text', required: false, localized: true }],
                },
              ],
            },
            {
              name: 'gastronomySubmitButtonLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'Submit Button Label',
            },
            {
              name: 'gastronomyCtaBanner',
              type: 'group',
              label: 'CTA Banner',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Heading',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Description',
                },
                {
                  name: 'buttonLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Button Label',
                },
                { name: 'buttonHref', type: 'text', required: false, label: 'Button URL' },
              ],
            },
            {
              name: 'gastronomyMapEmbedUrl',
              type: 'text',
              required: false,
              label: 'Map Embed URL',
            },
          ],
        },
        {
          name: 'onlineCourses',
          label: 'Online Courses Page',
          admin: {
            description:
              'Content for the Online Courses page (/courses). Only applies when slug is "courses".',
            condition: (data, siblingData) => {
              if (process.env.PAYLOAD_SKIP_ONLINE_COURSES_CONDITION === '1') return false
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'courses'
            },
          },
          fields: [
            {
              type: 'collapsible',
              label: '1. Hero',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'onlineCoursesHeroEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Eyebrow Text',
                  admin: {
                    description:
                      'Small label above the headline (e.g., "Online Workshops"). Leave empty to hide.',
                  },
                },
                {
                  name: 'onlineCoursesHeroTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Hero Title',
                  admin: {
                    description:
                      'Main headline (e.g., "Learn Fermentation Anytime, Anywhere").',
                  },
                },
                {
                  name: 'onlineCoursesHeroDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Hero Description',
                  admin: {
                    description: 'Subtext below the heading (1–2 sentences).',
                  },
                },
                {
                  name: 'onlineCoursesHeroCtaLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'CTA Button Label',
                  admin: {
                    description:
                      'Button text. Use "Explore workshops" to scroll to the workshop grid. Leave empty to hide.',
                  },
                },
                {
                  name: 'onlineCoursesHeroCtaUrl',
                  type: 'text',
                  required: false,
                  label: 'CTA Button URL',
                  admin: {
                    description:
                      'Use #workshops to scroll to the workshop grid on this page. Or use /workshops for in-person workshops.',
                  },
                },
                {
                  name: 'onlineCoursesHeroCtaHint',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'CTA Hint (below button)',
                  admin: {
                    description:
                      'Small text under the button when URL starts with # (e.g., "Scroll to explore"). Leave empty to hide.',
                  },
                },
                {
                  name: 'onlineCoursesHeroCta2Label',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Second CTA Button Label',
                  admin: { description: 'e.g., "Browse Workshops". Leave empty to hide.' },
                },
                {
                  name: 'onlineCoursesHeroCta2Url',
                  type: 'text',
                  required: false,
                  label: 'Second CTA Button URL',
                  admin: { description: 'e.g., "#workshops" or "/workshops".' },
                },
                {
                  name: 'onlineCoursesHeroImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Featured Image',
                  admin: {
                    description:
                      'Course thumbnail (e.g., jars of fermented food). Shown on the right in hero.',
                  },
                },
                {
                  name: 'onlineCoursesHeroImageBread',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Hero Image – Bread',
                  admin: {
                    description:
                      'Optional image for the bottom bread card in the hero collage. Falls back to Featured Image when empty.',
                  },
                },
                {
                  name: 'onlineCoursesHeroImageVeg',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Hero Image – Vegetables',
                  admin: {
                    description:
                      'Optional image for the middle vegetables card in the hero collage. Falls back to Featured Image when empty.',
                  },
                },
                {
                  name: 'onlineCoursesHeroImageKimchi',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Hero Image – Kimchi',
                  admin: {
                    description:
                      'Optional image for the top kimchi card in the hero collage. Falls back to Featured Image when empty.',
                  },
                },
                {
                  name: 'onlineCoursesLearnEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Learn Section Eyebrow',
                  admin: { description: 'Small label above "What You\'ll Learn". Leave empty to hide.' },
                },
                {
                  name: 'onlineCoursesWhyHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Learn Section Heading',
                  admin: { description: 'e.g., "What You\'ll Learn".' },
                },
                {
                  name: 'onlineCoursesWhyDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Learn Section Description',
                  admin: { description: 'Optional intro text for the learn cards.' },
                },
                {
                  name: 'onlineCoursesWhyCards',
                  type: 'array',
                  label: 'Learn Cards',
                  admin: { description: 'Up to 6 cards (icon + title + description).' },
                  fields: [
                    {
                      name: 'icon',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Icon',
                    },
                    { name: 'title', type: 'text', required: true, localized: true, label: 'Title' },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: false,
                      localized: true,
                      label: 'Description',
                    },
                  ],
                },
                {
                  name: 'onlineCoursesModulesEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Modules Section Eyebrow',
                  admin: { description: 'Small label above "Course Modules". Leave empty to hide.' },
                },
                {
                  name: 'onlineCoursesModulesHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Modules Section Heading',
                  admin: { description: 'e.g., "Course Modules".' },
                },
                {
                  name: 'onlineCoursesModules',
                  type: 'array',
                  label: 'Modules',
                  admin: { description: 'List of modules with lessons.' },
                  fields: [
                    { name: 'title', type: 'text', required: true, localized: true, label: 'Module Title' },
                    {
                      name: 'lessons',
                      type: 'array',
                      label: 'Lessons',
                      fields: [
                        { name: 'title', type: 'text', required: true, localized: true, label: 'Lesson Title' },
                        { name: 'locked', type: 'checkbox', label: 'Locked', defaultValue: false },
                      ],
                    },
                  ],
                },
                {
                  name: 'onlineCoursesModulesButtonLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Modules CTA Label',
                  admin: { description: 'e.g., "View all lessons". Leave empty to hide.' },
                },
                {
                  name: 'onlineCoursesModulesButtonUrl',
                  type: 'text',
                  required: false,
                  label: 'Modules CTA URL',
                  admin: { description: 'Link to product or #workshops.' },
                },
                {
                  name: 'onlineCoursesCurriculumProgressHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Curriculum Progress Heading',
                  admin: { description: 'Content for the curriculum page at /courses/basic-fermentation (progress bar, etc.).' },
                },
                {
                  name: 'onlineCoursesHowHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'How It Works Heading',
                  admin: { description: 'e.g., "How It Works".' },
                },
                {
                  name: 'onlineCoursesHowSteps',
                  type: 'array',
                  label: 'How It Works Steps',
                  admin: { description: 'Steps (title + description).' },
                  fields: [
                    { name: 'title', type: 'text', required: false, localized: true, label: 'Step Title' },
                    { name: 'description', type: 'textarea', required: false, localized: true, label: 'Step Description' },
                  ],
                },
                {
                  name: 'onlineCoursesExploreEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Workshops Section Eyebrow',
                  admin: { description: 'Small label above workshop cards. Leave empty to hide.' },
                },
                {
                  name: 'onlineCoursesWorkshopsHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Workshops Section Heading',
                  admin: { description: 'e.g., "More Courses on the Way".' },
                },
                {
                  name: 'onlineCoursesWorkshopsDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Workshops Section Description',
                  admin: { description: 'Optional text above the workshop cards.' },
                },
                {
                  name: 'onlineCoursesComingSoonSectionBadge',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Coming Soon Badge',
                  admin: { description: 'e.g., "Coming Soon". Leave empty to hide.' },
                },
                {
                  name: 'onlineCoursesWorkshopCards',
                  type: 'array',
                  label: 'Workshop Cards',
                  admin: { description: 'Cards for coming-soon or live courses (image, title, description, badge).' },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Card Image',
                    },
                    { name: 'title', type: 'text', required: true, localized: true, label: 'Title' },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: false,
                      localized: true,
                      label: 'Description',
                    },
                    { name: 'durationText', type: 'text', required: false, localized: true, label: 'Duration' },
                    { name: 'instructor', type: 'text', required: false, localized: true, label: 'Instructor' },
                    { name: 'levelText', type: 'text', required: false, localized: true, label: 'Level' },
                    {
                      name: 'comingSoonBadge',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Badge (e.g. "Coming Soon")',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'voucher',
          label: 'Voucher Page',
          admin: {
            description:
              'Content for the Gift Voucher page. These fields only apply when this page\'s slug is "voucher".',
            condition: (data) => data?.slug === 'voucher',
          },
          fields: [
            {
              name: 'heroHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Hero Heading',
              admin: {
                description:
                  'Main headline above the voucher form (e.g. "Give the gift of fermentation").',
              },
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Hero Description',
              admin: {
                description: 'Short intro text below the heading explaining the voucher.',
              },
            },
            {
              name: 'voucherAmounts',
              type: 'array',
              label: 'Voucher Amounts',
              required: true,
              minRows: 1,
              admin: {
                description:
                  'List of amount options shown as buttons (e.g. 50€, 99€). Same in all languages.',
              },
              fields: [
                {
                  name: 'amount',
                  type: 'text',
                  required: true,
                  label: 'Amount',
                },
              ],
            },
            {
              name: 'deliveryOptions',
              type: 'array',
              label: 'Delivery Options',
              required: true,
              minRows: 1,
              admin: { description: 'Ways to receive the voucher (e.g. by email or post).' },
              fields: [
                {
                  name: 'type',
                  type: 'text',
                  required: true,
                  label: 'Type (internal)',
                  admin: {
                    description: 'Internal key, e.g. "email" or "post". Used for logic, not shown.',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Title',
                  admin: {
                    description: 'Label shown to the user (e.g. "By email to print at home").',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  label: 'Icon',
                  options: [
                    { label: 'Email', value: 'email' },
                    { label: 'Card / Post', value: 'card' },
                  ],
                  admin: { description: 'Icon displayed next to this option.' },
                },
              ],
            },
            {
              name: 'cardLogo',
              type: 'upload',
              relationTo: 'media',
              label: 'Card Logo',
              admin: {
                description:
                  'Logo displayed on the voucher preview card. Leave empty to use fallback.',
              },
            },
            {
              name: 'cardLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Card Label',
              admin: {
                description: 'Label on the voucher preview card (e.g. "GIFT VOUCHER").',
              },
            },
            {
              name: 'valueLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Value Label',
              admin: {
                description: 'Label above the amount on the card (e.g. "Voucher value").',
              },
            },
            {
              name: 'cardDisclaimer',
              type: 'text',
              required: true,
              localized: true,
              label: 'Card Disclaimer',
              admin: {
                description: 'Small text under the amount (e.g. "Redeemable in our shop").',
              },
            },
            {
              name: 'amountSectionLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Amount Section Label',
              admin: {
                description: 'Label above the amount buttons (e.g. "VOUCHER VALUE").',
              },
            },
            {
              name: 'deliverySectionLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Delivery Section Label',
              admin: {
                description: 'Label above delivery options (e.g. "DELIVERY METHOD").',
              },
            },
            {
              name: 'greetingLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Greeting Message Label',
              admin: {
                description: 'Label for the optional greeting message field.',
              },
            },
            {
              name: 'greetingPlaceholder',
              type: 'text',
              required: true,
              localized: true,
              label: 'Greeting Placeholder',
              admin: {
                description:
                  'Placeholder text in the greeting textarea (e.g. "Max. 250 characters").',
              },
            },
            {
              name: 'addToCartButton',
              type: 'text',
              required: true,
              localized: true,
              label: 'Add to Cart Button',
              admin: {
                description: 'Text for the main CTA button (e.g. "Add to cart").',
              },
            },
            {
              name: 'starterSetHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Starter Set Section Heading',
              admin: {
                description: 'Heading for the "Combine with Starter Set" section.',
              },
            },
            {
              name: 'starterSetDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Starter Set Description',
              admin: {
                description: 'Body text for the starter set section.',
              },
            },
            {
              name: 'starterSetButton',
              type: 'text',
              required: true,
              localized: true,
              label: 'Starter Set Button',
              admin: {
                description: 'Button text (e.g. "View Starter Sets").',
              },
            },
            {
              name: 'starterSetImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Starter Set Image',
              admin: {
                description: 'Image shown in the starter set section. Leave empty to use fallback.',
              },
            },
            {
              name: 'giftOccasionsHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Gift Occasions Heading',
              admin: {
                description: 'Heading for the "Gift for every occasion" section.',
              },
            },
            {
              name: 'giftOccasions',
              type: 'array',
              label: 'Gift Occasions',
              required: true,
              minRows: 1,
              maxRows: 4,
              admin: {
                description: 'Occasion cards with image and caption (e.g. Birthdays, Weddings).',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Image',
                  admin: { description: 'Optional. Uses fallback if empty.' },
                },
                {
                  name: 'caption',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Caption',
                },
              ],
            },
            {
              name: 'faqHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'FAQ Heading',
              admin: {
                description: 'Heading above the voucher FAQ accordion.',
              },
            },
            {
              name: 'faqs',
              type: 'array',
              label: 'FAQs',
              required: true,
              minRows: 1,
              admin: {
                description: 'Frequently asked questions about vouchers.',
              },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Question',
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  label: 'Answer',
                },
              ],
            },
          ],
        },
        {
          name: 'shop',
          label: 'Shop Page',
          admin: {
            description:
              'Content for the Shop page (/shop). Only applies when slug is "shop". Editable from Collections → Pages.',
            condition: (data, siblingData) => {
              if (process.env.PAYLOAD_SKIP_SHOP_CONDITION === '1') return false
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'shop'
            },
          },
          fields: shopPageFields,
        },
        {
          name: 'workshops',
          label: 'Workshops Overview Page',
          admin: {
            description:
              'Content for the Workshops overview page (/workshops). Only applies when slug is "workshops".',
            condition: (data, siblingData) => {
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'workshops'
            },
          },
          fields: [
            {
              type: 'collapsible',
              label: '🎯 Hero Section',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'workshopsHeroEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Eyebrow Text',
                  admin: {
                    description: 'Small text above the title (e.g., "Fermentation Workshops").',
                  },
                },
                {
                  name: 'workshopsHeroTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Hero Title',
                  admin: {
                    description:
                      'Main heading. Use \\n for line breaks (e.g., "Discover the Art\\nof Fermentation").',
                  },
                },
                {
                  name: 'workshopsHeroDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Hero Description',
                  admin: { description: 'Short intro text describing the workshops.' },
                },
                {
                  name: 'workshopsHeroAttributes',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 5,
                  label: 'Hero Attributes',
                  admin: {
                    description: 'Small text items (e.g., "3 Hours", "Hands-on", "Experience").',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Attribute Text',
                    },
                  ],
                },
                {
                  name: 'workshopsHeroImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Hero Image',
                  admin: {
                    description:
                      'Optional background image for the hero. If empty, jar silhouettes are shown.',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: '📅 Workshop Calendar Section',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'workshopsCalendarTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section Title',
                  admin: { description: 'e.g., "Unsere Termine" / "Our Dates"' },
                },
                {
                  name: 'workshopsCalendarDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Section Description',
                  admin: { description: 'Intro text above the calendar.' },
                },
                {
                  name: 'workshopsCalendarCards',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 10,
                  label: 'Workshop Cards',
                  admin: {
                    description:
                      'Add workshop-specific calendar cards (Basics, Lakto, Kombucha, Tempeh).',
                  },
                  fields: [
                    {
                      name: 'workshopType',
                      type: 'select',
                      required: true,
                      localized: true,
                      label: 'Workshop Type',
                      options: [
                        { label: '🥬 Basics (Lacto-vegetables)', value: 'basics' },
                        { label: '🥒 Lakto-Gemüse', value: 'lakto' },
                        { label: '🫖 Kombucha', value: 'kombucha' },
                        { label: '🌱 Tempeh', value: 'tempeh' },
                      ],
                    },
                    {
                      name: 'cardImage',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Card Image',
                      admin: { description: 'Card background image for this workshop type.' },
                    },
                    {
                      name: 'nextDate',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Next Date',
                      admin: { description: 'e.g., "20. Mär" / "Mar 20"' },
                    },
                    {
                      name: 'duration',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Duration',
                      admin: { description: 'e.g., "3h 30m" / "3.5 Stunden"' },
                    },
                    {
                      name: 'buttonLabel',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Button Label',
                      admin: { description: 'e.g., "Buchen" / "Book Now"' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'fermentation',
          label: 'Fermentation Page',
          admin: {
            description:
              'Content for the Fermentation page (/fermentation). Only applies when slug is "fermentation".',
            condition: (data, siblingData) => {
              if (process.env.PAYLOAD_SKIP_FERMENTATION_CONDITION === '1') return false
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'fermentation'
            },
          },
          fields: [
            {
              type: 'collapsible',
              label: '1. Hero',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationHeroTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Hero Title',
                  admin: { description: 'Main headline (e.g., "Innovation meets Tradition").' },
                },
                {
                  name: 'fermentationHeroDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Hero Description',
                  admin: { description: 'Short intro text below the heading.' },
                },
                {
                  name: 'fermentationHeroImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Hero Image',
                  admin: {
                    description:
                      'Large hero image (e.g., founders/team). Shown above the 4 feature blocks.',
                  },
                },
                {
                  name: 'fermentationHeroBenefitsTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Hero Benefits Section Title',
                  admin: {
                    description: 'Heading above the 4 benefit cards (e.g., "WHY FERMENTATION?").',
                  },
                },
                {
                  name: 'fermentationHeroBlocks',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 4,
                  label: 'Hero Benefit Cards',
                  admin: {
                    description:
                      'Four cards: PROBIOTICS, ENZIMES, NUTRITION, PRESERVATION. Order: beige, gold, dark, beige. Each can have an icon.',
                  },
                  fields: [
                    {
                      name: 'icon',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Icon',
                      admin: { description: 'Small icon at top of block.' },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Title',
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: false,
                      localized: true,
                      label: 'Description',
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: false,
                      label: 'Link URL',
                      admin: { description: 'Where this block links.' },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: '2. Guide',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationGuideTag',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Guide Section Tag',
                  admin: {
                    description: 'Small label above the guide heading (e.g., "START HERE").',
                  },
                },
                {
                  name: 'fermentationGuideTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Guide Section Title',
                  admin: {
                    description: 'Main heading (e.g., "A complete guide to fermentation").',
                  },
                },
                {
                  name: 'fermentationGuideBody',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Guide Section Body',
                  admin: { description: 'Introductory paragraph for the guide.' },
                },
                {
                  name: 'fermentationGuideImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Guide Section Image',
                  admin: {
                    description:
                      'Optional image below the guide text (e.g. fermentation process, ingredients).',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: '3. What is fermentation?',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationWhatTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '"What is fermentation?" Title',
                },
                {
                  name: 'fermentationWhatBody',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: '"What is fermentation?" Body',
                },
                {
                  name: 'fermentationWhatMotto',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '"What is fermentation?" Motto',
                  admin: {
                    description: 'e.g. "No additives. No shortcuts. Just patience and care."',
                  },
                },
                {
                  name: 'fermentationWhatLinks',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 3,
                  label: 'What Section Links',
                  admin: { description: 'e.g. "Ready to Learn?", "Our Story"' },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Label',
                    },
                    { name: 'url', type: 'text', required: true, label: 'URL' },
                  ],
                },
                {
                  name: 'fermentationWhatImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: '"What" Section Image',
                  admin: {
                    description: 'Optional image (e.g. fermented vegetables, jars, process).',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: '4. Why is it so special?',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationWhyTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '"Why is it so special?" Title',
                },
                {
                  name: 'fermentationWhyItems',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 6,
                  label: 'Why Special Items',
                  admin: {
                    description:
                      'Six benefit items in two columns (e.g., Improved digestion, Rich in enzymes).',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Title',
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: true,
                      localized: true,
                      label: 'Description',
                    },
                  ],
                },
                {
                  name: 'fermentationWhyImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: '"Why" Section Image',
                  admin: {
                    description: 'Optional image (e.g. gut health, fermentation benefits).',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: '5. Is it dangerous?',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationDangerTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '"Is it dangerous?" Title',
                },
                {
                  name: 'fermentationDangerIntro',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: '"Is it dangerous?" Intro',
                  admin: { description: 'Intro paragraph before the concerns list.' },
                },
                {
                  name: 'fermentationDangerConcernsHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '"Is it dangerous?" Concerns Heading',
                  admin: { description: 'e.g. "Common concerns addressed:"' },
                },
                {
                  name: 'fermentationDangerConcerns',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 8,
                  label: '"Is it dangerous?" Concerns',
                  admin: {
                    description: 'Concern items (e.g., Mold, Smell, Botulism, Trust your senses).',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Title',
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: true,
                      localized: true,
                      label: 'Description',
                    },
                  ],
                },
                {
                  name: 'fermentationDangerClosing',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: '"Is it dangerous?" Closing',
                  admin: { description: 'Closing paragraph after the concerns list.' },
                },
              ],
            },
            {
              type: 'collapsible',
              label: '6. A practice, not a trend',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationPracticeTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '"A practice, not a trend" Title',
                },
                {
                  name: 'fermentationPracticeBody',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: '"A practice, not a trend" Body',
                  admin: {
                    description: 'Multiple paragraphs supported. Separate with a blank line.',
                  },
                },
                {
                  name: 'fermentationPracticeImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: '"Practice" Section Image',
                  admin: {
                    description: 'Optional image (e.g. traditional fermentation, cultural foods).',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: '7. CTA (Ready to learn?)',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationCtaTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'CTA Section Title',
                  admin: { description: 'e.g. "Ready to learn?"' },
                },
                {
                  name: 'fermentationCtaDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'CTA Section Description',
                },
                {
                  name: 'fermentationCtaPrimaryLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'CTA Primary Button Label',
                  admin: { description: 'e.g. "Find course" / "Kurs finden"' },
                },
                {
                  name: 'fermentationCtaPrimaryUrl',
                  type: 'text',
                  required: false,
                  label: 'CTA Primary Button URL',
                },
                {
                  name: 'fermentationCtaSecondaryLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'CTA Secondary Button Label',
                  admin: { description: 'e.g. "All courses" / "Alle Kurse"' },
                },
                {
                  name: 'fermentationCtaSecondaryUrl',
                  type: 'text',
                  required: false,
                  label: 'CTA Secondary Button URL',
                },
                {
                  name: 'fermentationCtaVideoUrl',
                  type: 'text',
                  required: false,
                  label: 'CTA Background Video URL',
                  admin: {
                    description:
                      'Optional video as background. Leave empty for solid gold background.',
                  },
                },
                {
                  name: 'fermentationCtaBackgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'CTA Background Image (fallback/poster)',
                  admin: {
                    description:
                      'Used as poster when video is set, or fallback when video is absent.',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: '8. FAQ',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'fermentationFaqTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ Section Title',
                },
                {
                  name: 'fermentationFaqSubtitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ Section Subtitle',
                  admin: { description: 'e.g. "Common questions about fermentation answered"' },
                },
                {
                  name: 'fermentationFaqItems',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 12,
                  label: 'FAQ Items',
                  admin: { description: 'Questions and answers.' },
                  fields: [
                    {
                      name: 'question',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Question',
                    },
                    {
                      name: 'answer',
                      type: 'textarea',
                      required: true,
                      localized: true,
                      label: 'Answer',
                    },
                  ],
                },
                {
                  name: 'fermentationFaqCtaTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ Bottom CTA Title',
                  admin: { description: 'e.g. "Ready to Start Fermenting?"' },
                },
                {
                  name: 'fermentationFaqCtaBody',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'FAQ Bottom CTA Body',
                  admin: {
                    description:
                      'Instructional paragraph below the FAQ grid (e.g. "Begin with simple vegetables...")',
                  },
                },
                {
                  name: 'fermentationFaqMoreText',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ "More" Text (legacy)',
                  admin: {
                    description: 'Fallback if CTA title empty. e.g. "Still have questions?"',
                  },
                },
                {
                  name: 'fermentationFaqContactLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ Contact Button Label',
                  admin: { description: 'e.g. "Contact Us"' },
                },
                {
                  name: 'fermentationFaqContactUrl',
                  type: 'text',
                  required: false,
                  label: 'FAQ Contact Button URL',
                },
              ],
            },
            {
              type: 'collapsible',
              label: '9. Learn UNIQUE. FLAVOURS (Workshop)',
              admin: { initCollapsed: false },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'fermentationWorkshopTitle',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Learn UNIQUE. FLAVOURS — Title (main)',
                      admin: { description: 'e.g. "Learn UNIQUE." — Last section on page.' },
                    },
                    {
                      name: 'fermentationWorkshopTitleSuffix',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Title (suffix)',
                      admin: { description: 'e.g. "FLAVOURS"' },
                    },
                  ],
                },
                {
                  name: 'fermentationWorkshopSubtitle',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Learn UNIQUE. FLAVOURS — Subtitle',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'fermentationWorkshopViewAllLabel',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'View All Dates Button Label',
                    },
                    {
                      name: 'fermentationWorkshopViewAllUrl',
                      type: 'text',
                      required: false,
                      label: 'View All Dates Button URL',
                    },
                    {
                      name: 'fermentationWorkshopNextDateLabel',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Next Date Label',
                    },
                  ],
                },
                {
                  name: 'fermentationWorkshopCards',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 6,
                  label: 'Workshop Cards (override; else uses Gastronomy)',
                  admin: {
                    description:
                      'Leave empty to use Gastronomy workshop cards. Add here to override for fermentation only.',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Image',
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Title',
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: true,
                      localized: true,
                      label: 'Description',
                    },
                    { name: 'price', type: 'text', required: false, label: 'Price' },
                    {
                      name: 'priceSuffix',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Price Suffix',
                    },
                    {
                      name: 'buttonLabel',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Button Label',
                    },
                    { name: 'buttonUrl', type: 'text', required: true, label: 'Button URL' },
                    {
                      name: 'nextDate',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Next Appointment',
                      admin: { description: 'e.g. "February 15, 2026"' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'workshopDetail',
          label: 'Workshop Detail',
          admin: {
            description:
              'All editable content for the workshop detail page (Hero, Calendar, Voucher, FAQ, How-To Articles). Available for lakto-gemuese, tempeh, and kombucha.',
            condition: (data, siblingData) => {
              if (process.env.PAYLOAD_SKIP_WORKSHOP_CONDITION === '1') return false
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'lakto-gemuese' || slug === 'tempeh' || slug === 'kombucha'
            },
          },
          fields: workshopDetailFields,
        },
        {
          name: 'workshopGiftOnline',
          label: 'Gift & Online',
          admin: {
            description: 'DEPRECATED - not used on any workshop UI',
            condition: () => false,
          },
          fields: [
            {
              name: 'giftTitle',
              type: 'text',
              required: true,
              localized: true,
              label: 'Gift Card Title',
            },
            {
              name: 'giftDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Gift Card Description',
            },
            {
              name: 'giftBuyNowLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Gift Buy Now Button',
            },
            {
              name: 'giftBuyVoucherLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Gift Buy Voucher Button',
            },
            { name: 'giftBuyNowHref', type: 'text', required: true, label: 'Gift Buy Now URL' },
            {
              name: 'giftBuyVoucherHref',
              type: 'text',
              required: true,
              label: 'Gift Buy Voucher URL',
            },
            {
              name: 'onlineTitle',
              type: 'text',
              required: true,
              localized: true,
              label: 'Online Card Title',
            },
            {
              name: 'onlineDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Online Card Description',
            },
            {
              name: 'onlineBullets',
              type: 'array',
              label: 'Online Card Bullets',
              required: true,
              minRows: 1,
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Bullet Text',
                },
              ],
            },
            {
              name: 'onlineButtonLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Online Button Label',
            },
            { name: 'onlineButtonHref', type: 'text', required: true, label: 'Online Button URL' },
          ],
        },
        {
          name: 'workshopLearnOnline',
          label: 'Learn Online',
          admin: {
            condition: () => false,
          },
          fields: [
            {
              name: 'learnOnlineHeading',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Heading',
            },
            {
              name: 'learnOnlineDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Description',
            },
            {
              name: 'learnOnlineButtonLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Button Label',
            },
            { name: 'learnOnlineButtonHref', type: 'text', required: true, label: 'Button URL' },
          ],
        },
        {
          name: 'workshopFaq',
          label: 'FAQ Slider',
          admin: {
            condition: () => false,
          },
          fields: [
            {
              name: 'faqHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'FAQ Heading',
            },
            {
              name: 'faqSubtitle',
              type: 'text',
              required: true,
              localized: true,
              label: 'FAQ Subtitle',
            },
            {
              name: 'faqItems',
              type: 'array',
              label: 'FAQ Items',
              required: true,
              minRows: 1,
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Question',
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  label: 'Answer',
                },
              ],
            },
          ],
        },
        {
          name: 'workshopWhyOnline',
          label: 'Why Online',
          admin: {
            condition: () => false,
          },
          fields: [
            {
              name: 'whyOnlineHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Heading',
            },
            {
              name: 'whyOnlineFeatures',
              type: 'array',
              label: 'Features',
              required: true,
              minRows: 4,
              maxRows: 4,
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  label: 'Icon',
                  options: [
                    { label: 'Lightning', value: 'lightning' },
                    { label: 'Clock', value: 'clock' },
                    { label: 'Home', value: 'home' },
                    { label: 'Book', value: 'book' },
                  ],
                },
                { name: 'title', type: 'text', required: true, localized: true, label: 'Title' },
                {
                  name: 'description',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Description',
                },
              ],
            },
          ],
        },
        {
          name: 'workshopTeamBuilding',
          label: 'Team Building',
          admin: {
            condition: () => false,
          },
          fields: [
            {
              name: 'teamEyebrow',
              type: 'text',
              required: true,
              localized: true,
              label: 'Eyebrow',
            },
            {
              name: 'teamHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Heading',
            },
            {
              name: 'teamDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Description',
            },
            {
              name: 'teamBullets',
              type: 'array',
              label: 'Bullets',
              required: true,
              minRows: 1,
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Bullet Text',
                },
              ],
            },
            {
              name: 'teamCtaLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'CTA Button Label',
            },
            { name: 'teamCtaHref', type: 'text', required: true, label: 'CTA Button URL' },
            {
              name: 'teamImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Team Building Image',
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage, autoTranslateCollection],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
}
