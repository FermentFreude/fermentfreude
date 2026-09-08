/**
 * update-shop-products-and-cleanup.ts
 *
 * One-off production content update, per Rafaela's exact spec (2026-09-04):
 *   1. Updates title/description/food-detail fields on the 3 real shop products
 *      (Käferbohnen-Tempeh, Berglinsen-Tempeh, Kimchi). Gallery/inventory are
 *      left untouched — images are reused, inventory is managed in the CMS.
 *   2. Deletes 20 confirmed-junk product records (17 leftover ecommerce-template
 *      demo products — Kombucha/Sourdough/etc. that were never real — plus 3
 *      broken records with slug=undefined). Everything else (workshop products,
 *      the online-course product, fermentierte-curryzwiebel, fermentierte-rote-rueben)
 *      is explicitly left alone per user confirmation.
 *
 * This is a PRODUCTION-ONLY script by design (opposite of cleanup-test-orders.ts,
 * which refuses to run anywhere BUT staging) — it refuses to run against staging
 * to avoid confusion, since the hardcoded IDs below only exist in production.
 *
 * Usage:
 *   npx tsx -r dotenv/config src/scripts/update-shop-products-and-cleanup.ts          ← dry-run
 *   npx tsx -r dotenv/config src/scripts/update-shop-products-and-cleanup.ts --force  ← actually apply
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const DRY_RUN = !process.argv.includes('--force')

function assertProductionDatabase() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (dbUrl.includes('-staging') || !dbUrl.includes('fermentfreude')) {
    console.error(
      '\n🚫 REFUSING TO RUN: DATABASE_URL does not look like production.\n' +
        '   This script targets specific hardcoded production document IDs —\n' +
        '   it would silently do nothing useful (or worse, something wrong) elsewhere.\n',
    )
    process.exit(1)
  }
}

function buildDescription(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [
            {
              type: 'text' as const,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              text,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

const TEMPEH_CATEGORY_ID = '69bda7f6ceb641ccc6a2cd90'
const KIMCHI_CATEGORY_ID = '6a9b17aa51f1dd02f7d682de'

const PRODUCT_UPDATES = [
  {
    id: '69bc80524889efa4f93c7ae9', // kaeferbohnen-tempeh
    slug: 'kaeferbohnen-tempeh',
    data: {
      title: 'Käferbohnen-Tempeh',
      shortDescription:
        'Nussig-aromatisch, herzhaft und voller Umami – unser Tempeh aus steirischen Käferbohnen wird beim Anbraten außen goldbraun und bleibt innen schön saftig.',
      description: buildDescription(
        'Aus steirischen Käferbohnen fermentieren wir in Graz einen Tempeh mit nussig-aromatischem Geschmack, ausgeprägten Umami-Noten und saftigem Biss. Kräftig angebraten entwickelt er eine goldbraune Kruste und intensive Röstaromen. Er nimmt Marinaden hervorragend auf und lässt sich vielseitig kombinieren.',
      ),
      priceInEUR: 5.9,
      weightGrams: 185,
      unitSize: '1 Packung',
      ingredients:
        'Käferbohnen aus Österreich gekocht (97 %), Apfelessig, Starterkultur (Rhizopus oligosporus)',
      allergens: 'Keine der 14 kennzeichnungspflichtigen Hauptallergene als Zutaten',
      storageInstructions: 'Gekühlt lagern bei +2 °C bis +6 °C.',
      shelfLife: '6 Wochen',
      bestBefore: '6 Wochen',
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isSeasonal: false,
      categories: [TEMPEH_CATEGORY_ID],
      // Pre-existing empty placeholder rows (no copy provided yet) — cleared so
      // the document passes validation on save. No minRows on these fields, so
      // an empty array is valid; the PDP sections simply won't render.
      pdpFlavorNotes: [],
      pdpTrustPoints: [],
      pdpUsageSteps: [],
    },
  },
  {
    id: '6a9af5c6047eee1587b17b3b', // berglinsen-tempeh
    slug: 'berglinsen-tempeh',
    data: {
      title: 'Berglinsen-Tempeh',
      shortDescription:
        'Nussig-aromatisch, herzhaft und umamireich – unser Tempeh aus österreichischen Berglinsen wird beim Anbraten wunderbar knusprig und bleibt innen saftig.',
      description: buildDescription(
        'Österreichische Berglinsen werden durch Fermentation zu einem herzhaften Tempeh mit nussig-aromatischem Geschmack und viel Umami. In der Pfanne wird er außen schön knusprig, bleibt innen saftig und entwickelt kräftige Röstaromen. Pur angebraten, mariniert oder als Bestandteil verschiedenster Gerichte ist er unkompliziert und vielseitig einsetzbar.',
      ),
      priceInEUR: 5.9,
      weightGrams: 185,
      unitSize: '1 Packung',
      ingredients:
        'Berglinsen aus Österreich gekocht (97 %), Apfelessig, Starterkultur (Rhizopus oligosporus)',
      allergens: 'Keine der 14 kennzeichnungspflichtigen Hauptallergene als Zutaten',
      storageInstructions: 'Gekühlt lagern bei +2 °C bis +6 °C.',
      shelfLife: '6 Wochen',
      bestBefore: '6 Wochen',
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isSeasonal: false,
      categories: [TEMPEH_CATEGORY_ID],
      // Pre-existing empty placeholder rows (no copy provided yet) — cleared so
      // the document passes validation on save. No minRows on these fields, so
      // an empty array is valid; the PDP sections simply won't render.
      pdpFlavorNotes: [],
      pdpTrustPoints: [],
      pdpUsageSteps: [],
    },
  },
  {
    id: '69bc80514889efa4f93c7ae0', // classic-kimchi
    slug: 'classic-kimchi',
    data: {
      title: 'Kimchi',
      shortDescription:
        'Unser Kimchi wird aus saisonal wechselndem Gemüse milchsauer fermentiert. Je nach Jahreszeit entstehen unterschiedliche Varianten mit ganz eigenem Charakter.',
      description: buildDescription(
        'Wir fermentieren das, was die Saison hergibt. Deshalb wechseln Gemüse und Würzung im Laufe des Jahres und jedes Kimchi schmeckt ein wenig anders. Würzig, angenehm säuerlich und vielseitig – als Beilage, Topping oder einfach direkt aus dem Glas.',
      ),
      priceInEUR: 7.2,
      unitSize: '1 Glas',
      // Placeholder per Rafaela's note: recipe changes seasonally — update before each variant goes live.
      ingredients:
        'Unsere Kimchis sind saisonal. Je nach verfügbarer Gemüseauswahl variiert die Rezeptur und damit auch die Zutatenliste. Die Zutaten der aktuell angebotenen Variante werden vor Verkaufsstart hier ergänzt.',
      allergens:
        'Variieren je nach saisonaler Rezeptur und werden gemeinsam mit der Zutatenliste der aktuell angebotenen Variante ergänzt.',
      storageInstructions: 'Gekühlt lagern bei max. +7 °C.',
      shelfLife: '3 Monate',
      bestBefore: '3 Monate',
      isOrganic: false,
      isVegan: true,
      isGlutenFree: false, // explicit: no gluten-free claim at this stage
      isSeasonal: true,
      categories: [KIMCHI_CATEGORY_ID],
      pdpFlavorNotes: [],
      pdpTrustPoints: [],
      pdpUsageSteps: [],
    },
  },
]

// Confirmed junk — 17 leftover ecommerce-template demo products + 3 broken
// slug=undefined records + 2 unreleased products (per explicit confirmation).
// Workshop products and the course product are still explicitly kept.
const PRODUCT_IDS_TO_DELETE = [
  '69bc80504889efa4f93c7ad7', // fermentierte-curryzwiebel
  '69bc80504889efa4f93c7ace', // fermentierte-rote-rueben
  '6a9af5c3047eee1587b17ae2', // kombucha-apple-carrot-2
  '6a9af5c3047eee1587b17ad9', // kombucha-coffee-4
  '6a9af5c2047eee1587b17ad0', // kombucha-waldberry-2
  '6a9af5c2047eee1587b17ac7', // kombucha-coffee-3
  '6a9af5c2047eee1587b17abe', // kombucha-coffee-2
  '6a9af5c2047eee1587b17ab5', // kombucha-waldberry
  '6a9af5c2047eee1587b17aac', // kombucha-coffee
  '6a9af5c1047eee1587b17aa3', // kombucha-apple-carrot
  '6a9af5c1047eee1587b17a9a', // kombucha-set
  '6a9af5c1047eee1587b17a91', // sourdough-starter
  '6a9af5c1047eee1587b17a88', // fermented-kimchi
  '6a9af5c0047eee1587b17a7f', // tempeh-starter
  '6a9af5c0047eee1587b17a68', // lakto-gemuese
  '6a9af5bf047eee1587b17a5f', // kombucha-green-tea
  '6a9af5bf047eee1587b17a4d', // kombucha-ginger-peach
  '6a9af5bf047eee1587b17a3b', // kombucha-vanilla-cream
  '6a9af5be047eee1587b179f9', // kombucha-classic
  '6a4dfdbd6f5c59b2233ef0d5', // slug=undefined
  '6a4dfd536f5c59b2233ef09f', // slug=undefined
  '6a4d14b3d276ff398af74976', // slug=undefined
]

async function main() {
  assertProductionDatabase()
  console.log(DRY_RUN ? '🔍 DRY RUN — no changes will be made\n' : '🔥 LIVE RUN — applying changes\n')

  const payload = await getPayload({ config })

  // No context override here, deliberately: this is a production content edit,
  // not a bulk seed — it should behave exactly like a human admin edit, which
  // means letting the existing autoTranslateCollection hook (DE→EN via DeepL)
  // and normal cache revalidation run, not skipping them.
  console.log(`── Updating ${PRODUCT_UPDATES.length} products (DE; EN auto-translates via hook) ──`)
  for (const { id, slug, data } of PRODUCT_UPDATES) {
    if (DRY_RUN) {
      console.log(`  would update ${slug} (${id}): ${Object.keys(data).join(', ')}`)
      continue
    }
    await payload.update({ collection: 'products', id, locale: 'de', data })
    console.log(`  ✔ updated DE ${slug}`)
  }

  console.log(`\n── Deleting ${PRODUCT_IDS_TO_DELETE.length} junk products ──`)
  for (const id of PRODUCT_IDS_TO_DELETE) {
    if (DRY_RUN) {
      console.log(`  would delete ${id}`)
      continue
    }
    try {
      await payload.delete({ collection: 'products', id })
      console.log(`  ✔ deleted ${id}`)
    } catch (err) {
      console.error(`  ✗ failed to delete ${id}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(DRY_RUN ? '\n✅ Dry run complete. Re-run with --force to apply.' : '\n✅ Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('[ERROR]', err)
  process.exit(1)
})
