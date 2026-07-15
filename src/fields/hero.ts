import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/** Resolve hero `type` inside nested collapsibles (siblingData may omit group-level fields). */
function isHeroType(
  data: Record<string, unknown>,
  siblingData: Record<string, unknown> | undefined,
  ...types: string[]
): boolean {
  const hero = data?.hero as { type?: string } | undefined
  const t = siblingData?.type ?? hero?.type
  return typeof t === 'string' && types.includes(t)
}

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
          'Choose how this page looks at the top. "Offerings Grid" shows all items at once (no carousel).',
      },
      options: [
        { label: '🏠 Home Page Slider', value: 'heroSlider' },
        { label: '📷 Full Image Banner', value: 'highImpact' },
        { label: '📄 Simple Title', value: 'lowImpact' },
        { label: '⬜ Split (Text + Image)', value: 'heroSplit' },
        { label: '📰 Press / Media Banner', value: 'heroPress' },
        { label: '🎠 Photo Carousel', value: 'heroCarousel' },
        { label: '▦ Offerings Grid', value: 'heroGrid' },
        { label: '🍽️ Food Presentation', value: 'foodPresentationSlider' },
        { label: '➖ No Hero', value: 'none' },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
     * HOME PAGE SLIDER (heroSlider)
     * The main homepage hero with animated product slides
     * ═══════════════════════════════════════════════════════════════════════ */

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
              type: 'textarea',
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
            {
              type: 'row',
              fields: [
                {
                  name: 'secondaryCtaLabel',
                  type: 'text',
                  label: 'Secondary Button Text',
                  localized: true,
                  admin: {
                    width: '50%',
                    description: 'e.g., "Shop"',
                  },
                },
                {
                  name: 'secondaryCtaHref',
                  type: 'text',
                  label: 'Secondary Button Link',
                  admin: {
                    width: '50%',
                    description: 'e.g., "/shop"',
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
     * SPLIT HERO (heroSplit)
     * Text left, image right — simple editorial layout
     * ═══════════════════════════════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '⬜ Split / Press Content',
      admin: {
        condition: (_, { type } = {}) => type === 'heroSplit' || type === 'heroPress',
        initCollapsed: false,
        description:
          'Label, heading, description, and image. Split = text left / image right. Press = full-width cinematic banner.',
      },
      fields: [
        {
          name: 'splitLabel',
          type: 'text',
          label: 'Label',
          localized: true,
          admin: {
            description: 'Small pill above the heading (e.g. "About Us")',
          },
        },
        {
          name: 'splitHeading',
          type: 'text',
          label: 'Heading',
          localized: true,
          required: false,
          admin: {
            description: 'Main headline',
          },
        },
        {
          name: 'splitDescription',
          type: 'textarea',
          label: 'Description',
          localized: true,
          admin: {
            description: 'Short paragraph below the heading',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'splitCtaLabel',
              type: 'text',
              label: 'Link Text',
              localized: true,
              admin: { width: '50%', description: 'e.g. "Learn more"' },
            },
            {
              name: 'splitCtaUrl',
              type: 'text',
              label: 'Link URL',
              admin: { width: '50%', description: 'e.g. /workshops' },
            },
          ],
        },
        {
          name: 'splitMedia',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
          admin: {
            condition: (data, siblingData) => isHeroType(data, siblingData, 'heroSplit'),
            description: 'Photo on the right side of the hero (Split layout only).',
          },
        },
        {
          name: 'splitHeroVideo',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero background video',
          admin: {
            condition: (data, siblingData) => isHeroType(data, siblingData, 'heroPress'),
            description:
              'Upload an MP4 — this is the moving background visitors see. To replace: Remove the current file, upload a new MP4, Save.',
          },
        },
        {
          name: 'splitMediaPoster',
          type: 'upload',
          relationTo: 'media',
          label: 'Poster image (accessibility only)',
          admin: {
            condition: (data, siblingData) => isHeroType(data, siblingData, 'heroPress'),
            description:
              'Optional. Shown only for visitors with “reduce motion” enabled — not the main hero background.',
          },
        },
        {
          type: 'collapsible',
          label: '⚙️ Or use YouTube instead',
          admin: {
            condition: (data, siblingData) => isHeroType(data, siblingData, 'heroPress'),
            initCollapsed: true,
            description:
              'Optional. Paste a YouTube link instead of uploading MP4. MP4 upload above is recommended — it plays more reliably.',
          },
          fields: [
            {
              name: 'splitYoutubeUrl',
              type: 'text',
              label: 'YouTube URL',
              admin: {
                description: 'Used only when no MP4 is uploaded above. e.g. https://www.youtube.com/watch?v=…',
              },
            },
            {
              name: 'splitYoutubeStart',
              type: 'number',
              label: 'Start at (seconds)',
              admin: {
                width: '50%',
                description: 'Start time in seconds (e.g. 395 = 6:35).',
              },
            },
          ],
        },
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
          type === 'heroCarousel' || type === 'heroGrid' || type === 'foodPresentationSlider',
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
                  type: 'textarea',
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
