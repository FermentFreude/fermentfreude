'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType, SponsorsBarBlock as SponsorsBarBlockType } from '@/payload-types'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

/* ── Static fallback logos — always available, no seed needed ── */
const STATIC_SPONSORS = [
  { name: 'aws Sustainable Food Systems Initiative', src: '/assets/images/sponsors/sustainable-food.png', scale: 1 },
  { name: 'Austria Wirtschafts Service', src: '/assets/images/sponsors/aws.png', scale: 0.85 },
  { name: 'Science Park Graz', src: '/assets/images/sponsors/science-park.png', scale: 1.45 },
  { name: 'Steiermärkische Sparkasse', src: '/assets/images/sponsors/sparkasse.png', scale: 1 },
]

const DEFAULTS = {
  heading: 'This project is supported by:',
}

type Props = SponsorsBarBlockType & { id?: string }

export const SponsorsBarBlock: React.FC<Props> = ({ heading, sponsors, id }) => {
  const resolvedHeading = heading ?? DEFAULTS.heading

  // Use CMS sponsors if they have valid logo objects, otherwise fall back to static images
  const hasCmsLogos =
    Array.isArray(sponsors) &&
    sponsors.length > 0 &&
    sponsors.some((s) => s.logo && typeof s.logo === 'object' && 'url' in s.logo)

  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className={`section-padding-md transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      style={{ backgroundColor: '#F0EDEA' }}
    >
      <div className="container mx-auto px-6">
        {/* ── Heading ── */}
        <p
          className="text-center font-display font-bold mb-12 lg:mb-16"
          style={{
            fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
            color: '#1d1d1d',
            lineHeight: 1.3,
          }}
        >
          {resolvedHeading}
        </p>

        {/* ── Logo grid — 1 col mobile, 2 col tablet, 4 col desktop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-10 w-full mx-auto">
          {hasCmsLogos
            ? /* ── CMS logos ── */
              sponsors!.map((sponsor, index) => {
                const logo = sponsor.logo
                const logoContent = (
                  <div
                    key={index}
                    className="flex items-center justify-center px-4 py-3 transition-all duration-500 ease-out"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                      transitionDelay: `${200 + index * 120}ms`,
                    }}
                  >
                    <div className="relative h-20 md:h-28 lg:h-32 w-full">
                      {logo && typeof logo === 'object' ? (
                        <Media
                          resource={logo as MediaType}
                          imgClassName="object-contain w-full h-full"
                          className="absolute inset-0"
                        />
                      ) : (
                        <div
                          className="h-full w-28 rounded-lg"
                          style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
                        />
                      )}
                    </div>
                  </div>
                )
                if (sponsor.url) {
                  return (
                    <a
                      key={index}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={sponsor.name || 'Sponsor'}
                    >
                      {logoContent}
                    </a>
                  )
                }
                return logoContent
              })
            : /* ── Static fallback logos ── */
              STATIC_SPONSORS.map((sponsor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center px-4 py-3 transition-all duration-500 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                    transitionDelay: `${200 + index * 120}ms`,
                  }}
                >
                  <div
                    className="relative h-20 md:h-28 lg:h-32 w-full"
                    style={sponsor.scale !== 1 ? { transform: `scale(${sponsor.scale})` } : undefined}
                  >
                    <Image
                      src={sponsor.src}
                      alt={sponsor.name}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
