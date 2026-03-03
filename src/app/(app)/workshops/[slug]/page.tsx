import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { getWorkshopBySlug } from './workshop-data'
import { WorkshopDetailClient } from './WorkshopDetailClient'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop detail page — /workshops/[slug]
 *
 *  Uses hardcoded workshop data for now (no CMS seed yet).
 *  The WorkshopDetailClient renders the full page based on
 *  Figma designs: hero card, dates, info panel, booking modal.
 * ═══════════════════════════════════════════════════════════════ */

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const workshop = getWorkshopBySlug(slug)

  if (!workshop) {
    return { title: 'Workshop | Fermentfreude' }
  }

  return {
    title: `${workshop.title} | Fermentfreude`,
    description: workshop.description,
  }
}

export default async function WorkshopDetailPage({ params }: Args) {
  const { slug } = await params
  const workshop = getWorkshopBySlug(slug)

  if (!workshop) {
    return notFound()
  }

  return <WorkshopDetailClient workshop={workshop} />
}
