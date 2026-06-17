import type { Metadata } from 'next'

import type { Page, Product } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'

export const generateMeta = async (args: { doc: Page | Product }): Promise<Metadata> => {
  const { doc } = args || {}

  const mediaUrl =
    typeof doc?.meta?.image === 'object' &&
    doc.meta.image !== null &&
    'url' in doc.meta.image
      ? (doc.meta.image as { url: string }).url
      : null

  // R2-hosted media URLs are already absolute; only prepend server URL for relative paths
  const ogImage = mediaUrl
    ? mediaUrl.startsWith('http')
      ? mediaUrl
      : `${process.env.NEXT_PUBLIC_SERVER_URL}${mediaUrl}`
    : null

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      ...(doc?.meta?.description ? { description: doc?.meta?.description } : {}),
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      title: doc?.meta?.title || doc?.title || 'FermentFreude',
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title: doc?.meta?.title || doc?.title || 'FermentFreude',
  }
}
