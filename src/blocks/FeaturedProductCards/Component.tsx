import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { FeaturedProductCardsBlock, Media as MediaType, Product } from '@/payload-types'

/* ── Helpers ────────────────────────────────────────────── */

function isMediaObject(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

function getFirstImage(product: Product): MediaType | null {
  const gallery = product.gallery
  if (gallery?.length) {
    const first = gallery[0]?.image
    if (isMediaObject(first)) return first
  }
  return null
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return ''
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price / 100)
}

function getPrimaryBadge(product: Product): { label: string; icon: string } | null {
  const badges = product.badges
  if (badges && badges.length > 0) {
    const badgeMap: Record<string, { label: string; icon: string }> = {
      vegan: { label: 'Vegan', icon: '🌱' },
      vegetarian: { label: 'Vegetarisch', icon: '🥬' },
      handmade: { label: 'Handmade', icon: '✋' },
      organic: { label: 'Bio', icon: '🌿' },
      'gluten-free': { label: 'Glutenfrei', icon: '🌾' },
      probiotic: { label: 'Probiotisch', icon: '🦠' },
      fermented: { label: 'Fermentiert', icon: '⚗️' },
      'no-additives': { label: 'Ohne Zusätze', icon: '✅' },
      refrigerated: { label: 'Kühlware', icon: '❄️' },
    }
    const first = badges[0]
    if (first && badgeMap[first]) return badgeMap[first]
  }
  return null
}

/* ── Brand-tone card colors ─────────────────────────────── */
const DEFAULT_COLORS = [
  'var(--ff-olive, #4b4f4a)',
  'var(--ff-charcoal-dark, #403c39)',
  'var(--ff-near-black, #1a1a1a)',
]
const DEFAULT_BANNER_COLOR = 'var(--ff-olive-dark, #3a3e3a)'

/* ── Component ──────────────────────────────────────────── */

