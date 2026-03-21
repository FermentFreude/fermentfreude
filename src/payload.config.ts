import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { CourseProgress } from '@/collections/CourseProgress'
import { Enrollments } from '@/collections/Enrollments'
import { Media } from '@/collections/Media'
import { OnlineCourses } from '@/collections/OnlineCourses'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Users } from '@/collections/Users'
import { Vouchers } from '@/collections/Vouchers'
import { WorkshopAppointments } from '@/collections/WorkshopAppointments'
import { WorkshopBookings } from '@/collections/WorkshopBookings'
import { WorkshopLocations } from '@/collections/WorkshopLocations'
import { Workshops } from '@/collections/Workshops'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { TestimonialsGlobal } from '@/globals/Testimonials'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    'https://www.fermentfreude.at',
    'https://fermentfreude.at',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[],
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — FermentFreude',
      icons: [{ url: '/submark-dark.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Icon#Icon',
      },
      afterNavLinks: ['/components/admin/AIAssistant#AIAssistant'],
    },
    livePreview: {
      collections: ['pages'],
    },
  },
  localization: {
    locales: [
      {
        label: 'Deutsch',
        code: 'de',
        fallbackLocale: 'en',
      },
      {
        label: 'English',
        code: 'en',
        fallbackLocale: 'de',
      },
    ],
    defaultLocale: 'de',
    fallback: true,
  },
  collections: [
    Users,
    Pages,
    Categories,
    CourseProgress,
    Enrollments,
    Media,
    OnlineCourses,
    Posts,
    Workshops,
    WorkshopLocations,
    WorkshopAppointments,
    WorkshopBookings,
    Vouchers,
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  globals: [Header, Footer, TestimonialsGlobal],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
