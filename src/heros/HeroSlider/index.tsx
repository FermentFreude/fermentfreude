'use client'

import type { Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useEffect, useMemo } from 'react'

import { NavArrow } from './NavArrow'
import { SlideImage } from './SlideImage'
import type { ResolvedSlide } from './slide-data'
import { DEFAULT_SLIDES, isResolvedMedia } from './slide-data'
import { AUTO_PLAY_INTERVAL, useAutoPlay } from './useAutoPlay'
import { useSwipe } from './useSwipe'

/* ═══════════════════════════════════════════════════════════════
 *  HERO SLIDER — Product Presentation Style
 *  Full-viewport slides with a fixed full-height center panel,
 *  flanking product images, smooth CSS animations, auto-play.
 *  Inspired by Slider Revolution "Chocolate Bar" template.
 * ═══════════════════════════════════════════════════════════════ */

type HeroSliderProps = Page['hero']

export const HeroSlider: React.FC<HeroSliderProps> = (props) => {
  const { setHeaderTheme, setHeroBackgroundColor } = useHeaderTheme()

  /* ── Merge CMS heroSlides with defaults ───────────────────── */
  const slides: ResolvedSlide[] = useMemo(() => {
    const cmsSlides = (props as Record<string, unknown>).heroSlides as
      | NonNullable<Page['hero']['heroSlides']>
      | undefined
    if (!cmsSlides?.length) return DEFAULT_SLIDES

    return cmsSlides.map((cs) => {
      const fallback = DEFAULT_SLIDES.find((d) => d.slideId === cs.slideId)
      return {
        slideId: cs.slideId ?? fallback?.slideId ?? 'unknown',
        eyebrow: cs.eyebrow ?? fallback?.eyebrow ?? '',
        title: cs.title ?? fallback?.title ?? '',
        description: cs.description ?? fallback?.description ?? '',
        attributes: cs.attributes?.length
          ? cs.attributes.map((a) => a.text)
          : (fallback?.attributes ?? []),
        ctaLabel: cs.ctaLabel ?? fallback?.ctaLabel ?? 'Learn More',
        ctaHref: cs.ctaHref ?? fallback?.ctaHref ?? '#',
        panelColor: cs.panelColor ?? fallback?.panelColor ?? '#555954',
        bgColor: cs.bgColor ?? fallback?.bgColor ?? '#D2DFD7',
        leftImage: isResolvedMedia(cs.leftImage) ? cs.leftImage : (fallback?.leftImage ?? null),
        rightImage: isResolvedMedia(cs.rightImage) ? cs.rightImage : (fallback?.rightImage ?? null),
        leftImageScale: fallback?.leftImageScale,
        rightImageScale: fallback?.rightImageScale,
      }
    })
  }, [props])

  const {
    activeIndex,
    isEntering,
    isExiting,
    isPaused,
    setIsPaused,
    progressRef,
    goToSlide,
    goNext,
    goPrev,
  } = useAutoPlay(slides.length)

  const { handleTouchStart, handleTouchEnd } = useSwipe({ goNext, goPrev })

  const slide = slides[activeIndex]
  const isFoundersOrLakto = slide.slideId === 'basics' || slide.slideId === 'lakto'

  // Chevron bubble colors that contrast with each slide's background
  const mobileChevronColors: Record<string, string> = {
    basics: '#555954',
    lakto: '#1a1a1a',
    kombucha: '#D2DFD7',
    tempeh: '#AEB1AE',
  }
  const chevronColor = mobileChevronColors[slide.slideId] ?? slide.panelColor
  const chevronArrowColor =
    slide.slideId === 'kombucha' || slide.slideId === 'tempeh' ? '#1a1a1a' : '#ffffff'

  useEffect(() => {
    setHeaderTheme('dark')
    setHeroBackgroundColor(slide.bgColor)
  }, [setHeaderTheme, setHeroBackgroundColor, slide.bgColor])

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <section
      className="relative w-full h-svh overflow-hidden max-w-[100vw] touch-pan-y transition-colors duration-700"
      style={{
        backgroundColor: slide.bgColor,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ═══════════════════════════════════════════════════════
       *  MOBILE LAYOUT (below sm)
       * ═══════════════════════════════════════════════════════ */}

      {/* ── Mobile split background ────────────────────────── */}
      <div className="sm:hidden absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="h-[40%] transition-colors duration-700"
          style={{ backgroundColor: slide.bgColor }}
        />
        <div
          className="h-[60%] transition-colors duration-700"
          style={{ backgroundColor: slide.panelColor }}
        />
      </div>

      <div className="sm:hidden relative z-10 flex flex-col h-full pt-16">
        {/* Mobile chevrons */}
        <button
          onClick={goPrev}
          aria-label="Previous slide"
          className="absolute left-0 top-[40%] -translate-y-1/2 z-30 flex items-center justify-center w-8 h-20 group/arrow cursor-pointer"
        >
          <span
            className="absolute rounded-full w-20 h-20 -left-10 group-hover/arrow:w-36 group-hover/arrow:h-36 group-hover/arrow:-left-18 transition-all duration-300 ease-out"
            style={{ backgroundColor: chevronColor }}
          />
          <svg
            className="relative w-4 h-4 ml-1 group-hover/arrow:translate-x-1 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke={chevronArrowColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={goNext}
          aria-label="Next slide"
          className="absolute right-0 top-[40%] -translate-y-1/2 z-30 flex items-center justify-center w-8 h-20 group/arrow cursor-pointer"
        >
          <span
            className="absolute rounded-full w-20 h-20 -right-10 group-hover/arrow:w-36 group-hover/arrow:h-36 group-hover/arrow:-right-18 transition-all duration-300 ease-out"
            style={{ backgroundColor: chevronColor }}
          />
          <svg
            className="relative w-4 h-4 mr-1 group-hover/arrow:-translate-x-1 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke={chevronArrowColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Images — centered, smaller on mobile */}
        <div className="relative z-20 flex items-end justify-center h-[40%] pb-2">
          <div
            className={cn(
              'relative -rotate-6',
              isEntering && 'hero-anim-image',
              isExiting && 'hero-exit-image',
            )}
          >
            <SlideImage
              media={slide.leftImage}
              className={cn(
                'object-contain drop-shadow-xl w-auto',
                slide.slideId === 'kombucha'
                  ? 'h-[38vh]'
                  : slide.slideId === 'tempeh'
                    ? 'h-[36vh]'
                    : 'h-[32vh]',
              )}
              priority={activeIndex === 0}
              size="40vw"
            />
          </div>
          <div
            className={cn(
              'relative rotate-6',
              slide.slideId === 'tempeh' ? '-ml-8' : '-ml-4',
              isEntering && 'hero-anim-image',
              isExiting && 'hero-exit-image',
            )}
          >
            <SlideImage
              media={slide.rightImage}
              className={cn(
                'object-contain drop-shadow-xl w-auto',
                slide.slideId === 'kombucha'
                  ? 'h-[38vh]'
                  : slide.slideId === 'tempeh'
                    ? 'h-[36vh]'
                    : 'h-[32vh]',
              )}
              size="40vw"
            />
          </div>
        </div>

        {/* Text content — bottom panel area, centered */}
        <div className="flex-1 flex flex-col items-center text-center justify-center px-6 pb-14">
          <p
            className={cn(
              'uppercase tracking-[0.2em] text-white text-[9px] font-display font-bold mb-1',
              isEntering && 'hero-anim-eyebrow',
              isExiting && 'hero-exit-content',
            )}
          >
            {slide.eyebrow}
          </p>
          <h1
            className={cn(
              'font-display font-black text-white text-lg leading-[1.15] tracking-[-0.02em] whitespace-pre-line mb-2',
              isEntering && 'hero-anim-title',
              isExiting && 'hero-exit-content',
            )}
          >
            {slide.title}
          </h1>
          <p
            className={cn(
              'text-white text-xs leading-relaxed max-w-[20rem] mb-3 font-sans font-medium',
              isEntering && 'hero-anim-desc',
              isExiting && 'hero-exit-content',
            )}
          >
            {slide.description}
          </p>
          <div
            className={cn(
              'w-full max-w-[20rem]',
              isEntering && 'hero-anim-divider',
              isExiting && 'hero-exit-content',
            )}
          >
            <div className="w-full h-px bg-white/20 mb-2" />
            <div
              className={cn(
                'flex items-center justify-center flex-wrap gap-x-3 gap-y-1',
                isEntering && 'hero-anim-attrs',
                isExiting && 'hero-exit-content',
              )}
            >
              {slide.attributes.map((attr, i) => (
                <React.Fragment key={attr}>
                  <span className="text-white text-[10px] font-display font-semibold tracking-wide">
                    {attr}
                  </span>
                  {i < slide.attributes.length - 1 && (
                    <span className="w-px h-3 bg-white/30" aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className={cn(
              'mt-4 flex items-center justify-center gap-3',
              isEntering && 'hero-anim-cta',
              isExiting && 'hero-exit-content',
            )}
          >
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center justify-center whitespace-nowrap font-display font-bold text-xs px-5 py-2 rounded-full bg-white text-[#1d1d1d] hover:bg-white/90 transition-all duration-300"
            >
              {slide.ctaLabel}
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center whitespace-nowrap font-display font-bold text-xs px-5 py-2 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#1d1d1d] transition-all duration-300"
            >
              Shop
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
       *  DESKTOP / TABLET LAYOUT (sm+)
       *  Three-column: Left image | Full-height panel | Right image
       *  Panel is FIXED on screen, content animates within it.
       *  Center panel width matches navbar container for alignment.
       * ═══════════════════════════════════════════════════════ */}
      <div className="hidden sm:flex relative z-10 h-full w-full">
        {/* Nav arrows at screen edges */}
        <NavArrow direction="left" onClick={goPrev} panelColor={slide.panelColor} />
        <NavArrow direction="right" onClick={goNext} panelColor={slide.panelColor} />

        {/* ── LEFT IMAGE AREA ──────────────────────────────── */}
        <div
          className="flex-1 flex items-center justify-center relative transition-colors duration-700 overflow-visible"
          style={{ backgroundColor: slide.bgColor }}
        >
          <div
            className={cn(
              'relative z-10 sm:z-30 lg:z-30 -rotate-3 group/img sm:translate-x-[14%] lg:translate-x-[8%]',
              isEntering && 'hero-anim-image',
              isExiting && 'hero-exit-image',
            )}
            style={
              slide.leftImageScale
                ? { transform: `rotate(-3deg) scale(${slide.leftImageScale})` }
                : undefined
            }
          >
            <SlideImage
              media={slide.leftImage}
              className={cn(
                'object-contain drop-shadow-2xl h-[42vh] md:h-[52vh] w-auto transition-transform duration-700 ease-out group-hover/img:-translate-y-2',
                isFoundersOrLakto ? 'lg:h-[70vh] xl:h-[78vh]' : 'lg:h-[74vh] xl:h-[82vh]',
              )}
              priority={activeIndex === 0}
              size="(min-width: 1280px) 35vw, (min-width: 1024px) 30vw, (min-width: 768px) 28vw, 45vw"
            />
          </div>
        </div>

        {/* ── CENTER PANEL (full-height, fixed structure) ───── */}
        <div
          className="w-[38%] md:w-[40%] lg:w-[42%] xl:w-[44%] h-full flex flex-col items-center transition-colors duration-700 relative z-40"
          style={{ backgroundColor: slide.panelColor }}
        >
          {/* Content — vertically centered, padded for header + bottom nav */}
          <div className="relative z-40 flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-10 xl:px-12 pt-20 pb-16">
            {/* Eyebrow */}
            <p
              className={cn(
                'uppercase tracking-[0.2em] text-white text-[9px] sm:text-[10px] lg:text-xs font-display font-bold mb-2 lg:mb-3',
                isEntering && 'hero-anim-eyebrow',
                isExiting && 'hero-exit-content',
              )}
            >
              {slide.eyebrow}
            </p>

            {/* Title */}
            <h1
              className={cn(
                'font-display font-black text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[2.25rem] leading-[1.1] tracking-[-0.02em] whitespace-pre-line mb-3 lg:mb-5',
                isEntering && 'hero-anim-title',
                isExiting && 'hero-exit-content',
              )}
            >
              {slide.title}
            </h1>

            {/* Description */}
            <p
              className={cn(
                'text-white text-[11px] sm:text-xs lg:text-sm leading-relaxed max-w-[20rem] lg:max-w-88 mb-4 lg:mb-6 font-sans font-medium',
                isEntering && 'hero-anim-desc',
                isExiting && 'hero-exit-content',
              )}
            >
              {slide.description}
            </p>

            {/* Divider + attributes */}
            <div
              className={cn(
                'w-full max-w-[20rem] lg:max-w-88',
                isEntering && 'hero-anim-divider',
                isExiting && 'hero-exit-content',
              )}
            >
              <div className="w-full h-px bg-white/20 mb-3 lg:mb-4" />
              <div
                className={cn(
                  'flex items-center justify-between px-2',
                  isEntering && 'hero-anim-attrs',
                  isExiting && 'hero-exit-content',
                )}
              >
                {slide.attributes.map((attr, i) => (
                  <React.Fragment key={attr}>
                    <span className="text-white text-[9px] sm:text-[10px] lg:text-xs font-display font-semibold tracking-wide">
                      {attr}
                    </span>
                    {i < slide.attributes.length - 1 && (
                      <span className="w-px h-4 bg-white/25 mx-2 sm:mx-3" aria-hidden="true" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div
              className={cn(
                'mt-6 lg:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full max-w-[20rem] lg:max-w-88',
                isEntering && 'hero-anim-cta',
                isExiting && 'hero-exit-content',
              )}
            >
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center justify-center whitespace-nowrap w-full sm:w-auto font-display font-bold text-xs lg:text-sm px-6 lg:px-8 py-2.5 lg:py-3 rounded-full bg-white text-[#1d1d1d] hover:bg-white/90 hover:scale-[1.03] transition-all duration-300"
              >
                {slide.ctaLabel}
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center whitespace-nowrap w-full sm:w-auto font-display font-bold text-xs lg:text-sm px-6 lg:px-8 py-2.5 lg:py-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#1d1d1d] hover:scale-[1.03] transition-all duration-300"
              >
                Shop
              </Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT IMAGE AREA ──────────────────────────────── */}
        <div
          className="flex-1 flex items-center justify-center relative transition-colors duration-700 overflow-visible"
          style={{ backgroundColor: slide.bgColor }}
        >
          <div
            className={cn(
              'relative z-10 sm:z-30 lg:z-30 rotate-3 group/img sm:-translate-x-[14%] lg:-translate-x-[8%]',
              isEntering && 'hero-anim-image',
              isExiting && 'hero-exit-image',
            )}
            style={
              slide.rightImageScale
                ? { transform: `rotate(3deg) scale(${slide.rightImageScale})` }
                : undefined
            }
          >
            <SlideImage
              media={slide.rightImage}
              className={cn(
                'object-contain drop-shadow-2xl h-[42vh] md:h-[52vh] w-auto transition-transform duration-700 ease-out group-hover/img:-translate-y-2',
                isFoundersOrLakto ? 'lg:h-[70vh] xl:h-[78vh]' : 'lg:h-[74vh] xl:h-[82vh]',
              )}
              size="(min-width: 1280px) 35vw, (min-width: 1024px) 30vw, (min-width: 768px) 28vw, 45vw"
            />
          </div>
        </div>
      </div>

      {/* ── Bottom navigation (shared) ─────────────────────────── */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-2.5 h-2.5 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60',
              )}
            />
          ))}
        </div>
        <div className="w-16 sm:w-20 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-white/70 rounded-full"
            style={{
              animation: `heroProgress ${AUTO_PLAY_INTERVAL}ms linear`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      </div>
    </section>
  )
}
