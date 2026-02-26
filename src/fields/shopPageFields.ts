import type { Field } from 'payload'

/**
 * Shared shop page fields — used by both Shop global and Pages collection (when slug=shop).
 * Keeps shop content in sync and editable from /admin/collections/pages.
 */
export const shopPageFields: Field[] = [
  {
    type: 'collapsible',
    label: 'Hero Section',
    admin: {
      description: 'Slider at the top of the shop page. Add multiple slides or use single hero.',
      initCollapsed: false,
    },
    fields: [
      {
        name: 'heroSlides',
        type: 'array',
        label: 'Hero Slides',
        minRows: 0,
        maxRows: 6,
        admin: {
          description: 'Add slides for a hero slider. If empty, the single hero below is used.',
          initCollapsed: false,
        },
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
            label: 'Background Image',
            admin: { description: 'Full-bleed background (or poster when video is set).' },
          },
          {
            name: 'backgroundVideo',
            type: 'upload',
            relationTo: 'media',
            required: false,
            label: 'Background Video',
            admin: {
              description: 'Optional looping video (e.g. bubbling ingredients). Homemade Jam style.',
              condition: (_, siblingData) => !!siblingData?.productImage,
            },
          },
          {
            name: 'productImage',
            type: 'upload',
            relationTo: 'media',
            required: false,
            label: 'Product Image',
            admin: { description: 'Optional center product/jar image (Homemade Jam style).' },
          },
          {
            name: 'title',
            type: 'text',
            required: true,
            localized: true,
            label: 'Title',
            admin: { description: 'e.g. "Discover UNIQUE Flavours".' },
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
                admin: { width: '50%', description: 'e.g. "Explore Now".' },
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
            required: false,
            localized: true,
            label: 'Hero Title Line 1',
            admin: { description: 'First line (e.g. "Discover").' },
          },
          {
            name: 'heroTitleLine2',
            type: 'text',
            required: false,
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
            admin: { description: 'Background image.' },
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
        required: false,
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
      {
        name: 'productCardBackgroundImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Product Card Background Shape',
        admin: {
          description: 'Decorative shape with organic cutout (bottom-right). Mask for card background.',
        },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'productCardBackgroundColor',
            type: 'text',
            required: false,
            label: 'Product Card Background Color',
            admin: {
              width: '50%',
              description: 'Hex color for card shape (e.g. #F7F7F8).',
            },
          },
          {
            name: 'productSectionBackgroundColor',
            type: 'text',
            required: false,
            label: 'Section Background Color',
            admin: {
              width: '50%',
              description: 'Hex color for product section (e.g. #FFFFFF).',
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'productCardAddToCartColor',
            type: 'text',
            required: false,
            label: 'Add to Cart Button Color',
            admin: {
              width: '50%',
              description: 'Hex color for add-to-cart circle (e.g. #E5B765).',
            },
          },
          {
            name: 'productCardAddToCartHoverColor',
            type: 'text',
            required: false,
            label: 'Add to Cart Button Hover Color',
            admin: {
              width: '50%',
              description: 'Hex color on hover (e.g. #d9a854).',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'collapsible',
    label: 'Product Benefits Section',
    admin: {
      description:
        '3 health/product benefits (e.g. gut health, nutrients, preservation). Focus on product benefits vs. fermentation practice.',
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
        label: 'Benefits',
        minRows: 3,
        maxRows: 3,
        admin: {
          description: 'Exactly 3 benefits. Product-focused (gut health, nutrients, preservation).',
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
  {
    type: 'collapsible',
    label: 'Gift Experience Section',
    admin: {
      description:
        'CTA section for gift vouchers (e.g. "Gift a special tasty experience").',
      initCollapsed: false,
    },
    fields: [
      {
        name: 'giftHeading',
        type: 'text',
        required: false,
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
  {
    type: 'collapsible',
    label: 'Featured Content (Learn UNIQUE Flavours)',
    admin: {
      description: 'Workshop cards section (e.g. "Learn UNIQUE Flavours").',
      initCollapsed: false,
    },
    fields: [
        {
          name: 'featuredHeading',
          type: 'text',
          required: false,
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
            admin: { width: '50%', description: 'e.g. "See All Workshops".' },
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
        label: 'Workshop Cards',
        minRows: 0,
        maxRows: 6,
        admin: {
          description: 'Workshop cards with image, date, seats, price, and booking button.',
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
            name: 'date',
            type: 'text',
            required: false,
            localized: true,
            label: 'Date',
            admin: { description: 'e.g. "12. March 2026".' },
          },
          {
            name: 'seats',
            type: 'number',
            required: false,
            label: 'Seats',
            admin: { description: 'Available seats (e.g. 12).' },
          },
          {
            name: 'price',
            type: 'text',
            required: false,
            localized: true,
            label: 'Price',
            admin: { description: 'e.g. "€89".' },
          },
          {
            name: 'buttonLabel',
            type: 'text',
            required: false,
            localized: true,
            label: 'Button Label',
            admin: { description: 'e.g. "Info & Buchen".' },
          },
          {
            name: 'readMoreLabel',
            type: 'text',
            required: false,
            localized: true,
            label: 'Read More Label (fallback)',
            admin: { description: 'Used when buttonLabel is empty (e.g. "Read More").' },
          },
          { name: 'url', type: 'text', required: true, label: 'Link URL' },
        ],
      },
    ],
  },
  {
    type: 'collapsible',
    label: 'Workshop CTA Banner',
    admin: {
      description:
        'Full-width banner for online workshops (e.g. "Learn Fermentation Anytime, Anywhere").',
      initCollapsed: false,
    },
    fields: [
      {
        name: 'workshopCtaHeading',
        type: 'text',
        required: false,
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
            admin: { width: '50%', description: 'e.g. "View All Workshops".' },
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
]
