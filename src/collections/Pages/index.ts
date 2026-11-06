import type { CheckboxField, CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import { slugField } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { gastronomySectionBlocks } from '@/blocks/GastronomySections/config'
import { HomeTempehStory } from '@/blocks/HomeTempehStory/config'
import { FermentationStory } from '@/blocks/FermentationStory/config'
import { ProductShowcase } from '@/blocks/ProductShowcase/config'
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
import { ShopAutomaten } from '@/blocks/ShopAutomaten/config'
import { ShopHero } from '@/blocks/ShopHero/config'
import { ShopProductGrid } from '@/blocks/ShopProductGrid/config'
import { ShopProductList } from '@/blocks/ShopProductList/config'
import { SpecialWorkshopBanner } from '@/blocks/SpecialWorkshopBanner/config'
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
import { voucherTab } from './voucherTab'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

function gastronomyShowSection(name: string): CheckboxField {
  return {
    name,
    type: 'checkbox',
    label: 'Show this section',
    defaultValue: true,
    admin: {
      description:
        'Turn off to hide this section on the website (German and English). The content stays saved.',
    },
  }
}

/** Keep unused gastronomy fields in the schema/API, but never show them in /admin. */
function hideGastronomyLegacyFields(fields: Field[]): Field[] {
  return fields.map((field) => ({
    ...field,
    required: false,
    hidden: true,
    admin: {
      ...('admin' in field && field.admin ? field.admin : {}),
      hidden: true,
      disableListColumn: true,
      condition: () => false,
    },
  })) as Field[]
}

const GASTRONOMY_HIDDEN_KEYS = [
  'gastronomyHeroSliderAutoplayMs',
  'gastronomyOfferCards',
  'gastronomyProductQuote',
  'gastronomyTrustedByBadges',
  'gastronomyCtaBanner',
  'gastronomyOfferDetailsTitle',
  'gastronomyOfferSectionTitle',
  'gastronomyOfferDetails',
  'gastronomyOutcomesEyebrow',
  'gastronomyOutcomesTitle',
  'gastronomyOutcomesBeforeLabel',
  'gastronomyOutcomesAfterLabel',
  'gastronomyOutcomesItems',
  'gastronomyProcessEyebrow',
  'gastronomyProcessTitle',
  'gastronomyProcessSteps',
  'gastronomyTestimonialsEyebrow',
  'gastronomyFaqEyebrow',
  'gastronomyFaqTitle',
  'gastronomyFaqItems',
  'gastronomyContactImage',
  'gastronomyContactTitle',
  'gastronomyContactDescription',
  'gastronomyContactAddress',
  'gastronomyWorkshopSectionTitle',
  'gastronomyWorkshopSectionSubtitle',
  'gastronomyWorkshopClarification',
  'gastronomyWorkshopNextDateLabel',
  'gastronomyWorkshopCards',
] as const

/** The sections the Home page is built from — the only blocks offered when editing Home. */
const HOME_BLOCKS = [
  'productShowcase',
  'voucherCta',
  'featureCards',
  'heroBanner',
  'fermentationStory',
  'teamPreview',
  'testimonials',
  'pressBanner',
  'sponsorsBar',
]

const preserveHiddenGastronomyFields: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation !== 'update') return data
  const slug = data?.slug ?? originalDoc?.slug
  if (slug !== 'gastronomy') return data
  const incoming = data?.gastronomy as Record<string, unknown> | undefined
  const existing = originalDoc?.gastronomy as Record<string, unknown> | undefined
  if (!incoming || !existing) return data
  for (const key of Object.keys(existing)) {
    if (incoming[key] === undefined && existing[key] !== undefined) {
      incoming[key] = existing[key]
    }
  }
  for (const key of GASTRONOMY_HIDDEN_KEYS) {
    if (incoming[key] === undefined && existing[key] !== undefined) {
      incoming[key] = existing[key]
    }
  }
  return data
}

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
                HomeTempehStory,
                ProductShowcase,
                FermentationStory,
                MediaBlock,
                Archive,
                Carousel,
                OurStory,
                PressBanner,
                PressMediaAwards,
                SpecialWorkshopBanner,
                OnlineCourseSlider,
                ProductSlider,
                FeaturedProductCards,
                ShopAutomaten,
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
              // Home: only offer the sections Home is built from (plus any already on it)
              filterOptions: ({ data }) => {
                if (data?.slug !== 'home') return true
                const present = (Array.isArray(data?.layout) ? data.layout : [])
                  .map((b: { blockType?: string }) => b?.blockType)
                  .filter((s: unknown): s is string => typeof s === 'string')
                return [...new Set([...HOME_BLOCKS, ...present])]
              },
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
              'B2B sales page. Add, drag, and reorder sections the same way as other pages (like Help & FAQ). Click a section to edit it.',
            condition: (data, siblingData) => {
              if (process.env.PAYLOAD_SKIP_GASTRONOMY_CONDITION === '1') return false
              const slug = data?.slug ?? siblingData?.slug
              return slug === 'gastronomy'
            },
          },
          fields: [
            {
              name: 'gastronomyBlocks',
              type: 'blocks',
              label: 'Sections',
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: gastronomySectionBlocks,
              required: false,
              admin: {
                description:
                  'Drag the handle to change the order on the website. Use Add Section to add Hero, Showcase, and the other gastronomy blocks. Toggle “Show this section” on a block to hide it without deleting it.',
                initCollapsed: false,
              },
            },
            {
              type: 'collapsible',
              label: 'Hero — full-bleed photo',
              admin: {
                initCollapsed: true,
                condition: () => false,
                description:
                  'Shop-style immersive hero. Fried tempeh photo, short headline, primary inquiry CTA.',
              },
              fields: [
                gastronomyShowSection('gastronomyShowHero'),
                {
                  name: 'gastronomyHeroImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Hero photo',
                  admin: {
                    description: 'Plated / fried tempeh. Leave empty to use the default photo.',
                  },
                },
                {
                  name: 'gastronomyHeroEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Eyebrow',
                  admin: { description: 'Small line above the title. e.g. “Für Restaurants”.' },
                },
                {
                  name: 'gastronomyHeroTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Title',
                  admin: {
                    description: 'Main headline. e.g. “Tempeh für Profiküchen.”',
                  },
                },
                {
                  name: 'gastronomyHeroTagline',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Tagline',
                  admin: {
                    description: 'One short line under the title. Keep it to 1–2 sentences.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'gastronomyHeroCtaLabel',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'CTA button label',
                      admin: {
                        width: '50%',
                        description: 'e.g. “Für Gastronomie anfragen”.',
                      },
                    },
                    {
                      name: 'gastronomyHeroCtaUrl',
                      type: 'text',
                      required: false,
                      label: 'CTA URL',
                      admin: {
                        width: '50%',
                        description: 'Usually #contact.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'gastronomyHeroCtaSecondaryLabel',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Secondary CTA label',
                      admin: {
                        width: '50%',
                        description: 'Optional. e.g. “Tempeh entdecken”.',
                      },
                    },
                    {
                      name: 'gastronomyHeroCtaSecondaryUrl',
                      type: 'text',
                      required: false,
                      label: 'Secondary CTA URL',
                      admin: {
                        width: '50%',
                        description: 'e.g. /products/kaeferbohnen-tempeh',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Food showcase — Was kann man daraus machen?',
              admin: {
                initCollapsed: true,
                condition: () => false,
                description:
                  'Horizontal slider of restaurant applications. Large photo, short title, one-line caption.',
              },
              fields: [
                gastronomyShowSection('gastronomyShowShowcase'),
                {
                  name: 'gastronomyShowcaseTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section title',
                  admin: { description: 'e.g. “Was kann man daraus machen?”' },
                },
                {
                  name: 'gastronomyUsageBanners',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 8,
                  labels: { singular: 'Slide', plural: 'Slides' },
                  admin: {
                    description:
                      'Each slide: photo + title + one short line. Photography does the talking.',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Photo',
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Title',
                      admin: { description: 'e.g. Tempeh als Hauptkomponente' },
                    },
                    {
                      name: 'text',
                      type: 'textarea',
                      required: false,
                      localized: true,
                      label: 'Short line',
                      admin: { description: 'One sentence max.' },
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
                      label: 'Previous slide label',
                      admin: {
                        width: '50%',
                        description: 'Accessibility label for the food slider.',
                      },
                    },
                    {
                      name: 'gastronomyHeroSliderNextLabel',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Next slide label',
                      admin: {
                        width: '50%',
                        description: 'Accessibility label for the food slider.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Why tempeh — 3–4 short benefits',
              admin: {
                initCollapsed: true,
                condition: () => false,
                description: 'Keep each benefit to a title + one line.',
              },
              fields: [
                gastronomyShowSection('gastronomyShowBenefits'),
                {
                  name: 'gastronomyFactsTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section title',
                  admin: { description: 'e.g. “Warum Tempeh für deine Küche?”' },
                },
                {
                  name: 'gastronomyFacts',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 4,
                  labels: { singular: 'Fact', plural: 'Facts' },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Title',
                    },
                    {
                      name: 'text',
                      type: 'textarea',
                      required: false,
                      localized: true,
                      label: 'Short text',
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Product close-up',
              admin: {
                initCollapsed: true,
                condition: () => false,
                description: 'Raw tempeh block + one sentence. No prices here.',
              },
              fields: [
                gastronomyShowSection('gastronomyShowProduct'),
                {
                  name: 'gastronomyProductImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Product photo',
                  admin: {
                    description: 'Packaging or raw block. Leave empty to use the default photo.',
                  },
                },
                {
                  name: 'gastronomyProductCaption',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Product section title',
                  admin: { description: 'e.g. “Käferbohnen-Tempeh für deine Küche”.' },
                },
                {
                  name: 'gastronomyProductCtaLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Product CTA label',
                  admin: {
                    description: 'Button under the facts. e.g. “Jetzt B2B-Anfrage senden”.',
                  },
                },
                {
                  name: 'gastronomyProductB2bLine',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Extra product fact',
                  admin: { description: 'Optional last line, e.g. “B2B / größere Mengen”.' },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Unused gastronomy fields',
              admin: {
                initCollapsed: true,
                condition: () => false,
              },
              fields: hideGastronomyLegacyFields([
                {
                  name: 'gastronomyHeroSliderAutoplayMs',
                  type: 'number',
                  required: false,
                  label: 'Hero slider — autoplay (ms)',
                  min: 2000,
                  max: 120000,
                },
                {
                  name: 'gastronomyOfferCards',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 3,
                  label: 'Old hero slider slides',
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
                  ],
                },
                {
                  name: 'gastronomyProductQuote',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Quote / product line',
                },
                {
                  name: 'gastronomyTrustedByBadges',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 12,
                  label: 'Old partner chips',
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
                  label: 'Final CTA',
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
                    },
                  ],
                },
                {
                  name: 'gastronomyOfferDetailsTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'What we offer — section title',
                },
                {
                  name: 'gastronomyOfferSectionTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'What we offer — title fallback',
                },
                {
                  name: 'gastronomyOfferDetails',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 8,
                  label: 'Offer Details',
                  fields: [
                    {
                      name: 'icon',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Icon',
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
                  name: 'gastronomyOutcomesEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Outcomes eyebrow',
                },
                {
                  name: 'gastronomyOutcomesTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Outcomes title',
                },
                {
                  name: 'gastronomyOutcomesBeforeLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Before label',
                },
                {
                  name: 'gastronomyOutcomesAfterLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'After label',
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
                {
                  name: 'gastronomyProcessEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Process eyebrow',
                },
                {
                  name: 'gastronomyProcessTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Process title',
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
                {
                  name: 'gastronomyTestimonialsEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Testimonials eyebrow',
                },
                {
                  name: 'gastronomyFaqEyebrow',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ eyebrow',
                },
                {
                  name: 'gastronomyFaqTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'FAQ title',
                },
                {
                  name: 'gastronomyFaqItems',
                  type: 'array',
                  required: false,
                  maxRows: 8,
                  label: 'FAQ items',
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
                  name: 'gastronomyContactImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Contact image',
                },
                {
                  name: 'gastronomyContactTitle',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Contact heading',
                },
                {
                  name: 'gastronomyContactDescription',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Contact description',
                },
                {
                  name: 'gastronomyContactAddress',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Contact address',
                },
                {
                  name: 'gastronomyWorkshopSectionTitle',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Workshop section title',
                },
                {
                  name: 'gastronomyWorkshopSectionSubtitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Workshop subtitle',
                },
                {
                  name: 'gastronomyWorkshopClarification',
                  type: 'textarea',
                  required: false,
                  localized: true,
                  label: 'Workshop clarification',
                },
                {
                  name: 'gastronomyWorkshopNextDateLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Workshop date label',
                },
                {
                  name: 'gastronomyWorkshopCards',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 4,
                  label: 'Workshop cards',
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
                    { name: 'price', type: 'text', required: true, label: 'Price' },
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
                    { name: 'duration', type: 'text', required: false, label: 'Duration' },
                    {
                      name: 'nextDate',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Next Appointment',
                    },
                  ],
                },
              ]),
            },
            {
              type: 'collapsible',
              label: 'Audience — Restaurants, Hotels, Catering, Feinkost',
              admin: {
                initCollapsed: true,
                condition: () => false,
                description: 'Four photo cards. Title + one short line each.',
              },
              fields: [
                gastronomyShowSection('gastronomyShowAudience'),
                {
                  name: 'gastronomyTrustedByHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Section heading',
                  admin: {
                    description:
                      'e.g. “Für Restaurants, die mehr aus pflanzlicher Küche machen wollen.”',
                  },
                },
                {
                  name: 'gastronomyAudienceCards',
                  type: 'array',
                  required: false,
                  minRows: 0,
                  maxRows: 4,
                  labels: { singular: 'Card', plural: 'Cards' },
                  admin: {
                    description:
                      'Photo, title and one short line. Leave photo empty to use the default.',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      label: 'Photo',
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Title',
                      admin: { description: 'e.g. Restaurants' },
                    },
                    {
                      name: 'text',
                      type: 'textarea',
                      required: false,
                      localized: true,
                      label: 'Short line',
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Proof — kitchen quote',
              admin: {
                initCollapsed: true,
                condition: () => false,
                description: 'Full-bleed photo with one chef quote.',
              },
              fields: [
                gastronomyShowSection('gastronomyShowProof'),
                {
                  name: 'gastronomyProofImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                  label: 'Background photo',
                  admin: { description: 'Leave empty to use the default tempeh photo.' },
                },
                {
                  name: 'gastronomyTestimonialsTitle',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Small label',
                  admin: { description: 'e.g. “Aus der Küche”.' },
                },
                {
                  name: 'gastronomyTestimonialsItems',
                  type: 'array',
                  required: false,
                  maxRows: 1,
                  label: 'Quote',
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
                      label: 'Name, place',
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Inquiry form',
              admin: {
                initCollapsed: true,
                condition: () => false,
                description: 'B2B enquiry form. Email and phone are shown under the form.',
              },
              fields: [
                gastronomyShowSection('gastronomyShowInquiry'),
                {
                  name: 'gastronomyContactFormHeading',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Form heading',
                  admin: {
                    description: 'e.g. “B2B-Anfrage” / “B2B enquiry”.',
                  },
                },
                {
                  name: 'gastronomyContactEmail',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Email',
                  admin: {
                    description: 'Shown under the form.',
                  },
                },
                {
                  name: 'gastronomyContactPhone',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Phone',
                  admin: {
                    description: 'Shown under the form.',
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
                      label: 'Name',
                    },
                    {
                      name: 'lastName',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Restaurant / company',
                    },
                    {
                      name: 'email',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Email',
                    },
                    {
                      name: 'phone',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Phone',
                    },
                    {
                      name: 'quantity',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Quantity',
                    },
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
                  name: 'gastronomyBusinessTypeOptions',
                  type: 'group',
                  label: 'Type of business dropdown',
                  fields: [
                    {
                      name: 'default',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Placeholder',
                      admin: { description: 'e.g. “Art des Betriebs”.' },
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
                  name: 'gastronomySubjectOptions',
                  type: 'group',
                  label: 'Interest dropdown',
                  fields: [
                    {
                      name: 'default',
                      type: 'text',
                      required: false,
                      localized: true,
                      label: 'Placeholder',
                      admin: { description: 'e.g. “Worum geht es?”.' },
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
                  label: 'Submit button',
                  admin: { description: 'e.g. “Anfrage senden” / “Send enquiry”.' },
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
        voucherTab,
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
              'All editable content for the workshop detail page (Hero, Calendar, Voucher, FAQ, How-To Articles). Available for lakto-gemuese, tempeh, kombucha, and vom-feld-ins-glas.',
            condition: (data, siblingData) => {
              if (process.env.PAYLOAD_SKIP_WORKSHOP_CONDITION === '1') return false
              const slug = data?.slug ?? siblingData?.slug
              return (
                slug === 'lakto-gemuese' ||
                slug === 'tempeh' ||
                slug === 'kombucha' ||
                slug === 'vom-feld-ins-glas'
              )
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
    beforeChange: [preserveHiddenGastronomyFields],
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
