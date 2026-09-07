'use client'

import { ShopHeroActions } from '@/blocks/ShopHero/ShopHeroActions'
import { useAutoPlay, AUTO_PLAY_INTERVAL } from '@/heros/HeroSlider/useAutoPlay'
import { useSwipe } from '@/heros/HeroSlider/useSwipe'
import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import React from 'react'

export type ResolvedProductSlide = {
  product: Product
  imageSrc: string | null
  imageAlt: string
  unit: string
  title: string
  blurb: string
  price: number | null
  href: string
  soldOut: boolean
  ctaLabel: string
  pickup: string
  badgeLabel: string | null
}

type Props = {
  slides: ResolvedProductSlide[]
}

export function ProductHeroSliderClient({ slides }: Props) {
  const { activeIndex, isPaused, setIsPaused, progressRef, goToSlide, goNext, goPrev } =
    useAutoPlay(slides.length)
  const { handleTouchStart, handleTouchEnd } = useSwipe({ goNext, goPrev })

  const slide = slides[activeIndex]

  return (
    <section
      id="product-hero-slider"
      className="product-hero-slider relative w-full overflow-hidden bg-ff-near-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative min-h-[78vh] md:min-h-[85vh]">
        {/* Full-bleed background photo */}
        <div className="absolute inset-0">
          {slide.imageSrc ? (
            <Image
              key={slide.imageSrc}
              src={slide.imageSrc}
              alt={slide.imageAlt}
              fill
              priority={activeIndex === 0}
              sizes="100vw"
              className="object-cover object-[50%_75%] md:object-[48%_70%] transition-opacity duration-700"
              unoptimized={slide.imageSrc.startsWith('http')}
            />
          ) : (
            <div className="absolute inset-0 bg-[#ECE5DE]" />
          )}
        </div>

        {/* Soft veil — product in center stays visible */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(18,16,15,0.7) 0%, rgba(18,16,15,0.35) 42%, rgba(18,16,15,0.2) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[28%] md:h-[24%]"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(18,16,15,0.25) 45%, rgba(18,16,15,0.78) 100%)',
          }}
        />

        {/* Badge — top right */}
        {slide.badgeLabel && (
          <div className="absolute top-[calc(var(--header-height,5rem)+1rem)] right-[var(--space-container-x)] z-10">
            <div
              className="flex items-center gap-3 rounded-2xl border border-ff-gold/45 bg-ff-near-black/75 py-3 pl-4 pr-4 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-md"
              aria-label={slide.badgeLabel}
            >
              <span className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-ff-gold">
                {slide.badgeLabel}
              </span>
            </div>
          </div>
        )}

        {/* Copy — left */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-16 md:pb-20">
          <div className="container mx-auto container-padding">
            <div className="flex w-full max-w-xl flex-col items-start text-left">
              {slide.unit && (
                <p className="shop-hero-copy mb-2.5 text-caption font-medium text-white/85">
                  {slide.unit}
                </p>
              )}
              <h2 className="shop-hero-copy mb-4 font-display font-bold text-hero text-white tracking-tight leading-[1.08]">
                {slide.title}
              </h2>
              {slide.blurb && (
                <p className="shop-hero-copy mb-8 max-w-md text-body-lg text-white/90 leading-relaxed">
                  {slide.blurb}
                </p>
              )}

              <ShopHeroActions
                product={slide.product}
                price={slide.price}
                href={slide.href}
                soldOut={slide.soldOut}
                ctaLabel={slide.ctaLabel}
                pickup={slide.pickup}
                align="left"
              />
            </div>
          </div>
        </div>

        {/* Dots + arrows + progress — one control cluster, out of the way of the photo/copy */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2 md:bottom-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous product"
                className="flex size-6 items-center justify-center text-white/70 transition-colors hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.product.id}
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to ${s.title}`}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === activeIndex ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60',
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next product"
                className="flex size-6 items-center justify-center text-white/70 transition-colors hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="h-0.5 w-16 overflow-hidden rounded-full bg-white/20 sm:w-20">
              <div
                ref={progressRef}
                className="h-full rounded-full bg-white/70"
                style={{
                  animation: `heroProgress ${AUTO_PLAY_INTERVAL}ms linear`,
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
