'use client'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  HERO GRID — Modern editorial layout
 *  Bento-style cards, mesh gradient, clean typography.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_SLIDES = [
  {
    title: 'Learn with us',
    description:
      'We create fermented foods and share the knowledge behind them. Through workshops, products, and education.',
    buttonLabel: 'Discover More',
    buttonUrl: '/about',
    image: null as string | null,
  },
]

function getImageUrl(image: unknown): string {
  if (!image) return ''
  if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('/'))) return image
  if (typeof image === 'object' && image !== null && 'url' in image) {
    const url = (image as { url?: string }).url
    if (!url) return ''
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${url}`
  }
  return ''
}

type HeroGridProps = Page['hero'] & { type: 'heroGrid' }

export const HeroGrid: React.FC<HeroGridProps> = ({ slides }) => {
  const { setHeaderTheme } = useHeaderTheme()

  const resolvedSlides =
    slides && slides.length > 0
      ? slides.map((s) => ({
          image: s.image,
          title: (s as { title?: string }).title ?? '',
          description: (s as { description?: string }).description ?? '',
          buttonLabel: (s as { buttonLabel?: string }).buttonLabel ?? '',
          buttonUrl: (s as { buttonUrl?: string }).buttonUrl ?? '',
        }))
      : DEFAULT_SLIDES

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const [first, ...rest] = resolvedSlides

  return (
    <section className="relative w-full min-h-svh overflow-hidden mb-[var(--space-section-md)]">
      {/* Mesh gradient background */}
      <div
        className="absolute inset-0 bg-[#0d0d0d]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(229,183,101,0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(229,183,101,0.06) 0%, transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 container mx-auto container-padding pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24">
        {/* Bento grid — large featured card left, 2 smaller stacked right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {first && (
            <HeroCard
              slide={first}
              index={0}
              className="min-h-[18rem] sm:min-h-[24rem] lg:min-h-[32rem]"
            />
          )}
          <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-rows-2">
            {rest.map((slide, i) => (
              <HeroCard key={i} slide={slide} index={i + 1} className="min-h-[14rem] sm:min-h-0 sm:row-span-1" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroCard({
  slide,
  index,
  className,
}: {
  slide: {
    image: unknown
    title: string
    description: string
    buttonLabel: string
    buttonUrl: string
  }
  index: number
  className?: string
}) {
  const imageUrl = getImageUrl(slide.image)
  const hasMediaResource =
    slide.image &&
    (typeof slide.image === 'object' ||
      (typeof slide.image === 'string' &&
        (slide.image.startsWith('http') || slide.image.startsWith('/'))))

  return (
    <Link
      href={slide.buttonUrl || '#'}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl h-full min-h-[14rem]',
        'transition-all duration-500 ease-out',
        'hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ff-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]',
        className,
      )}
    >
      {/* Image */}
      <div className="absolute inset-0">
        {hasMediaResource ? (
          <Media
            resource={
              (typeof slide.image === 'string'
                ? { url: slide.image, alt: '' }
                : slide.image) as Parameters<typeof Media>[0]['resource']
            }
            fill
            imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={index === 0}
          />
        ) : imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-ff-charcoal" />
        )}
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-end p-6 sm:p-8">
        <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
          {slide.title}
        </h2>
        {slide.description && (
          <p className="mt-2 font-sans text-body-sm text-white/80 line-clamp-2 max-w-md">
            {slide.description}
          </p>
        )}
        {slide.buttonLabel && (
          <span className="mt-4 inline-flex items-center gap-2 font-display text-sm font-semibold text-ff-gold-accent opacity-90 group-hover:opacity-100 group-hover:gap-3 transition-all">
            {slide.buttonLabel}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        )}
      </div>
    </Link>
  )
}
