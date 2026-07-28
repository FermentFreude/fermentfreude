import type { Payload } from 'payload'

import { resolvePageSlugForDbSlug } from '@/utilities/workshopPageUtils'

import { productSlugForWorkshop } from './constants'
import { findWorkshopPage } from './findWorkshopPage'

export type WorkshopSetupStatus = {
  dbSlug: string
  pageSlug: string
  productSlug: string
  hasProduct: boolean
  hasPage: boolean
  hasAppointments: boolean
  appointmentCount: number
  isActive: boolean
  publicUrl: string
  productAdminUrl: string | null
  pageAdminUrl: string | null
  appointmentsAdminUrl: string
  readyForBooking: boolean
  readyForPublic: boolean
}

export async function getWorkshopSetupStatus(
  payload: Payload,
  workshopId: string,
): Promise<WorkshopSetupStatus | null> {
  let workshop
  try {
    workshop = await payload.findByID({
      collection: 'workshops',
      id: workshopId,
      depth: 0,
      locale: 'de',
    })
  } catch {
    return null
  }

  const dbSlug = workshop.slug
  if (!dbSlug) return null

  const pageSlug = resolvePageSlugForDbSlug(dbSlug)
  const productSlug = productSlugForWorkshop(dbSlug)

  const [productResult, page, appointmentsResult] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { slug: { equals: productSlug } },
      limit: 1,
      depth: 0,
    }),
    findWorkshopPage(payload, dbSlug),
    payload.find({
      collection: 'workshop-appointments',
      where: {
        and: [
          { workshop: { equals: workshopId } },
          { isPublished: { equals: true } },
        ],
      },
      limit: 100,
      depth: 0,
    }),
  ])

  const now = new Date()
  const futureAppointments = appointmentsResult.docs.filter((row) => {
    if (!row.dateTime) return false
    return new Date(row.dateTime) > now
  })

  const hasProduct = productResult.docs.length > 0
  const hasPage = Boolean(page)
  const hasAppointments = futureAppointments.length > 0
  const isActive = Boolean(workshop.isActive)
  const productId = productResult.docs[0]?.id
  const pageId = page?.id

  return {
    dbSlug,
    pageSlug: page?.slug ?? pageSlug,
    productSlug,
    hasProduct,
    hasPage,
    hasAppointments,
    appointmentCount: futureAppointments.length,
    isActive,
    publicUrl: `/workshops/${page?.slug ?? pageSlug}`,
    productAdminUrl: productId ? `/admin/collections/products/${productId}` : null,
    pageAdminUrl: pageId ? `/admin/collections/pages/${pageId}` : null,
    appointmentsAdminUrl: `/admin/collections/workshop-appointments?limit=10`,
    readyForBooking: hasProduct && hasAppointments,
    readyForPublic: hasProduct && hasPage && isActive,
  }
}
