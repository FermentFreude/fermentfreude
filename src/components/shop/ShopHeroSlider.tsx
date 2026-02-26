'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useEffect, useMemo } from 'react'

import { useAutoPlay } from '@/heros/HeroSlider/useAutoPlay'
import { useSwipe } from '@/heros/HeroSlider/useSwipe'

const AUTO_PLAY_INTERVAL = 6000

type Slide = {
  id?: string | null
  image: { url: string; alt?: string } | null
  backgroundVideo?: { url: string; mimeType?: string } | null
  productImage?: { url: string; alt?: string } | null
  title: string
  description?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
}

/** CMS returns image/productImage as string ID or populated object */
type SlideInput = {
  id?: string | null
  image?: { url: string; alt?: string } | string | null
  productImage?: { url: string; alt?: string } | string | null
  title?: string | null
  description?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  backgroundVideo?: { url: string; mimeType?: string } | null
}

function hasValidImage(img: unknown): img is { url: string; alt?: string } {
  return (
    typeof img === 'object' &&
    img !== null &&
    'url' in img &&
    typeof (img as { url: string }).url === 'string' &&
    (img as { url: string }).url.length > 0
  )
}

type Props = {
  slides: SlideInput[]
}

export const ShopHeroSlider: React.FC<Props> = ({ slides }) => {
  const { setHeaderTheme } = useHeaderTheme()

  const resolvedSlides = useMemo<Slide[]>(() => {
    return slides
      .filter((s) => s?.title)
      .map((s) => ({
        id: (s as { id?: string }).id ?? String(Math.random()),
        image: hasValidImage(s?.image) ? s.image : null,
        backgroundVideo: s?.backgroundVideo && typeof (s.backgroundVideo as { url?: string }).url === 'string' ? (s.backgroundVideo as { url: string; mimeType?: string }) : null,
        productImage: hasValidImage(s?.productImage) ? s.productImage : null,
        title: s.title ?? '',
        description: s.description ?? null,
        ctaLabel: s.ctaLabel ?? 'Explore Now',
        ctaUrl: s.ctaUrl ?? '#products',
      }))
  }, [slides])

  const {
    activeIndex,
    isEntering,
    isExiting,
    isPaused,
    setIsPaused,
    goToSlide,
    goNext,
    goPrev,
  } = useAutoPlay(resolvedSlides.length)

  const { handleTouchStart, handleTouchEnd } = useSwipe({ goNext, goPrev })

  const useHomemadeJamLayout = true

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  if (resolvedSlides.length === 0) return null

  const slide = resolvedSlides[activeIndex]

  if (useHomemadeJamLayout) {
    return (
      <HomemadeJamSlider
        slides={resolvedSlides}
        activeIndex={activeIndex}
        slide={slide}
        isEntering={isEntering}
        isExiting={isExiting}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        goNext={goNext}
        goPrev={goPrev}
        goToSlide={goToSlide}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    )
  }

  return (
    <ClassicHeroSlider
      slides={resolvedSlides}
      activeIndex={activeIndex}
      slide={slide}
      isEntering={isEntering}
      isExiting={isExiting}
      isPaused={isPaused}
      setIsPaused={setIsPaused}
      goNext={goNext}
      goPrev={goPrev}
      goToSlide={goToSlide}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  )
}

function isVideoResource(r: { mimeType?: string } | null): boolean {
  return !!r?.mimeType?.toLowerCase().includes('video')
}

/* Homemade Jam style — clone of Slider Revolution Gourmet Food Product Slider
 * Warm parchment background, left content panel, center product jar, right prev/next nav */
