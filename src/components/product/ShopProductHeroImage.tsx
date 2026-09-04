'use client'

import type { Media as MediaType, Product } from '@/payload-types'

import { ShopProductCardImage } from '@/components/product/ShopProductCardImage'

export function ShopProductHeroImage({
  product,
  image,
  fallbackSrc,
}: {
  product: Product
  image?: MediaType | null
  fallbackSrc?: string
}) {
  return (
    <ShopProductCardImage
      product={product}
      resource={image}
      fallbackSrc={fallbackSrc}
      priority
      className="absolute inset-0"
      sizes="(max-width: 1024px) 100vw, 50vw"
      imgClassName="object-contain p-8 transition-transform duration-500 ease-out hover:scale-[1.02] md:p-10"
      emptyClassName="bg-ff-warm-gray"
    />
  )
}
