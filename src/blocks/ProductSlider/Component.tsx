'use client'

import type {
  Media as MediaType,
  Product,
  ProductSliderBlock as ProductSliderBlockType,
} from '@/payload-types'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import Link from 'next/link'
import React, { useCallback, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  DEFAULTS (English — CMS data always wins)
 * ═══════════════════════════════════════════════════════════════ */
const DEFAULTS = {
  heading: 'Discover UNIQUE.',
  headingAccent: 'FLAVOURS',
  description:
    'Dive into a world of fermentation innovation at FermentFreude. Our carefully curated products bring together the latest flavours and timeless classics, ensuring you find the perfect taste for every occasion.',
  buttonLabel: 'View All Products',
  buttonLink: '/products',
}

type Props = ProductSliderBlockType & { id?: string }

/* ═══════════════════════════════════════════════════════════════ */

function resolveProduct(p: Product | string | number | null | undefined): Product | null {
  if (!p) return null
  if (typeof p === 'object' && 'title' in p) return p
  return null
}

function getProductImage(product: Product): MediaType | null {
  const gallery = product.gallery
  if (!gallery || gallery.length === 0) return null
  const first = gallery[0]?.image
  if (typeof first === 'object' && first !== null && 'url' in first) return first
  return null
}

function getProductPrice(product: Product): number | null {
  const variants = product.variants?.docs
  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD &&
      typeof variant.priceInUSD === 'number'
    ) {
      return variant.priceInUSD
    }
  }
  return typeof product.priceInUSD === 'number' ? product.priceInUSD : null
}

function getVariantLabel(product: Product): string {
  // 1. Try ecommerce variant titles first
  const variants = product.variants?.docs
  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (variant && typeof variant === 'object' && variant?.title) {
      return variant.title
    }
  }
  // 2. Derive a human-readable label from the product slug
  if (product.slug) {
    const parts = product.slug
      .replace(/-\d+$/, '') // remove trailing number suffix (e.g. "-2")
      .replace(/^kombucha-/, '') // remove product prefix
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    if (parts) return parts
  }
  return ''
}

/* ═══════════════════════════════════════════════════════════════
 *  COMPONENT
 * ═══════════════════════════════════════════════════════════════ */

export const ProductSliderBlock: React.FC<Props> = ({
  heading,
  headingAccent,
  description,
  buttonLabel,
  buttonLink,
  products: rawProducts,
  id,
}) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedAccent = headingAccent ?? DEFAULTS.headingAccent
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink

  const products: Product[] = Array.isArray(rawProducts)
    ? (rawProducts.map(resolveProduct).filter(Boolean) as Product[])
    : []

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current
      if (!el) return
      const cardWidth = el.querySelector('[data-product-card]')?.clientWidth ?? 320
      const gap = 24
      const distance = cardWidth + gap
      el.scrollBy({
        left: direction === 'left' ? -distance : distance,
        behavior: 'smooth',
      })
      setTimeout(updateScrollState, 350)
    },
    [updateScrollState],
  )

  return (
    <section id={id} className="section-padding-md overflow-hidden">
      <div className="mx-auto container-padding" style={{ maxWidth: 'var(--content-full)' }}>
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-16 mb-8 lg:mb-10">
          {/* Left: Heading + Description */}
          <div className="flex-1 max-w-264">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2
                className="font-display font-black"
                style={{
                  fontSize: 'clamp(2.25rem, 5.5vw, 5rem)',
                  lineHeight: 1.2,
                  letterSpacing: '0',
                  color: '#000',
                }}
              >
                {resolvedHeading}
              </h2>
              <span
                className="font-display font-bold"
                style={{
                  color: '#E8C079',
                  fontSize: 'clamp(1rem, 1.6vw, 1.5rem)',
                  lineHeight: 1.5,
                }}
              >
                {resolvedAccent}
              </span>
            </div>
            <p
              className="font-display font-bold mt-6 lg:mt-9"
              style={{
                fontSize: 'clamp(0.95rem, 1.6vw, 1.5rem)',
                lineHeight: 1.5,
                color: '#000',
              }}
            >
              {resolvedDescription}
            </p>
          </div>

          {/* Right: CTA button */}
          <div className="shrink-0">
            <Link
              href={resolvedButtonLink}
              className="inline-flex items-center justify-center font-display font-bold text-[#F9F0DC] transition-opacity hover:opacity-90"
              style={{
                backgroundColor: '#4B4B4B',
                borderRadius: '2rem',
                padding: '1.125rem 1.875rem',
                fontSize: 'clamp(0.95rem, 1.3vw, 1.6rem)',
                lineHeight: 1.5,
              }}
            >
              {resolvedButtonLabel}
            </Link>
          </div>
        </div>

        {/* ── Product Cards Slider ───────────────────────── */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-5 overflow-x-auto pb-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`[data-product-slider]::-webkit-scrollbar { display: none; }`}</style>
          {products.length > 0
            ? products.map((product, i) => (
                <ProductCard key={product.id ?? i} product={product} />
              ))
            : Array.from({ length: 4 }).map((_, i) => <PlaceholderCard key={i} />)}
        </div>

        {/* ── Slider Navigation Arrows ───────────────────── */}
        <div className="flex justify-end items-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex items-center justify-center transition-colors hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: '2.65rem',
              height: '2.65rem',
              borderRadius: '0.44rem',
              backgroundColor: '#F2F2F2',
              border: '0.88px solid rgba(4,4,4,0.15)',
            }}
            aria-label="Scroll left"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12.25 7H1.75" stroke="#4B4F4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 1.75L1.75 7L7 12.25" stroke="#4B4F4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex items-center justify-center transition-colors hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: '2.65rem',
              height: '2.65rem',
              borderRadius: '0.44rem',
              backgroundColor: '#F2F2F2',
              border: '0.88px solid rgba(4,4,4,0.15)',
            }}
            aria-label="Scroll right"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.75 7H12.25" stroke="#4B4F4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 1.75L12.25 7L7 12.25" stroke="#4B4F4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  SVG card background — curved cutout at bottom-right for cart button
 *  Original Figma viewBox 328×350, scaled to fill card via preserveAspectRatio
 * ═══════════════════════════════════════════════════════════════ */
