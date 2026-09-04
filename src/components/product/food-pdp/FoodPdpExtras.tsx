'use client'

import type { Product } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { cn } from '@/utilities/cn'
import { type AppLocale } from '@/utilities/productDetailDisplay'
import {
  ArrowRight,
  ChefHat,
  ClipboardList,
  ShoppingBag,
  Snowflake,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense, useEffect, useState, type MouseEvent } from 'react'

import { FoodPdpRelatedProductCard } from './FoodPdpRelatedProductCard'
import { getHeaderScrollOffset, scrollToSection } from './scrollToSection'
import { FOOD_PDP_PANEL_BG } from './theme'

type SectionLink = { id: string; label: string }

const SECTION_NAV_ICONS: Record<string, LucideIcon> = {
  produktdetails: ClipboardList,
  geschmack: ChefHat,
  lagerung: Snowflake,
}

export function FoodPdpSectionNav({ sections }: { sections: SectionLink[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    if (!sections.length) return

    const updateActive = () => {
      const marker = getHeaderScrollOffset()
      let current = sections[0]?.id ?? ''

      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= marker) current = id
      }

      setActiveId(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [sections])

  if (sections.length < 2) return null

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    scrollToSection(id)
    setActiveId(id)
  }

  return (
    <nav
      aria-label="Produktabschnitte"
      className="mb-6 rounded-2xl p-2 ring-1 ring-ff-near-black/8"
      style={{ backgroundColor: FOOD_PDP_PANEL_BG }}
    >
      <ul className="flex flex-wrap gap-2 p-0.5">
        {sections.map(({ id, label }) => {
          const isActive = activeId === id
          const Icon = SECTION_NAV_ICONS[id]
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                onClick={(event) => handleNavClick(event, id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-caption font-medium transition-all',
                  isActive
                    ? 'border-ff-gold-accent bg-ff-gold-accent/15 text-ff-near-black'
                    : 'border-ff-near-black/10 bg-white text-ff-gray-text hover:border-ff-near-black/20 hover:text-ff-near-black',
                )}
              >
                {Icon && (
                  <Icon
                    className="size-3.5 shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                )}
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function FoodPdpMobileBuyBar({
  product,
  quantity,
  priceLabel,
  addToCartLabel,
  locale,
  isOutOfStock,
}: {
  product: Product
  quantity: number
  priceLabel: string
  addToCartLabel: string
  locale: AppLocale
  isOutOfStock: boolean
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('pdp-hero-purchase')
    if (!target || isOutOfStock) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -20px 0px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [isOutOfStock])

  if (isOutOfStock || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ff-near-black/10 bg-white/95 p-4 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-body-sm font-semibold text-ff-near-black">
            {product.title}
          </p>
          <p className="font-display text-body tabular-nums text-ff-gold-accent-dark">{priceLabel}</p>
        </div>
        <Suspense fallback={null}>
          <AddToCart
            product={product}
            quantity={quantity}
            className="!m-0 inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ff-near-black px-5 font-display text-caption font-medium text-white"
          >
            <ShoppingBag className="size-4" aria-hidden />
            {addToCartLabel}
          </AddToCart>
        </Suspense>
      </div>
    </div>
  )
}

export function FoodPdpRelatedStrip({
  products,
  locale,
  currentSlug,
  title,
}: {
  products: Product[]
  locale: AppLocale
  currentSlug?: string | null
  title: string
}) {
  const filtered = products.filter(
    (p) => p.slug && p.slug !== currentSlug && typeof p.slug === 'string',
  )

  if (!filtered.length) return null

  return (
    <section>
      <h2 className="mb-6 font-display text-body-lg font-bold text-ff-near-black">{title}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, 3).map((related) => (
          <li key={related.id}>
            <FoodPdpRelatedProductCard product={related} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function FoodPdpShopFooter({
  shopLabel,
  shopDescription,
  shopCta,
}: {
  shopLabel: string
  shopDescription: string
  shopCta: string
}) {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/shop/pdp-discover-bg.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-ff-near-black/50" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center md:px-10 md:py-20">
        <p className="font-display text-section-heading font-bold text-white">{shopLabel}</p>
        <p className="mx-auto mt-4 max-w-xl text-body leading-relaxed text-white/90">
          {shopDescription}
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display text-body-sm font-medium text-ff-near-black transition-transform hover:scale-[1.02]"
        >
          {shopCta}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
