import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'

import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'

import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { autoCompleteDigitalOrders } from '@/collections/Orders/autoCompleteDigitalOrders'
import { autoEnrollOnPurchase } from '@/collections/Orders/autoEnrollOnPurchase'
import { confirmWorkshopBookings } from '@/collections/Orders/confirmWorkshopBookings'
import { copyCustomerNameFromTransaction } from '@/collections/Orders/copyCustomerNameFromTransaction'
import { decrementInventory } from '@/collections/Orders/decrementInventory'
import { restoreWorkshopSpotsOnDelete } from '@/collections/Orders/restoreWorkshopSpotsOnDelete'
import { setInvoiceIssuedAt } from '@/collections/Orders/setInvoiceIssuedAt'
import {
  handleChargeRefunded,
  handleChargeSucceeded,
  handlePaymentFailed,
} from '@/collections/Orders/stripeWebhooks'
import { ProductsCollection } from '@/collections/Products'
import { sendOrderConfirmationEmail } from '@/hooks/brevo/sendOrderConfirmationEmail'
import { Page, Product } from '@/payload-types'
import { mediaFixR2UrlAfterReadPlugin } from '@/plugins/mediaFixR2UrlAfterRead'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const r2Enabled =
  !!process.env.R2_BUCKET &&
  !!process.env.R2_ENDPOINT &&
  !process.env.R2_ENDPOINT.includes('<account-id>')

// clientUploads makes the BROWSER PUT the file directly to R2 (presigned URL).
// PROBLEM: it bypasses Sharp, so no webp conversion, no resize, and no image
// `sizes` (thumbnail / card / hero) are ever generated. The admin then crashes
// after save with `Cannot read properties of undefined (reading 'reduce')`
// because the upload card UI walks the missing `sizes` array.
//
// We therefore keep server-side uploads everywhere (admin + local + seed) so
// Sharp runs and all variants land in R2. Vercel's 4.5 MB serverless body
// limit is mitigated by the `optimizedFile()` helper for seeds, and admins
// upload pre-optimised images.
const useClientUploads = false

export const plugins: Plugin[] = [
  s3Storage({
    enabled: r2Enabled,
    // Upload directly from browser to R2 via presigned URLs.
    // Bypasses Vercel's 4.5 MB serverless function body limit.
    // Disabled during seed scripts (PAYLOAD_SEED=true) so the Local API uploads work.
    clientUploads: useClientUploads,
    collections: {
      media: {
        disablePayloadAccessControl: true,
        prefix: 'media',
        generateFileURL: ({ filename, prefix }) => {
          return `${process.env.R2_PUBLIC_URL}/${prefix}/${filename}`
        },
      },
    },
    bucket: process.env.R2_BUCKET!,
    config: {
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      endpoint: process.env.R2_ENDPOINT!,
      region: 'auto',
    },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Inhalt',
      },
    },
    formOverrides: {
      admin: {
        group: 'Inhalt',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      isAdmin,
      isDocumentOwner,
    },
    currencies: {
      defaultCurrency: 'EUR',
      supportedCurrencies: [
        {
          code: 'EUR',
          label: 'Euro (€)',
          symbol: '€',
          decimals: 2,
        },
      ],
    },
    customers: {
      slug: 'users',
    },
    payments: {
      paymentMethods: [
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY!,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
          webhooks: {
            'payment_intent.payment_failed': handlePaymentFailed,
            'charge.refunded': handleChargeRefunded,
            'charge.succeeded': handleChargeSucceeded,
            'payment_intent.succeeded': handleChargeSucceeded,
          },
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection?.admin,
          group: 'Shop',
        },
        fields: [
          ...(defaultCollection?.fields ?? []),
          {
            name: 'customerName',
            type: 'text',
            label: 'Customer name',
            admin: {
              description:
                'Full name supplied by the buyer at checkout. Used to greet the buyer in confirmation emails. Optional for legacy orders.',
              position: 'sidebar',
            },
          },
          {
            name: 'downloadToken',
            type: 'text',
            label: 'Download Token',
            admin: {
              description:
                'UUID token for secure receipt download via /api/orders/[id]/receipt?token=... Set automatically when order confirmation email is sent.',
              position: 'sidebar',
            },
          },
          {
            name: 'invoiceIssuedAt',
            type: 'date',
            label: 'Invoice issued at',
            admin: {
              description:
                'Frozen invoice date. Set once when the order is paid and never overwritten — guarantees the PDF receipt shows the same date no matter when it is downloaded.',
              position: 'sidebar',
              readOnly: true,
              date: { pickerAppearance: 'dayAndTime' },
            },
          },
        ],
        hooks: {
          ...defaultCollection?.hooks,
          beforeChange: [
            ...(defaultCollection?.hooks?.beforeChange ?? []),
            copyCustomerNameFromTransaction,
          ],
          afterChange: [
            ...(defaultCollection?.hooks?.afterChange ?? []),
            setInvoiceIssuedAt,
            decrementInventory,
            autoEnrollOnPurchase,
            confirmWorkshopBookings,
            sendOrderConfirmationEmail,
            autoCompleteDigitalOrders,
          ],
          afterDelete: [
            ...(defaultCollection?.hooks?.afterDelete ?? []),
            restoreWorkshopSpotsOnDelete,
          ],
        },
      }),
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...(defaultCollection?.fields ?? []),
          {
            name: 'customerName',
            type: 'text',
            label: 'Customer name',
            admin: {
              description:
                'Full name supplied by the buyer at checkout. Copied to the resulting Order when it is created.',
            },
          },
        ],
      }),
    },
  }),
  // Must run last so it overrides Payload's default `url` afterRead behavior.
  mediaFixR2UrlAfterReadPlugin,
]
