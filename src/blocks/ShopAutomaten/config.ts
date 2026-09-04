import type { Block } from 'payload'

export const ShopAutomaten: Block = {
  slug: 'shopAutomaten',
  interfaceName: 'ShopAutomatenBlock',
  labels: {
    singular: 'Shop Automaten',
    plural: 'Shop Automaten',
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Toggle off to hide this section without deleting it.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow / city label',
      admin: {
        description: 'e.g. "GRAZ · AVAILABLE 24/7"',
      },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Heading',
      admin: {
        description: 'e.g. "Find our products, anytime."',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      localized: true,
      label: 'Intro text',
      admin: {
        description: 'Optional short line under the headline.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured lifestyle image (left)',
      admin: {
        description:
          'Large editorial photo on desktop (Automat, product, Graz mood). Soft rounded corners on the front.',
      },
    },
    {
      name: 'locations',
      type: 'array',
      label: 'Vending machine locations',
      minRows: 1,
      maxRows: 24,
      labels: {
        singular: 'Location',
        plural: 'Locations',
      },
      admin: {
        description:
          'Add each Automat as a row (Graz now; more across Styria later). Order = display order (01, 02, …).',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Card image',
          admin: {
            description:
              'Photo of this Automat / location (preferred). Product pack is fine until you have a location photo.',
          },
        },
        {
          name: 'city',
          type: 'text',
          localized: true,
          label: 'City / region',
          admin: {
            description: 'e.g. "Graz", "Leibnitz", "Südsteiermark". Shown above the name.',
          },
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
          label: 'Location name',
          admin: {
            description: 'e.g. "Automat Pölzl Gemüse & Freunde"',
          },
        },
        {
          name: 'address',
          type: 'text',
          localized: true,
          required: true,
          label: 'Full address',
        },
        {
          name: 'products',
          type: 'text',
          localized: true,
          label: 'Products available',
          admin: {
            description:
              'Short line of what is in this Automat, e.g. "Käfer · Berglinsen". Leave empty if same everywhere.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Short description',
        },
        {
          name: 'accessInfo',
          type: 'text',
          localized: true,
          label: 'Badge / access line',
          admin: {
            description: 'Shown as badge. Default: "24/7 Vending Machine".',
          },
        },
        {
          name: 'mapsUrl',
          type: 'text',
          required: true,
          label: 'Open in Maps URL',
        },
        {
          name: 'websiteUrl',
          type: 'text',
          label: 'Partner website URL',
          admin: {
            description: 'e.g. https://poelzl.at/ — leave empty to hide the website link.',
          },
        },
        {
          name: 'kind',
          type: 'select',
          label: 'Type (legacy)',
          defaultValue: 'automat',
          options: [
            { label: 'Automat', value: 'automat' },
            { label: 'Restaurant', value: 'restaurant' },
          ],
          admin: {
            description: 'Kept for older content. Automaten section uses Automat only.',
          },
        },
        {
          name: 'note',
          type: 'text',
          localized: true,
          label: 'Legacy note',
          admin: {
            description: 'Fallback if description is empty.',
          },
        },
      ],
    },
    {
      name: 'mapsLabel',
      type: 'text',
      localized: true,
      label: 'Maps CTA label',
      admin: {
        description: 'e.g. "Open in Maps" / "In Maps öffnen"',
      },
    },
    {
      name: 'shareLabel',
      type: 'text',
      localized: true,
      label: 'Share route label',
      admin: {
        description: 'e.g. "Route teilen" / "Share route"',
      },
    },
    {
      name: 'websiteLabel',
      type: 'text',
      localized: true,
      label: 'Website CTA label',
      admin: {
        description: 'e.g. "Zur Website" / "Visit website"',
      },
    },
    {
      name: 'tipVisible',
      type: 'checkbox',
      label: 'Show insider tip',
      defaultValue: true,
      admin: {
        description:
          'Toggle off to hide the Wildmoser / restaurant tip without deleting the text.',
      },
    },
    {
      name: 'tipImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Restaurant tip image',
      admin: {
        description: 'Photo of the restaurant (e.g. Wildmoser facade). Optional.',
        condition: (_, siblingData) => siblingData?.tipVisible !== false,
      },
    },
    {
      name: 'tipName',
      type: 'text',
      localized: true,
      label: 'Restaurant tip name',
      admin: {
        description: 'e.g. "Wildmoser"',
        condition: (_, siblingData) => siblingData?.tipVisible !== false,
      },
    },
    {
      name: 'tipText',
      type: 'textarea',
      localized: true,
      label: 'Insider tip (footer)',
      admin: {
        description:
          'Subtle note under the cards (e.g. Wildmoser). Leave empty to hide. Only restaurants / extras — not Automaten.',
        condition: (_, siblingData) => siblingData?.tipVisible !== false,
      },
    },
    {
      name: 'tipMapsUrl',
      type: 'text',
      label: 'Tip Maps URL (optional)',
      admin: {
        description: 'Optional link for the insider tip (e.g. Wildmoser).',
        condition: (_, siblingData) => siblingData?.tipVisible !== false,
      },
    },
    {
      name: 'tipWebsiteUrl',
      type: 'text',
      label: 'Tip website URL (optional)',
      admin: {
        description: 'e.g. https://www.wildmoser-graz.at/',
        condition: (_, siblingData) => siblingData?.tipVisible !== false,
      },
    },
    // Legacy fields
    {
      name: 'pullQuote',
      type: 'textarea',
      localized: true,
      label: 'Legacy shared note',
      admin: { condition: () => false },
    },
    {
      name: 'locationName',
      type: 'text',
      localized: true,
      label: 'Legacy location name',
      admin: { condition: () => false },
    },
    {
      name: 'locationAddress',
      type: 'text',
      localized: true,
      label: 'Legacy address',
      admin: { condition: () => false },
    },
    {
      name: 'mapsUrl',
      type: 'text',
      label: 'Legacy Maps URL',
      admin: { condition: () => false },
    },
  ],
}
