import { ShopFeaturedSection } from '@/components/shop/ShopFeaturedSection'
import { ShopGiftSection } from '@/components/shop/ShopGiftSection'
import { ShopHero } from '@/components/shop/ShopHero'
import { ShopProductSection } from '@/components/shop/ShopProductSection'
import { ShopWorkshopCta } from '@/components/shop/ShopWorkshopCta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata = {
  description: 'Discover unique handcrafted ferments. Shop Kombucha, fermented vegetables, and more.',
  title: 'Shop | FermentFreude',
}

const PRODUCTS_PER_PAGE = 12

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const locale = await getLocale()
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(String(pageParam || '1'), 10))

  const getShop = getCachedGlobal('shop', 2, locale as 'de' | 'en')
  const shopData = await getShop()

  const payload = await getPayload({ config: configPromise })

  const { docs: products, totalDocs } = await payload.find({
    collection: 'products',
    draft: false,
    locale,
    overrideAccess: false,
    depth: 2,
    limit: PRODUCTS_PER_PAGE,
    page,
    sort: 'title',
    where: {
      _status: { equals: 'published' },
    },
  })

  const hasMore = page * PRODUCTS_PER_PAGE < totalDocs

  return (
    <article className="pb-24">
      <ShopHero data={shopData} />
      <ShopProductSection
        data={shopData}
        products={products}
        hasMore={hasMore}
        nextPage={hasMore ? page + 1 : undefined}
      />
      <ShopGiftSection data={shopData} />
      <ShopFeaturedSection data={shopData} />
      <ShopWorkshopCta data={shopData} />
    </article>
  )
}
