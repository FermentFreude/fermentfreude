'use client'

import type { Product } from '@/payload-types'

import { ShopProductCardImage } from '@/components/product/ShopProductCardImage'
import {
  formatEurPrice,
  type AppLocale,
} from '@/utilities/productDetailDisplay'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FoodPdpRelatedProductCard({
  product,
  locale,
}: {
  product: Product
  locale: AppLocale
}) {
  const price =
    typeof product.priceInEUR === 'number' ? formatEurPrice(product.priceInEUR, locale) : null

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full min-h-[7rem] overflow-hidden rounded-2xl bg-white ring-1 ring-ff-near-black/10 transition-shadow hover:shadow-md sm:min-h-[8rem]"
    >
      <div className="relative w-28 shrink-0 border-r border-ff-near-black/8 bg-white sm:w-32">
        <ShopProductCardImage
          product={product}
          className="absolute inset-0"
          sizes="128px"
          imgClassName="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center bg-white px-4 py-4">
        <p className="font-display text-body-sm font-bold text-ff-near-black">{product.title}</p>
        {price && <p className="mt-1 text-caption tabular-nums text-ff-gray-text">{price}</p>}
        <span className="mt-3 inline-flex items-center gap-1 text-caption font-medium text-ff-charcoal">
          {locale === 'de' ? 'Ansehen' : 'View'}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
