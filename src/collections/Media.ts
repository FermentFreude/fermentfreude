import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { isAdmin } from '@/access/isAdmin'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  admin: {
    group: 'Content',
  },
  slug: 'media',
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
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'caption',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    // Allow focal point selection in admin for better cropping
    focalPoint: true,
    mimeTypes: [
      // Images
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      'image/gif',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ],
    // Automatically resize the original on upload — caps at 2560px (only applies to images, not videos)
    resizeOptions: {
      width: 2560,
      height: 2560,
      fit: 'inside',
      withoutEnlargement: true,
    },
    // Convert all uploaded images to WebP for maximum compression
    formatOptions: {
      format: 'webp',
      options: {
        quality: 82,
      },
    },
    // Generate optimized sizes for responsive images
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        fit: 'inside',
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'card',
        width: 800,
        height: 800,
        fit: 'inside',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        fit: 'inside',
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
    ],
  },
}
