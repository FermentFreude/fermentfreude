import { ShopBenefitsSection } from '@/components/shop/ShopBenefitsSection'
import { ShopFeaturedSection } from '@/components/shop/ShopFeaturedSection'
import { ShopGiftSection } from '@/components/shop/ShopGiftSection'
import { ShopHero } from '@/components/shop/ShopHero'
import { ShopHeroSlider } from '@/components/shop/ShopHeroSlider'
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

/** Fetches shop content from Page (slug=shop) if it exists, else from Shop global. */
async function getShopData(locale: 'de' | 'en') {
  const payload = await getPayload({ config: configPromise })
  const shopPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'shop' }, _status: { equals: 'published' } },
    locale,
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })
  const page = shopPage.docs?.[0] as { shop?: Record<string, unknown> } | undefined
  if (page?.shop) return page.shop
  const getShop = getCachedGlobal('shop', 2, locale)
  return await getShop()
}

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const locale = (await getLocale()) as 'de' | 'en'
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(String(pageParam || '1'), 10))

  const shopData = await getShopData(locale)

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

  const heroSlides = (shopData?.heroSlides ?? []) as Array<{
    id?: string
    image?: { url: string; alt?: string } | string | null
    productImage?: { url: string; alt?: string } | string | null
    title?: string | null
    description?: string | null
    ctaLabel?: string | null
    ctaUrl?: string | null
  }>
  const hasHeroSlides =
    heroSlides.length > 0 &&
    heroSlides.some(
      (s) =>
        s?.title &&
        s?.image &&
        typeof s.image === 'object' &&
        'url' in s.image &&
        (s.image as { url: string }).url,
    )

  return (
    <article className="pb-24">
      {hasHeroSlides ? (
        <ShopHeroSlider slides={heroSlides} />
      ) : (
        <ShopHero data={shopData} />
      )}
      <ShopProductSection
        data={shopData}
        products={products}
        hasMore={hasMore}
        nextPage={hasMore ? page + 1 : undefined}
      />
      <ShopBenefitsSection data={shopData} />
      <ShopGiftSection data={shopData} />
      <ShopFeaturedSection data={shopData} />
      <ShopWorkshopCta data={shopData} />
    </article>
  )
}
