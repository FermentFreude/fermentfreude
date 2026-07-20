/**
 * Seed Posts for the Vom Feld ins Glas (Marktgarten) workshop.
 *
 * Uploads/reuses Feld ins Glas images and attaches heroImage to each post.
 *
 * Run:  pnpm seed feld-ins-glas-posts
 *       pnpm seed feld-ins-glas-posts --force
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

import { FELD_INS_GLAS_ARTICLES } from '@/app/(app)/tipps/feld-ins-glas-articles'
import { IMAGE_PRESETS, optimizedFile } from '@/scripts/seed-image-utils'
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

const isForce = process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const FELD_IMAGES = [
  {
    key: 'hero' as const,
    alt: 'feld-ins-glas-hero-v2 – market garden with harvest crate and fermentation jars',
    file: 'seed-assets/images/feld-ins-glas/feld-ins-glas-hero.png',
    preset: IMAGE_PRESETS.card,
  },
  {
    key: 'hands' as const,
    alt: 'feld-ins-glas-hands-v2 – packing cabbage into a jar outdoors',
    file: 'seed-assets/images/feld-ins-glas/feld-ins-glas-hands.png',
    preset: IMAGE_PRESETS.card,
  },
  {
    key: 'jars' as const,
    alt: 'feld-ins-glas-jars-v2 – flat lay of fermentation jars and garden produce',
    file: 'seed-assets/images/feld-ins-glas/feld-ins-glas-jars.png',
    preset: IMAGE_PRESETS.card,
  },
]

async function findMediaByAlt(
  payload: Awaited<ReturnType<typeof getPayload>>,
  altFragment: string,
) {
  const result = await payload.find({
    collection: 'media',
    where: { alt: { contains: altFragment } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0] ?? null
}

async function ensureFeldInsGlasImages(payload: Awaited<ReturnType<typeof getPayload>>) {
  const images: Record<'hero' | 'hands' | 'jars', string | null> = {
    hero: null,
    hands: null,
    jars: null,
  }

  payload.logger.info('Ensuring Feld ins Glas images in Media / R2...')

  for (const item of FELD_IMAGES) {
    const fragment = item.alt.split(' –')[0]!
    let doc = await findMediaByAlt(payload, fragment)

    if (!doc) {
      const abs = path.resolve(process.cwd(), item.file)
      doc = await payload.create({
        collection: 'media',
        context: { skipAutoTranslate: true, skipRevalidate: true },
        data: { alt: item.alt },
        file: await optimizedFile(abs, item.preset),
      })
      payload.logger.info(`  ✓ uploaded ${item.key}`)
    } else {
      payload.logger.info(`  · reuse ${item.key}`)
    }

    images[item.key] = doc.id
  }

  return images
}

/** One dedicated Media doc per Tipps article so founders can replace covers independently. */
async function ensureArticleCover(
  payload: Awaited<ReturnType<typeof getPayload>>,
  articleSlug: string,
  sourceKey: 'hero' | 'hands' | 'jars',
  imageAlt: string,
): Promise<string | null> {
  const coverAlt = `tipps-cover-${articleSlug}`
  const existing = await findMediaByAlt(payload, coverAlt)
  if (existing && !isForce) return existing.id

  const source = FELD_IMAGES.find((i) => i.key === sourceKey)
  if (!source) return null

  if (existing && isForce) {
    await payload.delete({
      collection: 'media',
      id: existing.id,
      context: { skipAutoTranslate: true, skipRevalidate: true },
    })
  }

  const abs = path.resolve(process.cwd(), source.file)
  const doc = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: `${coverAlt} – ${imageAlt}` },
    file: await optimizedFile(abs, IMAGE_PRESETS.card),
  })
  return doc.id
}

type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  style: string
  mode: 'normal'
  detail: number
  version: 1
}

type LexicalHeadingNode = {
  type: 'heading'
  tag: 'h2' | 'h3'
  format: ''
  indent: number
  version: 1
  direction: 'ltr'
  children: LexicalTextNode[]
}

type LexicalParagraphNode = {
  type: 'paragraph'
  format: ''
  indent: number
  version: 1
  direction: 'ltr'
  textFormat: number
  textStyle: string
  children: LexicalTextNode[]
}

function textNode(text: string): LexicalTextNode {
  return { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }
}

function heading(text: string): LexicalHeadingNode {
  return {
    type: 'heading',
    tag: 'h2',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [textNode(text)],
  }
}

function paragraph(text: string): LexicalParagraphNode {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [textNode(text)],
  }
}

