import type { GlobalConfig } from 'payload'

import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

/**
 * Shared PDP chrome labels (section titles, nav, footer, field labels).
 * Product-specific story/copy lives on the Product document.
 */
export const ProductDetailLabelsGlobal: GlobalConfig = {
  slug: 'product-detail-labels-global',
  label: 'Product Detail Labels',
  admin: {
    group: 'Website',
    description:
      'Texte & Überschriften der Produktdetailseite (alle Lebensmittelprodukte). / Labels and section titles for the food product detail page.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Navigation & Actions',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'backToShopLabel',
          type: 'text',
          localized: true,
          label: 'Zurück zum Shop / Back to Shop',
          admin: { description: 'Link oben auf der Produktseite.' },
        },
        {
          name: 'addToCartLabel',
          type: 'text',
          localized: true,
          label: 'In den Warenkorb / Add to Cart',
        },
        {
          name: 'soldOutLabel',
          type: 'text',
          localized: true,
          label: 'Ausverkauft / Sold Out',
        },
        {
          name: 'seasonalBadgeLabel',
          type: 'text',
          localized: true,
          label: 'Saisonal-Badge / Seasonal Badge',
        },
        {
          name: 'deliveryNotice',
          type: 'textarea',
          localized: true,
          label: 'Abhol-/Lieferhinweis / Pickup Notice',
          admin: {
            description: 'Kleine Zeile unter dem Warenkorb-Button, z. B. Abholung in Graz.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Section Nav (Anker-Links)',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'navDetailsLabel',
          type: 'text',
          localized: true,
          label: 'Nav: Produktdetails',
        },
        {
          name: 'navTastePrepLabel',
          type: 'text',
          localized: true,
          label: 'Nav: Geschmack & Zubereitung',
        },
        {
          name: 'navStorageLabel',
          type: 'text',
          localized: true,
          label: 'Nav: Lagerung',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Section: Produktdetails',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'groupDetailsTitle',
          type: 'text',
          localized: true,
          label: 'Abschnittstitel Produktdetails',
        },
        {
          name: 'groupDetailsDescription',
          type: 'textarea',
          localized: true,
          label: 'Abschnittsbeschreibung Produktdetails',
        },
        {
          name: 'glanceTitle',
          type: 'text',
          localized: true,
          label: 'Auf einen Blick / At a Glance',
        },
        {
          name: 'weightLabel',
          type: 'text',
          localized: true,
          label: 'Label: Gewicht',
        },
        {
          name: 'portionLabel',
          type: 'text',
          localized: true,
          label: 'Label: Portion / Einheit',
        },
        {
          name: 'originLabel',
          type: 'text',
          localized: true,
          label: 'Label: Herkunft',
        },
        {
          name: 'madeInLabel',
          type: 'text',
          localized: true,
          label: 'Label: Hergestellt in',
        },
        {
          name: 'ingredientsLabel',
          type: 'text',
          localized: true,
          label: 'Label: Zutaten',
        },
        {
          name: 'allergensLabel',
          type: 'text',
          localized: true,
          label: 'Label: Allergene',
        },
        {
          name: 'ingredientsDisclaimer',
          type: 'textarea',
          localized: true,
          label: 'Zutaten-Hinweis / Ingredients Disclaimer',
          admin: {
            description: 'Kleiner Hinweis unter der Zutatenliste (Etikett gilt).',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Section: Geschmack & Zubereitung',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'groupTasteTitle',
          type: 'text',
          localized: true,
          label: 'Abschnittstitel Geschmack',
        },
        {
          name: 'groupTasteDescription',
          type: 'textarea',
          localized: true,
          label: 'Abschnittsbeschreibung Geschmack',
        },
        {
          name: 'tasteSectionLabel',
          type: 'text',
          localized: true,
          label: 'Geschmack-Label (Tempeh / „er“)',
          admin: { description: 'z. B. „So schmeckt er“' },
        },
        {
          name: 'tasteSectionLabelNeutral',
          type: 'text',
          localized: true,
          label: 'Geschmack-Label (Kimchi / neutral)',
          admin: { description: 'z. B. „So schmeckt es“ für Kimchi' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Section: Lagerung',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'groupStorageTitle',
          type: 'text',
          localized: true,
          label: 'Abschnittstitel Lagerung',
        },
        {
          name: 'groupStorageDescription',
          type: 'textarea',
          localized: true,
          label: 'Abschnittsbeschreibung Lagerung',
        },
        {
          name: 'storageShelfLifeLabel',
          type: 'text',
          localized: true,
          label: 'Label: Lagerung',
        },
        {
          name: 'shelfLifeLabel',
          type: 'text',
          localized: true,
          label: 'Label: Haltbarkeit',
        },
        {
          name: 'bestBeforeLabel',
          type: 'text',
          localized: true,
          label: 'Label: Mindesthaltbarkeit',
        },
        {
          name: 'howToUseLabel',
          type: 'text',
          localized: true,
          label: 'Label: Verwendung (Legacy)',
        },
        {
          name: 'instructionsBeforeUseLabel',
          type: 'text',
          localized: true,
          label: 'Label: Nach dem Öffnen',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Related & Shop Footer',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'relatedTitle',
          type: 'text',
          localized: true,
          label: 'Verwandte Produkte Titel',
          admin: { description: 'z. B. „Das könnte dir auch schmecken“' },
        },
        {
          name: 'shopFooterTitle',
          type: 'text',
          localized: true,
          label: 'Shop-Footer Titel',
        },
        {
          name: 'shopFooterDescription',
          type: 'textarea',
          localized: true,
          label: 'Shop-Footer Beschreibung',
        },
        {
          name: 'shopFooterCta',
          type: 'text',
          localized: true,
          label: 'Shop-Footer Button',
        },
      ],
    },
  ],
}
