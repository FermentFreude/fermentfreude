'use client'

import { ARTICLES as LAKTO_ARTICLES } from '@/app/(app)/tipps/article-data'
import { TEMPEH_ARTICLES } from '@/app/(app)/tipps/tempeh-articles'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  Fermented Vegetables How-Tos — Article Card Grid
 *
 *  Flexible article section for any workshop type:
 *  - Lakto: 6 articles about lacto-fermentation
 *  - Tempeh: 6 articles about tempeh making
 *  - Kombucha: (placeholder for future articles)
 *
 *  Each card links to an internal /tipps/[slug] article page.
 *
 *  CMS data is passed via the `cms` prop from workshop detail pages.
 *  Falls back to hardcoded defaults when no CMS data is set.
 *
 *  Features:
 *  - 2×3 responsive grid (1 col mobile → 2 col md → 3 col lg)
 *  - Animated entrance on scroll (IntersectionObserver)
 *  - Hover effects with subtle card lift
 *  - Multi-workshop type support via `workshopType` prop
 * ═══════════════════════════════════════════════════════════════ */

// ─── CMS types ──────────────────────────────────────────────

/**
 * Represents a resolved Post document from the `posts` relationship.
 * Populated at depth ≥ 1 when querying workshopDetail.howToArticles.
 */
export type PostCard = {
  id: string
  slug?: string | null
  title?: string | null
  summary?: string | null
  readTime?: string | null
  heroImage?: MediaType | string | null
}

export type FermentedVegHowTosCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  /** Relationship to Posts collection, resolved by depth ≥ 1 */
  howToArticles?: (string | PostCard)[] | null
}

export type WorkshopType = 'lakto' | 'tempeh' | 'kombucha'

// ─── Hardcoded defaults ──────────────────────────────────────

const DEFAULT_EYEBROW = 'Tips & Guides'
const DEFAULT_TITLE_DE = {
  lakto: 'Lerne zu fermentieren.',
  tempeh: 'Lerne Tempeh herzustellen.',
  kombucha: 'Lerne Kombucha zu brauen.',
}
const DEFAULT_TITLE_EN = {
  lakto: 'Learn to ferment.',
  tempeh: 'Learn to make tempeh.',
  kombucha: 'Learn to brew kombucha.',
}
const DEFAULT_DESCRIPTION_DE = {
  lakto: 'Einfache Anleitungen für dein erstes Ferment — direkt aus unserer Küche.',
  tempeh: 'Praktische Anleitung zur Tempeh-Herstellung — von unseren Experten.',
  kombucha: 'Schritt-für-Schritt Anleitung zu deinem ersten Kombucha — aus unserer Küche.',
}
const DEFAULT_DESCRIPTION_EN = {
  lakto: 'Simple guides for your first ferment — straight from our kitchen.',
  tempeh: 'Practical guide to making tempeh — from our experts.',
  kombucha: 'Step-by-step guide to your first kombucha — from our kitchen.',
}

function getArticlesByWorkshopType(workshopType: WorkshopType = 'lakto') {
  const articles = workshopType === 'tempeh' ? TEMPEH_ARTICLES : LAKTO_ARTICLES
  return articles.map((a) => ({
    id: a.slug,
    title: a.title,
    description: a.description,
    readTime: a.readTime,
    image: null as MediaType | null,
    href: `/tipps/${a.slug}`,
  }))
}

// ─── Component ──────────────────────────────────────────────

export function FermentedVegHowTos({
  cms,
  workshopType = 'lakto',
  locale = 'de',
}: {
  cms?: FermentedVegHowTosCMS
  workshopType?: WorkshopType
  locale?: 'de' | 'en'
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const eyebrow = cms?.eyebrow ?? DEFAULT_EYEBROW
  const sectionTitle =
    cms?.title ??
    (locale === 'en' ? DEFAULT_TITLE_EN[workshopType] : DEFAULT_TITLE_DE[workshopType])
  const sectionDescription =
    cms?.description ??
    (locale === 'en' ? DEFAULT_DESCRIPTION_EN[workshopType] : DEFAULT_DESCRIPTION_DE[workshopType])

  // Build card list from CMS posts (relationship resolved at depth ≥ 1),
  // falling back to hardcoded defaults when no CMS data or fewer than expected posts.
  const resolvedPosts: PostCard[] = (cms?.howToArticles ?? []).filter(
    (item): item is PostCard => typeof item === 'object' && item !== null,
  )

  const DEFAULT_ARTICLES = getArticlesByWorkshopType(workshopType)

  const articles = DEFAULT_ARTICLES.map((def, i) => {
    const post = resolvedPosts[i]
    return {
      id: post?.id ?? def.id,
      title: post?.title ?? def.title,
      description: post?.summary ?? def.description,
      readTime: post?.readTime ?? def.readTime,
      image:
        post?.heroImage && typeof post.heroImage === 'object' && 'url' in post.heroImage
          ? (post.heroImage as MediaType)
          : null,
      href: post?.slug ? `/tipps/${post.slug}` : def.href,
    }
  })

  return (
    <section ref={sectionRef} className="my-12 py-section-padding-lg lg:my-20">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <div
          className={`mb-12 transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <p className="mb-3 font-display text-body-sm font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
            {eyebrow}
          </p>
          <h2 className="font-display text-subheading font-bold tracking-wide text-ff-near-black">
            {sectionTitle}
          </h2>
          <p className="mt-3 max-w-lg text-body leading-relaxed text-ff-gray-text">
            {sectionDescription}
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {articles.map((article, index) => (
            <Link
              key={article.id}
              href={article.href}
              className={`group flex flex-col overflow-hidden rounded-2xl border border-ff-border-light bg-ff-cream transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: isVisible ? `${150 + index * 100}ms` : '0ms' }}
            >
              {/* Cover image */}
              <div className="relative aspect-video w-full overflow-hidden bg-ff-warm-gray transition-opacity duration-300 group-hover:opacity-90">
                {article.image ? (
                  <Media resource={article.image} fill imgClassName="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[#ECE5DE]" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <h3 className="mb-3 font-display text-subheading font-bold leading-snug text-ff-near-black transition-colors group-hover:text-ff-gray-text">
                  {article.title}
                </h3>
                <p className="mb-6 flex-1 text-body leading-relaxed text-ff-gray-text-light">
                  {article.description}
                </p>
                <p className="font-display text-body-sm font-black uppercase tracking-widest text-ff-gold-accent">
                  {article.readTime} Lesezeit
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
