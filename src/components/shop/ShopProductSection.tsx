import { ShopProductCard } from '@/components/shop/ShopProductCard'
import type { Product } from '@/payload-types'
import Link from 'next/link'
import React from 'react'

const DEFAULTS = {
  productSectionHeading: 'Discover UNIQUE.',
  productSectionSubheading: 'FLAVOURS',
  productSectionIntro:
    'Dive into a world of incredible handcrafted Ferments. Our carefully curated collection features an array of good and healthy products for every occasion.',
  viewAllButtonLabel: 'View All Products',
  viewAllButtonUrl: '/shop',
  loadMoreLabel: 'See All Products',
  addToCartLabel: 'Add to cart',
}

const DESIGN_DEFAULTS = {
  productCardBackgroundColor: '#F7F7F8',
  productSectionBackgroundColor: '#FFFFFF',
  productCardAddToCartColor: '#E5B765',
  productCardAddToCartHoverColor: '#d9a854',
}

type ShopProductSectionData = {
  productSectionHeading?: string | null
  productSectionSubheading?: string | null
  productSectionIntro?: string | null
  viewAllButtonLabel?: string | null
  viewAllButtonUrl?: string | null
  loadMoreLabel?: string | null
  addToCartLabel?: string | null
  productCardBackgroundImage?: unknown
  productCardBackgroundColor?: string | null
  productSectionBackgroundColor?: string | null
  productCardAddToCartColor?: string | null
  productCardAddToCartHoverColor?: string | null
}

type Props = {
  data?: ShopProductSectionData | null
  products: Product[]
  hasMore?: boolean
  nextPage?: number
}

export const ShopProductSection: React.FC<Props> = ({
  data,
  products,
  hasMore = false,
  nextPage,
}) => {
  const heading = data?.productSectionHeading ?? DEFAULTS.productSectionHeading
  const subheading = data?.productSectionSubheading ?? DEFAULTS.productSectionSubheading
  const intro = data?.productSectionIntro ?? DEFAULTS.productSectionIntro
  const viewAllLabel = data?.viewAllButtonLabel ?? DEFAULTS.viewAllButtonLabel
  const viewAllUrl = data?.viewAllButtonUrl ?? DEFAULTS.viewAllButtonUrl
  const loadMoreLabel = data?.loadMoreLabel ?? DEFAULTS.loadMoreLabel
  const addToCartLabel = data?.addToCartLabel ?? DEFAULTS.addToCartLabel

  const sectionBg =
    data?.productSectionBackgroundColor ?? DESIGN_DEFAULTS.productSectionBackgroundColor
  const cardBg =
    data?.productCardBackgroundColor?.trim() || DESIGN_DEFAULTS.productCardBackgroundColor
  const addToCartColor =
    data?.productCardAddToCartColor ?? DESIGN_DEFAULTS.productCardAddToCartColor
  const addToCartHoverColor =
    data?.productCardAddToCartHoverColor ??
    DESIGN_DEFAULTS.productCardAddToCartHoverColor

  return (
    <section
      id="products"
      className="section-padding-lg"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="container mx-auto container-padding content-wide">
        <div className="mb-8">
          <div className="animate-fade-in-up">
            <h2 className="text-section-heading font-display font-bold text-ff-charcoal flex flex-wrap items-baseline gap-2">
              {heading}
              {subheading && (
                <span className="text-body-lg font-normal text-ff-gold">
                  {subheading}
                </span>
              )}
            </h2>
            {intro && (
              <p className="mt-4 text-body text-ff-charcoal content-narrow max-w-2xl">{intro}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, i) => {
            const delayClass =
              i === 0
                ? 'animate-delay-200'
                : i === 1
                  ? 'animate-delay-400'
                  : i === 2
                    ? 'animate-delay-600'
                    : i === 3
                      ? 'animate-delay-800'
                      : ''
            return (
              <div
                key={product.id}
                className={`animate-fade-in-up overflow-visible ${delayClass}`}
                style={i >= 4 ? { animationDelay: `${0.2 + i * 0.1}s`, opacity: 0 } : undefined}
              >
                <ShopProductCard
                  product={product}
                  addToCartLabel={addToCartLabel}
                  cardBackgroundColor={cardBg}
                  addToCartColor={addToCartColor}
                  addToCartHoverColor={addToCartHoverColor}
                />
              </div>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          {hasMore && nextPage && (
            <Link
              href={`/shop?page=${nextPage}`}
              className="inline-flex items-center justify-center rounded-full border-2 border-[#d4d4d4] bg-white hover:bg-ff-charcoal hover:text-ff-ivory hover:border-ff-charcoal px-8 py-2.5 font-display font-bold text-base text-ff-charcoal transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {loadMoreLabel}
            </Link>
          )}
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover px-6 py-2.5 font-display font-bold text-base text-ff-ivory transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {viewAllLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
