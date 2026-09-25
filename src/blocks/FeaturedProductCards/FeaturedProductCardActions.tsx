'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import type { Product } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import Link from 'next/link'

type Props = {
  product: Product
  detailsHref: string
  soldOut: boolean
  orderLabel: string
}

export function FeaturedProductCardActions({
  product,
  detailsHref,
  soldOut,
  orderLabel,
}: Props) {
  const { locale } = useLocale()
  const isDe = locale === 'de'
  const detailsLabel = isDe ? 'Produktdetails' : 'Product details'

  return (
    <div className="flex flex-col gap-3">
      {!soldOut ? (
        <AddToCart
          product={product}
          className="!m-0 h-auto w-full rounded-full border-0 bg-white px-5 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ff-near-black shadow-none hover:bg-white/90"
        >
          {orderLabel}
        </AddToCart>
      ) : null}

      <Link
        href={detailsHref}
        className="inline-flex min-h-10 items-center font-display text-[12px] font-bold uppercase tracking-[0.12em] text-white underline decoration-white/45 underline-offset-[5px] transition-colors hover:decoration-white"
      >
        {detailsLabel} →
      </Link>
    </div>
  )
}
