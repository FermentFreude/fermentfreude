import type { GlobalConfig } from 'payload'

import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const Shop: GlobalConfig = {
  slug: 'shop',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  label: 'Shop Page',
  admin: {
    description: 'Content for the Shop page (/shop). Hero, product section, gift CTA, and workshop banner.',
  },
  fields: [
    /* ── Hero ───────────────────────────────────────────────────────────── */
    {
      type: 'collapsible',
      label: 'Hero Section',
      admin: {
        description: 'Hero carousel at the top. Add slides for a slider, or use single hero when empty.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'heroSlides',
          type: 'array',
          label: 'Hero Slides (Carousel)',
          minRows: 0,
          maxRows: 6,
          admin: {
            description: 'Add slides for a hero carousel. If empty, the single hero below is used.',
            initCollapsed: false,
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Background Image',
              admin: { description: 'Full-bleed background.' },
            },
            {
              name: 'productImage',
              type: 'upload',
              relationTo: 'media',
              required: false,
              label: 'Product Image',
              admin: { description: 'Optional center product (Homemade Jam style).' },
            },
            {
              name: 'backgroundVideo',
              type: 'upload',
              relationTo: 'media',
              required: false,
              label: 'Background Video',
              admin: {
                description: 'Optional looping video (e.g. bubbling ingredients). Homemade Jam style.',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: 'Title',
              admin: { description: 'e.g. "LAKTO FERMENTATION."' },
            },
            {
              name: 'description',
              type: 'textarea',
              required: false,
              localized: true,
              label: 'Description',
              admin: { description: 'Short text below the title.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ctaLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Button Label',
                  admin: { width: '50%', description: 'e.g. "Shop Now".' },
                },
                {
                  name: 'ctaUrl',
                  type: 'text',
                  label: 'Button URL',
                  admin: { width: '50%', description: 'e.g. "#products".' },
                },
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Single Hero (fallback when no slides)',
          admin: {
            description: 'Used when heroSlides is empty.',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'heroTitleLine1',
              type: 'text',
              required: true,
              localized: true,
              label: 'Hero Title Line 1',
              admin: { description: 'First line (e.g. "Discover").' },
            },
            {
              name: 'heroTitleLine2',
              type: 'text',
              required: true,
              localized: true,
              label: 'Hero Title Line 2',
              admin: { description: 'Second line with highlighted word (e.g. "UNIQUE Flavours").' },
            },
            {
              name: 'heroTitleHighlight',
              type: 'text',
              required: false,
              localized: true,
              label: 'Highlighted Word',
              admin: { description: 'Word to highlight in gold in line 2 (e.g. "UNIQUE").' },
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              required: false,
              localized: true,
              label: 'Hero Description',
              admin: { description: 'Short welcoming text below the title.' },
            },
            {
              name: 'heroBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Background Image',
              admin: { description: 'Blurred background image (fermented jars, products).' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroCtaPrimaryLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Primary Button Label',
                  admin: { width: '50%', description: 'e.g. "Explore Now".' },
                },
                {
                  name: 'heroCtaPrimaryUrl',
                  type: 'text',
                  label: 'Primary Button URL',
                  admin: { width: '50%', description: 'e.g. "#products".' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroCtaSecondaryLabel',
                  type: 'text',
                  required: false,
                  localized: true,
                  label: 'Secondary Button Label',
                  admin: { width: '50%', description: 'e.g. "Learn More".' },
                },
                {
                  name: 'heroCtaSecondaryUrl',
                  type: 'text',
                  label: 'Secondary Button URL',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
    /* ── Product Section ─────────────────────────────────────────────────── */
    {
      type: 'collapsible',
      label: 'Product Listing Section',
      admin: {
        description: 'Heading and intro above the product grid.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'productSectionHeading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Section Heading',
          admin: { description: 'e.g. "Discover UNIQUE."' },
        },
        {
          name: 'productSectionSubheading',
          type: 'text',
          required: false,
          localized: true,
          label: 'Subheading',
          admin: { description: 'e.g. "FLAVOURS" (smaller, lighter).' },
        },
        {
          name: 'productSectionIntro',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Intro Text',
          admin: {
            description:
              'Paragraph describing the product collection (handcrafted ferments, curated collection).',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'viewAllButtonLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'View All Button Label',
              admin: { width: '50%', description: 'e.g. "View All Products".' },
            },
            {
              name: 'viewAllButtonUrl',
              type: 'text',
              label: 'View All Button URL',
              admin: { width: '50%', description: 'e.g. "/shop".' },
            },
          ],
        },
        {
          name: 'loadMoreLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Load More Button Label',
          admin: { description: 'e.g. "Load More".' },
        },
        {
          name: 'addToCartLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Add to Cart Button Label',
          admin: { description: 'Label for the add-to-cart icon/button on product cards.' },
        },
      ],
    },
    /* ── Why Fermented Products (Benefits) ───────────────────────────────── */
    {
      type: 'collapsible',
      label: 'Why Fermented Products Section',
      admin: {
        description: 'Three benefit cards (e.g. Gut health, Nutrient boost, Natural preservation).',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'benefitsHeading',
          type: 'text',
          required: false,
          localized: true,
          label: 'Section Heading',
          admin: { description: 'e.g. "Why fermented products?"' },
        },
        {
          name: 'benefitsItems',
          type: 'array',
          label: 'Benefit Items',
          minRows: 0,
          maxRows: 3,
          admin: {
            description: 'Up to 3 cards with title and description.',
          },
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
      ],
    },
    /* ── Gift Section ────────────────────────────────────────────────────── */
    {
      type: 'collapsible',
      label: 'Gift Experience Section',
      admin: {
        description: 'CTA section for gift vouchers (e.g. "Gift a special tasty experience").',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'giftHeading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Heading',
          admin: { description: 'e.g. "Gift a special tasty experience."' },
        },
        {
          name: 'giftDescription',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Description',
          admin: { description: 'Text encouraging users to buy gift vouchers.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'giftButtonLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'Button Label',
              admin: { width: '50%', description: 'e.g. "Find Out More".' },
            },
            {
              name: 'giftButtonUrl',
              type: 'text',
              label: 'Button URL',
              admin: { width: '50%', description: 'e.g. "/voucher".' },
            },
          ],
        },
      ],
    },
    /* ── Featured Content (Learn UNIQUE Flavours) ────────────────────────── */
    {
      type: 'collapsible',
      label: 'Featured Content Section',
      admin: {
        description: 'Article/workshop cards carousel (e.g. "Learn UNIQUE Flavours").',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'featuredHeading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Section Heading',
          admin: { description: 'e.g. "Learn UNIQUE Flavours."' },
        },
        {
          name: 'featuredHeadingHighlight',
          type: 'text',
          required: false,
          localized: true,
          label: 'Highlighted Word',
          admin: { description: 'Word to highlight in gold (e.g. "UNIQUE").' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'featuredViewAllLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'View All Label',
              admin: { width: '50%', description: 'e.g. "View all".' },
            },
            {
              name: 'featuredViewAllUrl',
              type: 'text',
              label: 'View All URL',
              admin: { width: '50%', description: 'Link for View all.' },
            },
          ],
        },
        {
          name: 'featuredItems',
          type: 'array',
          label: 'Featured Items',
          minRows: 0,
          maxRows: 6,
          admin: {
            description: 'Cards with image, title, description, and "Read More" link.',
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
              required: false,
              localized: true,
              label: 'Description',
            },
            {
              name: 'readMoreLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'Read More Button Label',
              admin: { description: 'e.g. "Read More".' },
            },
            { name: 'url', type: 'text', required: true, label: 'Link URL' },
          ],
        },
      ],
    },
    /* ── Workshop CTA Banner ─────────────────────────────────────────────── */
    {
      type: 'collapsible',
      label: 'Workshop CTA Banner',
      admin: {
        description: 'Full-width banner for online workshops (e.g. "Learn Fermentation Anytime, Anywhere").',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'workshopCtaHeading',
          type: 'text',
          required: true,
          localized: true,
          label: 'Heading',
          admin: { description: 'e.g. "Learn Fermentation Anytime, Anywhere".' },
        },
        {
          name: 'workshopCtaDescription',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Description',
          admin: { description: 'Text about online courses.' },
        },
        {
          name: 'workshopCtaBackgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Background Image',
          admin: { description: 'Dark industrial image (fermentation vats).' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'workshopCtaButtonLabel',
              type: 'text',
              required: false,
              localized: true,
              label: 'Button Label',
              admin: { width: '50%', description: 'e.g. "Start Learning".' },
            },
            {
              name: 'workshopCtaButtonUrl',
              type: 'text',
              label: 'Button URL',
              admin: { width: '50%', description: 'e.g. "/workshops".' },
            },
          ],
        },
      ],
    },
  ],
}
