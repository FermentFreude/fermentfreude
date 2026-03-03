'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ARTICLES as ARTICLE_DATA } from '@/app/(app)/tipps/article-data'

/* ═══════════════════════════════════════════════════════════════
 *  Fermented Vegetables How-Tos — Article Card Grid
 *
 *  A curated selection of 6 educational articles about
 *  lacto-fermentation, rewritten in FermentFreude brand voice.
 *  Each card links to an internal /tipps/[slug] article page.
 *
 *  Features:
 *  - 2×3 responsive grid (1 col mobile → 2 col md → 3 col lg)
 *  - Animated entrance on scroll (IntersectionObserver)
 *  - Hover effects with subtle card lift
 *  - Placeholder images (managed via admin)
 * ═══════════════════════════════════════════════════════════════ */

// ─── Map article data to card format ────────────────────────

const ARTICLES = ARTICLE_DATA.map((a) => ({
  id: a.slug,
  title: a.title,
  description: a.description,
  readTime: a.readTime,
  href: `/tipps/${a.slug}`,
}))

// ─── Component ──────────────────────────────────────────────

export function FermentedVegHowTos() {
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

  return (
    <section
      ref={sectionRef}
      className="my-12 py-section-padding-lg lg:my-20"
    >
      <div className="container mx-auto container-padding">
      {/* Header */}
      <div
        className={`mb-12 transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <p className="mb-3 font-display text-body-sm font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
          Tipps & Guides
        </p>
        <h2 className="font-display text-subheading font-bold tracking-wide text-ff-near-black">
          Lerne fermentieren.
        </h2>
        <p className="mt-3 max-w-lg text-body leading-relaxed text-ff-gray-text">
          Einfache Anleitungen für dein erstes Ferment — direkt aus unserer Küche.
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {ARTICLES.map((article, index) => (
          <Link
            key={article.id}
            href={article.href}
            className={`group flex flex-col overflow-hidden rounded-2xl border border-ff-border-light bg-ff-cream transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
            style={{
              transitionDelay: isVisible ? `${150 + index * 100}ms` : '0ms',
            }}
          >
            {/* Image placeholder — replace via admin */}
            <div className="aspect-video w-full bg-ff-warm-gray transition-opacity duration-300 group-hover:opacity-90" />

            {/* Content */}
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              {/* Title */}
              <h3 className="mb-3 font-display text-subheading font-bold leading-snug text-ff-near-black transition-colors group-hover:text-ff-gray-text">
                {article.title}
              </h3>

              {/* Description */}
              <p className="mb-6 flex-1 text-body leading-relaxed text-ff-gray-text-light">
                {article.description}
              </p>

              {/* Footer: Read Time */}
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
