'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType, SponsorsBarBlock as SponsorsBarBlockType } from '@/payload-types'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

/* ── Static fallback logos — always available, no seed needed ── */
const STATIC_SPONSORS = [
  {
    name: 'aws Sustainable Food Systems Initiative',
    src: '/assets/images/sponsors/sustainable-food.png',
    scale: 1,
  },
  { name: 'Austria Wirtschafts Service', src: '/assets/images/sponsors/aws.png', scale: 0.85 },
  { name: 'Science Park Graz', src: '/assets/images/sponsors/science-park.png', scale: 1.45 },
  { name: 'Steiermärkische Sparkasse', src: '/assets/images/sponsors/sparkasse.png', scale: 1 },
]

const DEFAULTS = {
  heading: 'This project is supported by:',
}

type Props = SponsorsBarBlockType & { id?: string }
type CmsSponsor = NonNullable<SponsorsBarBlockType['sponsors']>[number]
type StaticSponsor = (typeof STATIC_SPONSORS)[number]
type LogoItem = ({ kind: 'cms' } & CmsSponsor) | ({ kind: 'static' } & StaticSponsor)

export const SponsorsBarBlock: React.FC<Props> = ({
  visible,
  heading,
  sponsors,
  autoScroll,
  logoSize,
  id,
}) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedLogoSize = logoSize ?? 'medium'
  const shouldAutoScroll = autoScroll !== false

  // Use CMS sponsor logos when available, otherwise fall back to static images
  const hasCmsLogos = Array.isArray(sponsors) && sponsors.length > 0
  const logoItems: LogoItem[] = hasCmsLogos
    ? sponsors!.map((sponsor) => ({ kind: 'cms', ...sponsor }))
    : STATIC_SPONSORS.map((sponsor) => ({ kind: 'static', ...sponsor }))
  const hasEnoughItemsToScroll = logoItems.length > 1
  const useMarquee = shouldAutoScroll && hasEnoughItemsToScroll

  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (visible === false) return null

  const logoFrameClassBySize: Record<string, string> = {
    small: 'h-10 md:h-12 lg:h-14',
    medium: 'h-12 md:h-14 lg:h-16',
    large: 'h-14 md:h-16 lg:h-20',
  }
  const logoFrameClass = logoFrameClassBySize[resolvedLogoSize] ?? logoFrameClassBySize.medium

  const renderLogoItem = (item: LogoItem, index: number) => {
    const name = item.name
    const url = item.kind === 'cms' ? item.url : undefined

    const content = (
      <div
        className="group flex shrink-0 items-center justify-center px-4 md:px-5"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transitionDelay: `${120 + (index % logoItems.length) * 80}ms`,
          transitionProperty: 'opacity, transform',
          transitionDuration: '500ms',
          transitionTimingFunction: 'ease-out',
        }}
      >
        <div className={`relative w-28 sm:w-32 md:w-36 lg:w-40 ${logoFrameClass}`}>
          {item.kind === 'cms' && item.logo && typeof item.logo === 'object' ? (
            <Media
              resource={item.logo as MediaType}
              imgClassName="object-contain w-full h-full"
              className="absolute inset-0"
            />
          ) : item.kind === 'static' ? (
            <Image
              src={item.src}
              alt={name || 'Sponsor'}
              fill
              unoptimized
              className="object-contain"
              style={item.scale !== 1 ? { transform: `scale(${item.scale})` } : undefined}
            />
          ) : (
            <div className="h-full w-full rounded-lg bg-black/10" />
          )}
        </div>
      </div>
    )

    if (url) {
      return (
        <a
          key={`${name}-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name || 'Sponsor'}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40 rounded-sm"
        >
          {content}
        </a>
      )
    }

    return (
      <div key={`${name}-${index}`} aria-label={name || 'Sponsor'}>
        {content}
      </div>
    )
  }

  const marqueeItems = useMarquee ? [...logoItems, ...logoItems] : logoItems

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className={`block-sponsors-bar section-padding-md bg-ff-warm-gray border-t border-ff-border-light transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <div className="container mx-auto container-padding">
        <h2 className="text-section-heading font-display font-bold text-ff-near-black text-center mb-6 lg:mb-8">
          {resolvedHeading}
        </h2>

        <div className="w-full max-w-(--content-wide) mx-auto overflow-hidden">
          <div
            className={`flex items-center ${useMarquee ? 'sponsors-marquee-track' : 'justify-center flex-wrap gap-y-4'}`}
          >
            {marqueeItems.map((item, index) => renderLogoItem(item, index))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .sponsors-marquee-track {
          width: max-content;
          animation: sponsors-marquee 28s linear infinite;
        }

        @keyframes sponsors-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 767px) {
          .sponsors-marquee-track {
            animation-duration: 22s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sponsors-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
