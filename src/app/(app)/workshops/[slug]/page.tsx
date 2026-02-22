import type { Media as MediaType, Page as PageType, WorkshopSliderBlock } from '@/payload-types'
import type { Metadata } from 'next'

import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop detail page — /workshops/[slug]
 *
 *  Workshops live inline inside WorkshopSlider blocks across
 *  different CMS pages. This route extracts the matching workshop
 *  by its ctaLink slug and renders a detail view.
 * ═══════════════════════════════════════════════════════════════ */

// English defaults — shown when CMS has no data
const DEFAULT_BACK_LABEL = 'All Workshops'
const DEFAULT_CTA_LABEL = 'Book Workshop'
const DEFAULT_CTA_HREF = '/contact'
const DEFAULT_FEATURES_HEADING = 'What to Expect'

type WorkshopData = {
  title: string
  description: string
  features: { text: string }[]
  image: MediaType | string | null | undefined
  detailsButtonLabel?: string | null
}

/**
 * Search all pages for a WorkshopSlider block or HeroSlider
 * containing a workshop whose link matches `/workshops/{slug}`.
 */
async function findWorkshopBySlug(slug: string, locale: 'de' | 'en'): Promise<WorkshopData | null> {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    depth: 3,
    limit: 100,
    locale,
    pagination: false,
  })

  const target = `/workshops/${slug}`

  for (const page of pages.docs as PageType[]) {
    // 1. Search WorkshopSlider blocks in layout
    const blocks = page.layout ?? []
    for (const block of blocks) {
      if (block.blockType === 'workshopSlider') {
        const wsBlock = block as WorkshopSliderBlock
        const match = wsBlock.workshops?.find(
          (w) => w.ctaLink === target || w.ctaLink === `/${slug}`,
        )
        if (match) {
          return {
            title: match.title,
            description: match.description,
            features: (match.features ?? []).map((f) => ({ text: f.text })),
            image: match.image ?? null,
          }
        }
      }
    }

    // 2. Search HeroSlider slides (hero.heroSlides[].ctaHref)
    const hero = page.hero as Record<string, unknown> | undefined
    const heroSlides = (hero?.heroSlides ?? []) as Array<{
      slideId?: string
      title?: string
      description?: string
      ctaHref?: string
      leftImage?: MediaType | string | null
      rightImage?: MediaType | string | null
      attributes?: Array<{ text: string }>
    }>
    for (const slide of heroSlides) {
      if (slide.ctaHref === target) {
        return {
          title: (slide.title ?? slug).replace(/\\n/g, ' '),
          description: slide.description ?? '',
          features: (slide.attributes ?? []).map((a) => ({ text: a.text })),
          image: slide.leftImage ?? slide.rightImage ?? null,
        }
      }
    }
  }

  return null
}

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const workshop = await findWorkshopBySlug(slug, locale)

  if (!workshop) {
    return { title: 'Workshop | Fermentfreude' }
  }

  return {
    title: `${workshop.title} | Fermentfreude`,
    description: workshop.description,
  }
}

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export default async function WorkshopDetailPage({ params }: Args) {
  const { slug } = await params
  const locale = await getLocale()
  const workshop = await findWorkshopBySlug(slug, locale)

  if (!workshop) {
    return notFound()
  }

  const { title, description, features, image } = workshop

  return (
    <article className="pb-24">
      {/* ── Hero section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#333333]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-4/3 lg:aspect-auto lg:min-h-130">
            {isResolvedMedia(image) ? (
              <Media resource={image} fill imgClassName="object-cover" priority />
            ) : (
              <div className="flex size-full items-center justify-center bg-[#ECE5DE]">
                <span className="font-display text-2xl text-[#333]/40">{title}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-20">
            <Link
              href="/workshops"
              className="mb-6 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-white/60 transition-colors hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {DEFAULT_BACK_LABEL}
            </Link>

            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">{description}</p>

            <div className="mt-10">
              <Link
                href={DEFAULT_CTA_HREF}
                className="inline-flex items-center justify-center rounded-full bg-[#E5B765] px-10 py-4 font-display text-base font-bold text-[#1a1a1a] shadow-sm transition-all hover:bg-[#d4a654] hover:shadow-md"
              >
                {DEFAULT_CTA_LABEL}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features section ─────────────────────────────────── */}
      {features.length > 0 && (
        <section className="px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">
              {DEFAULT_FEATURES_HEADING}
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-[#1a1a1a]/10 p-6"
                >
                  <span className="font-display text-2xl font-bold text-[#E5B765]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="font-display text-base font-bold leading-snug text-[#1a1a1a]">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA section ──────────────────────────────────────── */}
      <section className="px-6 pb-8 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-2xl bg-[#f9f0dc] px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">
            {locale === 'de' ? 'Bereit loszulegen?' : 'Ready to get started?'}
          </h2>
          <p className="mt-4 max-w-md text-base text-[#333]">
            {locale === 'de'
              ? 'Kontaktiere uns, um deinen Platz zu reservieren oder mehr Informationen zu erhalten.'
              : 'Get in touch to reserve your spot or learn more about this workshop.'}
          </p>
          <Link
            href={DEFAULT_CTA_HREF}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#2a2a2a] px-10 py-4 font-display text-base font-bold text-white shadow-sm transition-colors hover:bg-[#1a1a1a]"
          >
            {locale === 'de' ? 'Kontaktiere uns' : 'Contact Us'}
          </Link>
        </div>
      </section>
    </article>
  )
}
