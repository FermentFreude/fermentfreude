import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

// Generate unique voucher code
function generateVoucherCode(workshopTitle: string): string {
  const prefix = workshopTitle.toUpperCase().replace(/\s+/g, '-')
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-GIFT-${randomPart}`
}

export const Vouchers: CollectionConfig = {
  slug: 'vouchers',
  access: {
    read: adminOnly, // Only admins can view vouchers
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'workshop', 'value', 'redeemed', 'redeemedOn'],
    description:
      'Gift vouchers that can be purchased as products and redeemed on the /redeem-voucher page.',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated unique voucher code',
      },
    },
    {
      name: 'workshop',
      type: 'relationship',
      relationTo: 'workshops',
      required: true,
      admin: {
        description: 'Workshop this voucher is valid for',
      },
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      defaultValue: 99,
      admin: {
        description: 'Voucher value in EUR (should match workshop price)',
      },
    },
    {
      name: 'redeemed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Automatically set to true when voucher is used',
      },
    },
    {
      name: 'redeemedOn',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Date when voucher was redeemed',
      },
    },
    {
      name: 'redeemedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'User who redeemed the voucher',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this voucher',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Auto-generate voucher code on create
        if (operation === 'create' && !data?.code) {
          // Fetch workshop title to generate code
          let workshopTitle = 'WORKSHOP'
          if (data?.workshop && req?.payload) {
            try {
              const workshop = await req.payload.findByID({
                collection: 'workshops',
                id: data.workshop,
              })
              if (workshop?.title) {
                workshopTitle =
                  typeof workshop.title === 'string'
                    ? workshop.title
                    : (workshop.title as { de?: string; en?: string })?.de || 'WORKSHOP'
              }
            } catch (_err) {
              // Fallback to generic code if workshop fetch fails
            }
          }
          data.code = generateVoucherCode(workshopTitle)
        }
        return data
      },
    ],
  },
}
