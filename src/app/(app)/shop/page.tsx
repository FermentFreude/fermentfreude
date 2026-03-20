import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ShopHeroComponent } from '@/blocks/ShopHero/Component'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Page } from '@/payload-types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

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

async function queryShopPage(locale: string): Promise<Page | null> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'shop' } },
    locale: locale as 'de' | 'en',
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  return (result.docs?.[0] as Page) ?? null
}

export default async function ShopPage() {
  const locale = (await getLocale()) as 'de' | 'en'
  const page = await queryShopPage(locale)

  // If the page exists in Pages collection (seeded), render its blocks
  if (page) {
    const { layout } = page
    return (
      <article>
        {layout && layout.length > 0 && <RenderBlocks blocks={layout} slug="shop" />}
      </article>
    )
  }

  // Fallback: render default blocks with English defaults (no CMS data yet)
  return (
    <article>
      <ShopHeroComponent
        blockType="shopHero"
        blockName="Shop Hero"
        heroTitle="Our Handmade Products From Our Pick-Up Shop."
        slides={undefined as never}
        bottomTagline={null}
        bottomSubtitle={null}
      />
    </article>
  )
}
