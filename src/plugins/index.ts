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
import { generateDownloadToken } from '@/collections/Orders/generateDownloadToken'
import { markCartPurchased } from '@/collections/Orders/markCartPurchased'
import { redeemVoucherOnOrderComplete } from '@/collections/Orders/redeemVoucherOnOrderComplete'
import { restoreWorkshopSpotsOnDelete } from '@/collections/Orders/restoreWorkshopSpotsOnDelete'
import { setInvoiceIssuedAt } from '@/collections/Orders/setInvoiceIssuedAt'
import {
  handleChargeRefunded,
  handleChargeSucceeded,
  handlePaymentFailed,
} from '@/collections/Orders/stripeWebhooks'
import { ProductsCollection } from '@/collections/Products'
import { preventDuplicatePayment } from '@/collections/Transactions/preventDuplicatePayment'
import { assignInvoiceNumber } from '@/hooks/assignInvoiceNumber'
import { sendOrderConfirmationEmail } from '@/hooks/brevo/sendOrderConfirmationEmail'
import { Page, Product } from '@/payload-types'
import { mediaFixR2UrlAfterReadPlugin } from '@/plugins/mediaFixR2UrlAfterRead'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | FermentFreude` : 'FermentFreude'
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
    carts: {
      // Real, severe bug this closes: the default matcher only compares
      // product + variant. Every workshop appointment of the same TYPE (e.g.
      // two different Kombucha dates) resolves to the SAME product
      // (`workshop-${slug}`, no variant) — so without this, adding a second
      // different appointment of the same workshop to the cart silently
      // MERGES it into the first line item's quantity instead of creating a
      // second line. confirmWorkshopBookings.ts then can't tell which
      // specific pending booking the merged quantity belongs to and only
      // ever confirms one of them — the other stays 'pending' forever, never
      // emailed, never given a ticket, despite being paid for.
      //
      // Field is named `a` and stores only the LAST 6 hex chars of the real
      // appointment ID (not the full 24) — deliberately, not stylistically:
      // @payloadcms/plugin-ecommerce's Stripe initiatePayment.js copies
      // EVERY custom cart-item field verbatim into a JSON snapshot stored as
      // Stripe PaymentIntent metadata, which has a hard 500-character-per-
      // value limit. Verified empirically: 5 real workshop items with a
      // full-length field already exceeded it (586 chars) and hard-failed
      // checkout with a Stripe API error — a 6-char suffix is the difference
      // between 5 items fitting and not. confirmWorkshopBookings.ts matches
      // by this same suffix against the full appointmentId stored on the
      // booking, which is unambiguous for realistic concurrent-appointment
      // counts (16.7M possible suffixes).
      cartItemMatcher: ({ existingItem, newItem }) => {
        const existingProductID =
          typeof existingItem.product === 'object' ? existingItem.product.id : existingItem.product
        const productMatches = existingProductID === newItem.product
        const existingVariantID =
          existingItem.variant && typeof existingItem.variant === 'object'
            ? existingItem.variant.id
            : existingItem.variant
        const variantMatches = newItem.variant
          ? existingVariantID === newItem.variant
          : !existingVariantID
        const existingAid = existingItem.a
        const newAid = newItem.a
        const aidMatches = existingAid || newAid ? existingAid === newAid : true
        return productMatches && variantMatches && aidMatches
      },
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: defaultCollection.fields.map((field) => {
          if ('name' in field && field.name === 'items' && field.type === 'array') {
            return {
              ...field,
              fields: [
                ...field.fields,
                {
                  name: 'a',
                  type: 'text',
                  label: 'Appointment suffix',
                  maxLength: 6,
                  admin: {
                    description:
                      'Last 6 hex chars of the workshop-appointments ID this line is for (workshop items only). Kept deliberately short — see the `carts` config comment in src/plugins/index.ts for why: Stripe metadata has a hard 500-char-per-value limit and every character here is multiplied by cart size.',
                    readOnly: true,
                  },
                },
              ],
            }
          }
          return field
        }),
      }),
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
          defaultColumns: ['createdAt', 'customerEmail', 'status', 'amount', 'invoiceNumber'],
        },
        fields: [
          ...(defaultCollection?.fields ?? []),
          {
            name: 'customerFirstName',
            type: 'text',
            label: 'Customer first name',
            admin: {
              description: 'First name supplied by the buyer at checkout.',
              position: 'sidebar',
            },
          },
          {
            name: 'customerLastName',
            type: 'text',
            label: 'Customer last name',
            admin: {
              description: 'Last name supplied by the buyer at checkout.',
              position: 'sidebar',
            },
          },
          {
            name: 'customerName',
            type: 'text',
            label: 'Customer name (legacy)',
            admin: {
              description:
                'Full name supplied by the buyer at checkout. Used to greet the buyer in confirmation emails. Optional for legacy orders.',
              position: 'sidebar',
            },
          },
          {
            name: 'customerPhone',
            type: 'text',
            label: 'Customer phone',
            admin: {
              description:
                'Phone number supplied by the buyer at checkout. Required for workshop contact.',
              position: 'sidebar',
            },
          },
          {
            name: 'customerDietSpecs',
            type: 'textarea',
            label: 'Customer dietary specifications',
            admin: {
              description:
                'Dietary restrictions and specifications provided by the buyer at checkout.',
              position: 'sidebar',
            },
          },
          {
            name: 'paymentMethod',
            type: 'select',
            label: 'Payment Method',
            defaultValue: 'stripe',
            options: [
              { label: 'Stripe (online checkout)', value: 'stripe' },
              { label: 'Manuell (Banküberweisung, telefonisch, etc.)', value: 'manual' },
            ],
            admin: {
              description:
                'Determines the invoice series: stripe orders get WEB-YYYY-NNNN, manually-created orders get MAN-YYYY-NNNN.',
              position: 'sidebar',
            },
          },
          {
            name: 'referenceNote',
            type: 'text',
            label: 'Reference Note',
            admin: {
              description:
                'Freeform reference for manually-created orders (e.g. "Firmenevent August"). Shown as REFERENZ / BESTELLNUMMER on the Rechnung MAN PDF.',
              position: 'sidebar',
              condition: (data) => data?.paymentMethod === 'manual',
            },
          },
          {
            name: 'pickupDate',
            type: 'text',
            label: 'Pickup Date',
            admin: {
              description: 'Date chosen by buyer for in-store pickup (e.g. "14.05.2026"). Auto-set from checkout.',
              position: 'sidebar',
            },
          },
          {
            name: 'pickupTime',
            type: 'text',
            label: 'Pickup Time',
            admin: {
              description: 'Time slot chosen for pickup (e.g. "14:00 – 16:00").',
              position: 'sidebar',
            },
          },
          {
            name: 'pickupLocation',
            type: 'text',
            label: 'Pickup Location',
            admin: {
              description: 'Store location name for pickup.',
              position: 'sidebar',
            },
          },
          {
            name: 'pickupAddress',
            type: 'text',
            label: 'Pickup Address',
            admin: {
              description: 'Full address of the pickup location.',
              position: 'sidebar',
            },
          },
          {
            name: 'pickupStatus',
            type: 'select',
            label: 'Pickup Status',
            options: [
              { label: 'In Bearbeitung', value: 'pending' },
              { label: 'Abholbereit', value: 'ready' },
              { label: 'Abgeholt', value: 'collected' },
            ],
            admin: {
              description: 'Fulfillment status for pickup orders. Only relevant when Pickup Date is set.',
              position: 'sidebar',
              condition: (data) => Boolean(data?.pickupDate),
            },
          },
          {
            name: 'invoiceNumber',
            type: 'text',
            label: 'Invoice Number',
            admin: {
              description: 'Sequential invoice number (e.g. FF-2026-0001). Assigned automatically on order creation.',
              position: 'sidebar',
              readOnly: true,
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
          {
            name: 'downloadInvoice',
            type: 'ui',
            label: 'Invoice PDF',
            admin: {
              position: 'sidebar',
              description: 'Download this order\'s invoice — works for every status, including cancelled/refunded.',
              components: {
                Field: '@/components/admin/OrderInvoiceDownloadButton#OrderInvoiceDownloadButton',
              },
            },
          },
        ],
        hooks: {
          ...defaultCollection?.hooks,
          beforeChange: [
            ...(defaultCollection?.hooks?.beforeChange ?? []),
            assignInvoiceNumber,
            copyCustomerNameFromTransaction,
            generateDownloadToken,
          ],
          afterChange: [
            ...(defaultCollection?.hooks?.afterChange ?? []),
            setInvoiceIssuedAt,
            markCartPurchased,
            decrementInventory,
            autoEnrollOnPurchase,
            confirmWorkshopBookings,
            redeemVoucherOnOrderComplete,
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
            name: 'customerFirstName',
            type: 'text',
            label: 'Customer first name',
            admin: {
              description: 'First name supplied by the buyer at checkout.',
            },
          },
          {
            name: 'customerLastName',
            type: 'text',
            label: 'Customer last name',
            admin: {
              description: 'Last name supplied by the buyer at checkout.',
            },
          },
          {
            name: 'customerName',
            type: 'text',
            label: 'Customer name (legacy)',
            admin: {
              description:
                'Full name supplied by the buyer at checkout. Copied to the resulting Order when it is created.',
            },
          },
          {
            name: 'pickupDate',
            type: 'text',
            label: 'Pickup Date',
            admin: { description: 'Date chosen for in-store pickup. Copied to Order on creation.' },
          },
          {
            name: 'pickupTime',
            type: 'text',
            label: 'Pickup Time',
            admin: { description: 'Time slot chosen for pickup.' },
          },
          {
            name: 'pickupLocation',
            type: 'text',
            label: 'Pickup Location',
            admin: { description: 'Store location name.' },
          },
          {
            name: 'pickupAddress',
            type: 'text',
            label: 'Pickup Address',
            admin: { description: 'Full address of the pickup location.' },
          },
          {
            name: 'voucherCode',
            type: 'text',
            label: 'Voucher Code',
            admin: {
              description:
                'Voucher applied as a partial discount at checkout (cart total exceeded the voucher value, so the remainder was paid via Stripe). Read by redeemVoucherOnOrderComplete to mark the voucher redeemed once the Order is created.',
            },
          },
          {
            name: 'voucherDiscountAmount',
            type: 'number',
            label: 'Voucher Discount (cents)',
            admin: {
              description: 'Amount (in cents) deducted from the cart subtotal via the voucher above.',
            },
          },
        ],
        hooks: {
          ...defaultCollection?.hooks,
          beforeValidate: [
            ...(defaultCollection?.hooks?.beforeValidate ?? []),
            preventDuplicatePayment,
          ],
        },
      }),
    },
  }),
  // Must run last so it overrides Payload's default `url` afterRead behavior.
  mediaFixR2UrlAfterReadPlugin,
]
