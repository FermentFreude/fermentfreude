import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from './linkGroup'

/* ═══════════════════════════════════════════════════════════════════════════
 * HERO FIELD CONFIGURATION
 * Clean, editor-friendly admin interface
 * ═══════════════════════════════════════════════════════════════════════════ */

export const hero: Field = {
  name: 'hero',
  type: 'group',
  label: 'Hero Section',
  admin: {
    description: 'The large banner at the top of the page.',
  },
  fields: [
    /* ═══════════════════════════════════════════════════════════════════════
     * HERO TYPE - What kind of hero banner?
     * ═══════════════════════════════════════════════════════════════════════ */
    {
      name: 'type',
      type: 'select',
      label: 'Hero Style',
      defaultValue: 'heroSlider',
      required: true,
      admin: {
        description:
          'Choose how this page looks at the top. "Home Page Slider" is for the homepage with animated slides.',
      },
      options: [
        { label: '🏠 Home Page Slider', value: 'heroSlider' },
        { label: '📷 Full Image Banner', value: 'highImpact' },
        { label: '🎬 Video Background (Vimeo)', value: 'videoBackground' },
        { label: '📄 Simple Title', value: 'lowImpact' },
        { label: '🎠 Photo Carousel', value: 'heroCarousel' },
        { label: '🍽️ Food Presentation', value: 'foodPresentationSlider' },
        { label: '➖ No Hero', value: 'none' },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
     * HOME PAGE SLIDER (heroSlider)
     * The main homepage hero with animated product slides
     * ═══════════════════════════════════════════════════════════════════════ */

    // HEADLINE SECTION
    {
      type: 'collapsible',
      label: '✏️ Headline & Text',
      admin: {
        condition: (_, { type } = {}) => type === 'heroSlider',
        initCollapsed: false,
        description: 'The main text visitors see first on your homepage.',
      },
      fields: [
        {
          name: 'richText',
          type: 'richText',
          label: 'Hero Text',
          localized: true,
          admin: {
            description:
              'The main headline and tagline. Use H1 for the big headline, then paragraph for the tagline.',
          },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h1', 'h2'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
        },
        linkGroup({
          overrides: {
            label: 'Buttons',
            maxRows: 2,
            admin: {
              description: 'Add 1-2 buttons below the headline (e.g., "Workshops" and "Shop").',
            },
          },
        }),
        {
          name: 'showWordmark',
          type: 'checkbox',
          label: 'Show Logo Text',
          defaultValue: true,
          admin: {
            description: 'Show the gold "FERMENTFREUDE" text above the headline.',
          },
        },
      ],
    },

    // BACKGROUND IMAGES
    {
      type: 'collapsible',
      label: '🖼️ Background Images',
      admin: {
        condition: (_, { type } = {}) => type === 'heroSlider',
        initCollapsed: true,
        description: 'The food photos that appear behind the slides.',
      },
      fields: [
        {
          name: 'heroImages',
          type: 'array',
          label: 'Background Photos',
          minRows: 1,
          maxRows: 8,
          labels: {
            singular: 'Photo',
            plural: 'Photos',
          },
          admin: {
            description: 'Add 4-5 beautiful food photos. They cycle in the background.',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Photo',
            },
          ],
        },
      ],
    },

    // PRODUCT SLIDES
    {
      type: 'collapsible',
      label: '🎯 Product Slides',
      admin: {
        condition: (_, { type } = {}) => type === 'heroSlider',
        initCollapsed: false,
        description: 'Each slide showcases a product category (Lakto, Kombucha, Tempeh, etc.)',
      },
      fields: [
        {
          name: 'heroSlides',
          type: 'array',
          label: 'Slides',
          minRows: 1,
          maxRows: 6,
          labels: {
            singular: 'Slide',
            plural: 'Slides',
          },
          admin: {
            initCollapsed: false,
            description: 'Each slide has its own title, description, colors, and product images.',
            components: {
              RowLabel: '@/fields/heroSlideRowLabel.tsx#HeroSlideRowLabel',
            },
          },
          fields: [
            // Basic Info Row
            {
              type: 'row',
              fields: [
                {
                  name: 'slideId',
                  type: 'text',
                  label: 'Slide Name',
                  required: true,
                  admin: {
                    width: '30%',
                    description: 'e.g., "lakto", "kombucha"',
                  },
                },
                {
                  name: 'eyebrow',
                  type: 'text',
                  label: 'Small Text Above Title',
                  localized: true,
                  admin: {
                    width: '70%',
                    description: 'e.g., "Workshop Experience"',
                  },
                },
              ],
            },
            // Title
            {
              name: 'title',
              type: 'text',
              label: 'Slide Title',
              localized: true,
              required: true,
              admin: {
                description: 'The big title for this slide. Use \\n for line breaks.',
              },
            },
            // Description
            {
              name: 'description',
              type: 'textarea',
              label: 'Slide Description',
              localized: true,
              admin: {
                description: 'Short description below the title.',
              },
            },
            // Tags/Attributes
            {
              name: 'attributes',
              type: 'array',
              label: 'Product Tags',
              maxRows: 5,
              admin: {
                description: 'Small tags like "Probiotic-rich", "All-natural"',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  label: 'Tag',
                  localized: true,
                  required: true,
                },
              ],
            },
            // Button Row
            {
              type: 'row',
              fields: [
                {
                  name: 'ctaLabel',
                  type: 'text',
                  label: 'Button Text',
                  localized: true,
                  admin: {
                    width: '50%',
                    description: 'e.g., "Learn More"',
                  },
                },
                {
                  name: 'ctaHref',
                  type: 'text',
                  label: 'Button Link',
                  admin: {
                    width: '50%',
                    description: 'e.g., "/workshops/lakto"',
                  },
                },
              ],
            },
            // Colors Row
            {
              type: 'row',
              fields: [
                {
                  name: 'panelColor',
                  type: 'text',
                  label: 'Card Color',
                  admin: {
                    width: '50%',
                    description: 'Center card: #555954',
                  },
                },
                {
                  name: 'bgColor',
                  type: 'text',
                  label: 'Background Color',
                  admin: {
                    width: '50%',
                    description: 'Page background: #D2DFD7',
                  },
                },
              ],
            },
            // Product Images Row
            {
              type: 'row',
              fields: [
                {
                  name: 'leftImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Left Product Image',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'rightImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Right Product Image',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // SOCIAL LINKS
    {
      type: 'collapsible',
      label: '🔗 Social Media',
      admin: {
        condition: (_, { type } = {}) => type === 'heroSlider' || type === 'foodPresentationSlider',
        initCollapsed: true,
        description: 'Social icons on the hero. Leave empty to hide.',
      },
      fields: [
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Social Links',
          maxRows: 6,
          labels: {
            singular: 'Link',
            plural: 'Links',
          },
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  label: 'Platform',
                  required: true,
                  admin: { width: '40%' },
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'Twitter / X', value: 'twitter' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'Pinterest', value: 'pinterest' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Profile URL',
                  required: true,
                  admin: {
                    width: '60%',
                    description: 'https://instagram.com/fermentfreude',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
     * FULL IMAGE BANNER (highImpact / mediumImpact)
     * Simple hero with one big background image
     * ═══════════════════════════════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '🖼️ Banner Image',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact' || type === 'mediumImpact',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          label: 'Background Image',
          admin: {
            description: 'The big hero background image.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
     * VIDEO BACKGROUND (videoBackground)
     * Fullscreen Vimeo video with text overlay — cinematic hero
     * ═══════════════════════════════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '🎬 Video & Text',
      admin: {
        condition: (_, { type } = {}) => type === 'videoBackground',
        initCollapsed: false,
        description: 'Vimeo video plays fullscreen behind the text. Autoplay, loop, muted.',
      },
      fields: [
        {
          name: 'vimeoUrl',
          type: 'text',
          label: 'Vimeo Video URL',
          admin: {
            description: 'e.g. https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789. Leave empty to use fallback image only.',
          },
        },
        {
          name: 'videoFallbackImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Fallback Image',
          admin: {
            description: 'Shown while video loads or if video fails. Optional.',
          },
        },
        {
          name: 'videoRichText',
          type: 'richText',
          label: 'Title & Tagline',
          localized: true,
          admin: {
            description: 'Headline and optional tagline over the video.',
          },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
        },
        linkGroup({
          overrides: {
            name: 'videoLinks',
            label: 'Buttons',
            maxRows: 2,
            admin: {
              description: 'Optional CTA buttons below the headline.',
            },
          },
        }),
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
     * SIMPLE TITLE (lowImpact)
     * Just text, no image
     * ═══════════════════════════════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '📝 Page Title',
      admin: {
        condition: (_, { type } = {}) => type === 'lowImpact',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'richTextLowImpact',
          type: 'richText',
          label: 'Title & Text',
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
     * PHOTO CAROUSEL (heroCarousel / foodPresentationSlider)
     * Multiple fullscreen slides with text overlays
     * ═══════════════════════════════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '🎠 Carousel Slides',
      admin: {
        condition: (_, { type } = {}) =>
          type === 'heroCarousel' || type === 'foodPresentationSlider',
        initCollapsed: false,
        description: 'Fullscreen image slides with text.',
      },
      fields: [
        {
          name: 'slides',
          type: 'array',
          label: 'Slides',
          minRows: 1,
          maxRows: 8,
          labels: {
            singular: 'Slide',
            plural: 'Slides',
          },
          admin: {
            initCollapsed: false,
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Background Image',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Title',
                  required: true,
                  localized: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'tagline',
                  type: 'text',
                  label: 'Tagline',
                  localized: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'buttonLabel',
                  type: 'text',
                  label: 'Button Text',
                  localized: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'buttonUrl',
                  type: 'text',
                  label: 'Button Link',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
