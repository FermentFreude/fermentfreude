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
  loadMoreLabel: 'Load More',
  addToCartLabel: 'Add to cart',
}

type ShopProductSectionData = {
  productSectionHeading?: string | null
  productSectionSubheading?: string | null
  productSectionIntro?: string | null
  viewAllButtonLabel?: string | null
  viewAllButtonUrl?: string | null
  loadMoreLabel?: string | null
  addToCartLabel?: string | null
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

  return (
    <section id="products" className="section-padding-lg bg-ff-ivory">
      <div className="container mx-auto container-padding content-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-section-heading font-display font-bold text-ff-black flex flex-wrap items-baseline gap-2">
              {heading}
              {subheading && (
                <span className="text-body-lg font-normal text-ff-olive">
                  {subheading}
                </span>
              )}
            </h2>
            {intro && (
              <p className="mt-4 text-body text-ff-charcoal content-narrow max-w-2xl">{intro}</p>
            )}
          </div>
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover px-6 py-2.5 font-display font-bold text-base text-ff-ivory transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {viewAllLabel}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ShopProductCard
              key={product.id}
              product={product}
              addToCartLabel={addToCartLabel}
            />
          ))}
        </div>

        {hasMore && nextPage && (
          <div className="mt-12 flex justify-center">
            <Link
              href={`/shop?page=${nextPage}`}
              className="inline-flex items-center justify-center rounded-full border-2 border-ff-charcoal bg-transparent hover:bg-ff-charcoal hover:text-ff-ivory px-8 py-2.5 font-display font-bold text-base text-ff-charcoal transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {loadMoreLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