function HomemadeJamSlider({
  slides,
  activeIndex,
  slide,
  isEntering,
  isExiting,
  isPaused,
  setIsPaused,
  goNext,
  goPrev,
  goToSlide,
  onTouchStart,
  onTouchEnd,
}: {
  slides: Slide[]
  activeIndex: number
  slide: Slide
  isEntering: boolean
  isExiting: boolean
  isPaused: boolean
  setIsPaused: (p: boolean) => void
  goNext: () => void
  goPrev: () => void
  goToSlide: (i: number) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}) {
  return (
    <section
      className="relative min-h-[90vh] overflow-hidden bg-ff-warm-gray"
      data-theme="light"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background: looping video or warm parchment texture image */}
      {slides.map((s, i) => {
        const isActive = i === activeIndex
        const showVideo = isActive && s.backgroundVideo && isVideoResource(s.backgroundVideo)
        return (
          <div
            key={s.id ?? i}
            className={cn(
              'absolute inset-0 z-0 transition-opacity duration-1000',
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            {showVideo ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                poster={s.image?.url}
              >
                <source src={(s.backgroundVideo as { url: string }).url} type="video/mp4" />
              </video>
            ) : s.image ? (
              <>
                <Media
                  fill
                  imgClassName="object-cover"
                  priority={i === 0}
                  resource={s.image as MediaType}
                />
                {/* Warm parchment tint over image */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(249,240,220,0.7) 0%, rgba(236,229,222,0.6) 100%)',
                  }}
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, var(--ff-ivory-mist) 0%, var(--ff-warm-gray) 50%, var(--ff-warm-gray) 100%)',
                }}
              />
            )}
          </div>
        )
      })}

      <div className="relative z-10 flex min-h-[90vh]">
        {/* Left content panel — warm parchment card (template: cream rounded panel) */}
        <div className="absolute left-4 sm:left-6 md:left-10 lg:left-16 xl:left-24 top-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[420px] sm:max-w-[480px] lg:max-w-[520px] rounded-2xl bg-ff-cream shadow-[0_8px_32px_rgba(75,75,75,0.12)] border border-ff-border-light p-6 sm:p-8 lg:p-10">
          <div className="max-w-md">
            <span
              className={cn(
                'font-display text-[2rem] sm:text-[2.5rem] text-ff-charcoal mb-1 block transition-all duration-500',
                isEntering && 'animate-fade-in-up',
                isExiting && 'opacity-0 translate-y-2',
              )}
              style={{ fontStyle: 'italic', letterSpacing: '-0.02em' }}
            >
              {String(activeIndex + 1).padStart(2, '0')}
            </span>

            <h1
              className={cn(
                'font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-ff-charcoal uppercase tracking-tight mb-3 sm:mb-5 leading-[0.95] transition-all duration-500',
                isEntering && 'animate-fade-in-up animate-delay-200',
                isExiting && 'opacity-0 translate-y-4',
              )}
            >
              {slide.title}
            </h1>

            {slide.description && (
              <p
                className={cn(
                  'text-base sm:text-lg text-ff-charcoal mb-6 sm:mb-8 max-w-md leading-[1.45] transition-all duration-500',
                  isEntering && 'animate-fade-in-up animate-delay-200',
                  isExiting && 'opacity-0 translate-y-4',
                )}
              >
                {slide.description}
              </p>
            )}

            {slide.ctaUrl && (
              <Link
                href={slide.ctaUrl}
                className={cn(
                  'inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover px-8 py-2.5 font-display font-bold text-base text-ff-ivory transition-all hover:scale-[1.03] active:scale-[0.97]',
                  isEntering && 'animate-fade-in-up animate-delay-400',
                  isExiting && 'opacity-0 translate-y-4',
                )}
              >
                {slide.ctaLabel ?? 'Spread the Love'}
              </Link>
            )}
          </div>
        </div>

        {/* Center — product jar (template: jewel-toned jar with soft shadow) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[420px] aspect-[3/4]">
          {slide.productImage ? (
            <div
              className={cn(
                'relative w-full h-full transition-all duration-700',
                isEntering && 'animate-slide-in-from-left',
                isExiting && 'opacity-0 translate-x-4',
              )}
            >
              <Media
                fill
                imgClassName="object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.15)]"
                priority={activeIndex === 0}
                resource={slide.productImage as MediaType}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-3/4 h-3/4 rounded-2xl bg-ff-warm-gray/50 flex items-center justify-center">
                <span className="text-ff-charcoal/50 text-sm">Product</span>
              </div>
            </div>
          )}
        </div>

        {/* Right — prev / next nav (template: bottom-right, cream text) */}
        {slides.length > 1 && (
          <div className="absolute right-4 sm:right-6 md:right-10 lg:right-16 xl:right-24 bottom-8 md:bottom-12 z-20 flex flex-col items-end gap-4">
            <div className="flex items-center gap-2 text-ff-charcoal">
              <button
                onClick={goPrev}
                aria-label="Previous slide"
                className="font-display font-medium text-sm sm:text-base uppercase hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ff-charcoal/30 rounded"
              >
                prev
              </button>
              <span className="text-ff-charcoal font-medium">/</span>
              <button
                onClick={goNext}
                aria-label="Next slide"
                className="font-display font-medium text-sm sm:text-base uppercase hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ff-charcoal/30 rounded"
              >
                next
              </button>
            </div>
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === activeIndex
                      ? 'w-2.5 h-2.5 bg-ff-charcoal'
                      : 'w-2 h-2 bg-ff-charcoal/40 hover:bg-ff-charcoal/60',
                  )}
                />
              ))}
            </div>
            <div className="w-20 h-0.5 bg-ff-charcoal/20 rounded-full overflow-hidden">
              <div
                key={activeIndex}
                className="h-full bg-ff-charcoal/80 rounded-full origin-left"
                style={{
                  animation: `shopHeroProgress ${AUTO_PLAY_INTERVAL}ms linear forwards`,
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

/* Classic full-bleed dark hero */
function ClassicHeroSlider({
  slides,
  activeIndex,
  slide,
  isEntering,
  isExiting,
  isPaused,
  setIsPaused,
  goNext,
  goPrev,
  goToSlide,
  onTouchStart,
  onTouchEnd,
}: {
  slides: Slide[]
  activeIndex: number
  slide: Slide
  isEntering: boolean
  isExiting: boolean
  isPaused: boolean
  setIsPaused: (p: boolean) => void
  goNext: () => void
  goPrev: () => void
  goToSlide: (i: number) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}) {
  return (
    <section
      className="relative min-h-[55vh] md:min-h-[65vh] overflow-hidden"
      data-theme="dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => (
        <div
          key={s.id ?? i}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === activeIndex ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none',
          )}
        >
          {s.image ? (
            <Media
              fill
              imgClassName="object-cover"
              priority={i === 0}
              resource={s.image as MediaType}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, #4b4b4b 0%, #555954 50%, #403c39 100%)',
              }}
            />
          )}
          <div className="absolute inset-0 bg-ff-charcoal/50 z-[1]" />
        </div>
      ))}

      <div className="relative z-10 flex flex-col justify-end min-h-[55vh] md:min-h-[65vh] pb-16 md:pb-20 pt-24">
        <div className="container mx-auto container-padding">
          <div className="content-narrow max-w-2xl">
            <h1
              className={cn(
                'text-hero font-display font-bold text-white mb-4 transition-all duration-500',
                isEntering && 'animate-fade-in-up',
                isExiting && 'opacity-0 translate-y-4',
              )}
            >
              {slide.title}
            </h1>
            {slide.description && (
              <p
                className={cn(
                  'text-body-lg text-white/90 mb-6 max-w-xl transition-all duration-500',
                  isEntering && 'animate-fade-in-up animate-delay-200',
                  isExiting && 'opacity-0 translate-y-4',
                )}
              >
                {slide.description}
              </p>
            )}
            {slide.ctaUrl && (
              <Link
                href={slide.ctaUrl}
                className={cn(
                  'inline-flex items-center justify-center rounded-full bg-ff-gold hover:bg-ff-gold-accent px-6 py-2.5 font-display font-bold text-base text-ff-charcoal transition-all hover:scale-[1.03] active:scale-[0.97]',
                  isEntering && 'animate-fade-in-up animate-delay-400',
                  isExiting && 'opacity-0 translate-y-4',
                )}
              >
                {slide.ctaLabel ?? 'Explore Now'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === activeIndex ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60',
                )}
              />
            ))}
          </div>
          <div className="w-20 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              key={activeIndex}
              className="h-full bg-white/80 rounded-full origin-left"
              style={{
                animation: `shopHeroProgress ${AUTO_PLAY_INTERVAL}ms linear forwards`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
