/**
 * Seed / update the home-page Press Banner block (before SponsorsBar).
 *
 * Non-destructive by default: if a pressBanner block already exists, skips unless --force.
 * Reuses existing presse-logo-* media when available; otherwise uploads from seed-assets.
 *
 * Run: pnpm seed press-banner
 *      pnpm seed press-banner --force
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

async function seedPressBanner() {
  // Dynamic imports so dotenv runs before Payload config reads process.env
  const { buildPressBannerDE, buildPressBannerEN } = await import('@/blocks/PressBanner/seed')
  const { default: config } = await import('@payload-config')
  const fs = await import('fs')
  const path = await import('path')
  const { getPayload } = await import('payload')
  const { PRESS_LOGO_ALTS_DE } = await import('./data/presse')
  const { rasterizeLogoFile } = await import('./seed-image-utils')

  type Media = { id: string }
  type Page = {
    id: string
    layout?: LayoutBlock[] | null
  }

  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
  const force = process.argv.includes('--force')

  const LOGO_FILES = [
    'logo-kleine-zeitung.svg',
    'logo-kanal3.svg',
    'logo-junge-wirtschaft.svg',
  ] as const

  type LayoutBlock = {
    id?: string
    blockType?: string
    slides?: Array<Record<string, unknown> & { id?: string }>
    [key: string]: unknown
  }

  async function findOrCreateLogo(
    payload: Awaited<ReturnType<typeof getPayload>>,
    index: number,
    fileName: string,
  ): Promise<string | undefined> {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { contains: `presse-logo-${index + 1}` } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      return existing.docs[0].id
    }

    const filePath = path.resolve(process.cwd(), 'seed-assets/images/presse/logos', fileName)
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  Missing logo file: ${fileName}`)
      return undefined
    }

    const created = (await payload.create({
      collection: 'media',
      data: {
        alt: `presse-logo-${index + 1} ${PRESS_LOGO_ALTS_DE[index] ?? 'Outlet logo'}`,
      },
      file: await rasterizeLogoFile(filePath),
      context: ctx,
    })) as Media

    console.log(`  🏷️  Uploaded ${fileName} → ${created.id}`)
    return created.id
  }

  const payload = await getPayload({ config })
  console.log('🧪 Seeding home Press Banner…')

  const homeResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    locale: 'de',
    depth: 0,
    limit: 1,
  })

  const home = homeResult.docs[0] as Page | undefined
  if (!home) {
    console.error('❌ Home page not found. Seed home first.')
    process.exit(1)
  }

  const layout = (Array.isArray(home.layout) ? home.layout : []) as LayoutBlock[]
  const existingIndex = layout.findIndex((b) => b.blockType === 'pressBanner')

  if (existingIndex >= 0 && !force) {
    console.log('⏭️  Press Banner already on home. Run: pnpm seed press-banner --force')
    process.exit(0)
  }

  const logoIds: string[] = []
  for (let i = 0; i < LOGO_FILES.length; i++) {
    const id = await findOrCreateLogo(payload, i, LOGO_FILES[i]!)
    if (id) logoIds.push(id)
  }

  const logos = {
    kleineZeitung: logoIds[0],
    kanal3: logoIds[1],
    jungeWirtschaft: logoIds[2],
  }

  const deBlock = buildPressBannerDE(logos)

  let nextLayout: LayoutBlock[]
  if (existingIndex >= 0) {
    const existingId = layout[existingIndex]?.id
    nextLayout = [...layout]
    nextLayout[existingIndex] = { ...(deBlock as unknown as LayoutBlock), id: existingId }
  } else {
    const sponsorsIndex = layout.findIndex((b) => b.blockType === 'sponsorsBar')
    nextLayout = [...layout]
    if (sponsorsIndex >= 0) {
      nextLayout.splice(sponsorsIndex, 0, deBlock as unknown as LayoutBlock)
    } else {
      nextLayout.push(deBlock as unknown as LayoutBlock)
    }
  }

  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'de',
    context: ctx,
    data: {
      layout: nextLayout as never,
    },
  })

  console.log('  ✅ DE Press Banner saved')

  const fresh = (await payload.findByID({
    collection: 'pages',
    id: home.id,
    locale: 'de',
    depth: 0,
  })) as Page & { hero?: Record<string, unknown> }

  const freshLayout = (Array.isArray(fresh.layout) ? fresh.layout : []) as LayoutBlock[]
  const savedBlock = freshLayout.find((b) => b.blockType === 'pressBanner')
  if (!savedBlock?.id) {
    console.error('❌ pressBanner block missing after DE save')
    process.exit(1)
  }

  const enDoc = (await payload.findByID({
    collection: 'pages',
    id: home.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })) as Page & {
    hero?: {
      heroSlides?: Array<{
        attributes?: Array<{ id?: string; text?: string | null }>
        [key: string]: unknown
      }>
      [key: string]: unknown
    }
  }

  const enLayout = (
    Array.isArray(enDoc.layout) && enDoc.layout.length > 0 ? enDoc.layout : freshLayout
  ) as LayoutBlock[]

  const enBlock = buildPressBannerEN(logos)
  const nextEnLayout = enLayout.map((block) => {
    if (block.blockType !== 'pressBanner') return block
    return {
      ...enBlock,
      id: savedBlock.id,
      slides: enBlock.slides.map((slide, i) => ({
        ...slide,
        id: savedBlock.slides?.[i]?.id,
        logo: savedBlock.slides?.[i]?.logo ?? slide.logo,
      })),
    }
  })

  // Ensure the block exists in EN layout (structure can lag after DE insert)
  if (!nextEnLayout.some((b) => b.blockType === 'pressBanner')) {
    const sponsorsIndex = nextEnLayout.findIndex((b) => b.blockType === 'sponsorsBar')
    const insertAt = sponsorsIndex >= 0 ? sponsorsIndex : nextEnLayout.length
    nextEnLayout.splice(insertAt, 0, {
      ...enBlock,
      id: savedBlock.id,
      slides: enBlock.slides.map((slide, i) => ({
        ...slide,
        id: savedBlock.slides?.[i]?.id,
        logo: savedBlock.slides?.[i]?.logo ?? slide.logo,
      })),
    } as unknown as LayoutBlock)
  }

  // Heal EN hero tags that exist only in DE (empty required localized fields block updates)
  const deSlides = (fresh.hero as { heroSlides?: Array<{ attributes?: Array<{ text?: string }> }> })
    ?.heroSlides
  const healedHero = enDoc.hero
    ? {
        ...enDoc.hero,
        heroSlides: (enDoc.hero.heroSlides ?? []).map((slide, i) => ({
          ...slide,
          attributes: (slide.attributes ?? []).map((attr, j) => ({
            ...attr,
            text:
              (typeof attr.text === 'string' && attr.text.trim() !== ''
                ? attr.text
                : deSlides?.[i]?.attributes?.[j]?.text) || 'Feature',
          })),
        })),
      }
    : undefined

  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'en',
    context: ctx,
    data: {
      layout: nextEnLayout as never,
      ...(healedHero ? { hero: healedHero as never } : {}),
    },
  })

  console.log('  ✅ EN Press Banner saved')
  console.log('🎉 Press Banner ready on home (before partners section)')
  process.exit(0)
}

seedPressBanner().catch((err) => {
  console.error(err)
  process.exit(1)
})
