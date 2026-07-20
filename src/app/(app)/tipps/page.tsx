import { Media as MediaComponent } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export async function generateMetadata() {
  const locale = await getLocale()
  return {
    title: locale === 'de' ? 'Tipps & Guides — FermentFreude' : 'Tips & Guides — FermentFreude',
    description:
      locale === 'de'
        ? 'Anleitungen und Guides rund ums Fermentieren.'
        : 'Guides and how-tos for fermentation.',
  }
}

export default async function TippsIndexPage() {
  const locale = await getLocale()
  const isDe = locale === 'de'
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    limit: 100,
    depth: 1,
    locale,
    sort: '-updatedAt',
  })

  const posts = result.docs.filter((p) => p.slug && p.title)

  return (
    <main className="min-h-screen bg-ff-cream">
      <div className="container mx-auto container-padding pb-16 pt-12 lg:pb-24 lg:pt-16">
        <header className="mx-auto max-w-content-narrow pb-10">
          <p className="mb-3 font-display text-body-sm font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
            {isDe ? 'Wissen' : 'Knowledge'}
          </p>
          <h1 className="font-display text-display font-bold tracking-wide text-ff-near-black">
            {isDe ? 'Tipps & Guides' : 'Tips & Guides'}
          </h1>
          <p className="mt-4 text-body-lg leading-relaxed text-ff-gray-text">
            {isDe
              ? 'Anleitungen aus unserer Küche — für dein Ferment zu Hause.'
              : 'Guides from our kitchen — for your ferments at home.'}
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-body text-ff-gray-text-light">{isDe ? 'Bald mehr Tipps …' : 'More tips coming soon…'}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/tipps/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-ff-border-light bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {isResolvedMedia(post.heroImage) ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <MediaComponent
                      resource={post.heroImage}
                      imgClassName="size-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-ff-warm-gray transition-opacity duration-300 group-hover:opacity-90" />
                )}

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="mb-2 font-display text-body-lg font-bold leading-snug text-ff-near-black transition-colors group-hover:text-ff-gray-text">
                    {post.title}
                  </h2>
                  {post.summary ? (
                    <p className="mb-4 flex-1 text-body-sm leading-relaxed text-ff-gray-text-light line-clamp-2">
                      {post.summary}
                    </p>
                  ) : null}
                  {post.readTime ? (
                    <p className="font-display text-caption font-medium text-ff-gold-accent">
                      {post.readTime} {isDe ? 'Lesezeit' : 'read'}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
