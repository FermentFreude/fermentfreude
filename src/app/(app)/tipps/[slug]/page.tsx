import { FELD_INS_GLAS_HOWTO_SLUGS } from '@/app/(app)/workshops/[slug]/FeldInsGlas/data'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload, type Where } from 'payload'

import { ArticleDetailClient } from './ArticleDetailClient'

export const dynamic = 'force-dynamic'

/* ═══════════════════════════════════════════════════════════════
 *  /tipps/[slug] — Server Component
 *
 *  Resolves the article from the Posts CMS collection and renders
 *  the client component. Returns 404 if slug doesn't match.
 * ═══════════════════════════════════════════════════════════════ */

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      limit: 1000,
      depth: 0,
    })
    return posts.docs.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Params }) {
  try {
    const { slug } = await params
    const locale = await getLocale()
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      locale,
    })
    const post = result.docs[0]
    if (!post) return {}

    return {
      title: `${post.title} — FermentFreude`,
      description: post.summary ?? undefined,
    }
  } catch {
    return {}
  }
}

export default async function TippsArticlePage({ params }: { params: Params }) {
  const { slug } = await params
  const locale = await getLocale()
  const payload = await getPayload({ config: configPromise })

  // Fetch the requested article
  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    locale,
  })
  const post = result.docs[0]
  if (!post) notFound()

  // Prefer related articles from the same series (Feld ins Glas / workshop type)
  const isFeldInsGlas = (FELD_INS_GLAS_HOWTO_SLUGS as readonly string[]).includes(slug)
  const relatedWhere: Where = isFeldInsGlas
    ? {
        and: [
          { slug: { not_equals: slug } },
          { slug: { in: [...FELD_INS_GLAS_HOWTO_SLUGS] } },
        ],
      }
    : post.workshopType
      ? {
          and: [
            { slug: { not_equals: slug } },
            { workshopType: { equals: post.workshopType } },
          ],
        }
      : { slug: { not_equals: slug } }

  const relatedResult = await payload.find({
    collection: 'posts',
    where: relatedWhere,
    limit: 3,
    depth: 1,
    locale,
  })

  return <ArticleDetailClient post={post} relatedPosts={relatedResult.docs} />
}
