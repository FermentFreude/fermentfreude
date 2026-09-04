import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ShopAutomatenComponent } from '@/blocks/ShopAutomaten/Component'
import { ShopHeroComponent } from '@/blocks/ShopHero/Component'
import { ShopTrustRow, type TrustIconId, type TrustItem } from '@/components/shop/ShopTrustRow'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Page, ShopAutomatenBlock, ShopHeroBlock } from '@/payload-types'
import type { Metadata } from 'next'

// Cache CMS reads briefly so shop is fast after the first hit
export const revalidate = 60

const queryShopPage = cache(async (locale: 'de' | 'en'): Promise<Page | null> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'shop' } },
    locale,
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  return (result.docs?.[0] as Page) ?? null
})

function trustItemsFromHero(block: ShopHeroBlock | undefined): TrustItem[] | null {
  const raw = block?.trustItems
  if (!raw?.length) return null
  return raw
    .map((item) => {
      const label = item?.label?.trim()
      if (!label) return null
      const icon = (item.icon ?? 'hand') as TrustIconId
      return { icon, label }
    })
    .filter(Boolean) as TrustItem[]
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as 'de' | 'en'
  const page = await queryShopPage(locale)
  if (!page) {
    return {
      title: 'Shop | FermentFreude',
      description:
        'Discover unique handcrafted ferments. Shop Kombucha, fermented vegetables, and more.',
    }
  }
  return generateMeta({ doc: page })
}

export default async function ShopPage() {
  const locale = (await getLocale()) as 'de' | 'en'
  const page = await queryShopPage(locale)

  if (page) {
    const { layout } = page
    const hasShopHero = (layout ?? []).some((b) => b.blockType === 'shopHero' && b.visible !== false)
    const shopHeroBlock = (layout ?? []).find((b) => b.blockType === 'shopHero') as
      | ShopHeroBlock
      | undefined
    const automatenBlock = (layout ?? []).find((b) => b.blockType === 'shopAutomaten') as
      | ShopAutomatenBlock
      | undefined
    const rest = (layout ?? []).filter(
      (b) =>
        b.blockType !== 'shopHero' &&
        b.blockType !== 'shopProductList' &&
        b.blockType !== 'shopAutomaten',
    )
    const trustItems = trustItemsFromHero(shopHeroBlock)

    const featured = rest.filter((b) => b.blockType === 'featuredProductCards')
    const afterFeatured = rest.filter((b) => b.blockType !== 'featuredProductCards')

    return (
      <article>
        {hasShopHero && shopHeroBlock ? (
          <ShopHeroComponent {...shopHeroBlock} />
        ) : (
          <ShopHeroComponent
            blockType="shopHero"
            blockName="Shop Hero"
            visible
            heroTitle={null}
            slides={[]}
            bottomTagline={null}
            bottomSubtitle={null}
          />
        )}
        <ShopTrustRow locale={locale} items={trustItems} />
        {featured.length > 0 && <RenderBlocks blocks={featured} slug="shop" />}
        <ShopAutomatenComponent
          {...(automatenBlock ?? {
            blockType: 'shopAutomaten' as const,
            visible: true,
          })}
        />
        {afterFeatured.length > 0 && <RenderBlocks blocks={afterFeatured} slug="shop" />}
      </article>
    )
  }

  return (
    <article>
      <ShopHeroComponent
        blockType="shopHero"
        blockName="Shop Hero"
        visible
        heroTitle={null}
        slides={[]}
        bottomTagline={null}
        bottomSubtitle={null}
      />
      <ShopTrustRow locale={locale} />
      <ShopAutomatenComponent blockType="shopAutomaten" visible />
    </article>
  )
}
