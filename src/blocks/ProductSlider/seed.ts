/**
 * Seed data builder for the ProductSlider block.
 *
 * Text-only — products are linked via relationship field
 * and can be selected in the admin dashboard.
 */

export function buildProductSlider(opts?: { productIds?: string[] }) {
  const de = {
    blockType: 'productSlider' as const,
    heading: 'Entdecke EINZIGARTIGE.',
    headingAccent: 'GESCHMÄCKER',
    description:
      'Tauche ein in die Welt der Fermentations-Innovation bei FermentFreude. Unsere sorgfältig kuratierte Auswahl vereint die neuesten Geschmacksrichtungen und zeitlose Klassiker, damit du für jeden Anlass den perfekten Genuss findest.',
    buttonLabel: 'Alle Produkte ansehen',
    buttonLink: '/products',
    products: opts?.productIds ?? [],
  }

  const en = {
    blockType: 'productSlider' as const,
    heading: 'Discover UNIQUE.',
    headingAccent: 'FLAVOURS',
    description:
      'Dive into a world of fermentation innovation at FermentFreude. Our carefully curated products bring together the latest flavours and timeless classics, ensuring you find the perfect taste for every occasion.',
    buttonLabel: 'View All Products',
    buttonLink: '/products',
    products: opts?.productIds ?? [],
  }

  return { de, en }
}

type ProductSliderBlock = {
  id?: string
}

export function mergeProductSliderEN(
  en: ReturnType<typeof buildProductSlider>['en'],
  fresh: ProductSliderBlock,
) {
  return {
    ...en,
    id: fresh.id,
  }
}