export const FeaturedProductCardsComponent: React.FC<FeaturedProductCardsBlock> = async (props) => {
  const {
    visible,
    heading,
    subheading,
    products: selectedProducts,
    cardColors,
    bannerProduct: bannerRef,
    bannerColor,
    ctaLabel,
  } = props

  if (visible === false) return null

  const resolvedCta = ctaLabel ?? 'Order Now'
  const locale = (await getLocale()) as 'de' | 'en'
  const payload = await getPayload({ config: configPromise })

  /* Fetch the 3 card products */
  let products: Product[] = []
  if (selectedProducts && Array.isArray(selectedProducts) && selectedProducts.length > 0) {
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

  /* Fetch banner product */
  let banner: Product | null = null
  if (bannerRef) {
    const bannerId = typeof bannerRef === 'object' ? bannerRef.id : bannerRef
    const result = await payload.findByID({
      collection: 'products',
      id: bannerId,
      locale,
      depth: 2,
      overrideAccess: true,
    })
    if (result) banner = result as Product
  }

  if (products.length === 0 && !banner) return null

  return (
    <section className="section-padding-md" style={{ backgroundColor: 'var(--ff-cream, #fffef9)' }}>
      <div className="container mx-auto container-padding">
        {/* Section header */}
        {(heading || subheading) && (
          <div className="text-center mb-1">
            {heading && (
              <h2
                className="font-display text-section-heading font-bold tracking-tight"
                style={{ color: 'var(--ff-near-black)' }}
              >
                {heading}
              </h2>
            )}
            {subheading && (
              <p
                className="mt-3 text-base max-w-xl mx-auto"
                style={{ color: 'var(--ff-gray-text)' }}
              >
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* 3-column product cards — compact with half-image overflow */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product, i) => {
              const image = getFirstImage(product)
              const price = product.priceInEUR
              const badge = getPrimaryBadge(product)
              const cardColor = cardColors?.[i]?.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]
              const isTempeh =
                product.slug?.toLowerCase().includes('tempeh') ||
                String(product.title).toLowerCase().includes('tempeh')

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative flex flex-col no-underline transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Floating image — half above the card */}
                  <div className="relative z-10 flex justify-center -mb-28 md:-mb-32">
                    {image ? (
                      <div
                        className={
                          isTempeh
                            ? 'w-64 h-64 md:w-80 md:h-80 relative'
                            : 'w-56 h-56 md:w-64 md:h-64 relative'
                        }
                      >
                        <Media
                          resource={image}
                          imgClassName="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div
                        className={
                          isTempeh
                            ? 'w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-white/10'
                            : 'w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-white/10'
                        }
                      />
                    )}
                  </div>

                  {/* Card body */}
                  <div
                    className="flex flex-col flex-1 rounded-2xl pt-32 md:pt-36 px-5 pb-5"
                    style={{ backgroundColor: cardColor }}
                  >
                    {/* Unit size */}
                    {product.unitSize && (
                      <span className="text-caption font-medium text-white italic mb-1">
                        {product.unitSize}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="font-display text-lg md:text-xl font-bold text-white leading-tight mb-1.5">
                      {product.title}
                    </h3>

                    {/* Short description */}
                    {product.shortDescription && (
                      <p className="text-caption font-medium text-white leading-relaxed mb-4 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Price + CTA at bottom */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/15">
                      {price != null && price > 0 && (
                        <span className="text-lg font-bold text-white font-display">
                          {formatPrice(price)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {resolvedCta}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Banner card */}
        {banner && (
          <div className="mt-12 lg:mt-16">
            <Link
              href={`/products/${banner.slug}`}
              className="group relative flex flex-col md:flex-row rounded-2xl overflow-visible no-underline transition-transform duration-300 hover:-translate-y-1"
              style={{ backgroundColor: bannerColor || DEFAULT_BANNER_COLOR }}
            >
              {/* Banner image */}
              <div className="relative w-full md:w-2/5 flex items-center justify-center p-6 md:p-10">
                {(() => {
                  const bannerBadge = getPrimaryBadge(banner)
                  return bannerBadge ? (
                    <div className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full bg-white shadow-md flex flex-col items-center justify-center">
                      <span className="text-sm leading-none">{bannerBadge.icon}</span>
                      <span
                        className="text-[6px] font-bold uppercase tracking-wide mt-0.5"
                        style={{ color: 'var(--ff-near-black)' }}
                      >
                        {bannerBadge.label}
                      </span>
                    </div>
                  ) : null
                })()}

                {(() => {
                  const bannerImage = getFirstImage(banner)
                  return bannerImage ? (
                    <div className="w-48 h-48 md:w-60 md:h-60 relative md:-mt-12">
                      <Media
                        resource={bannerImage}
                        imgClassName="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 md:w-60 md:h-60 rounded-2xl bg-white/10" />
                  )
                })()}
              </div>

              {/* Banner text content */}
              <div className="flex flex-col justify-center flex-1 px-6 md:px-10 pb-6 md:py-8">
                {banner.unitSize && (
                  <span className="text-caption font-medium text-white/50 italic mb-1">
                    {banner.unitSize}
                  </span>
                )}

                <h3 className="font-display text-subheading font-bold text-white leading-tight mb-2">
                  {banner.title}
                </h3>

                {banner.shortDescription && (
                  <p className="text-body-sm text-white/70 leading-relaxed mb-4 max-w-md">
                    {banner.shortDescription}
                  </p>
                )}

                {/* Benefits as pills */}
                {banner.benefits && banner.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {banner.benefits.map((b, i) => (
                      <span
                        key={b.id || i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/15 text-white/85"
                      >
                        <span className="w-1 h-1 rounded-full bg-white/50" />
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price + CTA */}
                <div className="flex items-center gap-5">
                  {banner.priceInEUR != null && banner.priceInEUR > 0 && (
                    <span className="text-xl md:text-2xl font-bold text-white font-display">
                      {formatPrice(banner.priceInEUR)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 border border-white/30 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300 group-hover:bg-white group-hover:text-ff-near-black">
                    {resolvedCta}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
