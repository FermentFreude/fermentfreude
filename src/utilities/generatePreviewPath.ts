import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  products: '/products',
  pages: '',
}

// Pages with dedicated routes that differ from their slug
const pageSlugRouteMap: Record<string, string> = {
  voucher: '/workshops/voucher',
  tempeh: '/workshops/tempeh',
  'lakto-gemuese': '/workshops/lakto-gemuese',
  kombucha: '/workshops/kombucha',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Use dedicated route path if this slug has one, otherwise use default prefix
  const path =
    collection === 'pages' && pageSlugRouteMap[slug]
      ? pageSlugRouteMap[slug]
      : `${collectionPrefixMap[collection]}/${slug}`

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