function sectionsToLexical(sections: Array<{ heading: string; body: string[] }>) {
  const children: (LexicalHeadingNode | LexicalParagraphNode)[] = []
  for (const section of sections) {
    children.push(heading(section.heading))
    for (const p of section.body) {
      children.push(paragraph(p))
    }
  }
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1 as const,
      direction: 'ltr' as const,
      children,
    },
  }
}

const EN_OVERRIDES: Record<
  string,
  {
    title: string
    summary: string
    readTime: string
    sections: Array<{ heading: string; body: string[] }>
  }
> = {
  'frisches-gemuese-am-feld-erkennen': {
    title: 'Recognising Fresh Vegetables in the Field',
    summary:
      'What to look for at harvest: colour, firmness and seasonality so your ferment starts perfectly.',
    readTime: '6 min.',
    sections: [
      {
        heading: 'Why freshness in the field matters',
        body: [
          'At the “From Field to Jar” workshop, everything starts in the field. The fresher the vegetables, the crunchier they stay in the jar and the more reliably lactic acid fermentation begins.',
          'In the market garden you see how vegetables grow, ripen and are harvested. That knowledge helps at home too: you spot what is truly seasonal and harvest-fresh.',
        ],
      },
      {
        heading: 'What to check at harvest',
        body: [
          'Colour: seasonal vegetables have vivid, natural colours. Wilted, spotted or mushy areas suggest storage or age.',
          'Firmness: cucumbers, zucchini and cauliflower should feel firm and juicy, not soft or hollow.',
          'Size: medium specimens often work better for ferments than huge, water-heavy fruits.',
          'Leaves & stems: leafy greens should be crisp. For cabbage and cauliflower, look for firm, compact heads.',
        ],
      },
      {
        heading: 'Seasonality in the market garden',
        body: [
          'In summer you typically find zucchini, cucumbers, tomatoes, peppers and early cabbage. In autumn more root vegetables, cabbage and squash appear.',
          'Seasonal vegetables often have more flavour and the right water-salt balance for lacto-ferments. That is why our workshop recipes fit June through September.',
        ],
      },
      {
        heading: 'After harvest',
        body: [
          'Harvest-fresh means: process as soon as you can. In the workshop we prepare vegetables right after picking so quality stays high.',
          'At home: store cool, but do not wait days. For pickles and kimchi, harvest day or the next day is ideal.',
        ],
      },
    ],
  },
  'milchsaure-zucchini-pickels': {
    title: 'Lacto-Fermented Zucchini Pickles',
    summary:
      'Crunchy summer zucchini in salt brine: recipe, salt ratio and tips for the ferment from the market-garden workshop.',
    readTime: '8 min.',
    sections: [
      {
        heading: 'Why zucchini works perfectly',
        body: [
          'Zucchini is abundant in high summer and absorbs spices and brine beautifully. Lacto pickles stay pleasantly crisp when you use fresh, firm fruit.',
          'At the “From Field to Jar” workshop, this ferment is one of three jars you take home.',
        ],
      },
      {
        heading: 'Ingredients & prep',
        body: [
          'Fresh zucchini (medium size), non-iodised salt, garlic, dill or mustard seeds, optional chilli or peppercorns.',
          'Wash and slice or cut into sticks. Remove large seeds if the fruit is very ripe.',
          'Rule of thumb: 2% salt by vegetable weight, or a 2–3% brine to top up.',
        ],
      },
      {
        heading: 'Step by step',
        body: [
          '1. Layer zucchini in a clean jar with spices between.',
          '2. Add salt and massage briefly until liquid releases.',
          '3. Press firmly until covered by brine. Top up with salt brine if needed.',
          '4. Ferment at room temperature (18–24 °C) for 3–7 days, burp daily.',
          '5. When it tastes right: refrigerate. Fermentation slows down.',
        ],
      },
      {
        heading: 'Practical tips',
        body: [
          'Soft zucchini turns mushy quickly. Harvest-fresh and firm is best.',
          'In summer at the market garden: shade during short waits helps prevent over-fermentation.',
          'Serving: zucchini pickles go well with grilled veg, bowls or as a crunchy Brettljaus\'n side.',
        ],
      },
    ],
  },
  'fermentiertes-gurken-relish': {
    title: 'Fermented Cucumber Relish',
    summary:
      'Tangy-spicy cucumber relish via lactic fermentation: cutting technique, spices and how to get the right texture.',
    readTime: '7 min.',
    sections: [
      {
        heading: 'What is cucumber relish?',
        body: [
          'Relish is finely cut vegetables in a spiced brine, tangy and aromatic. Lacto-fermentation creates a lively topping for burgers, bowls, sandwiches and cold platters.',
          'In the workshop we make cucumber relish as your second take-home jar, from cucumbers harvested in the market garden.',
        ],
      },
      {
        heading: 'Preparation',
        body: [
          'Choose firm salad or pickling cucumbers. Soft, watery ones go limp quickly.',
          'Dice or cut cucumbers finely. Even pieces distribute salt and spices better.',
          'Classic additions: onion, dill, mustard seeds, pepper. Adjust to taste.',
        ],
      },
      {
        heading: 'Fermentation',
        body: [
          'Mix vegetables with 2% salt and rest 10–15 minutes until brine forms.',
          'Fill clean jars, press firmly, keep surface covered with brine.',
          'Ferment at room temperature 4–8 days. Relish may soften more than whole pickles, so taste early.',
        ],
      },
      {
        heading: 'Enjoy & storage',
        body: [
          'Refrigerated, relish keeps for months. Always use clean utensils in the jar.',
          'As a topping on grilled vegetables, in wraps or beside fermented Brettljaus\'n from the workshop: a summer classic.',
        ],
      },
    ],
  },
  'karfiol-kimchi-anleitung': {
    title: 'Cauliflower Kimchi: A Guide',
    summary:
      'Spicy cauliflower kimchi with lactic fermentation: salting, spicing and the right ferment time for your third workshop jar.',
    readTime: '9 min.',
    sections: [
      {
        heading: 'Cauliflower as a kimchi base',
        body: [
          'Cauliflower works brilliantly for kimchi: it takes paste and flavours well and stays pleasantly crisp with the right ferment time.',
          'At the market-garden workshop, cauliflower kimchi is the third ferment you take home.',
        ],
      },
      {
        heading: 'Ingredients',
        body: [
          'Fresh cauliflower, cut into even florets. Stems can ferment in small pieces or go into stock.',
          'Salt for salting (about 2% of vegetable weight), garlic, ginger, spring onion optional.',
          'For heat: chilli or paprika. In the workshop we show a balanced, everyday-friendly version.',
        ],
      },
      {
        heading: 'Process',
        body: [
          '1. Mix cauliflower with salt and rest 30–60 minutes until it softens slightly and releases liquid.',
          '2. Fold in spice paste or mix.',
          '3. Pack firmly into jars, minimise air pockets, keep surface covered.',
          '4. Ferment 2–5 days at room temperature, taste daily.',
          '5. Refrigerate when it tastes right.',
        ],
      },
      {
        heading: 'Tips',
        body: [
          'Fresh, compact cauliflower ferments more evenly than wilted heads.',
          'Kimchi may smell livelier than plain pickles but should stay pleasantly tangy and savoury.',
          'Great with rice, noodles, eggs or as a side to fermented Brettljaus\'n.',
        ],
      },
    ],
  },
  'marktgarten-workshop-vorbereitung': {
    title: 'How to Prepare for the Market Garden Workshop',
    summary:
      'Clothing, shoes, weather and what to bring: everything for four hours outdoors at “Unser Bauerngarten”.',
    readTime: '5 min.',
    sections: [
      {
        heading: 'Location & format',
        body: [
          'The workshop is not at Grabenstraße but outdoors at Marktgarten “Unser Bauerngarten” on Hochfeldweg in Graz.',
          'You spend about four hours outside: harvest, theory, practice and tasting. We provide vegetables, jars, spices and equipment.',
        ],
      },
      {
        heading: 'Clothing & shoes',
        body: [
          'Weatherproof layers: cool mornings, sunny middays. Pack a rain jacket if the forecast is uncertain.',
          'Sturdy, closed shoes. You stand on soil and grass, not a studio floor.',
          'Sun protection (hat, sunscreen) on hot days. Gloves optional; we provide tools.',
        ],
      },
      {
        heading: 'What you can bring',
        body: [
          'A water bottle, notebook if you like, and good spirits.',
          'You do not need your own vegetables or equipment. Three ferments and fermentation jars are included in the price.',
        ],
      },
      {
        heading: 'Who it is for',
        body: [
          'From beginners to fermentation pros: no prior knowledge needed. Ideal if you want to connect origin, craft and fermentation.',
          'Maximum 12 people so there is time for questions, harvest and hands-on work.',
        ],
      },
    ],
  },
  'vom-feld-ins-glas-ablauf': {
    title: 'From Field to Jar: How the Workshop Runs',
    summary:
      'Field, kitchen, jar: the thread through four hours of harvest, fermentation and tasting in the market garden.',
    readTime: '6 min.',
    sections: [
      {
        heading: '01 · Field',
        body: [
          'We start in the field. Together we harvest fresh seasonal vegetables and learn how to recognise quality and ripeness.',
          'You get insight into market-garden growing: what grows when, and why seasonality matters for ferments.',
        ],
      },
      {
        heading: '02 · Kitchen',
        body: [
          'Back at the work station: theory and practice. How lactic acid fermentation works, its benefits, and the techniques you need.',
          'Under guidance you prepare three lacto-ferments: zucchini pickles, cucumber relish and cauliflower kimchi.',
        ],
      },
      {
        heading: '03 · Jar',
        body: [
          'All jars go home with you, including fermentation vessels and a script with recipes.',
          'We finish with a ferment Brettljaus\'n (vegan on request): natural, surprising and aromatic.',
        ],
      },
      {
        heading: 'What you take away',
        body: [
          'Three ferments of your own, practical experience from harvest to jar, and fermentation understood as field, craft and time working together.',
          'Ready? Pick a date and join us in the market garden.',
        ],
      },
    ],
  },
}

