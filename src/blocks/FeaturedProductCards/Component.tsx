import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import { isProductSoldOut } from '@/utilities/productStock'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { FeaturedProductCardsBlock, Media as MediaType, Product } from '@/payload-types'

const DEFAULT_CARD_COLORS = ['#5C6B54', '#403c39']

function isMediaObject(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

function getProductImage(product: Product): MediaType | null {
  const first = product.gallery?.[0]?.image
  return isMediaObject(first) ? first : null
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return ''
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price / 100)
}

/**
 * Supporting products only (Berglinsen + Kimchi) — colored card style.
 * Käfer stays in the shop hero so this section is not repetitive.
 */
export const FeaturedProductCardsComponent: React.FC<FeaturedProductCardsBlock> = async (props) => {
  const { visible, products: selectedProducts, ctaLabel, heading, subheading, cardColors } = props
  if (visible === false) return null

  const locale = (await getLocale()) as 'de' | 'en'
  const payload = await getPayload({ config: configPromise })

  const resolvedHeading =
    heading?.trim() || (locale === 'de' ? 'Weitere Produkte' : 'More products')
  const resolvedSubheading =
    subheading?.trim() ||
    (locale === 'de'
      ? 'Handgemachte Fermente – natürlich, voller Leben und Geschmack'
      : 'Handmade ferments – natural, full of life and flavour')

  const rawCta = ctaLabel?.trim()
  const resolvedCta =
    locale === 'de' &&
    (!rawCta || rawCta.toLowerCase() === 'order now' || rawCta.toLowerCase() === 'order')
      ? 'Jetzt bestellen'
      : rawCta || (locale === 'de' ? 'Jetzt bestellen' : 'Order now')

  let products: Product[] = []
  if (selectedProducts?.length) {
    const ids = selectedProducts.map((p) => (typeof p === 'object' && p !== null ? p.id : p))
    const result = await payload.find({
      collection: 'products',
      where: { id: { in: ids }, _status: { equals: 'published' } },
      locale,
      depth: 2,
      limit: 3,
      overrideAccess: true,
    })
    products = ids.map((id) => result.docs.find((d) => d.id === id)).filter(Boolean) as Product[]
  }

  if (products.length === 0) {
    const fallback = await payload.find({
      collection: 'products',
      where: {
        slug: { in: ['berglinsen-tempeh', 'classic-kimchi'] },
        _status: { equals: 'published' },
      },
      locale,
      depth: 2,
      limit: 2,
      overrideAccess: true,
    })
    const bySlug = new Map(fallback.docs.map((d) => [d.slug, d]))
    products = ['berglinsen-tempeh', 'classic-kimchi']
      .map((s) => bySlug.get(s))
      .filter(Boolean) as Product[]
  }

  products = products.filter((p) => p.slug !== 'kaeferbohnen-tempeh').slice(0, 2)
  if (products.length === 0) return null

  const colors = products.map((_, i) => {
    const fromCms = cardColors?.[i]?.color?.trim()
    return fromCms || DEFAULT_CARD_COLORS[i % DEFAULT_CARD_COLORS.length]
  })

  return (
    <section id="products" className="bg-white section-padding-md">
      <div className="container mx-auto container-padding">
        <div className="mb-12 md:mb-14 mx-auto max-w-2xl text-center">
          <h2 className="font-display text-section-heading font-bold text-ff-near-black tracking-tight">
            {resolvedHeading}
          </h2>
          {resolvedSubheading && (
            <p className="mt-3 text-body text-ff-gray-text leading-relaxed">{resolvedSubheading}</p>
          )}
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
          {products.map((product, index) => {
            const image = getProductImage(product)
            const soldOut = isProductSoldOut(product)
            const isSeasonal = Boolean(product.isSeasonal)
            const bg = colors[index]

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative flex flex-col no-underline pt-10 sm:pt-12"
              >
                {/* Pack floats above the colored card — same layout as the founder mock */}
                <div className="relative z-10 mx-auto -mb-12 h-48 w-[72%] max-w-[280px] sm:h-56 sm:w-[68%]">
                  {soldOut && (
                    <span className="absolute top-0 right-0 z-20 rounded-full bg-ff-near-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {locale === 'de' ? 'Ausverkauft' : 'Sold out'}
                    </span>
                  )}
                  {isSeasonal && !soldOut && (
                    <span className="absolute top-0 right-0 z-20 rounded-full bg-ff-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ff-near-black">
                      {locale === 'de' ? 'Saisonal' : 'Seasonal'}
                    </span>
                  )}
                  {image ? (
                    <Media
                      fill
                      resource={image}
                      imgClassName="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.32)] transition-transform duration-500 group-hover:scale-[1.03]"
                      className="absolute inset-0"
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-lg bg-ff-warm-gray" />
                  )}
                </div>

                <div
                  className="flex flex-1 flex-col rounded-2xl px-6 pb-7 pt-16 sm:px-8 sm:pb-8 sm:pt-[4.5rem]"
                  style={{ backgroundColor: bg }}
                >
                  {product.unitSize && (
                    <span className="mb-2 text-caption font-medium text-white/75">
                      {product.unitSize}
                    </span>
                  )}
                  <h3 className="mb-3 font-display text-subheading font-bold leading-snug text-white">
                    {product.title}
                  </h3>
                  {product.shortDescription && (
                    <p className="mb-6 line-clamp-2 text-body-sm leading-relaxed text-white/80">
                      {product.shortDescription}
                    </p>
                  )}

                  <div className="mt-auto flex items-end justify-between gap-4 pt-2">
                    {product.priceInEUR != null && product.priceInEUR > 0 ? (
                      <span className="font-display text-xl font-bold tabular-nums text-white">
                        {formatPrice(product.priceInEUR)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/95 transition-opacity group-hover:opacity-80">
                      {resolvedCta} →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
