'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType, SponsorsBarBlock as SponsorsBarBlockType } from '@/payload-types'
import React, { useEffect, useRef, useState } from 'react'

const DEFAULTS = {
  heading: 'This project is supported by:',
}

type Props = SponsorsBarBlockType & { id?: string }

export const SponsorsBarBlock: React.FC<Props> = ({ heading, sponsors, id }) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedSponsors = sponsors ?? []

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
          className="text-center font-display font-bold uppercase tracking-widest mb-12 lg:mb-16"
          style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
            color: '#e5b765',
            letterSpacing: '0.15em',
          }}
        >
          {resolvedHeading}
        </p>

        {/* ── Logo grid — 2x2 on mobile, 4 across on lg ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-10 w-full mx-auto">
          {resolvedSponsors.map((sponsor, index) => {
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
                <div className="flex items-center justify-center h-14 md:h-20 lg:h-24 w-full">
                  {logo && typeof logo === 'object' ? (
                    <Media
                      resource={logo as MediaType}
                      className="h-full w-auto object-contain max-w-48 md:max-w-56 lg:max-w-64"
                    />
                  ) : (
                    <div className="h-full w-28 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />
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
          })}
        </div>
      </div>
    </section>
  )
}
