import type { Block } from 'payload'

/* Home page teaser: one recipe ("Rezept der Woche") with a big photo,
 * its name and short description, and links to the recipe and /rezepte. */
export const RecipeTeaser: Block = {
  slug: 'recipeTeaser',
  interfaceName: 'RecipeTeaserBlock',
  labels: {
    singular: 'Rezept der Woche (Teaser)',
    plural: 'Rezept-Teaser',
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: { description: 'Toggle off to hide this section on the page without deleting it.' },
    },
    {
      name: 'recipe',
      type: 'relationship',
      relationTo: 'recipes',
      label: 'Recipe',
      admin: {
        description:
          'Leave empty to show the "Rezept der Woche" chosen on Rezepte-Seite → Hero (so you only pick it in one place). If that is empty too, the first highlighted recipe is shown.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Small text above',
      admin: { description: 'Default: "Rezept der Woche" / "Recipe of the week".' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'recipeButton',
          type: 'text',
          localized: true,
          label: 'Button to the recipe',
          admin: { width: '50%', description: 'Default: "Zum Rezept" / "View recipe".' },
        },
        {
          name: 'allButton',
          type: 'text',
          localized: true,
          label: 'Link to all recipes',
          admin: { width: '50%', description: 'Default: "Alle Rezepte" / "All recipes".' },
        },
      ],
    },
  ],
}
