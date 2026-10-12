/**
 * seed-home-tempeh.ts — homepage Tempeh Story Carousel (bilingual).
 *
 *   pnpm seed home-tempeh           → adds the carousel as the first Content block
 *                                     if the home page doesn't have one yet
 *   pnpm seed home-tempeh --force   → also replaces the slides + heading of an
 *                                     existing carousel (keeps its position)
 *
 * Photos are picked from the Media library by file name (never uploaded or
 * overwritten). Content blocks are shared between languages (only the text
 * inside is localized), so German is saved first and English is written onto
 * the same block + slide IDs.
 */
import config from '@payload-config'
import type { HomeTempehStoryBlock, Page } from '@/payload-types'
import { getPayload, type Payload } from 'payload'

type SlideSeed = {
  /** Exact Media file name, or a unique part of it — must be a full photo, not a cut-out */
  photo: string
  /** Shop product slug for the button (optional) */
  product?: string
  de: { label: string; title: string; description: string; buttonLabel?: string }
  en: { label: string; title: string; description: string; buttonLabel?: string }
}

const HEADING = { de: 'Käferbohnen Tempeh', en: 'Runner Bean Tempeh' }

const SLIDES: SlideSeed[] = [
  {
    photo: 'Käferbohnentempeh verpackt 185g_1200x800.webp',
    product: 'kaeferbohnen-tempeh',
    de: {
      label: 'Unser Produkt',
      title: 'Käferbohnen-Tempeh',
      description:
        'Nussig, herzhaft und voller Umami – fermentiert aus steirischen Käferbohnen. Beim Anbraten außen goldbraun, innen schön saftig.',
      buttonLabel: 'Zum Produkt',
    },
    en: {
      label: 'Our product',
      title: 'Runner Bean Tempeh',
      description:
        'Nutty, hearty and full of umami – fermented from Styrian runner beans. Golden and crisp outside when pan-fried, juicy inside.',
      buttonLabel: 'View product',
    },
  },
  {
    photo: 'top-view-sliced-round-tempeh-2026-01-09-08-08-21-utc.webp',
    de: {
      label: 'Grundlagen',
      title: 'Was ist Tempeh?',
      description:
        'Tempeh stammt ursprünglich aus Indonesien. Gekochte Bohnen werden mit einer Edelschimmelkultur fermentiert – ihr feines, weißes Myzel verbindet sie zu einem festen, schnittfesten Block.',
    },
    en: {
      label: 'The basics',
      title: 'What is tempeh?',
      description:
        'Tempeh originally comes from Indonesia. Cooked beans are fermented with a food-grade culture whose fine white mycelium binds them into a firm, sliceable block.',
    },
  },
  {
    photo: 'hero-kaefer.webp',
    de: {
      label: 'Die Bohne',
      title: 'Steirische Käferbohne g.U.',
      description:
        'Unsere Käferbohnen wachsen ausschließlich in der Steiermark – geschützter Ursprung, traditionell verarbeitet und ohne Gentechnik. Von Natur aus reich an Eiweiß, Ballaststoffen und Mineralstoffen.',
    },
    en: {
      label: 'The bean',
      title: 'Styrian runner beans (PDO)',
      description:
        'Our runner beans are grown only in Styria – protected origin, traditionally processed and GMO-free. Naturally rich in protein, fibre and minerals.',
    },
  },
  {
    photo: 'sliced-raw-tempeh-on-wooden-plate-tempeh-or-tempe-2026-01-06-09-26-00-utc-1.webp',
    de: {
      label: 'Handwerk',
      title: 'So entsteht unser Tempeh',
      description:
        'Wir weichen die Bohnen ein, kochen sie und geben die Tempeh-Kultur dazu. Bei rund 30 °C wächst das Myzel in ein bis zwei Tagen zwischen den Bohnen und macht daraus einen festen Block.',
    },
    en: {
      label: 'Craft',
      title: 'How our tempeh is made',
      description:
        'We soak and cook the beans, then add the tempeh culture. At around 30 °C the mycelium grows between the beans over one to two days, binding them into a firm block.',
    },
  },
  {
    photo: 'Berglinsen tempeh.webp',
    product: 'berglinsen-tempeh',
    de: {
      label: 'Sorten',
      title: 'Mehr als eine Bohne',
      description:
        'Neben Käferbohnen fermentieren wir auch andere Hülsenfrüchte – etwa Berglinsen. Jede Sorte bringt ihren eigenen Biss und Geschmack mit.',
      buttonLabel: 'Berglinsen-Tempeh entdecken',
    },
    en: {
      label: 'Varieties',
      title: 'More than one bean',
      description:
        'Besides runner beans we ferment other pulses too – such as mountain lentils. Each variety brings its own bite and flavour.',
      buttonLabel: 'Discover lentil tempeh',
    },
  },
  {
    photo: 'Käferbohnen Tempeh auf großen Plattengrill Schladming.webp',
    de: {
      label: 'In der Küche',
      title: 'So genießt du Tempeh',
      description:
        'In Scheiben schneiden und knusprig anbraten, grillen oder marinieren. Tempeh passt zum Frühstück, in Burger, Bowls und Salate – oder als herzhafte Beilage.',
    },
    en: {
      label: 'In the kitchen',
      title: 'Ways to enjoy tempeh',
      description:
        'Slice and pan-fry until crisp, grill or marinate. Tempeh works for breakfast, in burgers, bowls and salads – or as a hearty side.',
    },
  },
]

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

