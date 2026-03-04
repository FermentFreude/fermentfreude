import type { CollectionConfig } from 'payload'
import {
  BoldFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdmin } from '@/access/isAdmin'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'

/* ═══════════════════════════════════════════════════════════════
 *  Posts (How-To Articles) Collection
 *
 *  Educational fermentation how-to articles.
 *  Shown as cards on the Lakto workshop page and as full articles
 *  at /tipps/[slug].
 *
 *  Every text field is localized (DE + EN).
 *  Images → Cloudflare R2 via the Media collection.
 * ═══════════════════════════════════════════════════════════════ */

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description:
      'How-to articles shown on the Lakto workshop page and at /tipps/[slug]. Edit the title, summary, cover image and article content here.',
    defaultColumns: ['title', 'slug', 'readTime', 'updatedAt'],
    pagination: {
      defaultLimit: 20,
    },
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [autoTranslateCollection],
  },
  fields: [
    // ── Slug (URL identifier) ────────────────────────────
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'URL path used in /tipps/[slug]. Use lowercase with hyphens only (e.g. "salz-und-lake"). Do not change after publishing — it will break existing links.',
        position: 'sidebar',
      },
    },

    // ── Card Fields (shown on the Lakto page card grid) ──
    {
      type: 'collapsible',
      label: '📋 Card — shown on the Lakto workshop page',
      admin: {
        initCollapsed: false,
        description:
          'These fields control how the article appears as a card on the Lakto workshop page.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Article Title',
          admin: {
            description:
              'Main heading used on both the card and the article page (e.g. "Salz & Lake richtig einsetzen").',
          },
        },
        {
          name: 'summary',
          type: 'textarea',
          localized: true,
          label: 'Card Summary',
          admin: {
            description:
              'Short 1–2 sentence description shown on the card. Keep it under 150 characters.',
          },
        },
        {
          name: 'readTime',
          type: 'text',
          localized: true,
          label: 'Read Time',
          admin: {
            description: 'Displayed at the bottom of the card (e.g. "9 Min.").',
          },
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Cover Image',
          admin: {
            description:
              'Image shown at the top of the card AND as the article hero. Use 16:9 ratio (e.g. 1200×675 px). Upload a WebP for best performance.',
          },
        },
      ],
    },

    // ── Full Article Content ─────────────────────────────
    {
      type: 'collapsible',
      label: '📝 Article Content — shown on the full article page',
      admin: {
        initCollapsed: false,
        description:
          'Write the full article here using the rich text editor. Use Heading 2 for section titles, paragraphs for body text. Supports bold, italic, links and lists.',
      },
      fields: [
        {
          name: 'content',
          type: 'richText',
          localized: true,
          label: 'Article Body',
          admin: {
            description:
              'Full article text. Use H2 for section titles. Each paragraph is a separate block. Supports bold, italic, unordered and ordered lists, and links.',
          },
          editor: lexicalEditor({
            features: () => [
              HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
              BoldFeature(),
              ItalicFeature(),
              UnderlineFeature(),
              UnorderedListFeature(),
              OrderedListFeature(),
              LinkFeature({ enabledCollections: [] }),
            ],
          }),
        },
      ],
    },
  ],
}
