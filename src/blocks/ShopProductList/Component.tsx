import type { Product, ShopProductListBlock } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { ShopProductListClient } from './ShopProductListClient'

export const ShopProductListComponent: React.FC<ShopProductListBlock> = async (props) => {
  const { heading, products: selectedProducts } = props
  const locale = (await getLocale()) as 'de' | 'en'
  const payload = await getPayload({ config: configPromise })

  // If admin selected specific products, resolve them; otherwise fetch all published
  const selectedIds = (selectedProducts ?? [])
    .map((p) => (typeof p === 'object' && p !== null ? p.id : p))
    .filter(Boolean) as string[]

  let products: Product[]

  if (selectedIds.length > 0) {
    const result = await payload.find({
      collection: 'products',
      where: {
        id: { in: selectedIds },
        _status: { equals: 'published' },
      },
      locale,
      depth: 2,
      limit: selectedIds.length,
      overrideAccess: true,
    })
    // Preserve admin-chosen order
    const byId = new Map(result.docs.map((d) => [d.id, d]))
    products = selectedIds.map((id) => byId.get(id)).filter(Boolean) as Product[]
  } else {
    const result = await payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      locale,
      depth: 2,
      limit: 50,
      sort: 'title',
      overrideAccess: true,
    })
    products = result.docs as Product[]
  }

  if (products.length === 0) return null

  return <ShopProductListClient products={products} heading={heading} />
}
