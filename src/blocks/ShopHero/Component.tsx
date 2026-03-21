'use client'

import { Media } from '@/components/Media'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { Media as MediaType, ShopHeroBlock } from '@/payload-types'

const BlobCanvas = dynamic(
  () => import('@/blocks/FeatureCards/BlobCanvas').then((m) => m.BlobCanvas),
  { ssr: false },
)

type Slide = NonNullable<ShopHeroBlock['slides']>[number]

const DEFAULT_SLIDES: Slide[] = [
  { id: 'default-1', categoryLabel: 'Tempeh', detailUrl: '/shop/tempeh' },
  { id: 'default-2', categoryLabel: 'Kimchi', detailUrl: '/shop/kimchi' },
  { id: 'default-3', categoryLabel: 'Miso', detailUrl: '/shop/miso' },
]

function isMediaObject(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

/* ═══════════════════════════════════════════════════════════════
 *  CardWithButton SVG — identical to ProductSlider
 *  Card background with cutout + gold circular arrow button
 * ═══════════════════════════════════════════════════════════════ */
function CardWithButton({
  className,
  btnHovered,
  onBtnEnter,
  onBtnLeave,
  ariaLabel,
}: {
  className?: string
  btnHovered?: boolean
  onBtnEnter?: () => void
  onBtnLeave?: () => void
  ariaLabel?: string
}) {
  const btnColor = btnHovered ? '#E5B765' : '#1a1a1a'
  return (
    <svg
      className={className}
      viewBox="0 0 328 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Card background with cutout — yellow fill, shadow, no border */}
      <defs>
        <filter id="cardShadow" x="-4%" y="-2%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.10" />
        </filter>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M327.018 17.588C327.018 7.874 319.144 0 309.43 0H17.588C7.874 0 0 7.874 0 17.588V421.964C0 431.678 7.874 439.552 17.588 439.552H251.689C257.932 439.552 262.052 432.503 261.028 426.344L259.404 416.564C255.047 390.346 277.37 367.427 303.693 371.089C313.197 372.411 327.018 365.987 327.018 356.392V17.588Z"
        fill="#e8e8e8"
        stroke="none"
        filter="url(#cardShadow)"
      />
      {/* Button circle + arrow icon */}
      <g
        role="button"
        aria-label={ariaLabel}
        style={{ cursor: 'pointer' }}
        onMouseEnter={onBtnEnter}
        onMouseLeave={onBtnLeave}
      >
        <circle
          cx="298.44"
          cy="410.97"
          r="28.58"
          fill={btnColor}
          className="transition-colors duration-200"
        />
        <path
          d="M290 411H307M307 411L300 404M307 411L300 418"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export const ShopHeroComponent: React.FC<ShopHeroBlock> = (props) => {
  const {
    heroTitle,
    heroPrice,
    ctaPrimaryLabel,
    ctaPrimaryUrl,
    ctaSecondaryLabel,
    ctaSecondaryUrl,
    slides: cmsSlides,
    bottomTagline,
    bottomSubtitle,
    bottomDisclaimer,
  } = props

  const title = heroTitle ?? 'Our Handmade Products From Our Pick-Up Shop.'
  const price = heroPrice ?? 'from €8.50'
  const primaryLabel = ctaPrimaryLabel ?? 'Order Now'
  const primaryUrl = ctaPrimaryUrl ?? '/shop#products'
  const secondaryLabel = ctaSecondaryLabel ?? 'Learn More'
  const secondaryUrl = ctaSecondaryUrl ?? '/fermentation'
  const tagline = bottomTagline ?? 'Fermented foods, crafted with care.'
  const subtitle = bottomSubtitle ?? 'Pickup in Graz — freshly made every week.'
  const disclaimer = bottomDisclaimer ?? 'Delivery coming soon — to ensure the freshest quality.'

  const slides = cmsSlides && cmsSlides.length >= 2 ? cmsSlides : DEFAULT_SLIDES

  /* ── Infinite scroll: triple the slides for seamless looping ── */
  const loopSlides = [...slides, ...slides, ...slides]

  const scrollRef = useRef<HTMLDivElement>(null)
  const isResetting = useRef(false)

  /* Jump to middle set on mount so we can scroll in both directions */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const oneSetWidth = el.scrollWidth / 3
    el.scrollLeft = oneSetWidth
  }, [])

  /* On scroll end, silently snap to the middle set for infinite loop */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || isResetting.current) return

    const oneSetWidth = el.scrollWidth / 3

    if (el.scrollLeft <= 0) {
      isResetting.current = true
      el.style.scrollBehavior = 'auto'
      el.scrollLeft = oneSetWidth
      el.style.scrollBehavior = ''
      isResetting.current = false
    } else if (el.scrollLeft >= oneSetWidth * 2) {
      isResetting.current = true
      el.style.scrollBehavior = 'auto'
      el.scrollLeft = oneSetWidth
      el.style.scrollBehavior = ''
      isResetting.current = false
    }
  }, [])

  return (
    <section className="relative w-full overflow-hidden bg-white min-h-dvh md:h-dvh">
      {/* ── Gold blob ── */}
      <div className="blob-interactive absolute top-[14%] left-[36%] z-3 hidden md:block pointer-events-auto w-14 h-14">
        <BlobCanvas
          color="#E6BE68"
          radius={20}
          numPoints={24}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* ── Dark blob ── */}
      <div className="blob-interactive absolute top-[8%] right-[6%] z-5 hidden md:block pointer-events-auto w-12 h-12">
        <BlobCanvas
          color="#1a1a1a"
          radius={16}
          numPoints={20}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* ── Left: Text content ── */}
        <div className="w-full md:w-[38%] flex flex-col justify-between px-4 sm:px-6 md:px-10 pt-20 sm:pt-24 md:pt-24 pb-2 md:pb-3 relative z-2 min-h-0">
          <div>
            <h1
              className="font-display font-bold text-[#1a1a1a] mb-2 md:mb-4 max-w-[95%] md:max-w-[95%]"
              style={{
                fontSize: 'clamp(1.3rem, 2.8vw, 2.5rem)',
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>

            {price && (
              <div className="flex items-baseline gap-2 mb-2 md:mb-3">
                <span className="text-[10px] md:text-xs font-semibold text-[#1a1a1a]">Price</span>
                <span
                  className="font-display font-semibold text-[#1a1a1a]"
                  style={{ fontSize: 'clamp(1rem, 1.6vw, 1.4rem)' }}
                >
                  {price}
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-row gap-2 mb-4 md:mb-0">
              {primaryLabel && primaryUrl && (
                <Link
                  href={primaryUrl}
                  className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-4 md:px-5 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-white transition-colors duration-300 hover:bg-[#333]"
                >
                  {primaryLabel}
                </Link>
              )}
              {secondaryLabel && secondaryUrl && (
                <Link
                  href={secondaryUrl}
                  className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a] px-4 md:px-5 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] transition-colors duration-300 hover:bg-[#1a1a1a] hover:text-white"
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>

          {/* ── Footer text ── */}
          <div className="flex items-start gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 76 76"
                fill="none"
                className="shrink-0 mt-0.5 hidden sm:block"
                aria-hidden="true"
              >
                <path
                  d="M52.6617 37.6496L58.7381 40.0325L75.0609 49.0874L66.6016 63.7422L49.9214 54.6872L45.1557 50.7554L46.1088 57.1892V75.18H28.952V57.1892L30.0243 50.5171L24.9011 54.6872L8.45924 63.7422L0 49.0874L16.3228 39.7942L22.3991 37.6496L16.3228 35.1475L0 26.2117L8.45924 11.557L25.1394 20.4928L30.0243 24.6629L28.952 18.3482V0H46.1088V18.3482L45.1557 24.4246L49.9214 20.4928L66.6016 11.557L75.0609 26.2117L58.7381 35.3858L52.6617 37.6496Z"
                  fill="#1a1a1a"
                />
              </svg>
              <div className="leading-tight">
                <p className="text-[10px] md:text-[11px] font-bold text-[#1a1a1a] m-0">{tagline}</p>
                <p className="text-[10px] md:text-[11px] font-medium text-[#1a1a1a] m-0 mt-0.5">
                  {subtitle}
                </p>
                {disclaimer && (
                  <p className="text-[9px] md:text-[10px] text-[#999] mt-0.5 m-0 italic">
                    {disclaimer}
                  </p>
                )}
              </div>
            </div>
        </div>

        {/* ── Right: Infinite card slider ── */}
        <div className="w-full md:w-[62%] flex flex-col justify-end relative z-1 pb-2 md:pb-3 pt-2 md:pt-16 min-h-0 overflow-visible">
          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            data-shop-slider
            className="flex gap-16 md:gap-20 overflow-x-auto pb-2 snap-x snap-mandatory pl-14 md:pl-24 pr-4 md:pr-8 items-center"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
            }}
          >
            <style>{`[data-shop-slider]::-webkit-scrollbar { display: none; }`}</style>
            {loopSlides.map((slide, i) => (
              <ShopCard
                key={`${slide.id || slide.categoryLabel}-${i}`}
                slide={slide}
                isFirstInRow={i === slides.length}
              />
            ))}
          </div>

          {/* "SCROLL →" indicator */}
          <div className="flex justify-end items-center mt-2 md:mt-3 px-4 md:pr-8">
            <span
              className="font-display uppercase tracking-[0.25em] text-[#999] select-none"
              style={{ fontSize: '0.75rem' }}
            >
              scroll{' '}
              <span className="inline-block ml-1" aria-hidden="true">
                &rarr;
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  Shop Card — ProductSlider SVG frame with integrated button
 *  + vertical category label on the card
 * ═══════════════════════════════════════════════════════════════ */
function ShopCard({
  slide,
  isFirstInRow = false,
}: {
  slide: Slide
  isFirstInRow?: boolean
}) {
  const [btnHovered, setBtnHovered] = useState(false)
  const hasImage = isMediaObject(slide.image)
  const labelText = (slide.categoryLabel ?? '').trim()
  const isTempeh = labelText.toLowerCase() === 'tempeh'

  const labelWords = labelText.split(/\s+/).filter(Boolean)
  const isLongLabel = labelText.length > 11

  const labelLines = React.useMemo(() => {
    if (!isLongLabel) return [labelText]
    if (labelWords.length >= 2) {
      const midpoint = Math.ceil(labelWords.length / 2)
      return [labelWords.slice(0, midpoint).join(' '), labelWords.slice(midpoint).join(' ')]
    }
    const midpoint = Math.ceil(labelText.length / 2)
    return [labelText.slice(0, midpoint), labelText.slice(midpoint)]
  }, [isLongLabel, labelText, labelWords])

  return (
    <div
      data-shop-card
      className={`shrink-0 snap-start flex h-full relative ${isLongLabel ? 'mr-4 md:mr-6' : ''}`}
    >
      {/* Card */}
      <div
        className="relative shrink-0"
        style={{ height: 'clamp(240px, 50vh, 440px)', aspectRatio: '328 / 440' }}
      >
        {/* Label — overlaps left edge, half on card half outside, always on top */}
        {slide.categoryLabel && (
          <div
            className="absolute z-50 select-none pointer-events-none"
            style={{
              left: isFirstInRow ? '-2.6rem' : '-1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <span
              className="leading-none uppercase font-black tracking-wider text-[#1a1a1a]"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: isLongLabel ? 'clamp(1.5rem, 2.8vw, 2.4rem)' : 'clamp(2rem, 4vw, 3.5rem)',
                display: 'block',
                lineHeight: isLongLabel ? 0.9 : 1,
              }}
            >
              {labelLines.map((line, index) => (
                <React.Fragment key={`${line}-${index}`}>
                  {line}
                  {index < labelLines.length - 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </span>
          </div>
        )}

        <Link href={slide.detailUrl || '/shop'} className="group block h-full">
          <div className="relative h-full">
            <CardWithButton
              className="absolute inset-0 w-full h-full"
              btnHovered={btnHovered}
              onBtnEnter={() => setBtnHovered(true)}
              onBtnLeave={() => setBtnHovered(false)}
              ariaLabel={`View ${slide.categoryLabel || 'product'} details`}
            />

            {/* Product image — overflows the card frame */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: isTempeh ? '-19%' : '-16%',
                left: isTempeh ? '-12%' : '-10%',
                right: isTempeh ? '-12%' : '-10%',
                bottom: '1%',
              }}
            >
              {hasImage ? (
                <Media
                  resource={slide.image as MediaType}
                  className="w-full h-full"
                  imgClassName={`w-full h-full object-contain transition-transform duration-300 ${isTempeh ? 'scale-105 group-hover:scale-[1.14]' : 'group-hover:scale-110'} drop-shadow-2xl`}
                />
              ) : (
                <div className="w-full h-full bg-[#ECE5DE] rounded-lg" />
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
