'use client'

import { Media } from '@/components/Media'
import { useSplashReveal } from '@/components/SplashScreen/splashSignal'
import type { Media as MediaType, Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import type { SupportedLocale } from '@/utilities/getLocale'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

import { isResolvedMedia } from '../HeroSlider/slide-data'
import { AUTO_PLAY_INTERVAL, useAutoPlay } from '../HeroSlider/useAutoPlay'
import { useSwipe } from '../HeroSlider/useSwipe'

/* ═══════════════════════════════════════════════════════════════
 *  HERO CINEMATIC — full-screen dark photo, white text.
 *  Desktop (1024px+): photo fills the screen, text sits bottom-left over a dark fade.
 *  Mobile:  photo on top at its natural ratio, text below on near-black.
 *  One slide = static. Two or more = crossfade, arrows, swipe, auto-play.
 * ═══════════════════════════════════════════════════════════════ */

const HERO_BG = '#0b0b0b'

interface ResolvedCinematicSlide {
  image: MediaType | null
  eyebrow: string
  title: string
  titleAccent: string
  description: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
}

/** English fallbacks — CMS data always wins. */
const DEFAULT_SLIDES: ResolvedCinematicSlide[] = [
  {
    image: null,
    eyebrow: 'FermentFreude',
    title: 'Fermentation,\nmade by hand.',
    titleAccent: 'Taste the difference.',
    description:
      'Workshops, ferments and know-how from our kitchen in Graz — natural, probiotic and full of flavour.',
    ctaLabel: 'Discover workshops',
    ctaHref: '/workshops',
    secondaryCtaLabel: 'Visit the shop',
    secondaryCtaHref: '/shop',
  },
]

type HeroCinematicProps = Page['hero'] & { locale?: SupportedLocale }

export const HeroCinematic: React.FC<HeroCinematicProps> = (props) => {
  const { setHeaderTheme, setHeroBackgroundColor } = useHeaderTheme()

  const slides: ResolvedCinematicSlide[] = useMemo(() => {
    const cms = props.cinematicSlides
    if (!cms?.length) return DEFAULT_SLIDES
    const fallback = DEFAULT_SLIDES[0]
    return cms.map((s) => ({
      image: isResolvedMedia(s.image) ? s.image : null,
      eyebrow: s.eyebrow ?? '',
      title: s.title ?? fallback.title,
      titleAccent: s.titleAccent ?? '',
      description: s.description ?? '',
      ctaLabel: s.ctaLabel ?? '',
      ctaHref: s.ctaHref ?? '',
      secondaryCtaLabel: s.secondaryCtaLabel ?? '',
      secondaryCtaHref: s.secondaryCtaHref ?? '',
    }))
  }, [props.cinematicSlides])

  const isMulti = slides.length > 1
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

  // The splash screen covers the page on load — hold the text until it lifts,
  // then replay the CSS fade-in so visitors actually see it
  const isRevealed = useSplashReveal()
  const [revealAnim, setRevealAnim] = useState(false)
  useEffect(() => {
    if (!isRevealed) return
    setRevealAnim(true)
    const t = setTimeout(() => setRevealAnim(false), 1200)
    return () => clearTimeout(t)
  }, [isRevealed])
  const animateIn = isEntering || revealAnim

  useEffect(() => {
    setHeaderTheme('dark')
    setHeroBackgroundColor(HERO_BG)
    // Tells the transparent home header to switch logo + icons to white (see Header/index.css)
    document.body.dataset.heroDark = ''
    return () => {
      delete document.body.dataset.heroDark
    }
  }, [setHeaderTheme, setHeroBackgroundColor])

  const slide = slides[activeIndex] ?? slides[0]

  return (
    <section
      className="relative flex w-full min-h-svh flex-col overflow-hidden max-w-[100vw] lg:block lg:h-svh touch-pan-y"
      style={{ backgroundColor: HERO_BG }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Photo layer (all slides stacked, active one fades in) ── */}
      <div className="relative mt-16 aspect-[3/2] w-full shrink-0 lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto">
        {slides.map((s, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none',
              i === activeIndex ? 'opacity-100 lg:scale-[1.04]' : 'opacity-0 lg:scale-100',
            )}
            style={{ transitionDuration: i === activeIndex ? '1000ms, 9000ms' : '1000ms' }}
            aria-hidden={i !== activeIndex}
          >
            {s.image ? (
              <Media
                resource={s.image}
                fill
                imgClassName="object-cover object-[50%_12%]"
                priority={i === 0}
                size="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-ff-charcoal-dark" />
            )}
          </div>
        ))}

        {/* Contrast fades — keep white text readable on any photo */}
        <div
          className="absolute inset-0 bg-linear-to-t from-[#0b0b0b] via-[#0b0b0b]/25 to-transparent lg:from-black/90 lg:via-black/35 lg:to-black/5"
          aria-hidden
        />
        <div
          className="absolute inset-0 hidden bg-linear-to-r from-black/45 via-black/5 to-transparent lg:block"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 top-0 hidden h-40 bg-linear-to-b from-black/50 to-transparent lg:block"
          aria-hidden
        />
      </div>

      {/* ── Text ───────────────────────────────────────────── */}
      <div className="relative z-10 -mt-14 flex flex-1 flex-col justify-center pb-24 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:flex-none lg:pb-28">
        <div className="container mx-auto container-padding">
          <div className={cn('max-w-xl lg:max-w-2xl', !isRevealed && 'opacity-0')}>
            {slide.eyebrow && (
              <p
                className={cn(
                  'mb-4 font-display text-eyebrow font-bold text-white',
                  animateIn && 'hero-anim-eyebrow',
                  isExiting && 'hero-exit-content',
                )}
              >
                {slide.eyebrow}
              </p>
            )}

            <h1
              className={cn(
                'font-display text-hero font-bold leading-[1.05] tracking-[-0.025em] text-white',
                animateIn && 'hero-anim-title',
                isExiting && 'hero-exit-content',
              )}
            >
              <span className="whitespace-pre-line">{slide.title}</span>
              {slide.titleAccent && (
                <span className="mt-1 block whitespace-pre-line">{slide.titleAccent}</span>
              )}
            </h1>

            {slide.description && (
              <p
                className={cn(
                  'mt-5 max-w-md font-sans text-body-lg leading-relaxed text-white/85',
                  animateIn && 'hero-anim-desc',
                  isExiting && 'hero-exit-content',
                )}
              >
                {slide.description}
              </p>
            )}

            {((slide.ctaLabel && slide.ctaHref) ||
              (slide.secondaryCtaLabel && slide.secondaryCtaHref)) && (
              <div
                className={cn(
                  'mt-8 flex flex-wrap items-center gap-3',
                  animateIn && 'hero-anim-cta',
                  isExiting && 'hero-exit-content',
                )}
              >
                {slide.ctaLabel && slide.ctaHref && (
                  <Link
                    href={slide.ctaHref}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-7 py-3 font-display text-sm font-bold text-ff-near-black transition-all duration-300 hover:bg-white/85 hover:scale-[1.03]"
                  >
                    {slide.ctaLabel}
                  </Link>
                )}
                {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                  <Link
                    href={slide.secondaryCtaHref}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/70 px-7 py-3 font-display text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-ff-near-black hover:scale-[1.03]"
                  >
                    {slide.secondaryCtaLabel}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Controls (only with 2+ slides) ─────────────────── */}
      {isMulti && (
        <div className="absolute inset-x-0 bottom-6 z-20 lg:bottom-10">
          <div className="container mx-auto container-padding flex items-center justify-center gap-5 lg:justify-end">
            <span className="font-display text-xs font-bold tracking-[0.2em] text-white/80">
              <span className="text-white">{String(activeIndex + 1).padStart(2, '0')}</span>
              {' / '}
              {String(slides.length).padStart(2, '0')}
            </span>
            <div className="h-px w-16 overflow-hidden bg-white/25 sm:w-24">
              <div
                ref={progressRef}
                className="h-full bg-white"
                style={{
                  animation: `heroProgress ${AUTO_PLAY_INTERVAL}ms linear`,
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/50 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-ff-near-black"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/50 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-ff-near-black"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="sr-only" role="group" aria-label="Slide navigation">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
