import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    group: 'Website',
    description:
      'Footer content: newsletter CTA, navigation columns, social links, and section headings.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    // ── Newsletter Section ──
    {
      name: 'newsletterHeading',
      type: 'text',
      localized: true,
      label: 'Newsletter Heading',
      admin: {
        description:
          'Heading for the newsletter section (DE: "Werde Teil der FermentFreude Bewegung").',
      },
    },
    {
      name: 'freeRecipesLabel',
      type: 'text',
      localized: true,
      label: 'Free Recipes Label',
      admin: {
        description: 'Badge text next to the newsletter (DE: "Kostenlose Workshop-Rezepte").',
      },
    },
    {
      name: 'accentColor',
      type: 'text',
      label: 'Accent Color',
      admin: {
        description:
          'Custom footer accent color for the badge and hover states (e.g. #e6be68, #d4a017, rgb(230,190,104)).',
        placeholder: '#e6be68',
      },
    },
    // ── Section Headings ──
    {
      name: 'quickLinksHeading',
      type: 'text',
      localized: true,
      label: 'Quick Links Column Heading',
      admin: {
        description:
          'Heading above the quick links column (DE: "Schnellzugriff", EN: "Quick Links").',
      },
    },
    {
      name: 'workshopsHeading',
      type: 'text',
      localized: true,
      label: 'Workshops Column Heading',
      admin: {
        description: 'Heading above the workshops column (DE: "Workshops").',
      },
    },
    {
      name: 'legalHeading',
      type: 'text',
      localized: true,
      label: 'Legal Column Heading',
      admin: {
        description: 'Heading above the legal links column (DE: "Rechtliches", EN: "Legal Info").',
      },
    },
    {
      name: 'followUsHeading',
      type: 'text',
      localized: true,
      label: 'Follow Us Column Heading',
      admin: {
        description: 'Heading above social media links (DE: "Folge uns", EN: "Follow Us").',
      },
    },
    {
      name: 'copyrightText',
      type: 'text',
      localized: true,
      label: 'Copyright Text',
      admin: {
        description:
          'Copyright line at the bottom. The year is added automatically (e.g. "FermentFreude — All Rights Reserved").',
      },
    },
    // ── Navigation Columns ──
    {
      name: 'navItems',
      type: 'array',
      label: 'Quick Links',
      admin: {
        description: 'Links shown in the "Quick Links" column.',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
    },
    {
      name: 'workshopLinks',
      type: 'array',
      label: 'Workshop Links',
      admin: {
        description: 'Links shown in the "Our Workshops" column.',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal Links',
      admin: {
        description: 'Links shown in the "Legal" column (e.g. Datenschutz, AGB, Impressum).',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    // ── Contact & Social ──
    {
      name: 'location',
      type: 'textarea',
      localized: true,
      label: 'Location Address',
      admin: {
        description:
          'Address displayed in the footer (e.g. "Grabenstraße 15, 8010 Graz, Austria").',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      admin: {
        description: 'Contact phone number.',
      },
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook URL',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram URL',
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
      ],
    },
  ],
}
