'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import type { Product } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/cn'
import Link from 'next/link'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price / 100)
}

const LABEL_DEFAULTS = {
  en: {
    priceLabel: 'Price',
    addToCartLabel: 'Add to cart',
    detailsLabel: 'Product details',
    viewDetailsLabel: 'View details',
  },
  de: {
    priceLabel: 'Preis',
    addToCartLabel: 'In den Warenkorb',
    detailsLabel: 'Produktdetails',
    viewDetailsLabel: 'Details ansehen',
  },
} as const

type Props = {
  product: Product | null
  price: number | null | undefined
  href: string
  soldOut: boolean
  ctaLabel: string
  pickup: string
  priceLabel?: string
  addToCartLabel?: string
  detailsLabel?: string
  viewDetailsLabel?: string
  align?: 'left' | 'right'
}

export function ShopHeroActions({
  product,
  price,
  href,
  soldOut,
  ctaLabel,
  pickup,
  priceLabel,
  addToCartLabel,
  detailsLabel,
  viewDetailsLabel,
  align = 'left',
}: Props) {
  const { locale } = useLocale()
  const d = LABEL_DEFAULTS[locale === 'de' ? 'de' : 'en']
  const resolvedPriceLabel = priceLabel?.trim() || d.priceLabel
  const resolvedAddToCart = addToCartLabel?.trim() || d.addToCartLabel
  const resolvedDetails = detailsLabel?.trim() || d.detailsLabel
  const resolvedViewDetails = viewDetailsLabel?.trim() || d.viewDetailsLabel
  const isRight = align === 'right'

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4',
        isRight ? 'items-end text-right' : 'items-start text-left',
      )}
    >
      {price != null && price > 0 && (
        <div className="shop-hero-price">
          <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-ff-gold">
            {resolvedPriceLabel}
          </p>
          <p className="m-0 font-display text-4xl sm:text-5xl font-extrabold leading-none tabular-nums tracking-tight text-white">
            {formatPrice(price)}
          </p>
        </div>
      )}

      {product && !soldOut ? (
        <AddToCart
          product={product}
          className="m-0! h-auto w-fit rounded-full border-0 bg-ff-charcoal px-7 py-3 font-display text-base font-bold text-ff-ivory shadow-none hover:bg-ff-charcoal-hover hover:text-ff-ivory"
        >
          {resolvedAddToCart}
        </AddToCart>
      ) : (
        <Link
          href={href}
          className="inline-flex w-fit items-center justify-center rounded-full bg-ff-charcoal px-7 py-3 font-display text-base font-bold text-ff-ivory transition-colors hover:bg-ff-charcoal-hover"
        >
          {soldOut ? resolvedViewDetails : ctaLabel}
        </Link>
      )}

      {product && !soldOut && (
        <Link
          href={href}
          className="shop-hero-copy text-body-sm font-medium text-white/80 underline underline-offset-4 transition-colors hover:text-white"
        >
          {resolvedDetails}
        </Link>
      )}

      <p className="shop-hero-copy text-body-sm text-white/75">{pickup}</p>
    </div>
  )
}
