'use client'

import { Media as MediaComponent } from '@/components/Media'
import { RichText } from '@/components/RichText'
import type { Media as MediaType } from '@/payload-types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
 *  Article Detail — Client Component
 *
 *  Clean reading experience for fermentation how-to articles.
 *  Content comes from the Posts CMS collection (richText field).
 *
 *  - Back navigation to lakto workshop
 *  - Hero image from CMS (or warm-gray placeholder)
 *  - RichText body rendered with Payload Lexical converter
 *  - Related articles at bottom (fetched by server component)
 * ═══════════════════════════════════════════════════════════════ */

// Minimal subset of Post fields used by this component.
// Mirrors the generated `Post` type from @/payload-types — safe
// to replace with `import type { Post } from '@/payload-types'` after
// running `pnpm generate:types`.
export type PostData = {
  id: string
  slug: string
  title: string
  summary?: string | null
  readTime?: string | null
  heroImage?: MediaType | string | null
  content?: SerializedEditorState | null
}

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

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export function ArticleDetailClient({
  post,
  relatedPosts = [],
}: {
  post: PostData
  relatedPosts?: PostData[]
}) {
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
            {post.title}
          </h1>
          {post.readTime && (
            <div className="mt-4 flex items-center gap-2 text-ff-gray-text-light">
              <ClockIcon />
              <span className="font-display text-body-sm font-medium">{post.readTime} Lesezeit</span>
            </div>
          )}
          {post.summary && (
            <p className="mt-6 text-body-lg leading-relaxed text-ff-gray-text">{post.summary}</p>
          )}
        </header>

        {/* ─── Hero Image ─── */}
        <div>
          {isResolvedMedia(post.heroImage) ? (
            <div className="aspect-21/9 w-full overflow-hidden rounded-2xl">
              <MediaComponent
                resource={post.heroImage}
                imgClassName="size-full object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-21/9 w-full rounded-2xl bg-ff-warm-gray" />
          )}
        </div>

        {/* ─── Article Content (RichText) ─── */}
        <article className="mx-auto max-w-content-narrow py-12 lg:py-16">
          {post.content ? (
            <RichText
              data={post.content}
              enableGutter={false}
              className="[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-subheading [&_h2]:font-bold [&_h2]:text-ff-near-black [&_p]:mt-4 [&_p]:text-body [&_p]:leading-relaxed [&_p]:text-ff-gray-text [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-body [&_ul]:leading-relaxed [&_ul]:text-ff-gray-text [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-body [&_ol]:leading-relaxed [&_ol]:text-ff-gray-text first:[&_h2]:mt-0"
            />
          ) : (
            <p className="text-body text-ff-gray-text-light italic">
              Inhalt wird gerade hinzugefügt …
            </p>
          )}
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
        {relatedPosts.length > 0 && (
          <section className="pb-16 lg:pb-24">
            <h2 className="mb-8 font-display text-section-heading font-bold text-ff-near-black">
              Weitere Tipps
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/tipps/${rel.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-ff-border-light bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {isResolvedMedia(rel.heroImage) ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <MediaComponent
                        resource={rel.heroImage}
                        imgClassName="size-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-ff-warm-gray transition-opacity duration-300 group-hover:opacity-90" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 font-display text-body-lg font-bold leading-snug text-ff-near-black transition-colors group-hover:text-ff-gray-text">
                      {rel.title}
                    </h3>
                    {rel.summary && (
                      <p className="mb-4 flex-1 text-body-sm leading-relaxed text-ff-gray-text-light line-clamp-2">
                        {rel.summary}
                      </p>
                    )}
                    {rel.readTime && (
                      <p className="font-display text-caption font-medium text-ff-gold-accent">
                        {rel.readTime} Lesezeit
                      </p>
                    )}
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