async function seedFeldInsGlasPosts() {
  const payload = await getPayload({ config })
  await ensureFeldInsGlasImages(payload)

  payload.logger.info('Seeding Posts (Vom Feld ins Glas articles)...')

  for (const article of FELD_INS_GLAS_ARTICLES) {
    const heroImageId = await ensureArticleCover(
      payload,
      article.slug,
      article.heroImageKey,
      article.imageAlt,
    )
    if (heroImageId) {
      payload.logger.info(`  · cover ready for ${article.slug}`)
    }

    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: article.slug } },
      limit: 1,
      depth: 0,
    })

    const existingDoc = existing.docs[0]
    const needsImage = Boolean(heroImageId && existingDoc && !existingDoc.heroImage)

    if (existingDoc && !isForce) {
      if (needsImage || (heroImageId && isForce)) {
        await payload.update({
          collection: 'posts',
          id: existingDoc.id,
          data: { heroImage: heroImageId! },
          context: ctx,
        })
        payload.logger.info(`  🖼️  Cover set on "${article.slug}"`)
      } else if (heroImageId) {
        // Refresh dedicated cover even without --force when shared image was used before
        const currentHero =
          typeof existingDoc.heroImage === 'string'
            ? existingDoc.heroImage
            : (existingDoc.heroImage as { id?: string } | null)?.id
        if (currentHero !== heroImageId) {
          await payload.update({
            collection: 'posts',
            id: existingDoc.id,
            data: { heroImage: heroImageId },
            context: ctx,
          })
          payload.logger.info(`  🖼️  Upgraded to dedicated cover "${article.slug}"`)
        } else {
          payload.logger.info(
            `  ⏭️  "${article.slug}" already exists — skipping. Use --force to overwrite.`,
          )
        }
      } else {
        payload.logger.info(
          `  ⏭️  "${article.slug}" already exists — skipping. Use --force to overwrite.`,
        )
      }
      continue
    }

    const enOverride = EN_OVERRIDES[article.slug]
    const deContent = sectionsToLexical(article.sections)
    const enContent = enOverride ? sectionsToLexical(enOverride.sections) : deContent
    const heroImageField = heroImageId ? { heroImage: heroImageId } : {}

    if (existingDoc && isForce) {
      const id = existingDoc.id

      await payload.update({
        collection: 'posts',
        id,
        locale: 'de',
        data: {
          slug: article.slug,
          workshopType: 'lakto',
          title: article.title,
          summary: article.description,
          readTime: article.readTime,
          content: deContent,
          ...heroImageField,
        },
        context: ctx,
      })

      await payload.update({
        collection: 'posts',
        id,
        locale: 'en',
        data: {
          workshopType: 'lakto',
          title: enOverride?.title ?? article.title,
          summary: enOverride?.summary ?? article.description,
          readTime: enOverride?.readTime ?? article.readTime,
          content: enContent,
        },
        context: ctx,
      })

      payload.logger.info(`  ✅ Updated "${article.slug}" (DE + EN + image)`)
    } else {
      const created = await payload.create({
        collection: 'posts',
        locale: 'de',
        data: {
          slug: article.slug,
          workshopType: 'lakto',
          title: article.title,
          summary: article.description,
          readTime: article.readTime,
          content: deContent,
          ...heroImageField,
        },
        context: ctx,
      })

      await payload.update({
        collection: 'posts',
        id: created.id,
        locale: 'en',
        data: {
          workshopType: 'lakto',
          title: enOverride?.title ?? article.title,
          summary: enOverride?.summary ?? article.description,
          readTime: enOverride?.readTime ?? article.readTime,
          content: enContent,
        },
        context: ctx,
      })

      payload.logger.info(`  ✅ Created "${article.slug}" (DE + EN + image)`)
    }
  }

  payload.logger.info('✅ All 6 Vom Feld ins Glas posts seeded!')
  payload.logger.info('   Edit at: /admin/collections/posts')
  process.exit(0)
}

seedFeldInsGlasPosts().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
