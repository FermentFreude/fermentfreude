import type { Block } from 'payload'

import { blockVisible } from '@/fields/blockVisible'

const photoTitleText = [
  {
    name: 'image',
    type: 'upload' as const,
    relationTo: 'media' as const,
    required: false,
    label: 'Photo',
  },
  {
    name: 'title',
    type: 'text' as const,
    required: false,
    localized: true,
    label: 'Title',
  },
  {
    name: 'text',
    type: 'textarea' as const,
    required: false,
    localized: true,
    label: 'Short line',
  },
]

export const GastronomyHeroBlock: Block = {
  slug: 'gastronomyHero',
  interfaceName: 'GastronomyHeroBlock',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    blockVisible,
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Hero photo',
      admin: { description: 'Plated / fried tempeh. Leave empty to use the default photo.' },
    },
    {
      name: 'eyebrow',
      type: 'text',
      required: false,
      localized: true,
      label: 'Eyebrow',
      admin: { description: 'Small line above the title. e.g. “Für Restaurants”.' },
    },
    {
      name: 'title',
      type: 'text',
      required: false,
      localized: true,
      label: 'Title',
      admin: { description: 'Main headline. e.g. “Tempeh für Profiküchen.”' },
    },
    {
      name: 'tagline',
      type: 'text',
      required: false,
      localized: true,
      label: 'Tagline',
      admin: { description: 'One short line under the title.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'CTA button label',
          admin: { width: '50%', description: 'e.g. “Für Gastronomie anfragen”.' },
        },
        {
          name: 'ctaUrl',
          type: 'text',
          required: false,
          label: 'CTA URL',
          admin: { width: '50%', description: 'Usually #contact.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'secondaryLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Secondary CTA label',
          admin: { width: '50%' },
        },
        {
          name: 'secondaryUrl',
          type: 'text',
          required: false,
          label: 'Secondary CTA URL',
          admin: { width: '50%' },
        },
      ],
    },
  ],
}

export const GastronomyShowcaseBlock: Block = {
  slug: 'gastronomyShowcase',
  interfaceName: 'GastronomyShowcaseBlock',
  labels: { singular: 'Food showcase', plural: 'Food showcase' },
  fields: [
    blockVisible,
    {
      name: 'title',
      type: 'text',
      required: false,
      localized: true,
      label: 'Section title',
    },
    {
      name: 'slides',
      type: 'array',
      required: false,
      minRows: 0,
      maxRows: 8,
      labels: { singular: 'Slide', plural: 'Slides' },
      admin: { description: 'Drag slides to reorder. Each slide: photo + title + one short line.' },
      fields: photoTitleText,
    },
  ],
}

export const GastronomyBenefitsBlock: Block = {
  slug: 'gastronomyBenefits',
  interfaceName: 'GastronomyBenefitsBlock',
  labels: { singular: 'Why tempeh', plural: 'Why tempeh' },
  fields: [
    blockVisible,
    {
      name: 'title',
      type: 'text',
      required: false,
      localized: true,
      label: 'Section title',
    },
    {
      name: 'items',
      type: 'array',
      required: false,
      minRows: 0,
      maxRows: 4,
      labels: { singular: 'Benefit', plural: 'Benefits' },
      admin: { description: 'Drag to reorder benefits.' },
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: false,
          defaultValue: 'utensils',
          label: 'Icon',
          options: [
            { label: 'Utensils', value: 'utensils' },
            { label: 'Sparkles', value: 'sparkles' },
            { label: 'Leaf', value: 'leaf' },
            { label: 'Chef hat', value: 'chefHat' },
            { label: 'Flame', value: 'flame' },
            { label: 'Wheat', value: 'wheat' },
            { label: 'Heart', value: 'heart' },
            { label: 'Sprout', value: 'sprout' },
          ],
          admin: {
            description: 'Shown in the gold circle above the title. Same icon in German and English.',
          },
        },
        { name: 'title', type: 'text', required: false, localized: true, label: 'Title' },
        { name: 'text', type: 'textarea', required: false, localized: true, label: 'Short text' },
      ],
    },
  ],
}

export const GastronomyAudienceBlock: Block = {
  slug: 'gastronomyAudience',
  interfaceName: 'GastronomyAudienceBlock',
  labels: { singular: 'Audience', plural: 'Audience' },
  fields: [
    blockVisible,
    {
      name: 'title',
      type: 'text',
      required: false,
      localized: true,
      label: 'Section heading',
    },
    {
      name: 'cards',
      type: 'array',
      required: false,
      minRows: 0,
      maxRows: 4,
      labels: { singular: 'Card', plural: 'Cards' },
      admin: { description: 'Drag cards to reorder. Photo, title and one short line.' },
      fields: photoTitleText,
    },
  ],
}

