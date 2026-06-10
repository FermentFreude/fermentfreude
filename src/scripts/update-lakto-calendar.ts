/**
 * update-lakto-calendar.ts
 *
 * Updates ONLY the calendarMonths field on the lakto-gemuese workshop page.
 * All other admin-edited content (hero, images, FAQ, etc.) is left untouched.
 *
 * Run: pnpm tsx src/scripts/update-lakto-calendar.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const calendarMonthsDE = [
  {
    month: 'Juni',
    monthShort: 'JUN',
    monthNumber: '06',
    season: 'SOMMER',
    accent: '#4a7c59',
    recipes: [
      { name: 'Salzgurken' },
      { name: 'Fermentierter Orangen-Fenchel' },
      { name: 'Spargel-Kimchi' },
    ],
  },
  {
    month: 'Juli',
    monthShort: 'JUL',
    monthNumber: '07',
    season: 'SOMMER',
    accent: '#2d6a4f',
    recipes: [
      { name: 'Milchsaure Zucchini-Pickels' },
      { name: 'Fermentierte Gurken-Relish' },
      { name: 'Karfiol-Kimchi' },
    ],
  },
  {
    month: 'August',
    monthShort: 'AUG',
    monthNumber: '08',
    season: 'SOMMER',
    accent: '#e6be68',
    recipes: [
      { name: 'Milchsaure Eierschwammerl' },
      { name: 'Fermentierte Tomaten-Salsa' },
      { name: 'Paprika-Kimchi' },
    ],
  },
  {
    month: 'September',
    monthShort: 'SEP',
    monthNumber: '09',
    season: 'HERBST',
    accent: '#d4875a',
    recipes: [
      { name: 'Salzlacken-Kirschtomaten' },
      { name: 'Fermentierte Hot-Sauce' },
      { name: 'Süßkartoffel-Kimchi' },
    ],
  },
]

const calendarMonthsEN = [
  {
    month: 'June',
    monthShort: 'JUN',
    monthNumber: '06',
    season: 'SUMMER',
    accent: '#4a7c59',
    recipes: [
      { name: 'Pickled Cucumbers' },
      { name: 'Fermented Orange-Fennel' },
      { name: 'Asparagus Kimchi' },
    ],
  },
  {
    month: 'July',
    monthShort: 'JUL',
    monthNumber: '07',
    season: 'SUMMER',
    accent: '#2d6a4f',
    recipes: [
      { name: 'Lacto-Fermented Zucchini Pickles' },
      { name: 'Fermented Cucumber Relish' },
      { name: 'Cauliflower Kimchi' },
    ],
  },
  {
    month: 'August',
    monthShort: 'AUG',
    monthNumber: '08',
    season: 'SUMMER',
    accent: '#e6be68',
    recipes: [
      { name: 'Lacto-Fermented Chanterelles' },
      { name: 'Fermented Tomato Salsa' },
      { name: 'Pepper Kimchi' },
    ],
  },
  {
    month: 'September',
    monthShort: 'SEP',
    monthNumber: '09',
    season: 'AUTUMN',
    accent: '#d4875a',
    recipes: [
      { name: 'Brine-Pickled Cherry Tomatoes' },
      { name: 'Fermented Hot Sauce' },
      { name: 'Sweet Potato Kimchi' },
    ],
  },
]

async function main() {
  const payload = await getPayload({ config: await config })

  // Find the lakto-gemuese page
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'lakto-gemuese' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (result.totalDocs === 0) {
    console.error('❌ lakto-gemuese page not found')
    process.exit(1)
  }

  const pageId = result.docs[0]!.id
  console.log(`Found lakto-gemuese page: ${pageId}`)

  // ── 1. Save DE calendar months ────────────────────────────────────────────
  const saved = await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: { workshopDetail: { calendarMonths: calendarMonthsDE } } as never,
    context: ctx,
    overrideAccess: true,
    depth: 0,
  })
  console.log('✓ DE calendar months saved')

  // ── 2. Read back to capture generated array IDs ───────────────────────────
  const savedDoc = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })

  const savedDetail = ((savedDoc as unknown) as Record<string, unknown>).workshopDetail as Record<string, unknown> | undefined
  const savedMonths = (savedDetail?.calendarMonths as Array<{ id?: string; recipes?: Array<{ id?: string }> }>) ?? []

  // ── 3. Build EN months with same IDs ─────────────────────────────────────
  const enMonths = calendarMonthsEN.map((enMonth, i) => {
    const savedMonth = savedMonths[i]
    const enRecipes = enMonth.recipes.map((enRecipe, j) => ({
      ...enRecipe,
      id: savedMonth?.recipes?.[j]?.id,
    }))
    return {
      ...enMonth,
      id: savedMonth?.id,
      recipes: enRecipes,
    }
  })

  // ── 4. Save EN calendar months ────────────────────────────────────────────
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: { workshopDetail: { calendarMonths: enMonths } } as never,
    context: ctx,
    overrideAccess: true,
    depth: 0,
  })
  console.log('✓ EN calendar months saved')

  console.log('\n✅ Fermentkalender updated: Juni · Juli · August · September')
  process.exit(0)
}

main().catch((e) => {
  console.error('❌', e)
  process.exit(1)
})
