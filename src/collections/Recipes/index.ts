import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'

import { PARTNER_DISCLOSURES, RECIPE_CATEGORIES, RECIPE_DIFFICULTIES } from './categories'

/* ═══════════════════════════════════════════════════════════════
 *  Recipes Collection — /rezepte and /rezepte/[slug]
 *
 *  One clean template for every recipe. Founders fill structured
 *  fields; the page builds Google/Pinterest recipe data (JSON-LD)
 *  and SEO tags from them automatically.
 *
 *  Tabs:  Rezept · Partner (optional, sponsored) · Verknüpfungen · SEO
 * ═══════════════════════════════════════════════════════════════ */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Fill the slug from the German title when the editor leaves it empty. */
const autoSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (data && !data.slug && typeof data.title === 'string' && data.title.trim()) {
    data.slug = slugify(data.title)
  }
  // /rezepte/<kategorie> is the category page → a recipe can't take that address.
  // Fixed here (not only in `validate`) because Payload skips validation for drafts.
  if (data && typeof data.slug === 'string' && RECIPE_CATEGORIES.some((c) => c.value === data.slug)) {
    data.slug = `${data.slug}-rezept`
  }
  return data
}

const de = (o: { label: { de: string } }) => o.label.de

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  labels: { singular: 'Rezept', plural: 'Rezepte' },
  admin: {
    useAsTitle: 'title',
    group: 'Inhalt',
    description:
      'Rezepte für /rezepte. Jedes Rezept bekommt eine eigene Seite (/rezepte/[slug]) im gleichen Layout. Google- und Pinterest-Rezeptdaten werden automatisch aus den Feldern erzeugt.',
    defaultColumns: ['title', 'category', '_status', 'updatedAt'],
    pagination: { defaultLimit: 25 },
    // "Vorschau" button: opens /rezepte/<slug>; drafts are visible there for logged-in admins only
    preview: (doc) => (doc?.slug ? `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/rezepte/${doc.slug}` : null),
    components: {
      // shortcut to /admin/rezepte-import (many recipes from a spreadsheet)
      beforeListTable: ['/components/admin/RecipeImportLink#RecipeImportLink'],
    },
  },
  access: {
    read: adminOrPublishedStatus,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [autoSlug],
    beforeChange: [populatePublishedAt],
    afterChange: [autoTranslateCollection],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Rezeptname',
      admin: { description: 'z. B. „Klassisches Sauerkraut". Erscheint als Überschrift und in Google.' },
    },

    // ── Sidebar ────────────────────────────────────────────
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'URL',
      // /rezepte/<kategorie> shows the category page, so a recipe can't use those addresses
      validate: (value: string | null | undefined) =>
        value && RECIPE_CATEGORIES.some((c) => c.value === value)
          ? `„${value}" ist schon die Adresse einer Kategorie-Seite. Bitte eine andere URL wählen, z. B. „${value}-rezept".`
          : true,
      admin: {
        position: 'sidebar',
        description:
          'Wird automatisch aus dem Namen erzeugt (z. B. „klassisches-sauerkraut"). Nach dem Veröffentlichen nicht mehr ändern. fermentieren, einlegen, tempeh und kombucha sind die Kategorie-Seiten – daraus wird automatisch z. B. „kombucha-rezept".',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Kategorie',
      options: RECIPE_CATEGORIES.map((c) => ({ label: de(c), value: c.value })),
      admin: { position: 'sidebar', description: 'Eine der vier Kategorien auf /rezepte.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Hervorheben',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Erscheint ganz oben auf /rezepte.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Veröffentlicht am',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description:
          'Nur das Datum. Wird beim ersten Veröffentlichen automatisch gesetzt (leer lassen). Online geht das Rezept erst mit dem Button „Veröffentlichen" oben rechts.',
      },
    },

    {
      type: 'tabs',
      tabs: [
        // ── Tab 1: Recipe ──────────────────────────────────
        {
          label: 'Rezept',
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              label: 'Kurzbeschreibung',
              admin: {
                description:
                  '1–2 Sätze. Erscheint auf der Karte, unter dem Titel und als Google-Beschreibung (max. ~155 Zeichen).',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Titelbild (Querformat)',
                  admin: {
                    width: '50%',
                    description: 'Querformat 3:2, mind. 1600 px breit. Für Seite, Karte und Google.',
                  },
                },
                {
                  name: 'pinterestImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Pinterest-Bild (Hochformat)',
                  admin: {
                    width: '50%',
                    description: 'Optional. Hochformat 2:3 (z. B. 1000×1500 px) — wird beim Pinnen bevorzugt.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'prepMinutes',
                  type: 'number',
                  min: 0,
                  label: 'Zubereitung (Minuten)',
                  admin: { width: '25%', description: 'Aktive Arbeitszeit.' },
                },
                {
                  name: 'fermentationDays',
                  type: 'number',
                  min: 0,
                  label: 'Fermentation (Tage)',
                  admin: { width: '25%', description: 'Leer lassen, wenn nicht fermentiert wird.' },
                },
                {
                  name: 'yield',
                  type: 'text',
                  localized: true,
                  label: 'Menge',
                  admin: { width: '25%', description: 'z. B. „1 Glas (1 l)" oder „4 Portionen".' },
                },
                {
                  name: 'difficulty',
                  type: 'select',
                  label: 'Schwierigkeit',
                  defaultValue: 'leicht',
                  options: RECIPE_DIFFICULTIES.map((d) => ({ label: de(d), value: d.value })),
                  admin: { width: '25%' },
                },
              ],
            },
            {
              name: 'vessel',
              type: 'text',
              localized: true,
              label: 'Gefäß',
              admin: {
                description: 'Optional, z. B. „500-ml-Rex-, Weck- oder Bügelglas, mit Gewicht".',
              },
            },
            {
              name: 'whyItWorks',
              type: 'textarea',
              localized: true,
              label: 'Warum es funktioniert (David)',
              admin: {
                description:
                  'Optional: kurze Erklärung, was im Glas passiert. Erscheint als hervorgehobener Kasten über der Zubereitung.',
              },
            },
            {
              name: 'ingredientGroups',
              type: 'array',
              label: 'Zutaten',
              labels: { singular: 'Zutaten-Gruppe', plural: 'Zutaten-Gruppen' },
              minRows: 1,
              admin: {
                description:
                  'Meist reicht eine Gruppe ohne Titel. Mehrere Gruppen z. B. für „Lake" und „Gemüse".',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  label: 'Gruppen-Titel (optional)',
                  admin: { description: 'z. B. „Für die Lake". Leer lassen, wenn es nur eine Gruppe gibt.' },
                },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Zutaten',
                  labels: { singular: 'Zutat', plural: 'Zutaten' },
                  minRows: 1,
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'amount',
                          type: 'text',
                          localized: true,
                          label: 'Menge',
                          admin: {
                            width: '25%',
                            description: 'z. B. „1 kg", „20 g", „2 EL". Englisch z. B. „2 tbsp" – leer = wie Deutsch.',
                          },
                        },
                        {
                          name: 'name',
                          type: 'text',
                          required: true,
                          localized: true,
                          label: 'Zutat',
                          admin: { width: '40%' },
                        },
                        {
                          name: 'note',
                          type: 'text',
                          localized: true,
                          label: 'Hinweis',
                          admin: { width: '35%', description: 'z. B. „fein gehobelt".' },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'steps',
              type: 'array',
              label: 'Zubereitung',
              labels: { singular: 'Schritt', plural: 'Schritte' },
              minRows: 1,
              admin: { description: 'Ein Schritt = ein klarer Arbeitsschritt. Foto optional.' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  label: 'Kurztitel (optional)',
                  admin: { description: 'z. B. „Gemüse vorbereiten", „Ansetzen", „Fermentieren".' },
                },
                {
                  name: 'text',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  label: 'Beschreibung',
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Foto (optional)',
                  admin: {
                    description:
                      'Ein Foto genau von diesem Schritt (z. B. Kraut ins Glas drücken). Querformat 3:2, z. B. 1200×800 px. Erscheint neben dem Schritt – macht das Rezept viel appetitlicher.',
                  },
                },
              ],
            },
            {
              name: 'fermentLog',
              type: 'array',
              label: 'Was du bemerkst (Tag für Tag)',
              labels: { singular: 'Beobachtung', plural: 'Beobachtungen' },
              admin: {
                description:
                  'Optional, hilft Anfängern: was man an welchem Tag sieht, riecht oder schmeckt, z. B. Tag 1 „Erste kleine Bläschen", Tag 3 „Riecht angenehm säuerlich". Erscheint unter der Zeitleiste. Nur sichtbar, wenn Fermentationstage eingetragen sind.',
                condition: (data) => Boolean(data?.fermentationDays),
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'day',
                      type: 'number',
                      required: true,
                      min: 0,
                      label: 'Tag',
                      admin: { width: '20%', description: '0 = am Tag des Ansetzens.' },
                    },
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Was passiert',
                      admin: { width: '80%', description: 'Kurz, z. B. „Erste kleine Bläschen steigen auf".' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'tips',
              type: 'array',
              label: 'Tipps',
              labels: { singular: 'Tipp', plural: 'Tipps' },
              admin: { description: 'Optional: Profi-Tipps, häufige Fehler, Varianten.' },
              fields: [
                { name: 'text', type: 'textarea', required: true, localized: true, label: 'Tipp' },
              ],
            },
            {
              name: 'keywords',
              type: 'text',
              localized: true,
              label: 'Stichwörter',
              admin: {
                description:
                  'Optional, mit Komma getrennt (z. B. „Sauerkraut, Weißkraut, probiotisch"). Hilft Google & Pinterest.',
              },
            },
          ],
        },

        // ── Tab 2: Partner (sponsored) ─────────────────────
        {
          label: 'Partner',
          description:
            'Nur für bezahlte Kooperationen. Ist „Partner anzeigen" aus, ist auf der Seite nichts davon zu sehen.',
          fields: [
            {
              name: 'partner',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Partner anzeigen',
                  defaultValue: false,
                },
                {
                  name: 'disclosure',
                  type: 'select',
                  label: 'Kennzeichnung',
                  defaultValue: 'kooperation',
                  options: PARTNER_DISCLOSURES.map((d) => ({ label: de(d), value: d.value })),
                  admin: {
                    condition: (_, s) => Boolean(s?.enabled),
                    description:
                      'Erscheint unter dem Titel, z. B. „In Kooperation mit Musterglas". Bei bezahlten Kooperationen (Geld oder Gratis-Produkte) rechtlich „Anzeige" oder „Werbung" wählen.',
                  },
                },
                {
                  type: 'row',
                  admin: { condition: (_, s) => Boolean(s?.enabled) },
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      localized: true,
                      label: 'Marke / Partner',
                      admin: { width: '50%', description: 'Erscheint als „In Kooperation mit <Marke>" unter dem Titel.' },
                    },
                    {
                      name: 'logo',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Logo',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'text',
                  type: 'textarea',
                  localized: true,
                  label: 'Text',
                  admin: {
                    condition: (_, s) => Boolean(s?.enabled),
                    description: 'Kurz: welches Produkt wurde verwendet und warum.',
                  },
                },
                {
                  type: 'row',
                  admin: { condition: (_, s) => Boolean(s?.enabled) },
                  fields: [
                    {
                      name: 'linkUrl',
                      type: 'text',
                      label: 'Link (https://…)',
                      admin: { width: '60%' },
                    },
                    {
                      name: 'linkLabel',
                      type: 'text',
                      localized: true,
                      label: 'Button-Text',
                      admin: { width: '40%', description: 'z. B. „Zum Produkt".' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ── Tab 3: Links to workshops & shop ───────────────
        {
          label: 'Verknüpfungen',
          description:
            'Optional. Leer lassen = passender Workshop zur Kategorie wird automatisch verlinkt.',
          fields: [
            {
              name: 'relatedWorkshop',
              type: 'relationship',
              relationTo: 'workshops',
              label: 'Passender Workshop',
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              maxRows: 3,
              label: 'Passende Produkte (max. 3)',
            },
          ],
        },

        // ── Tab 4: SEO ─────────────────────────────────────
        {
          name: 'meta',
          label: 'SEO',
          description:
            'Optional. Leer lassen = Titel, Kurzbeschreibung und Titelbild werden automatisch verwendet.',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
  ],
}
