/**
 * Seed Product Detail Labels global (DE + EN) for food PDP chrome.
 * Run: pnpm exec tsx src/scripts/patch-product-detail-labels.ts
 */
import path from 'path'
import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const LABELS_DE = {
  backToShopLabel: 'Zurück zum Shop',
  addToCartLabel: 'In den Warenkorb',
  soldOutLabel: 'Ausverkauft',
  seasonalBadgeLabel: 'Saisonal',
  deliveryNotice: 'Abholung in Graz, jede Woche frisch.',
  navDetailsLabel: 'Produktdetails',
  navTastePrepLabel: 'Geschmack & Zubereitung',
  navStorageLabel: 'Lagerung',
  groupDetailsTitle: 'Produktdetails',
  groupDetailsDescription:
    'Alles Wichtige auf einen Blick, inklusive Zutaten und Allergene.',
  glanceTitle: 'Auf einen Blick',
  weightLabel: 'Gewicht',
  portionLabel: 'Portion',
  originLabel: 'Herkunft',
  madeInLabel: 'Hergestellt',
  ingredientsLabel: 'Zutaten',
  allergensLabel: 'Allergene',
  ingredientsDisclaimer:
    'Die Zutatenliste kann sich ändern. Bitte entnehmen Sie die aktuellsten Angaben der Produktverpackung.',
  groupTasteTitle: 'Geschmack & Zubereitung',
  groupTasteDescription: 'So schmeckt es und wie du es am besten genießt.',
  tasteSectionLabel: 'So schmeckt er',
  tasteSectionLabelNeutral: 'So schmeckt es',
  groupStorageTitle: 'Lagerung & Haltbarkeit',
  groupStorageDescription: 'Damit es frisch und lecker bleibt.',
  storageShelfLifeLabel: 'Lagerung',
  shelfLifeLabel: 'Haltbarkeit',
  bestBeforeLabel: 'Mindesthaltbarkeit',
  howToUseLabel: 'Verwendung',
  instructionsBeforeUseLabel: 'Nach dem Öffnen',
  relatedTitle: 'Das könnte dir auch schmecken',
  shopFooterTitle: 'Mehr entdecken',
  shopFooterDescription:
    'Von Hand in Graz hergestellt: frische Fermente, voller Geschmack und voller Leben. Tempeh, Kimchi und weitere Spezialitäten aus unserer Manufaktur, jede Woche frisch zur Abholung.',
  shopFooterCta: 'Zum Shop',
}

const LABELS_EN = {
  backToShopLabel: 'Back to shop',
  addToCartLabel: 'Add to bag',
  soldOutLabel: 'Sold out',
  seasonalBadgeLabel: 'Seasonal',
  deliveryNotice: 'Pickup in Graz, fresh every week.',
  navDetailsLabel: 'Product details',
  navTastePrepLabel: 'Taste & preparation',
  navStorageLabel: 'Storage',
  groupDetailsTitle: 'Product details',
  groupDetailsDescription: 'Everything at a glance, including ingredients and allergens.',
  glanceTitle: 'At a glance',
  weightLabel: 'Weight',
  portionLabel: 'Portion',
  originLabel: 'Origin',
  madeInLabel: 'Made in',
  ingredientsLabel: 'Ingredients',
  allergensLabel: 'Allergens',
  ingredientsDisclaimer:
    'This ingredient list is subject to change. Please refer to the product label for the most accurate information.',
  groupTasteTitle: 'Taste & preparation',
  groupTasteDescription: 'How it tastes and the best way to enjoy it.',
  tasteSectionLabel: 'How it tastes',
  tasteSectionLabelNeutral: 'How it tastes',
  groupStorageTitle: 'Storage & shelf life',
  groupStorageDescription: 'Keep it fresh and delicious.',
  storageShelfLifeLabel: 'Storage',
  shelfLifeLabel: 'Shelf life',
  bestBeforeLabel: 'Best before',
  howToUseLabel: 'How to use',
  instructionsBeforeUseLabel: 'After opening',
  relatedTitle: 'You might also like',
  shopFooterTitle: 'Discover more',
  shopFooterDescription:
    'Made by hand in Graz: fresh ferments, full of flavour and full of life. Tempeh, kimchi and more from our workshop, ready for pickup every week.',
  shopFooterCta: 'Visit the shop',
}

async function main() {
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  payload.logger.info('📝 Patching Product Detail Labels global (DE/EN)…')

  await payload.updateGlobal({
    slug: 'product-detail-labels-global',
    locale: 'de',
    data: LABELS_DE,
    context: CTX,
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'product-detail-labels-global',
    locale: 'en',
    data: LABELS_EN,
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info('✅ Product Detail Labels seeded. Check Globals → Product Detail Labels.')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
