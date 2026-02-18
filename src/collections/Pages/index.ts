import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { WorkshopSlider } from '@/blocks/WorkshopSlider/config'
import { AboutBlock } from '@/blocks/AboutBlock/config'
import { hero } from '@/fields/hero'
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
    group: 'Content',
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
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                Carousel,
                ThreeItemGrid,
                Banner,
                FormBlock,
                WorkshopSlider,
                AboutBlock,
              ],
            },
          ],
          label: 'Content',
        },
        {
          name: 'voucher',
          label: 'Voucher Page',
          admin: {
            description: 'Content for the Gift Voucher page. These fields only apply when this page’s slug is "voucher".',
            condition: (data) => data?.slug === 'voucher',
          },
          fields: [
            {
              name: 'heroHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Hero Heading',
              admin: { description: 'Main headline above the voucher form (e.g. "Give the gift of fermentation").' },
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Hero Description',
              admin: { description: 'Short intro text below the heading explaining the voucher.' },
            },
            {
              name: 'voucherAmounts',
              type: 'array',
              label: 'Voucher Amounts',
              required: true,
              minRows: 1,
              admin: { description: 'List of amount options shown as buttons (e.g. 50€, 99€). Same in all languages.' },
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
                  admin: { description: 'Internal key, e.g. "email" or "post". Used for logic, not shown.' },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Title',
                  admin: { description: 'Label shown to the user (e.g. "By email to print at home").' },
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
              admin: { description: 'Logo displayed on the voucher preview card. Leave empty to use fallback.' },
            },
            {
              name: 'cardLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Card Label',
              admin: { description: 'Label on the voucher preview card (e.g. "GIFT VOUCHER").' },
            },
            {
              name: 'valueLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Value Label',
              admin: { description: 'Label above the amount on the card (e.g. "Voucher value").' },
            },
            {
              name: 'cardDisclaimer',
              type: 'text',
              required: true,
              localized: true,
              label: 'Card Disclaimer',
              admin: { description: 'Small text under the amount (e.g. "Redeemable in our shop").' },
            },
            {
              name: 'amountSectionLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Amount Section Label',
              admin: { description: 'Label above the amount buttons (e.g. "VOUCHER VALUE").' },
            },
            {
              name: 'deliverySectionLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Delivery Section Label',
              admin: { description: 'Label above delivery options (e.g. "DELIVERY METHOD").' },
            },
            {
              name: 'greetingLabel',
              type: 'text',
              required: true,
              localized: true,
              label: 'Greeting Message Label',
              admin: { description: 'Label for the optional greeting message field.' },
            },
            {
              name: 'greetingPlaceholder',
              type: 'text',
              required: true,
              localized: true,
              label: 'Greeting Placeholder',
              admin: { description: 'Placeholder text in the greeting textarea (e.g. "Max. 250 characters").' },
            },
            {
              name: 'addToCartButton',
              type: 'text',
              required: true,
              localized: true,
              label: 'Add to Cart Button',
              admin: { description: 'Text for the main CTA button (e.g. "Add to cart").' },
            },
            {
              name: 'starterSetHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Starter Set Section Heading',
              admin: { description: 'Heading for the "Combine with Starter Set" section.' },
            },
            {
              name: 'starterSetDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Starter Set Description',
              admin: { description: 'Body text for the starter set section.' },
            },
            {
              name: 'starterSetButton',
              type: 'text',
              required: true,
              localized: true,
              label: 'Starter Set Button',
              admin: { description: 'Button text (e.g. "View Starter Sets").' },
            },
            {
              name: 'starterSetImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Starter Set Image',
              admin: { description: 'Image shown in the starter set section. Leave empty to use fallback.' },
            },
            {
              name: 'giftOccasionsHeading',
              type: 'text',
              required: true,
              localized: true,
              label: 'Gift Occasions Heading',
              admin: { description: 'Heading for the "Gift for every occasion" section.' },
            },
            {
              name: 'giftOccasions',
              type: 'array',
              label: 'Gift Occasions',
              required: true,
              minRows: 1,
              admin: { description: 'Occasion cards with image and caption (e.g. Birthdays, Weddings).' },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Image',
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
              admin: { description: 'Heading above the voucher FAQ accordion.' },
            },
            {
              name: 'faqs',
              type: 'array',
              label: 'FAQs',
              required: true,
              minRows: 1,
              admin: { description: 'Frequently asked questions about vouchers.' },
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
