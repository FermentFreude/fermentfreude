import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/* ═══════════════════════════════════════════════════════════════
 *  "Hat's geschmeckt?" — star votes on recipe pages.
 *
 *  Written ONLY by POST /api/recipes/rate (server-side, with limits):
 *  one vote per person and recipe (voting again changes the vote),
 *  max. votes per connection per hour. No IP is stored, only salted
 *  hashes. Admins can read and delete; nobody can create or edit
 *  through the API/admin.
 * ═══════════════════════════════════════════════════════════════ */
export const RecipeRatings: CollectionConfig = {
  slug: 'recipe-ratings',
  labels: { singular: 'Rezept-Bewertung', plural: 'Rezept-Bewertungen' },
  admin: {
    group: 'Inhalt',
    defaultColumns: ['recipe', 'stars', 'updatedAt'],
    description:
      'Sterne von Besuchern („Hat\'s geschmeckt?") auf den Rezeptseiten. Eine Stimme pro Person und Rezept. Unpassende Einträge kannst du löschen; neue kommen nur über die Website.',
  },
  access: {
    read: adminOnly,
    create: () => false,
    update: () => false,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'recipe',
      type: 'relationship',
      relationTo: 'recipes',
      required: true,
      index: true,
      label: 'Rezept',
      admin: { readOnly: true },
    },
    {
      name: 'stars',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      label: 'Sterne (1–5)',
      admin: { readOnly: true },
    },
    {
      // salted hash of connection + browser + recipe: "same person, same recipe"
      name: 'voter',
      type: 'text',
      required: true,
      index: true,
      admin: { hidden: true },
    },
    {
      // salted hash of the connection only: for the hourly limit
      name: 'ipHash',
      type: 'text',
      required: true,
      index: true,
      admin: { hidden: true },
    },
  ],
  timestamps: true,
}