function CardBackground({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 328 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M327.018 17.5875C327.018 7.87419 319.144 0 309.43 0H17.5875C7.8737 0 0 7.8742 0 17.5875V331.964C0 341.678 7.8737 349.552 17.5875 349.552H251.689C257.932 349.552 262.052 342.503 261.028 336.344L259.404 326.564C255.047 300.346 277.37 277.427 303.693 281.089C313.197 282.411 327.018 275.987 327.018 266.392V17.5875Z"
        fill="#F7F7F8"
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  Gold cart button SVG — exact Figma circle + cart icon
 * ═══════════════════════════════════════════════════════════════ */
function CartButtonIcon() {
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M57.1594 28.5797C57.1594 12.7956 44.3638 0 28.5797 0C12.7956 0 0 12.7956 0 28.5797C0 44.3638 12.7956 57.1594 28.5797 57.1594C44.3638 57.1594 57.1594 44.3638 57.1594 28.5797Z" fill="#E5B765" />
      <path d="M23.5518 36.1753C24.4641 36.1753 25.2105 36.9382 25.2105 37.8802C25.2105 38.8113 24.4641 39.5741 23.5518 39.5741C22.6295 39.5741 21.882 38.8113 21.882 37.8802C21.882 36.9382 22.6295 36.1753 23.5518 36.1753ZM35.9092 36.1753C36.8204 36.1753 37.5668 36.9382 37.5668 37.8802C37.5668 38.8113 36.8204 39.5741 35.9092 39.5741C34.9858 39.5741 34.2394 38.8113 34.2394 37.8802C34.2394 36.9382 34.9858 36.1753 35.9092 36.1753ZM18.5547 17.5996L21.1741 18.002C21.5479 18.0701 21.8227 18.3834 21.8556 18.7648L22.0645 21.2776C22.0975 21.6382 22.3822 21.9064 22.7339 21.9064H37.5679C38.2373 21.9064 38.677 22.1427 39.1156 22.6582C39.5553 23.1749 39.6322 23.9146 39.5333 24.5863L38.4901 31.9455C38.2923 33.3602 37.1062 34.4023 35.7113 34.4023H23.7276C22.2668 34.4023 21.0587 33.2591 20.9378 31.7785L19.9276 19.5496L18.2689 19.2584C17.8303 19.1803 17.5225 18.7429 17.5995 18.2933C17.6764 17.8349 18.104 17.5304 18.5547 17.5996ZM33.9536 26.0559H30.911C30.4504 26.0559 30.0877 26.4264 30.0877 26.8979C30.0877 27.3574 30.4504 27.7388 30.911 27.7388H33.9536C34.4153 27.7388 34.778 27.3574 34.778 26.8979C34.778 26.4264 34.4153 26.0559 33.9536 26.0559Z" fill="white" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  Product Card — matches Figma exactly:
 *  • SVG card shape with curved cutout at bottom-right
 *  • Gold circular cart SVG button nesting into the cutout
 *  • Product bottle image overflowing bottom of card
 *  • Product name + variant + price below the card
 * ═══════════════════════════════════════════════════════════════ */

function ProductCard({ product }: { product: Product }) {
  const image = getProductImage(product)
  const price = getProductPrice(product)
  const variantLabel = getVariantLabel(product)

  return (
    <div
      data-product-card
      className="shrink-0 snap-start"
      style={{ width: 'clamp(260px, 24vw, 340px)' }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        {/* ── Card with SVG background + overflowing bottle ── */}
        <div className="relative mb-2">
          {/* SVG card background with cutout */}
          <div className="relative" style={{ aspectRatio: '328 / 350' }}>
            <CardBackground className="absolute inset-0 w-full h-full" />

            {/* Product bottle — positioned over the SVG card, overflows bottom */}
            <div
              className="absolute inset-0 flex items-end justify-center"
              style={{ bottom: '-14%' }}
            >
              {image ? (
                <Media
                  resource={image}
                  className="relative w-[55%] h-[85%]"
                  imgClassName="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
                />
              ) : (
                <div className="w-[55%] h-[70%] bg-[#ECE5DE] rounded-lg" />
              )}
            </div>
          </div>

          {/* Gold cart button — nests into the SVG cutout at bottom-right */}
          <button
            type="button"
            className="absolute z-10 transition-transform hover:scale-110"
            style={{
              width: '17.7%',
              bottom: '0',
              right: '0',
            }}
            aria-label={`Add ${product.title} to cart`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <CartButtonIcon />
          </button>
        </div>

        {/* ── Product info below card ─────────────── */}
        <div className="pt-8">
          <p
            className="font-display font-medium mb-0"
            style={{ fontSize: '1rem', lineHeight: 1.4, color: '#4B4F4A' }}
          >
            {product.title}
          </p>
          {variantLabel && (
            <p
              className="font-display mb-0"
              style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#4B4F4A' }}
            >
              {variantLabel}
            </p>
          )}
          <p
            className="mb-0"
            style={{ fontSize: '0.775rem', lineHeight: 1.5, color: '#4B4F4A', opacity: 0.7 }}
          >
            250ML
          </p>
          {typeof price === 'number' && (
            <Price
              amount={price}
              className="font-semibold mb-0"
              as="p"
            />
          )}
        </div>
      </Link>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  Placeholder Card (no products selected — same SVG card shape)
 * ═══════════════════════════════════════════════════════════════ */

function PlaceholderCard() {
  return (
    <div
      data-product-card
      className="shrink-0 snap-start"
      style={{ width: 'clamp(260px, 24vw, 340px)' }}
    >
      <div className="relative mb-2">
        <div className="relative" style={{ aspectRatio: '328 / 350' }}>
          <CardBackground className="absolute inset-0 w-full h-full" />
          <div
            className="absolute inset-0 flex items-end justify-center"
            style={{ bottom: '-14%' }}
          >
            <div className="w-[55%] h-[70%] bg-[#ECE5DE] rounded-lg" />
          </div>
        </div>
        {/* Gold cart button placeholder */}
        <div
          className="absolute z-10 opacity-50"
          style={{
            width: '17.7%',
            bottom: '0',
            right: '0',
          }}
        >
          <CartButtonIcon />
        </div>
      </div>
      <div className="pt-8">
        <div className="h-4 w-20 rounded" style={{ backgroundColor: '#E5E5E5' }} />
        <div className="h-3 w-14 rounded mt-1.5" style={{ backgroundColor: '#E5E5E5' }} />
        <div className="h-5 w-10 rounded mt-1.5" style={{ backgroundColor: '#E5E5E5' }} />
      </div>
    </div>
  )
}
