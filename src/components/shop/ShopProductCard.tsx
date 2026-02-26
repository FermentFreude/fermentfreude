'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { Product } from '@/payload-types'
import Link from 'next/link'
import React from 'react'
import { ShoppingCart } from 'lucide-react'

type Props = {
  product: Product
  addToCartLabel?: string | null
  cardBackgroundColor?: string
  addToCartColor?: string
  addToCartHoverColor?: string
}

const CARD_DEFAULTS = {
  cardBackgroundColor: '#F7F7F8',
  addToCartColor: '#4b4b4b',
  addToCartHoverColor: '#333333',
}

export const ShopProductCard: React.FC<Props> = ({
  product,
  addToCartLabel,
  cardBackgroundColor,
  addToCartColor,
  addToCartHoverColor,
}) => {
  const bgColor = cardBackgroundColor?.trim() || CARD_DEFAULTS.cardBackgroundColor
  const btnColor = addToCartColor?.trim() || CARD_DEFAULTS.addToCartColor
  const btnHoverColor = addToCartHoverColor?.trim() || CARD_DEFAULTS.addToCartHoverColor
  const { gallery, priceInUSD, title, slug } = product

  let price = priceInUSD
  let variantTitle: string | null = null
  const variants = product.variants?.docs
  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (variant && typeof variant === 'object') {
      if (variant.priceInUSD && typeof variant.priceInUSD === 'number') {
        price = variant.priceInUSD
      }
      if (variant.title) {
        variantTitle = variant.title
      }
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : null

  const label = addToCartLabel ?? 'Add to cart'

  const parts = title.split(' ')
  const productName =
    variantTitle || parts.length > 1 ? (parts[0] ?? title) : title
  const flavorRaw =
    variantTitle ?? (parts.length > 1 ? parts.slice(1).join(' ') : null)
  const flavor = flavorRaw
    ? productName === 'Kombucha'
      ? `${flavorRaw} Flavour`
      : flavorRaw
    : null

  return (
    <div className="card product-box box-minimal group relative w-full max-w-[327px] overflow-visible">
      <div
        className="card-body relative flex flex-col rounded-2xl"
        style={{ backgroundColor: bgColor }}
      >
        <Link
          href={`/products/${slug}`}
          className="flex flex-col flex-1"
          aria-label={`${productName}${flavor ? ` - ${flavor}` : ''}`}
        >
          {/* Image area */}
          <div className="relative flex flex-1 min-h-[200px] items-center justify-center p-4">
            {image ? (
              <div className="relative h-[220px] w-full max-w-[200px] shrink-0 overflow-hidden rounded-2xl">
                <Media
                  className="object-contain transition duration-300 ease-in-out group-hover:scale-105"
                  imgClassName="object-contain"
                  resource={image}
                  fill
                />
              </div>
            ) : (
              <div className="h-[220px] w-32 shrink-0 rounded-2xl bg-ff-ivory-mist/50" />
            )}
          </div>
          {/* Product info */}
          <div className="flex w-full flex-col items-start gap-1.5 self-stretch px-4 pb-4">
            <div className="flex flex-col">
              <p
                className="font-display font-semibold text-ff-charcoal"
                style={{ fontSize: 16, lineHeight: 1.6 }}
              >
                {productName}
              </p>
              {flavor && (
                <p
                  className="text-ff-charcoal/80"
                  style={{ fontSize: 12.39, lineHeight: 1.6 }}
                >
                  {flavor}
                </p>
              )}
            </div>
            {typeof price === 'number' && (
              <Price
                amount={price}
                className="font-semibold text-ff-charcoal"
                style={{ fontSize: 19.47, lineHeight: 1.6 }}
              />
            )}
          </div>
        </Link>

        {/* Add to cart: bottom-right gold circle */}
        <div
          className="add-to-cart-custom pointer-events-auto absolute bottom-4 right-4 z-[100] rounded-full"
          style={
            {
              width: 57.16,
              height: 57.16,
              minWidth: 57.16,
              minHeight: 57.16,
              '--add-to-cart-bg': btnColor,
              '--add-to-cart-hover-bg': btnHoverColor,
            } as React.CSSProperties
          }
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <AddToCart
            product={product}
            className="add-to-cart-custom-btn size-full rounded-full border-0 shadow-md [&_svg]:text-white"
            ariaLabel={label}
          >
            <ShoppingCart className="size-5" aria-hidden />
          </AddToCart>
        </div>
      </div>
    </div>
  )
}