type LayoutBlock = NonNullable<Page['layout']>[number]
const isStoryBlock = (block: LayoutBlock): block is HomeTempehStoryBlock =>
  block.blockType === 'homeTempehStory'

async function findMediaId(payload: Payload, fragment: string) {
  // Exact file name first; a loose match only as a fallback (it can pick a similar file)
  for (const where of [{ filename: { equals: fragment } }, { filename: { like: fragment } }]) {
    const { docs } = await payload.find({
      collection: 'media',
      where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (docs[0]) return docs[0].id
  }
  throw new Error(
    `No photo matching "${fragment}" in the Media library — upload it first, or pick photos in the admin instead.`,
  )
}

async function findProductId(payload: Payload, slug: string) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0]?.id
}

async function seedHomeTempeh() {
  const payload = await getPayload({ config })
  const force = process.argv.includes('--force')

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const home = docs[0]
  if (!home) throw new Error('Cannot seed the tempeh carousel: the Home page does not exist.')

  const de = await payload.findByID({
    collection: 'pages',
    id: home.id,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })
  const deLayout = de.layout ?? []
  const existing = deLayout.find(isStoryBlock)

  if (existing && !force) {
    payload.logger.info('Home page already has the tempeh carousel — left unchanged (use --force).')
    return
  }

  // Sequential lookups (Atlas M0)
  const slideRefs: { image: string; product?: string }[] = []
  for (const slide of SLIDES) {
    slideRefs.push({
      image: await findMediaId(payload, slide.photo),
      product: slide.product ? await findProductId(payload, slide.product) : undefined,
    })
  }

  // ── 1. German first (Payload generates the slide IDs) ──
  const deBlock = {
    blockType: 'homeTempehStory' as const,
    visible: existing?.visible ?? true,
    heading: HEADING.de,
    slides: SLIDES.map((slide, i) => ({
      image: slideRefs[i].image,
      product: slideRefs[i].product,
      label: slide.de.label,
      title: slide.de.title,
      description: slide.de.description,
      buttonLabel: slide.de.buttonLabel,
    })),
  }
  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'de',
    context: ctx,
    overrideAccess: true,
    data: {
      layout: existing
        ? deLayout.map((b) => (b.id === existing.id ? { ...deBlock, id: existing.id } : b))
        : [deBlock, ...deLayout],
    },
  })
  payload.logger.info(`${existing ? 'Replaced' : 'Added'} the tempeh carousel (German).`)

  // ── 2. Read back the IDs, then English onto the same block + slides ──
  // fallbackLocale: false so other blocks keep their own (possibly empty) English text
  const en = await payload.findByID({
    collection: 'pages',
    id: home.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
    overrideAccess: true,
  })
  const enLayout = en.layout ?? []
  const enBlock = enLayout.find(isStoryBlock)
  if (!enBlock) throw new Error('Tempeh carousel missing after the German save.')

  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'en',
    context: ctx,
    overrideAccess: true,
    data: {
      layout: enLayout.map((block) =>
        block.id === enBlock.id
          ? {
              ...enBlock,
              heading: HEADING.en,
              slides: (enBlock.slides ?? []).map((slide, i) => ({
                ...slide,
                label: SLIDES[i]?.en.label,
                title: SLIDES[i]?.en.title ?? slide.title,
                description: SLIDES[i]?.en.description,
                buttonLabel: SLIDES[i]?.en.buttonLabel,
              })),
            }
          : block,
      ),
    },
  })
  payload.logger.info('Wrote the tempeh carousel text (English).')
}

seedHomeTempeh()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Tempeh homepage seed failed:', error)
    process.exit(1)
  })
