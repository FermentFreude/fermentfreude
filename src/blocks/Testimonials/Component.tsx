'use client'

import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

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
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-ff-gold-accent' : 'text-gray-300'}`}
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
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.12 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto-advance every 6s
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setActiveIndex((p) => (p + 1) % total), 6000)
  }, [total])
  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  const go = (dir: -1 | 1) => {
    setActiveIndex((p) => (p + dir + total) % total)
    if (timerRef.current) clearInterval(timerRef.current)
    startTimer()
  }

  const current = resolvedTestimonials[activeIndex]

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className={`section-padding-md transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-(--space-content-md) mb-(--space-content-xl)">
          <div className="flex flex-col gap-(--space-content-xs) content-medium">
            {resolvedEyebrow && (
              <span className="text-eyebrow text-ff-gold-accent">{resolvedEyebrow}</span>
            )}
            <h2 className="text-ff-olive">{resolvedHeading}</h2>
          </div>
          {resolvedButtonLabel && (
            <Link
              href={resolvedButtonLink}
              className="inline-flex items-center justify-center rounded-full bg-ff-gold-accent hover:bg-ff-gold-accent-dark hover:scale-[1.03] active:scale-[0.97] transition-all text-ff-dark-deep font-display font-bold text-base px-6 py-2.5 shrink-0"
            >
              {resolvedButtonLabel}
            </Link>
          )}
        </div>

        {/* Testimonial card */}
        <div className="relative bg-ff-ivory-mist rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col items-center text-center gap-(--space-content-md)">
          <StarRating rating={current?.rating ?? 5} />

          <blockquote
            key={activeIndex}
            className="text-body-lg text-ff-dark content-medium animate-fade-in"
          >
            &ldquo;{current?.quote ?? ''}&rdquo;
          </blockquote>

          <div className="flex flex-col items-center gap-1">
            <p className="font-display text-base text-ff-dark">{current?.authorName ?? ''}</p>
            {current?.authorRole && (
              <p className="text-caption text-ff-ivory-mist bg-ff-olive px-3 py-0.5 rounded-full">
                {current.authorRole}
              </p>
            )}
          </div>

          {/* Navigation arrows */}
          {total > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-ff-olive hover:bg-black/5 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
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
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-ff-olive hover:bg-black/5 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
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
          <div className="flex justify-center gap-1.5 mt-4">
            {resolvedTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index)
                  if (timerRef.current) clearInterval(timerRef.current)
                  startTimer()
                }}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-ff-gold-accent scale-125' : 'bg-ff-gold-accent/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
