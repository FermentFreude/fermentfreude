'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { Product } from '@/payload-types'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

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
  const { gallery, priceInEUR, title, slug, inventory } = product

  // Check if product is out of stock
  const isOutOfStock = !inventory || inventory === 0

  let price = priceInEUR
  let variantTitle: string | null = null
  const variants = product.variants?.docs
  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (variant && typeof variant === 'object') {
      if (variant.priceInEUR && typeof variant.priceInEUR === 'number') {
        price = variant.priceInEUR
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
  const productName = variantTitle || parts.length > 1 ? (parts[0] ?? title) : title
  const flavorRaw = variantTitle ?? (parts.length > 1 ? parts.slice(1).join(' ') : null)
  const flavor = flavorRaw
    ? productName === 'Kombucha'
      ? `${flavorRaw} Flavour`
      : flavorRaw
    : null

  return (
    <div className="card product-box box-minimal group relative w-full max-w-81.75 overflow-visible">
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
          <div className="relative flex flex-1 min-h-50 items-center justify-center p-4">
            {image ? (
              <div className="relative h-55 w-full max-w-50 shrink-0 overflow-hidden rounded-2xl">
                <Media
                  className="object-contain transition duration-300 ease-in-out group-hover:scale-105"
                  imgClassName="object-contain"
                  resource={image}
                  fill
                />
              </div>
            ) : (
              <div className="h-55 w-32 shrink-0 rounded-2xl bg-ff-ivory-mist/50" />
            )}
            {/* Sold Out Badge */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                <span className="inline-block bg-red-100 border border-red-300 text-red-700 text-sm font-bold px-4 py-2.5 rounded-full">
                  Sold Out
                </span>
              </div>
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
                <p className="text-ff-charcoal/80" style={{ fontSize: 12.39, lineHeight: 1.6 }}>
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
          className={`add-to-cart-custom pointer-events-auto absolute bottom-4 right-4 z-100 rounded-full transition-all ${
            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={
            {
              width: 57.16,
              height: 57.16,
              minWidth: 57.16,
              minHeight: 57.16,
              '--add-to-cart-bg': isOutOfStock ? '#d0ccc6' : btnColor,
              '--add-to-cart-hover-bg': isOutOfStock ? '#d0ccc6' : btnHoverColor,
            } as React.CSSProperties
          }
          onClick={(e) => {
            e.stopPropagation()
            if (isOutOfStock) e.preventDefault()
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <AddToCart
            product={product}
            className="add-to-cart-custom-btn size-full rounded-full border-0 shadow-md [&_svg]:text-white"
            ariaLabel={isOutOfStock ? 'Sold Out' : label}
          >
            <ShoppingCart className="size-5" aria-hidden />
          </AddToCart>
        </div>
      </div>
    </div>
  )
}
