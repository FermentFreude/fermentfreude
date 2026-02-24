'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { Product } from '@/payload-types'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'
import { ShoppingCart } from 'lucide-react'

type Props = {
  product: Product
  addToCartLabel?: string | null
}

export const ShopProductCard: React.FC<Props> = ({ product, addToCartLabel }) => {
  const { gallery, priceInUSD, title, slug } = product

  let price = priceInUSD
  const variants = product.variants?.docs
  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD &&
      typeof variant.priceInUSD === 'number'
    ) {
      price = variant.priceInUSD
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : null

  const label = addToCartLabel ?? 'Add to cart'

  return (
    <div className="group relative flex flex-col">
      <Link className="flex flex-col flex-1" href={`/products/${slug}`}>
        <div
          className={clsx(
            'relative aspect-square rounded-2xl overflow-hidden border bg-primary-foreground p-8',
          )}
        >
          {image ? (
            <Media
              className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
              imgClassName="rounded-2xl object-cover"
              resource={image}
              fill
            />
          ) : (
            <div className="h-full w-full bg-ff-ivory-mist rounded-2xl" />
          )}
        </div>
        <div className="flex justify-between items-center mt-4 gap-2">
          <span className="font-display font-bold text-ff-black truncate">{title}</span>
          {typeof price === 'number' && (
            <Price amount={price} className="font-mono text-ff-olive shrink-0" />
          )}
        </div>
      </Link>
      <div className="mt-3 flex justify-end">
        <AddToCart
          product={product}
          className="rounded-full p-2.5 bg-ff-gold hover:bg-ff-gold-accent text-ff-charcoal transition-all hover:scale-105 active:scale-95"
          ariaLabel={label}
        >
          <ShoppingCart className="size-5 text-white" aria-hidden />
        </AddToCart>
      </div>
    </div>
  )
}
