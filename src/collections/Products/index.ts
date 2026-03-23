import { isAdmin } from '@/access/isAdmin'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { DefaultDocumentIDType, slugField, Where } from 'payload'

/* ── Helper: condition functions for productType ── */
const isFood = (data: Record<string, unknown>) =>
  ['jarred', 'fresh', 'bottled'].includes(data?.productType as string)
const isBottled = (data: Record<string, unknown>) => data?.productType === 'bottled'
const isFresh = (data: Record<string, unknown>) => data?.productType === 'fresh'
const isDigitalCourse = (data: Record<string, unknown>) => data?.productType === 'digital-course'
const isWorkshop = (data: Record<string, unknown>) => data?.productType === 'workshop'

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  access: {
    ...defaultCollection?.access,
    delete: isAdmin,
  },
  hooks: {
    ...defaultCollection?.hooks,
    afterChange: [...(defaultCollection?.hooks?.afterChange || []), autoTranslateCollection],
  },
  admin: {
    ...defaultCollection?.admin,
    group: 'Shop',
    defaultColumns: ['title', 'productType', 'priceInEUR', 'inventory', '_status'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    productType: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    priceInEUR: true,
    inventory: true,
    meta: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'productType',
      type: 'select',
      required: true,
      defaultValue: 'jarred',
      admin: {
        description:
          'Wähle den Produkttyp — je nach Auswahl erscheinen unterschiedliche Felder. / Select the product type — different fields appear depending on the selection.',
      },
      options: [
        { label: 'Im Glas (Kimchi, Gemüse, etc.)', value: 'jarred' },
        { label: 'Frisch (Tempeh)', value: 'fresh' },
        { label: 'Flasche (Kombucha)', value: 'bottled' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Online-Kurs', value: 'digital-course' },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        /* ── Tab 1: Content (all product types) ── */
        {
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              label: 'Kurzbeschreibung / Short Description',
              admin: {
                description:
                  'Ein kurzer Satz für die Produktseite unter dem Titel (max. 2–3 Zeilen). / A short sentence displayed below the title on the product page.',
              },
            },
            {
              name: 'brand',
              type: 'text',
              localized: true,
              label: 'Marke / Brand',
              admin: {
                description:
                  'Markenname, z.B. "FermentFreude". Wird in der Produkt-Infotabelle angezeigt. / Brand name shown in the product specs table.',
              },
            },
            {
              name: 'flavour',
              type: 'text',
              localized: true,
              label: 'Geschmack / Flavour',
              admin: {
                description:
                  'Geschmacksrichtung, z.B. "Ingwer & Zitrone". Wird in der Produkt-Infotabelle angezeigt. / Flavour shown in the product specs table.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              label: 'Ausführliche Beschreibung / Full Description',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              required: false,
              admin: {
                description: 'Wird im aufklappbaren "Über das Produkt" Bereich angezeigt.',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map(
                        (item: Record<string, unknown> | string) => {
                          if (typeof item === 'object' && item?.id) {
                            return item.id
                          }
                          return item
                        },
                      ) as DefaultDocumentIDType[]

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },
            {
              name: 'benefits',
              type: 'array',
              label: 'Vorteile / Benefits',
              labels: { singular: 'Vorteil', plural: 'Vorteile' },
              admin: {
                description:
                  'Vorteile werden als farbige Badges auf der Produktseite angezeigt (z.B. "Soothing + Purifying", "Reduces Redness").',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Label',
                  admin: {
                    description: 'z.B. "Probiotisch", "Gut für die Darmflora"',
                  },
                },
              ],
            },
            {
              name: 'badges',
              type: 'select',
              hasMany: true,
              label: 'Produkt-Badges',
              admin: {
                description:
                  'Badges werden als Icons auf der Produktseite angezeigt (z.B. Vegan, Handmade, Bio).',
              },
              options: [
                { label: '🌱 Vegan', value: 'vegan' },
                { label: '🥬 Vegetarisch / Vegetarian', value: 'vegetarian' },
                { label: '🤲 Handgemacht / Handmade', value: 'handmade' },
                { label: '🌿 Bio / Organic', value: 'organic' },
                { label: '🚫 Glutenfrei / Gluten-Free', value: 'gluten-free' },
                { label: '💪 Probiotisch / Probiotic', value: 'probiotic' },
                { label: '🫙 Natürlich fermentiert / Naturally Fermented', value: 'fermented' },
                { label: '🌾 Ohne Zusatzstoffe / No Additives', value: 'no-additives' },
                { label: '❄️ Kühlware / Refrigerated', value: 'refrigerated' },
              ],
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: 'Content',
        },

        /* ── Tab 2: Product Details Page — Accordion Sections ── */
        {
          label: 'Produktseite / PDP Sections',
          admin: {
            description:
              'Diese Felder erscheinen als aufklappbare Abschnitte auf der Produktdetailseite.',
          },
          fields: [
            {
              name: 'aboutProduct',
              type: 'richText',
              localized: true,
              label: 'Über das Produkt / About This Product',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
              admin: {
                description:
                  'Aufklappbarer Bereich "Über das Produkt" — Geschichte, Herstellung, besondere Eigenschaften.',
              },
            },
            {
              name: 'howToUse',
              type: 'richText',
              localized: true,
              label: 'Verwendung / How to Use',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
              admin: {
                description:
                  'Aufklappbarer Bereich "Wie verwenden?" — Serviervorschläge, Rezeptideen.',
              },
            },
            {
              name: 'userInstructions',
              type: 'richText',
              localized: true,
              label: 'Hinweise / Instructions Before Use',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
              admin: {
                description:
                  'Aufklappbarer Bereich "Hinweise vor dem Gebrauch" — Lagerung, Öffnungshinweise.',
              },
            },
          ],
        },

        /* ── Tab 2: Food Details (jarred, fresh, bottled only) ── */
        {
          label: 'Produktinfo / Food Details',
          admin: {
            condition: isFood,
          },
          fields: [
            {
              name: 'unitSize',
              type: 'text',
              localized: true,
              label: 'Einheit / Unit Size',
              admin: {
                description: 'z.B. "350g", "200ml", "1 Stück"',
              },
            },
            {
              name: 'ingredients',
              type: 'textarea',
              localized: true,
              label: 'Zutaten / Ingredients',
              admin: {
                description: 'Zutatenliste für das Etikett und die Produktseite.',
              },
            },
            {
              name: 'allergens',
              type: 'textarea',
              localized: true,
              label: 'Allergene / Allergens',
              admin: {
                description: 'z.B. "Enthält Soja" / "Contains soy"',
              },
            },
            {
              name: 'storageInstructions',
              type: 'textarea',
              localized: true,
              label: 'Lagerung / Storage',
              admin: {
                description:
                  'z.B. "Kühl lagern, nach dem Öffnen innerhalb von 4 Wochen verbrauchen"',
              },
            },
            {
              name: 'shelfLife',
              type: 'text',
              localized: true,
              label: 'Haltbarkeit / Shelf Life',
              admin: {
                description: 'z.B. "6 Monate ungeöffnet" / "6 months unopened"',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'isOrganic',
                  type: 'checkbox',
                  label: 'Bio / Organic',
                  defaultValue: false,
                  admin: { width: '33%' },
                },
                {
                  name: 'isVegan',
                  type: 'checkbox',
                  label: 'Vegan',
                  defaultValue: false,
                  admin: { width: '33%' },
                },
                {
                  name: 'isGlutenFree',
                  type: 'checkbox',
                  label: 'Glutenfrei / Gluten-Free',
                  defaultValue: false,
                  admin: { width: '33%' },
                },
              ],
            },
            // Bottled-only fields
            {
              name: 'volumeML',
              type: 'number',
              label: 'Volumen (ml)',
              min: 0,
              admin: {
                condition: isBottled,
                description: 'Flaschenvolumen in Milliliter',
              },
            },
            {
              name: 'alcoholContent',
              type: 'text',
              label: 'Alkoholgehalt / Alcohol Content',
              admin: {
                condition: isBottled,
                description: 'z.B. "< 0.5%"',
              },
            },
            // Fresh-only fields
            {
              name: 'weightGrams',
              type: 'number',
              label: 'Gewicht (g)',
              min: 0,
              admin: {
                condition: isFresh,
                description: 'Gewicht in Gramm',
              },
            },
            {
              name: 'bestBefore',
              type: 'text',
              localized: true,
              label: 'Mindesthaltbarkeit / Best Before',
              admin: {
                condition: isFresh,
                description: 'z.B. "3 Tage nach Kauf" / "3 days after purchase"',
              },
            },
          ],
        },

        /* ── Tab 3: Workshop Details (workshop only) ── */
        {
          label: 'Workshop Details',
          admin: {
            condition: isWorkshop,
          },
          fields: [
            {
              name: 'workshopRef',
              type: 'relationship',
              relationTo: 'workshops',
              label: 'Verknüpfter Workshop / Linked Workshop',
              admin: {
                description:
                  'Verknüpfe dieses Produkt mit einem Workshop aus der Workshop-Sammlung. Termine und Buchungen werden dort verwaltet.',
              },
            },
          ],
        },

        /* ── Tab 4: Course Details (digital-course only) ── */
        {
          label: 'Kurs Details / Course Details',
          admin: {
            condition: isDigitalCourse,
          },
          fields: [
            {
              name: 'courseSlug',
              type: 'text',
              label: 'Kurs-Slug / Course Slug',
              admin: {
                description:
                  'Slug des Online-Kurses (z.B. "basic-fermentation"). Käufer werden automatisch eingeschrieben.',
              },
            },
            {
              name: 'courseDuration',
              type: 'text',
              localized: true,
              label: 'Kursdauer / Course Duration',
              admin: {
                description: 'z.B. "4 Stunden" / "4 hours"',
              },
            },
            {
              name: 'courseLevel',
              type: 'select',
              label: 'Schwierigkeitsgrad / Level',
              options: [
                { label: 'Anfänger / Beginner', value: 'beginner' },
                { label: 'Fortgeschritten / Intermediate', value: 'intermediate' },
                { label: 'Profi / Advanced', value: 'advanced' },
              ],
            },
          ],
        },

        /* ── Tab 5: Product Details (plugin fields + related) ── */
        {
          fields: [
            ...defaultCollection.fields,
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
          ],
          label: 'Product Details',
        },

        /* ── Tab 6: SEO ── */
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField(),
  ],
})
