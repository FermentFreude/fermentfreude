import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { ArticleDetailClient } from './ArticleDetailClient'

/* ═══════════════════════════════════════════════════════════════
 *  /tipps/[slug] — Server Component
 *
 *  Resolves the article from the Posts CMS collection and renders
 *  the client component. Returns 404 if slug doesn't match.
 * ═══════════════════════════════════════════════════════════════ */

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    limit: 1000,
    depth: 0,
  })
  return posts.docs.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }) {
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

  // Fetch up to 3 related articles (exclude current)
  const relatedResult = await payload.find({
    collection: 'posts',
    where: { slug: { not_equals: slug } },
    limit: 3,
    depth: 1,
    locale,
  })

  return <ArticleDetailClient post={post} relatedPosts={relatedResult.docs} />
}

