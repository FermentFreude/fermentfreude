'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import type { Product } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/cn'
import Link from 'next/link'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price / 100)
}

type Props = {
  product: Product | null
  price: number | null | undefined
  href: string
  soldOut: boolean
  ctaLabel: string
  pickup: string
  align?: 'left' | 'right'
}

export function ShopHeroActions({
  product,
  price,
  href,
  soldOut,
  ctaLabel,
  pickup,
  align = 'left',
}: Props) {
  const { locale } = useLocale()
  const isDe = locale === 'de'
  const addLabel = isDe ? 'In den Warenkorb' : 'Add to cart'
  const priceLabel = isDe ? 'Preis' : 'Price'
  const isRight = align === 'right'

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4',
        isRight ? 'items-end text-right' : 'items-start text-left',
      )}
    >
      {/* Focused price — purchase zone */}
      {price != null && price > 0 && (
        <div className="shop-hero-price">
          <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ff-gold">
            {priceLabel}
          </p>
          <p className="m-0 font-display text-4xl sm:text-5xl font-extrabold leading-none tabular-nums tracking-tight text-white">
            {formatPrice(price)}
          </p>
        </div>
      )}

      {product && !soldOut ? (
        <AddToCart
          product={product}
          className="!m-0 h-auto w-fit rounded-full border-0 bg-ff-charcoal px-7 py-3 font-display text-base font-bold text-ff-ivory shadow-none hover:bg-ff-charcoal-hover hover:text-ff-ivory"
        >
          {addLabel}
        </AddToCart>
      ) : (
        <Link
          href={href}
          className="inline-flex w-fit items-center justify-center rounded-full bg-ff-charcoal px-7 py-3 font-display text-base font-bold text-ff-ivory transition-colors hover:bg-ff-charcoal-hover"
        >
          {soldOut ? (isDe ? 'Details ansehen' : 'View details') : ctaLabel}
        </Link>
      )}

      {product && !soldOut && (
        <Link
          href={href}
          className="shop-hero-copy text-body-sm font-medium text-white/80 underline underline-offset-4 transition-colors hover:text-white"
        >
          {isDe ? 'Produktdetails' : 'Product details'}
        </Link>
      )}

      <p className="shop-hero-copy text-body-sm text-white/75">{pickup}</p>
    </div>
  )
}
