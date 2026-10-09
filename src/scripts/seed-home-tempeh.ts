/**
 * seed-home-tempeh.ts — homepage Käferbohnen Tempeh story (bilingual, additive).
 *
 * Run: pnpm seed home-tempeh
 *
 * Non-destructive: adds the section as the first block in Content (editors can
 * drag it anywhere) if the home page doesn't have it, and fills in English only
 * where the English text is still empty. Never touches images. Content blocks
 * are shared between languages (only the text inside is localized), so English
 * is written onto the same block/slide IDs as German.
 */
import config from '@payload-config'
import type { HomeTempehStoryBlock } from '@/payload-types'
import { getPayload } from 'payload'

const DEFAULT_PRODUCT_SLUG = 'kaeferbohnen-tempeh'

const COPY = {
  de: {
    heading: 'Käferbohnen Tempeh',
    productLinkLabel: 'Zum Produkt',
    slides: [
      {
        title: 'Was ist Tempeh?',
        description:
          'Ganze Bohnen werden mit einer Edelschimmelkultur fermentiert. Das feine Myzel verbindet sie zu einem festen, schnittfähigen Block.',
      },
      {
        title: 'Käferbohnen als Basis',
        description:
          'Für diese Variante verwenden wir aromatische Käferbohnen. Ihre kräftige Textur macht den Tempeh zu etwas ganz Besonderem.',
      },
      {
        title: 'Zeit für Fermentation',
        description:
          'Während der Fermentation wächst das Myzel zwischen den Bohnen. So entsteht die typische feste Struktur und ein herzhaft-nussiger Geschmack.',
      },
      {
        title: 'So schmeckt Tempeh',
        description:
          'In Scheiben schneiden und knusprig anbraten, grillen oder marinieren – Tempeh passt in Bowls, Salate und warme Gerichte.',
      },
    ],
  },
  en: {
    heading: 'Runner Bean Tempeh',
    productLinkLabel: 'View product',
    slides: [
      {
        title: 'What is tempeh?',
        description:
          'Whole beans are fermented with a food-grade mould culture. Its fine mycelium binds them into a firm, sliceable cake.',
      },
      {
        title: 'Made with runner beans',
        description:
          'This version starts with flavourful runner beans. Their hearty texture makes this tempeh something special.',
      },
      {
        title: 'Time to ferment',
        description:
          'As it ferments, mycelium grows between the beans, creating tempeh’s signature firm texture and savoury, nutty flavour.',
      },
      {
        title: 'Ways to enjoy it',
        description:
          'Slice and pan-fry until golden, grill or marinate it. Tempeh works beautifully in bowls, salads and warm dishes.',
      },
    ],
  },
} as const

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const isStoryBlock = (block: { blockType?: string }): block is HomeTempehStoryBlock =>
  block.blockType === 'homeTempehStory'

async function seedHomeTempeh() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const home = docs[0]
  if (!home) throw new Error('Cannot seed the tempeh section: the Home page does not exist.')

  const { docs: products } = await payload.find({
    collection: 'products',
    where: { slug: { equals: DEFAULT_PRODUCT_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const productId = products[0]?.id

  // ── 1. German first: add as the first Content block (Payload generates the IDs) ──
  const de = await payload.findByID({
    collection: 'pages',
    id: home.id,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })
  const deLayout = de.layout ?? []

  if (!deLayout.some(isStoryBlock)) {
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale: 'de',
      context: ctx,
      overrideAccess: true,
      data: {
        layout: [
          {
            blockType: 'homeTempehStory',
            visible: true,
            product: productId,
            heading: COPY.de.heading,
            productLinkLabel: COPY.de.productLinkLabel,
            slides: COPY.de.slides.map((s) => ({ ...s })),
          },
          ...deLayout,
        ],
      },
    })
    payload.logger.info('Added the tempeh story as the first Content block (German).')
  } else {
    payload.logger.info('German home page already has the tempeh block — left unchanged.')
  }

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
  if (!enBlock) throw new Error('Tempeh block missing after the German save.')

  if (enBlock.heading?.trim()) {
    payload.logger.info('English tempeh text already exists — left unchanged.')
    return
  }

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
              heading: COPY.en.heading,
              productLinkLabel: COPY.en.productLinkLabel,
              slides: (enBlock.slides ?? []).map((slide, i) => ({
                ...slide,
                ...(COPY.en.slides[i] ?? {}),
              })),
            }
          : block,
      ),
    },
  })
  payload.logger.info('Added the tempeh story text (English).')
}

seedHomeTempeh()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Tempeh homepage seed failed:', error)
    process.exit(1)
  })
