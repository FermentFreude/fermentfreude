'use client'

import type { Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  SLIDE DATA — one slide per workshop
 *  Each slide has its own background color, text, image, attributes, and CTA.
 *  Later: driven by CMS heroSlides array field.
 * ═══════════════════════════════════════════════════════════════ */

interface HeroSlide {
  id: string
  eyebrow: string
  title: string
  description: string
  attributes: string[]
  ctaLabel: string
  ctaHref: string
  /** Central panel background */
  panelColor: string
  /** Outer / page background */
  bgColor: string
}

/** Person images — same across all slides */
const LEFT_IMAGE = {
  src: '/media/hero/DavidHeroCopy.png',
  alt: 'David Heider – FermentFreude founder',
  width: 1000,
  height: 1250,
}
const RIGHT_IMAGE = {
  src: '/media/hero/MarcelHero.png',
  alt: 'Marcel Rauminger – FermentFreude founder',
  width: 1000,
  height: 1250,
}

const SLIDES: HeroSlide[] = [
  {
    id: 'lakto',
    eyebrow: 'Workshop Experience',
    title: 'Discover the Art of\nLakto-Fermentation!',
    description:
      'Our hands-on workshop takes you on a journey through traditional lacto-fermentation, turning simple vegetables into probiotic-rich delicacies.',
    attributes: ['All-natural', 'Probiotic-rich', 'Made with Love'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/lakto',
    panelColor: '#555954',
    bgColor: '#D2DFD7',
  },
  {
    id: 'kombucha',
    eyebrow: 'Workshop Experience',
    title: 'Immerse Yourself in\nKombucha Brewing!',
    description:
      'Learn to brew your own kombucha from scratch — from growing the SCOBY to bottling your perfect fizzy, probiotic tea.',
    attributes: ['Live cultures', 'Naturally fizzy', 'Handcrafted'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/kombucha',
    panelColor: '#555954',
    bgColor: '#F6F0E8',
  },
  {
    id: 'tempeh',
    eyebrow: 'Workshop Experience',
    title: 'Master the Craft of\nTempeh Making!',
    description:
      'Explore the Indonesian tradition of tempeh — cultivate your own live cultures and create protein-rich, fermented goodness at home.',
    attributes: ['High protein', 'Traditional', 'Plant-based'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/tempeh',
    panelColor: '#737672',
    bgColor: '#F6F3F0',
  },
  {
    id: 'basics',
    eyebrow: 'Workshop Experience',
    title: 'Begin Your Journey with\nFermentation Basics!',
    description:
      'The perfect starting point — learn fundamental fermentation science, safety, and techniques to confidently ferment anything at home.',
    attributes: ['Beginner-friendly', 'Science-based', 'Practical'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/basics',
    panelColor: '#000000',
    bgColor: '#AEB1AE',
  },
]

const AUTO_PLAY_INTERVAL = 6000

/* ── Arrow Icons ──────────────────────────────────────────────── */

function NavArrow({
  direction,
  onClick,
  panelColor,
}: {
  direction: 'left' | 'right'
  onClick: () => void
  panelColor: string
}) {
  const isLeft = direction === 'left'
  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? 'Previous slide' : 'Next slide'}
      className={cn(
        'hidden md:flex fixed top-1/2 -translate-y-1/2 z-40',
        'items-center justify-center',
        'w-10 h-24',
        'group/arrow cursor-pointer',
        isLeft ? 'left-0' : 'right-0',
      )}
    >
      {/* Filled circle — positioned to hang off the edge, always half-cut */}
      <span
        className={cn(
          'absolute rounded-full transition-all duration-300 ease-out',
          'w-24 h-24 group-hover/arrow:w-44 group-hover/arrow:h-44',
          isLeft ? '-left-12 group-hover/arrow:-left-22' : '-right-12 group-hover/arrow:-right-22',
        )}
        style={{ backgroundColor: panelColor }}
        aria-hidden="true"
      />
      {/* Chevron — always on screen, nudges inward on hover */}
      <svg
        className={cn(
          'relative w-5 h-5 transition-transform duration-300',
          'text-white',
          isLeft ? 'ml-1 group-hover/arrow:translate-x-1' : 'mr-1 group-hover/arrow:-translate-x-1',
        )}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={isLeft ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
      </svg>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  HERO SLIDER — Product Presentation Style
 *  Matches the Slider Revolution "Chocolate Bar" template:
 *  - Full-viewport slide
 *  - Central dark panel with text
 *  - Large product images flanking left & right
 *  - Background color transitions per slide
 *  - Staggered CSS entrance/exit animations
 *  - Auto-play with progress bar
 * ═══════════════════════════════════════════════════════════════ */

type HeroSliderProps = Page['hero']

export const HeroSlider: React.FC<HeroSliderProps> = () => {
  const { setHeaderTheme } = useHeaderTheme()

  const [activeIndex, setActiveIndex] = useState(0)
  const [animState, setAnimState] = useState<'entering' | 'visible' | 'exiting'>('entering')
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const slide = SLIDES[activeIndex]
  // Custom images for kombucha slide
  const isKombucha = slide.id === 'kombucha'
  const isLakto = slide.id === 'lakto'
  const isTempeh = slide.id === 'tempeh'
  const leftImage = isLakto
    ? {
        src: '/media/hero/lakto1.png',
        alt: 'FermentFreude Sauerkraut Jar',
        width: 810,
        height: 768,
      }
    : isKombucha
      ? {
          src: '/media/hero/kombucha1.png',
          alt: 'FermentFreude Kombucha Apple & Carrot',
          width: 1000,
          height: 1250,
        }
      : isTempeh
        ? {
            src: '/media/hero/tempeh1.png',
            alt: 'FermentFreude Tempeh Slices',
            width: 768,
            height: 768,
          }
        : LEFT_IMAGE
  const rightImage = isLakto
    ? {
        src: '/media/hero/lakto2.png',
        alt: 'FermentFreude Sauerkraut Jar',
        width: 810,
        height: 768,
      }
    : isKombucha
      ? {
          src: '/media/hero/kombucha2.png',
          alt: 'FermentFreude Kombucha Coffee Flavour',
          width: 1000,
          height: 1250,
        }
      : isTempeh
        ? {
            src: '/media/hero/tempeh2.png',
            alt: 'FermentFreude Black Bean Tempeh',
            width: 768,
            height: 768,
          }
        : RIGHT_IMAGE

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  /* ── Transition logic ──────────────────────────────────────── */
  const goToSlide = useCallback(
    (nextIndex: number) => {
      if (animState === 'exiting') return
      // Exit current
      setAnimState('exiting')
      setTimeout(() => {
        setActiveIndex(nextIndex)
        setAnimState('entering')
        // After entrance animations complete, mark visible
        setTimeout(() => setAnimState('visible'), 800)
      }, 450) // exit duration
    },
    [animState],
  )

  const goNext = useCallback(() => {
    goToSlide((activeIndex + 1) % SLIDES.length)
  }, [activeIndex, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide((activeIndex - 1 + SLIDES.length) % SLIDES.length)
  }, [activeIndex, goToSlide])

  /* ── Auto-play ─────────────────────────────────────────────── */
  useEffect(() => {
    if (isPaused || animState === 'exiting') return
    timerRef.current = setTimeout(goNext, AUTO_PLAY_INTERVAL)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, isPaused, animState, goNext])

  /* ── Restart progress bar animation on slide change ───────── */
  useEffect(() => {
    if (!progressRef.current) return
    const el = progressRef.current
    // Force restart animation
    el.style.animation = 'none'
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight // trigger reflow
    el.style.animation = ''
  }, [activeIndex])

  /* ── Initial enter ─────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setAnimState('visible'), 900)
    return () => clearTimeout(t)
  }, [])

  const isEntering = animState === 'entering'
  const isExiting = animState === 'exiting'

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <section
      className="relative w-full h-svh overflow-hidden max-w-[100vw]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Mobile split background (below md) ─────────────── */}
      <div className="md:hidden absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="h-[42%] transition-colors duration-700"
          style={{ backgroundColor: slide.bgColor }}
        />
        <div
          className="h-[58%] transition-colors duration-700"
          style={{ backgroundColor: slide.panelColor }}
        />
      </div>

      {/* ── Desktop/tablet solid background (md+) ──────────── */}
      <div
        className="hidden md:block absolute inset-0 transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: slide.bgColor }}
        aria-hidden="true"
      />

      {/* ── Watermark ──────────────────────────────────────── */}
      <div
        className={cn(
          'pointer-events-none absolute left-0 right-0 flex items-center justify-center select-none',
          'font-display font-black uppercase tracking-[-0.04em]',
          'text-[18vw] md:text-[10vw]',
          'top-0 h-[42%] md:top-0 md:h-full',
          'transition-opacity duration-700',
          isExiting ? 'opacity-0' : 'opacity-[0.07]',
        )}
        style={{ color: slide.panelColor }}
        aria-hidden="true"
      >
        FermentFreude
      </div>

      {/* ═══════════════════════════════════════════════════════
       *  MOBILE LAYOUT (below md)
       *  Top 42%: bgColor + watermark + images + side chevrons
       *  Bottom 58%: panelColor + text + dots
       * ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden relative z-10 flex flex-col h-full">
        {/* Mobile chevrons — half-circles at edges, grow on hover */}
        <button
          onClick={goPrev}
          aria-label="Previous slide"
          className="absolute left-0 top-[21%] -translate-y-1/2 z-30 flex items-center justify-center w-10 h-24 group/arrow cursor-pointer"
        >
          <span
            className="absolute rounded-full w-24 h-24 -left-12 group-hover/arrow:w-44 group-hover/arrow:h-44 group-hover/arrow:-left-22 transition-all duration-300 ease-out"
            style={{ backgroundColor: slide.panelColor }}
          />
          <svg
            className="relative w-5 h-5 text-white ml-1 group-hover/arrow:translate-x-1 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
          className="absolute right-0 top-[21%] -translate-y-1/2 z-30 flex items-center justify-center w-10 h-24 group/arrow cursor-pointer"
        >
          <span
            className="absolute rounded-full w-24 h-24 -right-12 group-hover/arrow:w-44 group-hover/arrow:h-44 group-hover/arrow:-right-22 transition-all duration-300 ease-out"
            style={{ backgroundColor: slide.panelColor }}
          />
          <svg
            className="relative w-5 h-5 text-white mr-1 group-hover/arrow:-translate-x-1 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Images — centered in the background area */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 z-20 flex items-end">
          <div
            className={cn(
              'relative',
              isEntering && 'hero-anim-image',
              isExiting && 'hero-exit-image',
            )}
          >
            <Image
              src={leftImage.src}
              alt={leftImage.alt}
              width={leftImage.width}
              height={leftImage.height}
              className="object-contain drop-shadow-xl h-[28vh] w-auto"
              priority={activeIndex === 0}
              sizes="40vw"
            />
          </div>
          <div
            className={cn(
              'relative -ml-2',
              isEntering && 'hero-anim-image',
              isExiting && 'hero-exit-image',
            )}
          >
            <Image
              src={rightImage.src}
              alt={rightImage.alt}
              width={rightImage.width}
              height={rightImage.height}
              className="object-contain drop-shadow-xl h-[28vh] w-auto"
              sizes="40vw"
            />
          </div>
        </div>

        {/* Text content — bottom panel area */}
        <div className="mt-auto h-[58%] flex flex-col items-center text-center justify-center px-6 pb-14 pt-4">
          <p
            className={cn(
              'uppercase tracking-[0.2em] text-white text-[9px] font-display font-medium mb-1.5',
              isEntering && 'hero-anim-eyebrow',
              isExiting && 'hero-exit-content',
            )}
          >
            {slide.eyebrow}
          </p>
          <h1
            className={cn(
              'font-display font-black text-white text-lg sm:text-xl leading-[1.15] tracking-[-0.02em] whitespace-pre-line mb-2',
              isEntering && 'hero-anim-title',
              isExiting && 'hero-exit-content',
            )}
          >
            {slide.title}
          </h1>
          <p
            className={cn(
              'text-white text-[11px] sm:text-xs leading-relaxed max-w-[18rem] mb-3 font-sans',
              isEntering && 'hero-anim-desc',
              isExiting && 'hero-exit-content',
            )}
          >
            {slide.description}
          </p>
          <div
            className={cn(
              'w-full max-w-[18rem]',
              isEntering && 'hero-anim-divider',
              isExiting && 'hero-exit-content',
            )}
          >
            <div className="w-full h-px bg-white/20 mb-1.5" />
            <div
              className={cn(
                'flex items-center justify-center flex-wrap gap-x-3 gap-y-1',
                isEntering && 'hero-anim-attrs',
                isExiting && 'hero-exit-content',
              )}
            >
              {slide.attributes.map((attr, i) => (
                <React.Fragment key={attr}>
                  <span className="text-white text-[9px] font-display font-medium tracking-wide">
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
              'mt-4 flex items-center gap-2',
              isEntering && 'hero-anim-cta',
              isExiting && 'hero-exit-content',
            )}
          >
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center justify-center font-display font-bold text-[10px] px-5 py-1.5 rounded-full bg-white text-[#1d1d1d] hover:bg-white/90 transition-all duration-300"
            >
              {slide.ctaLabel}
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center font-display font-bold text-[10px] px-5 py-1.5 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#1d1d1d] transition-all duration-300"
            >
              Shop
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
       *  DESKTOP / TABLET LAYOUT (md+)
       *  Solid bgColor background, three-column:
       *  chevron | image | card | image | chevron
       * ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:flex relative z-10 h-full items-center justify-center w-full">
        {/* Nav arrows at screen edges */}
        <NavArrow direction="left" onClick={goPrev} panelColor={slide.panelColor} />
        <NavArrow direction="right" onClick={goNext} panelColor={slide.panelColor} />

        {/* Image — Card — Image */}
        <div className="flex items-center justify-center w-full max-w-5xl mx-auto px-14 lg:px-20 xl:px-24 gap-4 lg:gap-6">
          {/* LEFT IMAGE (David) */}
          <div className="flex items-center justify-center">
            <div
              className={cn(
                'relative group/img',
                isEntering && 'hero-anim-image',
                isExiting && 'hero-exit-image',
              )}
            >
              <Image
                src={leftImage.src}
                alt={leftImage.alt}
                width={leftImage.width}
                height={leftImage.height}
                className="object-contain drop-shadow-2xl h-[45vh] w-auto transition-transform duration-700 ease-out group-hover/img:-translate-y-3"
                priority={activeIndex === 0}
                sizes="(min-width: 768px) 20vw, 0px"
              />
            </div>
          </div>

          {/* CENTER CARD */}
          <div className="shrink min-w-0 flex justify-center relative z-20">
            <div
              className="w-full rounded-xl lg:rounded-2xl px-4 lg:px-6 py-5 lg:py-7 flex flex-col items-center text-center transition-colors duration-700"
              style={{ backgroundColor: slide.panelColor }}
            >
              {/* Logo */}
              <div
                className={cn(
                  'mb-1.5',
                  isEntering && 'hero-anim-eyebrow',
                  isExiting && 'hero-exit-content',
                )}
              >
                <Image
                  src="/secondary-logo.svg"
                  alt="FermentFreude"
                  width={240}
                  height={104}
                  className="h-5 lg:h-7 w-auto brightness-0 invert"
                />
              </div>

              {/* Eyebrow */}
              <p
                className={cn(
                  'uppercase tracking-[0.2em] text-white text-[8px] lg:text-[10px] font-display font-medium mb-1',
                  isEntering && 'hero-anim-eyebrow',
                  isExiting && 'hero-exit-content',
                )}
              >
                {slide.eyebrow}
              </p>

              {/* Title */}
              <h1
                className={cn(
                  'font-display font-black text-white text-base lg:text-[1.35rem] xl:text-[1.45rem] leading-[1.15] tracking-[-0.02em] whitespace-pre-line mb-1.5',
                  isEntering && 'hero-anim-title',
                  isExiting && 'hero-exit-content',
                )}
              >
                {slide.title}
              </h1>

              {/* Description */}
              <p
                className={cn(
                  'text-white text-[10px] lg:text-xs leading-relaxed max-w-[16rem] mb-2 font-sans',
                  isEntering && 'hero-anim-desc',
                  isExiting && 'hero-exit-content',
                )}
              >
                {slide.description}
              </p>

              {/* Divider + attributes */}
              <div
                className={cn(
                  'w-full max-w-[16rem]',
                  isEntering && 'hero-anim-divider',
                  isExiting && 'hero-exit-content',
                )}
              >
                <div className="w-full h-px bg-white/20 mb-1.5" />
                <div
                  className={cn(
                    'flex items-center justify-center flex-wrap gap-x-3 gap-y-1',
                    isEntering && 'hero-anim-attrs',
                    isExiting && 'hero-exit-content',
                  )}
                >
                  {slide.attributes.map((attr, i) => (
                    <React.Fragment key={attr}>
                      <span className="text-white text-[8px] lg:text-[10px] font-display font-medium tracking-wide">
                        {attr}
                      </span>
                      {i < slide.attributes.length - 1 && (
                        <span className="w-px h-3 bg-white/30" aria-hidden="true" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div
                className={cn(
                  'mt-3 lg:mt-4 flex items-center gap-1.5 lg:gap-2',
                  isEntering && 'hero-anim-cta',
                  isExiting && 'hero-exit-content',
                )}
              >
                <Link
                  href={slide.ctaHref}
                  className="inline-flex items-center justify-center font-display font-bold text-[10px] lg:text-xs px-5 lg:px-6 py-1.5 lg:py-2 rounded-full bg-white text-[#1d1d1d] hover:bg-white/90 hover:scale-[1.03] transition-all duration-300"
                >
                  {slide.ctaLabel}
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center font-display font-bold text-[10px] lg:text-xs px-5 lg:px-6 py-1.5 lg:py-2 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#1d1d1d] hover:scale-[1.03] transition-all duration-300"
                >
                  Shop
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE (Marcel) */}
          <div className="flex items-center justify-center">
            <div
              className={cn(
                'relative group/img',
                isEntering && 'hero-anim-image',
                isExiting && 'hero-exit-image',
              )}
            >
              <Image
                src={rightImage.src}
                alt={rightImage.alt}
                width={rightImage.width}
                height={rightImage.height}
                className="object-contain drop-shadow-2xl h-[45vh] w-auto transition-transform duration-700 ease-out group-hover/img:-translate-y-3"
                sizes="(min-width: 768px) 20vw, 0px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation (shared) ─────────────────────────── */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
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
