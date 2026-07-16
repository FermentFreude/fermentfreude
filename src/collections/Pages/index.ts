import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { CollectionGrid } from '@/blocks/CollectionGrid/config'
import { ContactBlock } from '@/blocks/ContactBlock/config'
import { Content } from '@/blocks/Content/config'
import { CourseWaitlistCta } from '@/blocks/CourseWaitlistCta/config'
import { FeatureCards } from '@/blocks/FeatureCards/config'
import { FeaturedProductCards } from '@/blocks/FeaturedProductCards/config'
import { FormBlock } from '@/blocks/Form/config'
import { HelpFaqBlock } from '@/blocks/HelpFaqBlock/config'
import { HeroBanner } from '@/blocks/HeroBanner/config'
import { LaktoVoucherCtaBlock } from '@/blocks/LaktoVoucherCta/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { OnlineCourseSlider } from '@/blocks/OnlineCourseSlider/config'
import { OurStory } from '@/blocks/OurStory/config'
import { PressBanner } from '@/blocks/PressBanner/config'
import { PressMediaAwards } from '@/blocks/PressMediaAwards/config'
import { ProductSlider } from '@/blocks/ProductSlider/config'
import { ReadyToLearnCTA } from '@/blocks/ReadyToLearnCTA/config'
import { ShopHero } from '@/blocks/ShopHero/config'
import { ShopProductGrid } from '@/blocks/ShopProductGrid/config'
import { ShopProductList } from '@/blocks/ShopProductList/config'
import { SponsorsBar } from '@/blocks/SponsorsBar/config'
import { TeamCards } from '@/blocks/TeamCards/config'
import { TeamPreview } from '@/blocks/TeamPreview/config'
import { Testimonials } from '@/blocks/Testimonials/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { VoucherCta } from '@/blocks/VoucherCta/config'
import { WorkshopPhases } from '@/blocks/WorkshopPhases/config'
import { WorkshopSlider } from '@/blocks/WorkshopSlider/config'
import { hero } from '@/fields/hero'
import { workshopDetailFields } from '@/fields/workshopDetailFields'
import { workshopOverviewFields } from '@/fields/workshopOverviewFields'
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
    group: 'Inhalt',
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
    /** Slug before tabs so tab conditions and editors reliably see it (sidebar row). */
    slugField(),
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
                PressBanner,
                PressMediaAwards,
                OnlineCourseSlider,
                ProductSlider,
                FeaturedProductCards,
                ShopHero,
                ShopProductGrid,
                ShopProductList,
                CollectionGrid,
                ReadyToLearnCTA,
                SponsorsBar,
                TeamCards,
                TeamPreview,
                Testimonials,
                ThreeItemGrid,
                Banner,
                FormBlock,
                HelpFaqBlock,
                VoucherCta,
                LaktoVoucherCtaBlock,
                CourseWaitlistCta,
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
              'B2B /gastronomy. Slug oben setzen. Felder folgen der Seitenreihenfolge: Hero → Trusted by → CTA → What we offer → … → Kontakt → Next workshop. / Fields follow on-page order from top to bottom.',
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
                  name: 'gastronomyHeroCtaLabel',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Hero — CTA button label',
                  admin: {
                    width: '50%',
                    description: 'Primary button on the hero slider (e.g. “Take a look”).',
                  },
                },
                {
                  name: 'gastronomyHeroCtaUrl',
                  type: 'text',
                  required: false,
                  label: 'Hero — CTA URL',
                  admin: {
                    width: '50%',
                    description: 'Hero button target (e.g. #offer).',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'gastronomyHeroSliderPrevLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Hero slider — Previous label',
                  admin: {
                    description: 'Text on the previous-slide control (e.g. PREV, ZURÜCK).',
                    width: '33%',
                  },
                },
                {
                  name: 'gastronomyHeroSliderNextLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Hero slider — Next label',
                  admin: {
                    description: 'Text on the next-slide control (e.g. NEXT, WEITER).',
                    width: '33%',
                  },
                },
                {
                  name: 'gastronomyHeroSliderAutoplayMs',
                  type: 'number',
                  required: false,
                  label: 'Hero slider — autoplay (ms)',
                  admin: {
                    description:
                      'Milliseconds between automatic slide changes. Leave empty for default (12000). Min 2000, max 120000.',
                    width: '34%',
                  },
                  min: 2000,
                  max: 120000,
                },
              ],
            },
            {
              name: 'gastronomyOfferCards',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 3,
              label: 'Hero slider — slides (3 cards)',
              admin: {
                description:
                  'Images + text for the large hero carousel (same order as on the page, before Trusted by).',
              },
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
              name: 'gastronomyTrustedByHeading',
              type: 'text',
              required: false,
              localized: true,
              label: 'Partner section — heading (editable)',
              admin: {
                description:
                  'Editable heading above the partner tags. Example DE: "Für Profiküchen". Example EN: "For professional kitchens".',
              },
            },
            {
              name: 'gastronomyTrustedByBadges',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 12,
              label: 'Partner section — tags (editable)',
              admin: {
                description:
                  'Editable chips shown next to the heading (e.g. Restaurants, Hotels, Catering).',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Chip text',
                },
              ],
            },
            {
              name: 'gastronomyCtaBanner',
              type: 'group',
              label: 'CTA banner (dark block)',
              admin: {
                description:
                  'Dark rounded block after Trusted by, before “What we offer”. Headline, subline, button.',
              },
              fields: [
                {
                  name: 'heading',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Heading',
                },
                {
                  name: 'description',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Subline',
                },
                {
                  name: 'buttonLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Button label',
                },
                {
                  name: 'buttonHref',
                  type: 'text',
                  required: false,
                  label: 'Button URL',
                  admin: { description: 'e.g. #contact or /contact' },
                },
              ],
            },
            {
              name: 'gastronomyOfferDetailsTitle',
              type: 'text',
              required: false,
              localized: true,
              label: 'What we offer — section title',
              admin: {
                description:
                  'Main heading above the icon cards. If empty, “Offer section title (fallback)” below is used.',
              },
            },
            {
              name: 'gastronomyOfferSectionTitle',
              type: 'text',
              required: false,
              localized: true,
              label: 'What we offer — title fallback',
              admin: {
                description:
                  'Used only if “What we offer — section title” is empty (legacy / short heading).',
              },
            },
            {
              name: 'gastronomyOfferDetails',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 8,
              label: 'Offer Details',
              admin: {
                description:
                  'Cards under “What we offer”. Optional icon image per row; if empty, a default icon is used.',
              },
              fields: [
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Icon (optional)',
                  admin: {
                    description:
                      'Small square icon (SVG/PNG/WebP). If empty, a built-in icon is used.',
                  },
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
              type: 'collapsible',
              label: 'Outcomes — Before / After',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'gastronomyOutcomesEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Eyebrow (e.g. ERGEBNISSE)',
                },
                {
                  name: 'gastronomyOutcomesTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section title',
                },
                {
                  name: 'gastronomyOutcomesBeforeLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '“Before” column label',
                  admin: { description: 'e.g. VORHER / BEFORE' },
                },
                {
                  name: 'gastronomyOutcomesAfterLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '“After” column label',
                  admin: { description: 'e.g. NACHHER / AFTER' },
                },
                {
                  name: 'gastronomyOutcomesItems',
                  type: 'array',
                  required: false,
                  maxRows: 6,
                  label: 'Outcome cards',
                  fields: [
                    {
                      name: 'before',
                      type: 'textarea',
                      required: true,
                      localized: true,
                      label: 'Before',
                    },
                    {
                      name: 'after',
                      type: 'textarea',
                      required: true,
                      localized: true,
                      label: 'After',
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Process — How we work',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'gastronomyProcessEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Eyebrow',
                },
                {
                  name: 'gastronomyProcessTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section title',
                },
                {
                  name: 'gastronomyProcessSteps',
                  type: 'array',
                  required: false,
                  maxRows: 6,
                  label: 'Steps',
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
              ],
            },
            {
              type: 'collapsible',
              label: 'Testimonials',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'gastronomyTestimonialsEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Eyebrow',
                },
                {
                  name: 'gastronomyTestimonialsTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section title',
                },
                {
                  name: 'gastronomyTestimonialsItems',
                  type: 'array',
                  required: false,
                  maxRows: 6,
                  label: 'Quotes',
                  fields: [
                    {
                      name: 'quote',
                      type: 'textarea',
                      required: true,
                      localized: true,
                      label: 'Quote',
                    },
                    {
                      name: 'author',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Attribution',
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'B2B FAQ',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'gastronomyFaqEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Eyebrow',
                },
                {
                  name: 'gastronomyFaqTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section title',
                },
                {
                  name: 'gastronomyFaqItems',
                  type: 'array',
                  required: false,
                  maxRows: 8,
                  label: 'Questions',
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
              name: 'gastronomyContactFormHeading',
              type: 'text',
              required: false,
              localized: true,
              label: 'Contact Form — right column heading',
              admin: {
                description:
                  'Heading above the form fields (e.g. "Frag uns alles" / "Ask About Anything").',
              },
            },
            {
              name: 'gastronomyContactAddress',
              type: 'textarea',
              required: false,
              localized: true,
              label: 'Contact Details — Address',
              admin: {
                description: 'Address shown in the left contact details panel.',
              },
            },
            {
              name: 'gastronomyContactPhone',
              type: 'text',
              required: false,
              localized: true,
              label: 'Contact Details — Phone',
              admin: {
                description: 'Phone number shown in the left contact details panel.',
              },
            },
            {
              name: 'gastronomyContactEmail',
              type: 'text',
              required: false,
              localized: true,
              label: 'Contact Details — Email',
              admin: {
                description: 'Email address shown in the left contact details panel.',
              },
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
              name: 'gastronomyWorkshopSectionTitle',
              type: 'text',
              required: true,
              localized: true,
              label: 'Next workshop — section title',
              admin: {
                description: 'Heading for the workshop cards at the bottom of the page.',
              },
            },
            {
              name: 'gastronomyWorkshopSectionSubtitle',
              type: 'text',
              required: false,
              localized: true,
              label: 'Next workshop — subtitle',
            },
            {
              name: 'gastronomyWorkshopClarification',
              type: 'textarea',
              required: false,
              localized: true,
              label: 'Next workshop — clarification',
              admin: {
                description:
                  'Optional note below the subtitle (e.g. chefs welcome, custom workshops).',
              },
            },
            {
              name: 'gastronomyWorkshopNextDateLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'Next workshop — date label',
              admin: { description: 'e.g. “Nächster Termin:” / “Next Appointment:”' },
            },
            {
              name: 'gastronomyWorkshopCards',
              type: 'array',
              required: false,
              minRows: 0,
              maxRows: 3,
              label: 'Next workshop — cards',
              admin: { description: 'Up to three cards; last section on /gastronomy.' },
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
                  admin: {
                    description: 'Main headline (e.g., "Innovation meets Tradition").',
                  },
                },
                {
                  name: 'fermentationHeroDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Hero Description',
                  admin: {
                    description: 'Short intro text below the heading.',
                  },
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
                    hidden: true,
                    description:
                      'Legacy field — not currently rendered on the page. Kept for backward compatibility.',
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
                  admin: {
                    description: 'Introductory paragraph for the guide.',
                  },
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
                  name: 'fermentationWhyEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: '"Why is it so special?" Eyebrow',
                  admin: {
                    description:
                      'Small label shown above the section title (e.g. "BENEFITS" / "VORTEILE").',
                  },
                },
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
                  admin: {
                    description: 'Intro paragraph before the concerns list.',
                  },
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
                  admin: {
                    description: 'Closing paragraph after the concerns list.',
                  },
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
                  name: 'fermentationCtaVideo',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'CTA Background Video',
                  admin: {
                    description:
                      'Upload a video (MP4) as background. Or use the URL field below for videos in public/assets/videos/.',
                  },
                },
                {
                  name: 'fermentationCtaVideoUrl',
                  type: 'text',
                  required: false,
                  label: 'CTA Background Video URL (alternative)',
                  admin: {
                    description:
                      'If not using upload above: path like /assets/videos/cabbage-cta.mp4. Leave empty for solid gold background.',
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
                    hidden: true,
                    description: 'Legacy field — not rendered. Use "FAQ Bottom CTA Title" instead.',
                  },
                },
                {
                  name: 'fermentationFaqContactLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ Contact Button Label',
                  admin: {
                    hidden: true,
                    description: 'Legacy field — not rendered.',
                  },
                },
                {
                  name: 'fermentationFaqContactUrl',
                  type: 'text',
                  required: false,
                  label: 'FAQ Contact Button URL',
                  admin: { hidden: true },
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
                      label: 'Next Date',
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
              name: 'voucherShowHero',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description: 'Toggle off to hide the voucher hero section on the website.',
              },
            },
            {
              name: 'heroHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Hero Heading',
              admin: {
                description:
                  'Main headline above the voucher form (e.g. "Give the gift of fermentation").',
                condition: (data) => data?.voucherShowHero !== false,
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
                condition: (data) => data?.voucherShowHero !== false,
              },
            },
            {
              name: 'voucherShowAmounts',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description: 'Toggle off to hide the voucher amount selection on the website.',
                condition: (data) => data?.voucherShowHero !== false,
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
                condition: (data) =>
                  data?.voucherShowHero !== false && data?.voucherShowAmounts !== false,
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
              name: 'voucherShowDeliveryOptions',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description: 'Toggle off to hide delivery options on the website.',
                condition: (data) => data?.voucherShowHero !== false,
              },
            },
            {
              name: 'deliveryOptions',
              type: 'array',
              label: 'Delivery Options',
              required: true,
              minRows: 1,
              admin: {
                description:
                  'Email or pick up from store. Post/card removed for product freshness.',
                condition: (data) =>
                  data?.voucherShowHero !== false && data?.voucherShowDeliveryOptions !== false,
              },
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
                  name: 'iconSource',
                  type: 'select',
                  label: 'Icon Type',
                  defaultValue: 'preset',
                  options: [
                    { label: 'Built-in icon', value: 'preset' },
                    { label: 'Custom upload (Media)', value: 'custom' },
                  ],
                  admin: {
                    description:
                      'Choose built-in icon from the list, or switch to custom to upload/select an icon from Media.',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  required: false,
                  label: 'Icon',
                  options: [
                    { label: 'Email', value: 'email' },
                    { label: 'Pick up from store', value: 'pickup' },
                    { label: 'Card / Post (deprecated)', value: 'card' },
                  ],
                  admin: {
                    description: 'Icon displayed next to this option. Use email or pickup only.',
                  },
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
                condition: (data) => data?.voucherShowHero !== false,
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
                condition: (data) => data?.voucherShowHero !== false,
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
                condition: (data) => data?.voucherShowHero !== false,
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
                condition: (data) => data?.voucherShowHero !== false,
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
                condition: (data) =>
                  data?.voucherShowHero !== false && data?.voucherShowAmounts !== false,
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
                condition: (data) =>
                  data?.voucherShowHero !== false && data?.voucherShowDeliveryOptions !== false,
              },
            },
            {
              name: 'deliveryDisclaimer',
              type: 'textarea',
              label: 'Delivery Disclaimer',
              localized: true,
              admin: {
                description:
                  'Explains why products cannot be sent by post (e.g. freshness). Shown under the delivery option.',
                condition: (data) =>
                  data?.voucherShowHero !== false && data?.voucherShowDeliveryOptions !== false,
              },
            },
            {
              name: 'pickupAddress',
              type: 'textarea',
              label: 'Pick-up store address',
              localized: true,
              admin: {
                description:
                  'Address shown when "Pick up from store" is selected (e.g. Grabenstraße 15, 8010 Graz).',
                condition: (data) =>
                  data?.voucherShowHero !== false && data?.voucherShowDeliveryOptions !== false,
              },
            },
            {
              name: 'voucherShowCTA',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description: 'Toggle off to hide the add-to-cart button on the website.',
                condition: (data) => data?.voucherShowHero !== false,
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
                condition: (data) =>
                  data?.voucherShowHero !== false && data?.voucherShowCTA !== false,
              },
            },
            {
              type: 'collapsible',
              label: 'Why Section',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'voucherShowWhy',
                  type: 'checkbox',
                  label: 'Show this section',
                  defaultValue: true,
                  localized: true,
                  admin: {
                    description: 'Toggle off to hide the voucher "Why" section on the website.',
                  },
                },
                {
                  name: 'voucherWhyHeading',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Why Voucher Section Heading',
                  admin: {
                    description:
                      'Heading for the "Why a fermentation voucher" section (e.g. "Why a fermentation voucher is a great gift").',
                    condition: (data) => data?.voucherShowWhy !== false,
                  },
                },
                {
                  name: 'voucherWhyBody',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  label: 'Why Voucher Section Body',
                  admin: {
                    description:
                      'Body text that explains why a fermentation workshop voucher is a good present.',
                    condition: (data) => data?.voucherShowWhy !== false,
                  },
                },
                {
                  name: 'voucherWhyImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Why Section Image',
                  admin: {
                    description:
                      'Optional joyful image for the "Why" section (e.g. fermentation, gift, workshop). Shown beside the text. Leave empty to show text only.',
                    condition: (data) => data?.voucherShowWhy !== false,
                  },
                },
                {
                  name: 'voucherWhyBenefits',
                  type: 'array',
                  label: 'Why Section Benefit Items',
                  required: false,
                  maxRows: 4,
                  admin: {
                    description:
                      'Four benefit items shown in a 2×2 grid (e.g. Unforgettable Experience, Health & Pleasure). Leave empty to use default copy.',
                    condition: (data) => data?.voucherShowWhy !== false,
                  },
                  fields: [
                    {
                      name: 'iconSource',
                      type: 'select',
                      label: 'Icon Type',
                      defaultValue: 'preset',
                      options: [
                        { label: 'Built-in icon', value: 'preset' },
                        { label: 'Custom upload (Media)', value: 'custom' },
                      ],
                      admin: {
                        description:
                          'Choose built-in icon from the list, or switch to custom to upload/select an icon from Media.',
                      },
                    },
                    {
                      name: 'icon',
                      type: 'select',
                      required: false,
                      label: 'Icon',
                      options: [
                        { label: 'Sparkle (experience)', value: 'sparkle' },
                        { label: 'Heart (health)', value: 'heart' },
                        { label: 'Graduation cap (knowledge)', value: 'graduation' },
                        { label: 'Leaf (sustainability)', value: 'leaf' },
                      ],
                      admin: {
                        condition: (_, siblingData) => siblingData?.iconSource !== 'custom',
                      },
                    },
                    {
                      name: 'customIcon',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Custom Icon',
                      admin: {
                        description:
                          'Optional uploaded icon from Media. Recommended: square icon with transparent background.',
                        condition: (_, siblingData) => siblingData?.iconSource === 'custom',
                      },
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
                  ],
                },
                {
                  name: 'voucherWhyPerfectForVisible',
                  type: 'checkbox',
                  label: 'Show this section',
                  defaultValue: false,
                  localized: true,
                  admin: {
                    description:
                      'Toggle off to hide the "Perfect for" section on the website without deleting the content.',
                    condition: (data) => data?.voucherShowWhy !== false,
                  },
                },
                {
                  name: 'voucherWhyPerfectForHeading',
                  type: 'text',
                  localized: true,
                  label: '"Perfect for" heading',
                  admin: {
                    description:
                      'Heading above the audience tags (e.g. "Perfect for"). Shown at the end of the Why section. Leave empty to hide.',
                    condition: (data) =>
                      data?.voucherShowWhy !== false && data?.voucherWhyPerfectForVisible === true,
                  },
                },
                {
                  name: 'voucherWhyPerfectForTags',
                  type: 'array',
                  label: '"Perfect for" tags',
                  admin: {
                    description:
                      'Tags shown under the heading (e.g. Foodies, Health-conscious). Leave empty to hide.',
                    condition: (data) =>
                      data?.voucherShowWhy !== false && data?.voucherWhyPerfectForVisible === true,
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Tag',
                    },
                  ],
                },
              ],
            },
            {
              name: 'voucherHowHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'How It Works Section Heading',
              admin: {
                description: 'Heading above the steps (e.g. "How it works").',
                condition: (data) => data?.voucherShowHow !== false,
              },
            },
            {
              name: 'voucherShowHow',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description:
                  'Toggle off to hide the voucher "How it works" section on the website.',
              },
            },
            {
              name: 'voucherHowSteps',
              type: 'array',
              label: 'How It Works Steps',
              required: true,
              minRows: 1,
              admin: {
                description:
                  'Four steps with title and optional description (e.g. "Buy" / "Order online for €99").',
                condition: (data) => data?.voucherShowHow !== false,
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Title',
                  admin: { description: 'Step heading (e.g. "Buy", "Receive").' },
                },
                {
                  name: 'description',
                  type: 'text',
                  localized: true,
                  label: 'Description',
                  admin: { description: 'Optional detail (e.g. "Order online for €99").' },
                },
              ],
            },
            {
              name: 'voucherShowStarterSet',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: false,
              localized: true,
              admin: {
                description: 'Toggle off to hide the starter set section on the website.',
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
                condition: (data) => data?.voucherShowStarterSet === true,
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
                condition: (data) => data?.voucherShowStarterSet === true,
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
                condition: (data) => data?.voucherShowStarterSet === true,
              },
            },
            {
              name: 'starterSetImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Starter Set Image',
              admin: {
                description: 'Image shown in the starter set section. Leave empty to use fallback.',
                condition: (data) => data?.voucherShowStarterSet === true,
              },
            },
            {
              name: 'voucherShowGiftOccasions',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description:
                  'Toggle off to hide the voucher gift occasions section on the website.',
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
                condition: (data) => data?.voucherShowGiftOccasions !== false,
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
                condition: (data) => data?.voucherShowGiftOccasions !== false,
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
              name: 'voucherBenefitsHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Voucher Benefits Section Heading',
              admin: {
                description:
                  'Heading above the benefits list (e.g. "What\'s included in the voucher").',
                condition: (data) => data?.voucherShowBenefits !== false,
              },
            },
            {
              name: 'voucherShowBenefits',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description: 'Toggle off to hide the voucher benefits section on the website.',
              },
            },
            {
              name: 'voucherBenefitsSubtitle',
              type: 'text',
              localized: true,
              label: 'Voucher Benefits Subtitle',
              admin: {
                description: 'Short line under the heading (e.g. "All at a glance").',
                condition: (data) => data?.voucherShowBenefits !== false,
              },
            },
            {
              name: 'voucherBenefits',
              type: 'array',
              label: 'Voucher Benefits',
              required: true,
              minRows: 1,
              admin: {
                description:
                  'List of benefit cards with editable icon, title, and optional subtext.',
                condition: (data) => data?.voucherShowBenefits !== false,
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Title',
                  admin: { description: 'Main benefit line (e.g. "Valid for all workshops").' },
                },
                {
                  name: 'iconSource',
                  type: 'select',
                  label: 'Icon Type',
                  defaultValue: 'preset',
                  options: [
                    { label: 'Built-in icon', value: 'preset' },
                    { label: 'Custom upload (Media)', value: 'custom' },
                  ],
                  admin: {
                    description:
                      'Choose built-in icon from the list, or switch to custom to upload/select an icon from Media.',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  label: 'Icon',
                  options: [
                    { label: 'Calendar', value: 'calendar' },
                    { label: 'Shield', value: 'shield' },
                    { label: 'Users', value: 'users' },
                    { label: 'Users Round', value: 'usersRound' },
                    { label: 'Zap', value: 'zap' },
                    { label: 'Package', value: 'package' },
                  ],
                  admin: {
                    description:
                      'Card icon shown above this benefit title. Leave empty to use the default sequence.',
                    condition: (_, siblingData) => siblingData?.iconSource !== 'custom',
                  },
                },
                {
                  name: 'customIcon',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Custom Icon',
                  admin: {
                    description:
                      'Optional uploaded icon from Media. Recommended: square icon with transparent background.',
                    condition: (_, siblingData) => siblingData?.iconSource === 'custom',
                  },
                },
                {
                  name: 'subtext',
                  type: 'text',
                  localized: true,
                  label: 'Subtext',
                  admin: {
                    description:
                      'Optional detail below the title (e.g. "Kombucha, Lakto, Tempeh & seasonal").',
                  },
                },
              ],
            },
            {
              name: 'voucherShowFAQ',
              type: 'checkbox',
              label: 'Show this section',
              defaultValue: true,
              localized: true,
              admin: {
                description: 'Toggle off to hide the voucher FAQ section on the website.',
              },
            },
            {
              name: 'faqHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'FAQ Heading',
              admin: {
                description: 'Heading above the voucher FAQ accordion.',
                condition: (data) => data?.voucherShowFAQ !== false,
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
                condition: (data) => data?.voucherShowFAQ !== false,
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
          name: 'workshops',
          label: 'Workshops Overview Page',
          admin: {
            description:
              'Content for the Workshops overview page (/workshops). Only applies when slug is "workshops". Each shared section defaults to its Website global — toggle "Customize" to override for this page only.',
            condition: (data, siblingData) => {
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'workshops'
            },
          },
          fields: workshopOverviewFields,
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
