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

import { BrevoEmailTemplates } from '@/collections/BrevoEmailTemplates'
import { BrevoTemplates } from '@/collections/BrevoTemplates'
import { CancellationRequests } from '@/collections/CancellationRequests'
import { Categories } from '@/collections/Categories'
import { CourseProgress } from '@/collections/CourseProgress'
import { Downloads } from '@/collections/Downloads'
import { Enrollments } from '@/collections/Enrollments'
import { Media } from '@/collections/Media'
import { OnlineCourses } from '@/collections/OnlineCourses'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { ReturnRequests } from '@/collections/ReturnRequests'
import { Reviews } from '@/collections/Reviews'
import { Users } from '@/collections/Users'
import { Vouchers } from '@/collections/Vouchers'
import { WorkshopAppointments } from '@/collections/WorkshopAppointments'
import { WorkshopBookings } from '@/collections/WorkshopBookings'
import { WorkshopLocations } from '@/collections/WorkshopLocations'
import { Workshops } from '@/collections/Workshops'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { ProductSliderGlobal } from '@/globals/ProductSlider'
import { SponsorsBarGlobal } from '@/globals/SponsorsBar'
import { TestimonialsGlobal } from '@/globals/Testimonials'
import { VoucherCtaGlobal } from '@/globals/VoucherCta'
import { WorkshopCardsGlobal } from '@/globals/WorkshopCards'
import { WorkshopSliderGlobal } from '@/globals/WorkshopSlider'
import { plugins } from './plugins'

/** Same as the folder containing `payload.config.ts`, without `import.meta.url` (Webpack + ESM breaks on that in some chunks). */
const srcDir = path.resolve(process.cwd(), 'src')

// Vercel exposes the canonical project URL at VERCEL_PROJECT_PRODUCTION_URL
// and the per-deployment URL at VERCEL_URL. Both are needed because Vercel
// will serve the same deployment under multiple aliases (e.g. "-env-staging-",
// "-git-staging-") and CORS must accept all of them.
const vercelOrigins = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '',
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
].filter(Boolean) as string[]

// On any Vercel deployment, accept the full *.vercel.app preview surface so
// Vercel's per-branch / per-env aliases never break CORS.
const corsOrigins: string[] | '*' = process.env.VERCEL
  ? '*'
  : ([
      process.env.NEXT_PUBLIC_SERVER_URL || '',
      'https://www.fermentfreude.at',
      'https://fermentfreude.at',
      'http://localhost:3000',
      'http://localhost:3001',
      ...vercelOrigins,
    ].filter(Boolean) as string[])

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  cors: corsOrigins,
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    'https://www.fermentfreude.at',
    'https://fermentfreude.at',
    'http://localhost:3000',
    'http://localhost:3001',
    ...vercelOrigins,
  ].filter(Boolean) as string[],
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: srcDir,
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
    },
    livePreview: {
      collections: ['pages'],
      globals: [
        'footer',
        'testimonials-global',
        'sponsors-bar-global',
        'voucher-cta-global',
        'workshop-slider-global',
        'product-slider-global',
        'workshop-cards-global',
      ],
      url: ({ globalConfig }) => {
        // Globals: preview on the page where they appear most prominently
        if (globalConfig?.slug === 'workshop-cards-global') return '/workshops'
        // Most globals show on the home page
        if (globalConfig) return '/'
        // Collections handled by their own livePreview config
        return '/'
      },
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
    Downloads,
    Reviews,
    ReturnRequests,
    CancellationRequests,
    BrevoEmailTemplates,
    BrevoTemplates,
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
  globals: [
    Header,
    Footer,
    TestimonialsGlobal,
    SponsorsBarGlobal,
    VoucherCtaGlobal,
    WorkshopSliderGlobal,
    ProductSliderGlobal,
    WorkshopCardsGlobal,
  ],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(srcDir, 'payload-types.ts'),
  },
})
