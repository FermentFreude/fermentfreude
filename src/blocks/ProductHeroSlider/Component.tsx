import { getLocale } from '@/utilities/getLocale'
import { isProductSoldOut } from '@/utilities/productStock'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Product, ProductHeroSliderBlock as BlockType } from '@/payload-types'

import { ProductHeroSliderClient, type ResolvedProductSlide } from './ProductHeroSliderClient'
import '../ShopHero/shop-hero.css'

function isMedia(val: unknown): val is Media {
  return typeof val === 'object' && val !== null && 'url' in val
}

type Props = BlockType & { id?: string }

async function resolveSlide(
  payload: Awaited<ReturnType<typeof getPayload>>,
  locale: 'de' | 'en',
  slide: NonNullable<BlockType['slides']>[number],
): Promise<ResolvedProductSlide | null> {
  let product: Product | null = null
  const ref = slide.product
  if (typeof ref === 'object' && ref !== null) {
    product = ref as Product
  } else if (ref) {
    try {
      product = (await payload.findByID({
        collection: 'products',
        id: String(ref),
        locale,
        depth: 1,
        overrideAccess: true,
      })) as Product
    } catch {
      product = null
    }
  }
  if (!product) return null

  const cmsImage = isMedia(slide.image) ? slide.image : null
  const imageSrc = cmsImage?.url?.trim() || null
  const imageAlt = cmsImage?.alt?.trim() || product.title

  const soldOut = isProductSoldOut(product)
  const href = slide.ctaLink?.trim() || (product.slug ? `/products/${product.slug}` : '/shop')
  const ctaLabel =
    slide.ctaLabel?.trim() || (locale === 'de' ? 'Jetzt bestellen' : 'Order now')
  const pickup =
    locale === 'de' ? 'Abholung in Graz, jede Woche frisch' : 'Pickup in Graz, fresh every week'

  return {
    product,
    imageSrc,
    imageAlt,
    unit: product.unitSize || '',
    title: product.title,
    blurb: product.shortDescription || '',
    price: typeof product.priceInEUR === 'number' ? product.priceInEUR : null,
    href,
    soldOut,
    ctaLabel,
    pickup,
    badgeLabel: slide.badgeLabel?.trim() || null,
  }
}

/**
 * Product Hero Slider — full-bleed photo slider cycling through several
 * products, in the same visual language as the Shop Hero.
 */
export const ProductHeroSliderComponent: React.FC<Props> = async (props) => {
  if (props.visible === false) return null
  const slideConfigs = props.slides ?? []
  if (slideConfigs.length === 0) return null

  const locale = (await getLocale()) as 'de' | 'en'
  const payload = await getPayload({ config: configPromise })

  const resolvedSlides: ResolvedProductSlide[] = []
  for (const slide of slideConfigs) {
    const resolved = await resolveSlide(payload, locale, slide)
    if (resolved) resolvedSlides.push(resolved)
  }
  if (resolvedSlides.length === 0) return null

  return <ProductHeroSliderClient slides={resolvedSlides} />
}
