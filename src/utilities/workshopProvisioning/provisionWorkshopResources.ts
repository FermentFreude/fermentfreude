import type { Workshop } from '@/payload-types'
import type { Payload } from 'payload'
import { revalidateTag } from 'next/cache'

import { resolvePageSlugForDbSlug } from '@/utilities/workshopPageUtils'

import { buildRichText } from './buildRichText'
import {
  buildDefaultPageShellDE,
  buildDefaultPageShellEN,
  buildDefaultWorkshopPageDE,
  buildDefaultWorkshopPageEN,
} from './buildDefaultWorkshopPageContent'
import {
  PROVISION_CTX,
  productSlugForWorkshop,
  SPECIAL_WORKSHOP_DB_SLUGS,
} from './constants'
import { findWorkshopPage } from './findWorkshopPage'

type ProvisionResult = {
  productCreated: boolean
  productUpdated: boolean
  pageCreated: boolean
}

function resolveImageId(workshop: Workshop): string | undefined {
  const image = workshop.image
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image !== null && 'id' in image) {
    return String(image.id)
  }
  return undefined
}

async function ensureWorkshopProduct(
  payload: Payload,
  workshop: Workshop,
): Promise<{ created: boolean; updated: boolean }> {
  const dbSlug = workshop.slug
  const productSlug = productSlugForWorkshop(dbSlug)
  const titleDe = typeof workshop.title === 'string' ? workshop.title : dbSlug
  const priceCents = Math.round((workshop.basePrice ?? 99) * 100)
  const imageId = resolveImageId(workshop)

  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: productSlug } },
    limit: 1,
    depth: 0,
  })

  const descriptionDe = buildRichText('Workshop-Buchung (Details siehe Warenkorb)')
  const descriptionEn = buildRichText('Workshop booking (see cart for details)')

  if (existing.docs[0]) {
    await payload.update({
      collection: 'products',
      id: existing.docs[0].id,
      locale: 'de',
      data: {
        title: titleDe,
        priceInEUR: priceCents,
        priceInEUREnabled: true,
        productType: 'workshop',
        workshopRef: workshop.id,
        inventory: 999,
        _status: 'published',
        ...(imageId && {
          gallery: [{ image: imageId }],
          meta: { title: titleDe, description: 'Workshop-Buchung', image: imageId },
        }),
      },
      context: PROVISION_CTX,
    })

    await payload.update({
      collection: 'products',
      id: existing.docs[0].id,
      locale: 'en',
      data: {
        title: titleDe,
        description: descriptionEn,
        meta: { title: titleDe, description: 'Workshop booking' },
      },
      context: PROVISION_CTX,
    })

    return { created: false, updated: true }
  }

  const productDE = await payload.create({
    collection: 'products',
    locale: 'de',
    draft: false,
    data: {
      title: titleDe,
      slug: productSlug,
      productType: 'workshop',
      priceInEUR: priceCents,
      priceInEUREnabled: true,
      inventory: 999,
      workshopRef: workshop.id,
      description: descriptionDe,
      _status: 'published',
      ...(imageId && {
        gallery: [{ image: imageId }],
        meta: { title: titleDe, description: 'Workshop-Buchung', image: imageId },
      }),
      ...(!imageId && {
        meta: { title: titleDe, description: 'Workshop-Buchung' },
      }),
    },
    context: PROVISION_CTX,
  })

  await payload.update({
    collection: 'products',
    id: productDE.id,
    locale: 'en',
    data: {
      title: titleDe,
      description: descriptionEn,
      meta: { title: titleDe, description: 'Workshop booking' },
    },
    context: PROVISION_CTX,
  })

  payload.logger.info(`[workshop-provision] Created product ${productSlug}`)
  return { created: true, updated: false }
}

import { mergeWorkshopPageSectionIds } from './mergeWorkshopPageSectionIds'

async function ensureWorkshopPage(
  payload: Payload,
  workshop: Workshop,
): Promise<{ created: boolean }> {
  const dbSlug = workshop.slug

  if (SPECIAL_WORKSHOP_DB_SLUGS.has(dbSlug)) {
    payload.logger.info(`[workshop-provision] Skipping page for special workshop ${dbSlug}`)
    return { created: false }
  }

  const existing = await findWorkshopPage(payload, dbSlug)
  if (existing) return { created: false }

  const pageSlug = resolvePageSlugForDbSlug(dbSlug)
  const titleDe = typeof workshop.title === 'string' ? workshop.title : dbSlug
  const price = workshop.basePrice ?? 99

  const pageDE = await payload.create({
    collection: 'pages',
    locale: 'de',
    draft: false,
    data: {
      ...buildDefaultPageShellDE(pageSlug, titleDe),
      workshopDetail: buildDefaultWorkshopPageDE(titleDe, price),
    },
    context: PROVISION_CTX,
  })

  const saved = await payload.findByID({
    collection: 'pages',
    id: pageDE.id,
    locale: 'de',
    depth: 0,
  })

  const savedDetail = (saved as { workshopDetail?: Record<string, unknown> }).workshopDetail
  const enWorkshopDetail = mergeWorkshopPageSectionIds(
    savedDetail,
    buildDefaultWorkshopPageEN(titleDe, price),
  )

  await payload.update({
    collection: 'pages',
    id: pageDE.id,
    locale: 'en',
    data: {
      ...buildDefaultPageShellEN(titleDe),
      workshopDetail: enWorkshopDetail,
    },
    context: PROVISION_CTX,
  })

  payload.logger.info(`[workshop-provision] Created page /workshops/${pageSlug}`)
  return { created: true }
}

/** Auto-create cart product + public CMS page when a workshop is saved. */
export async function provisionWorkshopResources(
  payload: Payload,
  workshop: Workshop,
): Promise<ProvisionResult> {
  const productResult = await ensureWorkshopProduct(payload, workshop)
  const pageResult = await ensureWorkshopPage(payload, workshop)

  if (productResult.created || productResult.updated || pageResult.created) {
    revalidateTag('workshops')
    revalidateTag('pages')
  }

  return {
    productCreated: productResult.created,
    productUpdated: productResult.updated,
    pageCreated: pageResult.created,
  }
}
