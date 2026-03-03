'use client'

import Link from 'next/link'
import { ARTICLES, type Article } from '../article-data'

/* ═══════════════════════════════════════════════════════════════
 *  Article Detail — Client Component
 *
 *  Clean reading experience for fermentation how-to articles.
 *  - Back navigation to workshop page
 *  - Image placeholder (managed via admin)
 *  - Section-based content layout
 *  - Related articles at bottom
 * ═══════════════════════════════════════════════════════════════ */

function ArrowLeftIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

function ClockIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

export function ArticleDetailClient({ article }: { article: Article }) {
  // Get up to 3 related articles (exclude current)
  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <main className="min-h-screen bg-ff-cream">
      <div className="container mx-auto container-padding">
      {/* ─── Back Navigation ─── */}
      <div className="pt-8">
        <Link
          href="/workshops/lakto-gemuese"
          className="group inline-flex items-center gap-2 font-display text-body-sm font-medium text-ff-gray-text transition-colors hover:text-ff-near-black"
        >
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
          Zurück zum Workshop
        </Link>
      </div>

      {/* ─── Article Header ─── */}
      <header className="mx-auto max-w-content-narrow pb-8 pt-12">
        <p className="mb-3 font-display text-body-sm font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
          How-To
        </p>
        <h1 className="font-display text-display font-bold tracking-wide text-ff-near-black">
          {article.title}
        </h1>
        <div className="mt-4 flex items-center gap-2 text-ff-gray-text-light">
          <ClockIcon />
          <span className="font-display text-body-sm font-medium">{article.readTime} Lesezeit</span>
        </div>
        <p className="mt-6 text-body-lg leading-relaxed text-ff-gray-text">
          {article.description}
        </p>
      </header>

      {/* ─── Hero Image Placeholder ─── */}
      <div>
        <div className="aspect-[21/9] w-full rounded-2xl bg-ff-warm-gray" />
      </div>

      {/* ─── Article Content ─── */}
      <article className="mx-auto max-w-content-narrow py-12 lg:py-16">
        {article.sections.map((section, index) => (
          <section key={index} className={index > 0 ? 'mt-10 lg:mt-12' : ''}>
            <h2 className="mb-4 font-display text-subheading font-bold text-ff-near-black">
              {section.heading}
            </h2>
            {section.body.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className={`text-body leading-relaxed text-ff-gray-text ${pIdx > 0 ? 'mt-4' : ''}`}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>

      {/* ─── CTA ─── */}
      <div className="mx-auto max-w-content-narrow pb-12">
        <div className="rounded-2xl border border-ff-border-light bg-ff-ivory p-8 text-center lg:p-12">
          <p className="mb-2 font-display text-body-sm font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
            Jetzt ausprobieren
          </p>
          <h3 className="mb-4 font-display text-subheading font-bold text-ff-near-black">
            Lerne Fermentieren in unserem Workshop
          </h3>
          <p className="mb-8 text-body leading-relaxed text-ff-gray-text">
            In unserem Lakto-Gemüse-Workshop zeigen wir dir Schritt für Schritt,
            wie du dein erstes Ferment ansetzt — mit frischen Zutaten, Profi-Tipps
            und ganz viel Spaß.
          </p>
          <Link
            href="/workshops/lakto-gemuese"
            className="inline-flex items-center gap-2 rounded-(--radius-pill) bg-ff-near-black px-8 py-3 font-display text-body-sm font-semibold text-white transition-all duration-300 hover:bg-ff-charcoal"
          >
            Zum Workshop
          </Link>
        </div>
      </div>

      {/* ─── Related Articles ─── */}
      {related.length > 0 && (
        <section className="pb-16 lg:pb-24">
          <h2 className="mb-8 font-display text-section-heading font-bold text-ff-near-black">
            Weitere Tipps
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/tipps/${rel.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-ff-border-light bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Placeholder image */}
                <div className="aspect-[16/9] w-full bg-ff-warm-gray transition-opacity duration-300 group-hover:opacity-90" />

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 font-display text-body-lg font-bold leading-snug text-ff-near-black transition-colors group-hover:text-ff-gray-text">
                    {rel.title}
                  </h3>
                  <p className="mb-4 flex-1 text-body-sm leading-relaxed text-ff-gray-text-light line-clamp-2">
                    {rel.description}
                  </p>
                  <p className="font-display text-caption font-medium text-ff-gold-accent">
                    {rel.readTime} Lesezeit
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </main>
  )
}
