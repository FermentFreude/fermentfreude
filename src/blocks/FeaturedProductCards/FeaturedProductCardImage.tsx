'use client'

import type { Product } from '@/payload-types'

import { ShopProductCardImage } from '@/components/product/ShopProductCardImage'

export function FeaturedProductCardImage({ product }: { product: Product }) {
  return (
    <ShopProductCardImage
      product={product}
      className="absolute inset-0"
      sizes="(max-width: 768px) 72vw, 280px"
      imgClassName="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.32)] transition-transform duration-500 group-hover:scale-[1.03]"
      emptyClassName="rounded-lg bg-ff-warm-gray"
    />
  )
}
