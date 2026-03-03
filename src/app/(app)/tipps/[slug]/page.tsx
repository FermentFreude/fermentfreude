import { notFound } from 'next/navigation'
import { getArticleBySlug, ARTICLES } from '../article-data'
import { ArticleDetailClient } from './ArticleDetailClient'

/* ═══════════════════════════════════════════════════════════════
 *  /tipps/[slug] — Server Component
 *
 *  Resolves the article from static data and renders the
 *  client component. Returns 404 if slug doesn't match.
 * ═══════════════════════════════════════════════════════════════ */

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  return {
    title: `${article.title} — FermentFreude`,
    description: article.description,
  }
}

export default async function TippsArticlePage({ params }: { params: Params }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return <ArticleDetailClient article={article} />
}
