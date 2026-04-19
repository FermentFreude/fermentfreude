import { getServerSideURL } from '@/utilities/getURL'
import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  /sitemap.xml — dynamically generated from Payload CMS data
 *
 *  Includes:
 *  - Static pages (home, workshops, shop, courses, etc.)
 *  - CMS pages (pages collection, published, non-home)
 *  - Product detail pages (/products/[slug])
 *  - Workshop detail pages (/workshops/[slug])
 * ═══════════════════════════════════════════════════════════════ */

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerSideURL()

  // ─── Static pages ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/workshops`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/workshops/lakto-gemuese`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/workshops/kombucha`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/workshops/tempeh`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/workshops/voucher`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/gastronomy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/fermentation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/tipps`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/impressum`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/datenschutz`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/agb`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // ─── CMS pages ─────────────────────────────────────────────
  let payload
  try {
    payload = await getPayload({ config: configPromise })
  } catch {
    return staticPages
  }

  let cmsPages: MetadataRoute.Sitemap = []
  try {
    const pagesResult = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 500,
      overrideAccess: true,
      select: { slug: true, updatedAt: true },
    })

    const EXCLUDED_SLUGS = new Set([
      'home',
      'workshops',
      'shop',
      'courses',
      'gastronomy',
      'fermentation',
      'tipps',
      'impressum',
      'datenschutz',
      'agb',
    ])

    cmsPages = pagesResult.docs
      .filter((page) => page.slug && !EXCLUDED_SLUGS.has(page.slug as string))
      .map((page) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt as string) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  } catch {
    // Payload not available during static build — skip
  }

  // ─── Product pages ─────────────────────────────────────────
  let productPages: MetadataRoute.Sitemap = []
  try {
    const productsResult = await payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 500,
      overrideAccess: true,
      select: { slug: true, updatedAt: true },
    })

    productPages = productsResult.docs
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt as string) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
  } catch {
    // Payload not available during static build — skip
  }

  return [...staticPages, ...cmsPages, ...productPages]
}