export const GastronomyProductBlock: Block = {
  slug: 'gastronomyProduct',
  interfaceName: 'GastronomyProductBlock',
  labels: { singular: 'Product', plural: 'Product' },
  fields: [
    blockVisible,
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Product photo',
    },
    {
      name: 'title',
      type: 'text',
      required: false,
      localized: true,
      label: 'Section title',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      required: false,
      localized: true,
      label: 'CTA button label',
    },
    {
      name: 'ctaUrl',
      type: 'text',
      required: false,
      label: 'CTA URL',
      admin: { description: 'Usually #contact.' },
    },
    {
      name: 'facts',
      type: 'array',
      required: false,
      labels: { singular: 'Fact', plural: 'Facts' },
      admin: {
        description:
          'One line each — pack size, vegan, origin, B2B. Drag to reorder. This is what shows under the title.',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: false,
          localized: true,
          label: 'Line',
        },
      ],
    },
    {
      name: 'b2bLine',
      type: 'text',
      required: false,
      localized: true,
      label: 'Extra product fact',
      admin: {
        description: 'Optional extra line if Facts is empty. Prefer adding it as a Fact above.',
      },
    },
  ],
}

export const GastronomyProofBlock: Block = {
  slug: 'gastronomyProof',
  interfaceName: 'GastronomyProofBlock',
  labels: { singular: 'Proof', plural: 'Proof' },
  fields: [
    blockVisible,
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Background photo',
    },
    {
      name: 'title',
      type: 'text',
      required: false,
      localized: true,
      label: 'Small label',
    },
    {
      name: 'items',
      type: 'array',
      required: false,
      maxRows: 1,
      label: 'Quote',
      fields: [
        { name: 'quote', type: 'textarea', required: true, localized: true, label: 'Quote' },
        { name: 'author', type: 'text', required: true, localized: true, label: 'Name, place' },
      ],
    },
  ],
}

export const GastronomyInquiryBlock: Block = {
  slug: 'gastronomyInquiry',
  interfaceName: 'GastronomyInquiryBlock',
  labels: { singular: 'Inquiry form', plural: 'Inquiry form' },
  fields: [
    blockVisible,
    {
      name: 'heading',
      type: 'text',
      required: false,
      localized: true,
      label: 'Form heading',
    },
    {
      name: 'email',
      type: 'text',
      required: false,
      localized: true,
      label: 'Email',
    },
    {
      name: 'phone',
      type: 'text',
      required: false,
      localized: true,
      label: 'Phone',
    },
    {
      name: 'placeholders',
      type: 'group',
      label: 'Form placeholders',
      fields: [
        { name: 'firstName', type: 'text', required: false, localized: true, label: 'Name' },
        {
          name: 'lastName',
          type: 'text',
          required: false,
          localized: true,
          label: 'Restaurant / company',
        },
        { name: 'email', type: 'text', required: false, localized: true, label: 'Email' },
        { name: 'phone', type: 'text', required: false, localized: true, label: 'Phone' },
        { name: 'quantity', type: 'text', required: false, localized: true, label: 'Quantity' },
        { name: 'message', type: 'text', required: false, localized: true, label: 'Message' },
      ],
    },
    {
      name: 'businessType',
      type: 'group',
      label: 'Type of business dropdown',
      fields: [
        { name: 'default', type: 'text', required: false, localized: true, label: 'Placeholder' },
        {
          name: 'options',
          type: 'array',
          label: 'Options',
          minRows: 0,
          fields: [{ name: 'label', type: 'text', required: false, localized: true }],
        },
      ],
    },
    {
      name: 'interest',
      type: 'group',
      label: 'Interest dropdown',
      fields: [
        { name: 'default', type: 'text', required: false, localized: true, label: 'Placeholder' },
        {
          name: 'options',
          type: 'array',
          label: 'Options',
          minRows: 0,
          fields: [{ name: 'label', type: 'text', required: false, localized: true }],
        },
      ],
    },
    {
      name: 'submitLabel',
      type: 'text',
      required: false,
      localized: true,
      label: 'Submit button',
    },
  ],
}

export const gastronomySectionBlocks = [
  GastronomyHeroBlock,
  GastronomyShowcaseBlock,
  GastronomyBenefitsBlock,
  GastronomyAudienceBlock,
  GastronomyProductBlock,
  GastronomyProofBlock,
  GastronomyInquiryBlock,
]
