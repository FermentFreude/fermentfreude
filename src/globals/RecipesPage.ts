import type { Field, GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'
import { RECIPE_LABEL_ADMIN, RECIPE_LABELS } from '@/app/(app)/rezepte/labels'
import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'

/* ═══════════════════════════════════════════════════════════════
 *  Rezepte-Seite (global) — texts and photos of the /rezepte landing
 *
 *  Tabs: Hero (headline, photo recipe) · Kategorien (name, intro,
 *  photo) · Rezepte & Workshop (gallery title, workshop card) ·
 *  Vorlagen-Texte (fixed template words).
 *  Every field falls back to an English/German default in code.
 * ═══════════════════════════════════════════════════════════════ */

type Opts = { description?: string; width?: string }
const text = (name: string, label: string, o: Opts | string = {}): Field => {
  const { description, width } = typeof o === 'string' ? { description: o, width: undefined } : o
  return { name, type: 'text', localized: true, label, admin: { description, width } }
}
const area = (name: string, label: string, description?: string): Field => ({
  name,
  type: 'textarea',
  localized: true,
  label,
  admin: { description },
})
const image = (name: string, label: string, description?: string): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  label,
  ...(description ? { admin: { description } } : {}),
})

export const RecipesPageGlobal: GlobalConfig = {
  slug: 'recipes-page',
  label: 'Rezepte-Seite',
  admin: {
    group: 'Inhalt',
    description:
      'Texte und Fotos der Seite /rezepte: großes Foto oben, Kategorien (Name, Kurztext, Foto), Workshop-Karte am Ende und die festen Wörter der Rezept-Vorlage. Die Rezepte selbst pflegst du unter „Rezepte". Leere Felder zeigen den Standardtext.',
  },
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [autoTranslateGlobal],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            text('eyebrow', 'Kleiner Text oben', 'z. B. „Rezepte".'),
            {
              type: 'row',
              fields: [
                text('title', 'Überschrift Zeile 1', { width: '60%', description: 'Weiß, z. B. „Aus dem Glas."' }),
                text('highlight', 'Überschrift Zeile 2', {
                  width: '40%',
                  description: 'Gold, z. B. „Auf den Teller."',
                }),
              ],
            },
            area('lead', 'Einleitung', 'Wird nicht auf der Seite angezeigt, nur als Google-Beschreibung verwendet.'),
            {
              name: 'heroRecipe',
              type: 'relationship',
              relationTo: 'recipes',
              label: 'Rezept der Woche',
              admin: {
                description:
                  'Sein Foto ist das große Bild oben auf /rezepte (mit Link „Rezept der Woche"), und es erscheint als „Rezept der Woche" auf der Startseite. Leer = erstes hervorgehobenes Rezept mit Foto.',
              },
            },
          ],
        },
        {
          label: 'Kategorien',
          name: 'categories',
          fields: [
            text('title', 'Überschrift', 'z. B. „Was setzt du heute an?".'),
            {
              name: 'items',
              type: 'array',
              label: 'Kategorie-Karten',
              maxRows: RECIPE_CATEGORIES.length,
              admin: {
                description:
                  'Pro Kategorie: Name, ein kurzer Text und ein Foto. Der Name steht auf der Karte, im Filter und auf der Kategorie-Seite; der Text erscheint oben auf der Kategorie-Seite (/rezepte/kombucha usw.).',
              },
              fields: [
                {
                  name: 'category',
                  type: 'select',
                  required: true,
                  label: 'Kategorie',
                  options: RECIPE_CATEGORIES.map((c) => ({ label: c.label.de, value: c.value })),
                },
                text('name', 'Name', 'Leer = Standard (z. B. „Gemüse fermentieren" / „Fermenting Vegetables").'),
                area('intro', 'Kurztext', 'Ein bis zwei Sätze, erscheinen oben auf der Kategorie-Seite.'),
                image('image', 'Foto', 'Querformat 4:3, z. B. 1200×900 px. Erscheint auf der Kategorie-Karte.'),
              ],
            },
          ],
        },
        {
          label: 'Rezepte & Workshop',
          name: 'featured',
          fields: [
            text('title', 'Überschrift über den Rezepten', 'z. B. „Frisch aus der Küche". Zeigt hervorgehobene Rezepte zuerst, dann die neuesten.'),
            text('bandEyebrow', 'Workshop-Karte: kleiner Text', 'Gelbes Schild, z. B. „Workshops".'),
            text('bandTitle', 'Workshop-Karte: Überschrift', 'z. B. „Lieber gemeinsam fermentieren?".'),
            area('bandText', 'Workshop-Karte: Text'),
            text('bandButton', 'Workshop-Karte: Button', 'z. B. „Termine ansehen".'),
            image('bandImage', 'Workshop-Karte: Foto', 'Querformat oder Hochformat, z. B. ein Foto vom Workshop-Tisch.'),
            {
              name: 'bandLink',
              type: 'text',
              label: 'Workshop-Karte: Link',
              defaultValue: '/workshops',
              admin: { description: 'Auf Kategorie-Seiten führt der Button automatisch zum passenden Workshop.' },
            },
          ],
        },
        {
          label: 'Notiz-Karte',
          name: 'note',
          description:
            'Die Karte „Warum es funktioniert" in jedem Rezept: Foto, Name und Rolle der Person, die den Tipp gibt. Den Text selbst schreibst du im Rezept (Feld „Warum es funktioniert").',
          fields: [
            image('photo', 'Foto', 'Quadratisches Porträt, z. B. 600×600 px. Wird rund angezeigt.'),
            {
              type: 'row',
              fields: [
                text('name', 'Name', { width: '40%', description: 'z. B. „David".' }),
                text('role', 'Rolle', { width: '60%', description: 'z. B. „Mitgründer von Fermentfreude".' }),
              ],
            },
          ],
        },
        {
          label: 'Vorlagen-Texte',
          name: 'labels',
          description:
            'Feste Wörter der Rezept-Vorlage (z. B. „Zutaten", „Zubereitung", „Leicht"). Leer lassen = Standard (grau im Feld). Oben rechts die Sprache wechseln, um die englischen Wörter zu bearbeiten.',
          fields: (Object.keys(RECIPE_LABELS.de) as Array<keyof (typeof RECIPE_LABELS)['de']>).map(
            (key): Field => ({
              name: key,
              type: 'text',
              localized: true,
              label: RECIPE_LABEL_ADMIN[key] ?? key,
              admin: {
                // grey example text = the standard wording (German / English)
                placeholder: `${RECIPE_LABELS.de[key]}  ·  EN: ${RECIPE_LABELS.en[key]}`,
                // words no longer shown on the site stay in the data but are hidden
                hidden: !RECIPE_LABEL_ADMIN[key],
              },
            }),
          ),
        },
      ],
    },
  ],
}
