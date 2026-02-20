'use client'

import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import Link from 'next/link'
import React, { useState } from 'react'

const DEFAULTS = {
  eyebrow: 'Testimonials',
  heading: 'What They Like About Our Fermentation Class',
  buttonLabel: 'View All',
  buttonLink: '#',
  testimonials: [
    {
      quote:
        "I've been practicing for over a year now, and it has truly been a transformative journey. When I first stepped onto the mat, I was seeking relief from the stress and chaos of daily life. What I found was so much more.",
      authorName: 'Clara Keihl',
      authorRole: 'Artist',
      rating: 5,
    },
    {
      quote:
        'The workshop was incredibly well organized. Marcel explained every step with such patience and passion. I left feeling inspired and confident to start fermenting at home.',
      authorName: 'Thomas Weber',
      authorRole: 'Home Cook',
      rating: 5,
    },
    {
      quote:
        'As a professional chef, I was looking for new techniques to add to my repertoire. The fermentation class exceeded my expectations — practical, creative, and delicious.',
      authorName: 'Sofia Berger',
      authorRole: 'Chef',
      rating: 5,
    },
  ],
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-[#e5b765]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

type Props = TestimonialsBlockType & { id?: string }

export const TestimonialsBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  buttonLabel,
  buttonLink,
  testimonials,
  id,
}) => {
  const resolvedEyebrow = eyebrow ?? DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink
  const resolvedTestimonials =
    testimonials && testimonials.length > 0 ? testimonials : DEFAULTS.testimonials

  const [activeIndex, setActiveIndex] = useState(0)
  const total = resolvedTestimonials.length

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + total) % total)
  const goNext = () => setActiveIndex((prev) => (prev + 1) % total)

  const current = resolvedTestimonials[activeIndex]

  return (
    <section id={id ?? undefined} className="py-16 md:py-24 lg:py-25">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="flex flex-col gap-2 max-w-175">
            {resolvedEyebrow && (
              <span className="font-display font-bold text-2xl md:text-[35px] text-[#e5b765]">
                {resolvedEyebrow}
              </span>
            )}
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-[52px] leading-[1.2] text-[#4b4f4a]">
              {resolvedHeading}
            </h2>
          </div>
          {resolvedButtonLabel && (
            <Link
              href={resolvedButtonLink}
              className="inline-flex items-center justify-center rounded-full bg-[#e5b765] hover:bg-[#d4a654] transition-colors text-[#1b1b1b] font-display font-bold text-base md:text-lg px-8 py-3 md:px-12 md:py-4 shrink-0"
            >
              {resolvedButtonLabel}
            </Link>
          )}
        </div>

        {/* Testimonial card */}
        <div className="relative bg-[#faf2e0] rounded-[40px] md:rounded-[60px] lg:rounded-[80px] px-8 py-12 md:px-16 md:py-16 lg:px-20 lg:py-20 flex flex-col items-center text-center gap-6 md:gap-8">
          <StarRating rating={current?.rating ?? 5} />

          <blockquote className="font-sans font-medium text-base md:text-lg lg:text-[26px] leading-relaxed text-[#1e1e1e] max-w-220">
            &ldquo;{current?.quote ?? ''}&rdquo;
          </blockquote>

          <div className="flex flex-col items-center gap-1">
            <p className="font-display text-lg md:text-xl text-[#1e1e1e]">
              {current?.authorName ?? ''}
            </p>
            {current?.authorRole && (
              <p className="font-sans text-sm md:text-base text-[#faf2e0] bg-[#4b4f4a] px-3 py-0.5 rounded-full">
                {current.authorRole}
              </p>
            )}
          </div>

          {/* Navigation arrows */}
          {total > 1 && (
            <>
              <button
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-[#4b4f4a] hover:bg-black/5 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={goNext}
                aria-label="Next testimonial"
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-[#4b4f4a] hover:bg-black/5 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {resolvedTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-[#e5b765]' : 'bg-[#e5b765]/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
