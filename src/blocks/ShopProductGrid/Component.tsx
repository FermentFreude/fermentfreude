import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Media as MediaType, Product, ShopProductGridBlock } from '@/payload-types'

function isMediaObject(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

function getFirstImage(product: Product): MediaType | null {
  const gallery = product.gallery
  if (gallery && gallery.length > 0) {
    const first = gallery[0]?.image
    if (isMediaObject(first)) return first
  }
  return null
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return ''
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price / 100)
}

export const ShopProductGridComponent: React.FC<ShopProductGridBlock> = async (props) => {
  const {
    eyebrow,
    heading,
    description,
    pickupNotice,
    products: selectedProducts,
    showAllFallback,
    maxProducts,
    ctaLabel,
    ctaUrl,
  } = props

  const resolvedEyebrow = eyebrow ?? 'Our Products'
  const resolvedHeading = heading ?? 'Shop All Products'
  const resolvedPickup = pickupNotice ?? 'Pickup in Berlin'
  const limit = maxProducts ?? 12

  const locale = (await getLocale()) as 'de' | 'en'
  const payload = await getPayload({ config: configPromise })

  let products: Product[] = []

  // If specific products selected, use those
  if (selectedProducts && Array.isArray(selectedProducts) && selectedProducts.length > 0) {
    // Relations can be IDs or populated objects
    const ids = selectedProducts.map((p) => (typeof p === 'object' && p !== null ? p.id : p))
    const result = await payload.find({
      collection: 'products',
      where: { id: { in: ids }, _status: { equals: 'published' } },
      locale,
      depth: 2,
      limit,
      overrideAccess: false,
    })
    products = result.docs as Product[]
  } else if (showAllFallback !== false) {
    // Fetch all published products
    const result = await payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      locale,
      depth: 2,
      limit,
      sort: 'title',
      overrideAccess: false,
    })
    products = result.docs as Product[]
  }

  if (products.length === 0) return null

  return (
    <section id="products" className="py-(--space-section-lg) bg-ff-cream">
      <div className="mx-auto max-w-(--content-full) px-(--space-container-x)">
        {/* Header */}
        <div className="mb-12 lg:mb-16 max-w-(--content-medium)">
          <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-ff-charcoal mb-3">
            {resolvedEyebrow}
          </span>
          <h2 className="text-ff-near-black mb-4">{resolvedHeading}</h2>
          {description && (
            <p className="text-ff-charcoal text-body-lg leading-relaxed m-0">{description}</p>
          )}

          {/* Pickup badge */}
          {resolvedPickup && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-ff-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ff-charcoal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {resolvedPickup}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => {
            const image = getFirstImage(product)
            const price = (product as unknown as Record<string, unknown>).priceInEUR as
              | number
              | undefined
            const slug = product.slug

            return (
              <Link key={product.id} href={`/products/${slug}`} className="group no-underline">
                <div className="relative overflow-hidden rounded-xl bg-white aspect-3/4 mb-3">
                  {image ? (
                    <Media
                      resource={image}
                      imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#ECE5DE] flex items-center justify-center">
                      <span className="text-ff-charcoal/30 text-sm">No image</span>
                    </div>
                  )}
                </div>

                <div className="px-1">
                  <h4 className="font-display text-sm lg:text-base font-semibold text-ff-near-black mb-0.5 leading-snug group-hover:text-ff-charcoal transition-colors">
                    {product.title}
                  </h4>
                  {price != null && price > 0 && (
                    <span className="text-sm text-ff-charcoal">{formatPrice(price)}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        {ctaLabel && ctaUrl && (
          <div className="mt-12 lg:mt-16 text-center">
            <Link
              href={ctaUrl}
              className="inline-flex items-center justify-center rounded-full border border-ff-near-black px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-ff-near-black transition-colors hover:bg-ff-near-black hover:text-white no-underline"
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
