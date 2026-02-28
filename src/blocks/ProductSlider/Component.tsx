'use client'

import type {
  Media as MediaType,
  Product,
  ProductSliderBlock as ProductSliderBlockType,
} from '@/payload-types'
import { Media } from '@/components/Media'
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
 *  Combined SVG: card background + cart button in one unit
 *  From the original Figma export — both shapes share the same
 *  328×350 coordinate system so they always align perfectly.
 *  The button circle + icon are a clickable <g> with hover state.
 * ═══════════════════════════════════════════════════════════════ */
function CardWithButton({
  className,
  cartHovered,
  onCartEnter,
  onCartLeave,
  onCartClick,
  ariaLabel,
  opacity,
}: {
  className?: string
  cartHovered?: boolean
  onCartEnter?: () => void
  onCartLeave?: () => void
  onCartClick?: (e: React.MouseEvent) => void
  ariaLabel?: string
  opacity?: number
}) {
  const btnColor = cartHovered ? '#4B4B4B' : '#E5B765'
  return (
    <svg
      className={className}
      viewBox="0 0 328 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Card background with cutout */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M327.018 17.5875C327.018 7.87419 319.144 0 309.43 0H17.5875C7.87419 0 0 7.8742 0 17.5875V331.964C0 341.678 7.87421 349.552 17.5875 349.552H251.689C257.932 349.552 262.052 342.503 261.028 336.344L259.404 326.564C255.047 300.346 277.37 277.427 303.693 281.089C313.197 282.411 327.018 275.987 327.018 266.392V17.5875Z"
        fill="#F7F7F8"
      />
      {/* Cart button circle + icon */}
      <g
        role="button"
        aria-label={ariaLabel}
        style={{ cursor: 'pointer', opacity: opacity ?? 1 }}
        onMouseEnter={onCartEnter}
        onMouseLeave={onCartLeave}
        onClick={onCartClick}
      >
        <path
          d="M327.019 320.974C327.019 305.19 314.223 292.395 298.439 292.395C282.655 292.395 269.859 305.19 269.859 320.974C269.859 336.758 282.655 349.554 298.439 349.554C314.223 349.554 327.019 336.758 327.019 320.974Z"
          fill={btnColor}
          className="transition-colors duration-200"
        />
        <path
          d="M293.409 328.566C294.322 328.566 295.068 329.329 295.068 330.271C295.068 331.202 294.322 331.965 293.409 331.965C292.487 331.965 291.74 331.202 291.74 330.271C291.74 329.329 292.487 328.566 293.409 328.566ZM305.767 328.566C306.678 328.566 307.424 329.329 307.424 330.271C307.424 331.202 306.678 331.965 305.767 331.965C304.843 331.965 304.097 331.202 304.097 330.271C304.097 329.329 304.843 328.566 305.767 328.566ZM288.412 309.99L291.032 310.393C291.406 310.461 291.68 310.774 291.713 311.155L291.922 313.668C291.955 314.029 292.24 314.297 292.592 314.297H307.426C308.095 314.297 308.535 314.533 308.973 315.049C309.413 315.566 309.49 316.305 309.391 316.977L308.348 324.336C308.15 325.751 306.964 326.793 305.569 326.793H293.585C292.124 326.793 290.916 325.65 290.795 324.169L289.785 311.94L288.127 311.649C287.688 311.571 287.38 311.133 287.457 310.684C287.534 310.226 287.962 309.921 288.412 309.99ZM303.811 318.447H300.769C300.308 318.447 299.945 318.817 299.945 319.289C299.945 319.748 300.308 320.129 300.769 320.129H303.811C304.273 320.129 304.636 319.748 304.636 319.289C304.636 318.817 304.273 318.447 303.811 318.447Z"
          fill="white"
        />
      </g>
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
  const [cartHovered, setCartHovered] = useState(false)
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
        {/* ── Card with combined SVG (background + button) + overflowing bottle ── */}
        <div className="relative mb-2">
          <div className="relative" style={{ aspectRatio: '328 / 350' }}>
            {/* Single SVG: card background + cart button always aligned */}
            <CardWithButton
              className="absolute inset-0 w-full h-full"
              cartHovered={cartHovered}
              onCartEnter={() => setCartHovered(true)}
              onCartLeave={() => setCartHovered(false)}
              onCartClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              ariaLabel={`Add ${product.title} to cart`}
            />

            {/* Product bottle — positioned over the SVG card, overflows bottom */}
            <div
              className="absolute inset-0 flex items-end justify-center pointer-events-none"
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
            <p
              className="font-semibold mb-0"
              style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#4B4F4A' }}
            >
              €{price.toFixed(2).replace('.', ',')}
            </p>
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
          <CardWithButton className="absolute inset-0 w-full h-full" opacity={0.5} />
          <div
            className="absolute inset-0 flex items-end justify-center pointer-events-none"
            style={{ bottom: '-14%' }}
          >
            <div className="w-[55%] h-[70%] bg-[#ECE5DE] rounded-lg" />
          </div>
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
