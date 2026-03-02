'use client'

import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'

/* ── Brand color ── */
const STAR_COLOR = '#e5b765'
const CARD_BG = '#FAF8F5'

const DEFAULTS = {
  eyebrow: 'Testimonials',
  heading: 'What THEY LIKE ABOUT Our Fermentation Class',
  buttonLabel: 'View All',
  buttonLink: 'https://www.google.com/maps/place/Fermentfreude//@?entry=ttu&reviews=1',
  testimonials: [
    {
      quote:
        'Being able to attend the course was one of the best birthday presents I can remember. It was wonderful to see Marcel share his passion for fermentation with the participants. And the best part is: it opens up a whole new culinary world for me.',
      authorName: 'Ernst Michael Preininger',
      authorRole: 'Workshop Participant',
      rating: 5,
    },
    {
      quote:
        'A highly recommended workshop, both for beginners and those with some experience. Marcel conveys the fascinating techniques with a passion for the subject, detailed but not boring explanations, and a good dose of humor. The highlight was definitely the excellent tasting.',
      authorName: 'Mme Kuchar',
      authorRole: 'Workshop Participant',
      rating: 5,
    },
    {
      quote:
        'Marcel and David are incredibly kind people who genuinely enjoy sharing their knowledge in various workshops. The kombucha workshop was the perfect introduction to the fascinating world of kombucha! I highly recommend it to anyone interested in fermentation!',
      authorName: 'Vera Wagner',
      authorRole: 'Workshop Participant',
      rating: 5,
    },
    {
      quote:
        'I celebrated my birthday at Ferment-Freude. It was super fun, and David did a fantastic job guiding us through the afternoon. We immediately put all the technical information into practice. Highly recommended for anyone who wants a cool afternoon or has something to celebrate!',
      authorName: 'Andi Wind',
      authorRole: 'Workshop Participant',
      rating: 5,
    },
    {
      quote:
        'Very informative workshops from a trained chef with a passion for fermentation, with plenty of practical experience and great homemade gifts to take home. The homemade fermented products tasted afterward are exquisite! The next workshop is already booked.',
      authorName: 'Jorche Kanipcki',
      authorRole: 'Workshop Participant',
      rating: 5,
    },
    {
      quote:
        'We had a wonderful evening at the Tempeh workshop. We learned a lot and the tasting of the different fermented foods was a culinary highlight.',
      authorName: 'Marlies Kern',
      authorRole: 'Workshop Participant',
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
          className="w-3.5 h-3.5"
          style={{ color: i < rating ? STAR_COLOR : '#D1D5DB' }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

/* ── Big opening quotation mark ── */
function QuoteMark() {
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none" className="opacity-15">
      <path
        d="M0 32V19.2C0 13.867 1.333 9.6 4 6.4C6.667 3.2 10.4 1.067 15.2 0L17.6 4.8C14.4 5.867 12 7.467 10.4 9.6C8.8 11.733 8 14.133 8 16.8H16V32H0ZM22.4 32V19.2C22.4 13.867 23.733 9.6 26.4 6.4C29.067 3.2 32.8 1.067 37.6 0L40 4.8C36.8 5.867 34.4 7.467 32.8 9.6C31.2 11.733 30.4 14.133 30.4 16.8H38.4V32H22.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

type Props = TestimonialsBlockType & { id?: string }

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, heading, testimonials, id }) => {
  const resolvedEyebrow = eyebrow ?? DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedTestimonials =
    testimonials && testimonials.length > 0 ? testimonials : DEFAULTS.testimonials

  const total = resolvedTestimonials.length
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

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

  // Auto-advance every 10s
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setDirection(1)
      setActiveIndex((p) => (p + 1) % total)
    }, 10000)
  }, [total])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  const go = useCallback(
    (dir: -1 | 1) => {
      setDirection(dir)
      setActiveIndex((p) => (p + dir + total) % total)
      if (timerRef.current) clearInterval(timerRef.current)
      startTimer()
    },
    [total, startTimer],
  )

  // Keep a stable ref to `go` for the pointer event listeners
  const goRef = useRef(go)
  useEffect(() => {
    goRef.current = go
  }, [go])

  // Swipe / drag support (touch + mouse)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef<number | null>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const onPointerDown = (e: PointerEvent) => {
      // Don't capture if clicking a button
      if ((e.target as HTMLElement).closest('button')) return
      dragStartX.current = e.clientX
      isDragging.current = true
      el.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging.current || dragStartX.current === null) return
      isDragging.current = false
      const dx = e.clientX - dragStartX.current
      dragStartX.current = null
      if (Math.abs(dx) > 40) {
        goRef.current(dx < 0 ? 1 : -1)
      }
    }
    const onPointerCancel = () => {
      isDragging.current = false
      dragStartX.current = null
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerCancel)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerCancel)
    }
  }, []) // stable — uses goRef

  const current = resolvedTestimonials[activeIndex]

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className={`section-padding-md transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <style>{`
        @keyframes testimonialSlideIn {
          from { opacity: 0; transform: translateX(${direction > 0 ? '40px' : '-40px'}); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes testimonialFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="container mx-auto px-6">
        {/* ── Header ── */}
        <div className="flex flex-col gap-2 mb-(--space-content-xl)">
          {resolvedEyebrow && (
            <span className="text-eyebrow font-bold text-ff-gold-accent">{resolvedEyebrow}</span>
          )}
          <h2
            className="font-display font-black whitespace-nowrap"
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: '#000',
            }}
          >
            {resolvedHeading.split(/(\b[A-ZÄÖÜ]{2,}\b)/g).map((part, i) =>
              /^[A-ZÄÖÜ]{2,}$/.test(part) ? (
                <span key={i} style={{ fontSize: '1.35em', letterSpacing: '-0.03em' }}>
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </h2>
        </div>

        {/* ── Testimonial Card ── */}
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ backgroundColor: CARD_BG, touchAction: 'pan-y pinch-zoom' }}
        >
          <div className="grid lg:grid-cols-[1fr_auto]">
            {/* Left: Quote content */}
            <div
              key={activeIndex}
              className="p-8 md:p-12 lg:p-16 flex flex-col justify-between gap-8"
              style={{ animation: 'testimonialSlideIn 0.5s ease-out forwards' }}
            >
              {/* Quote mark + text */}
              <div className="flex flex-col gap-5">
                <QuoteMark />
                <blockquote
                  className="font-sans"
                  style={{
                    fontSize: 'clamp(1rem, 1.6vw, 1.35rem)',
                    lineHeight: 1.7,
                    color: '#1A1A1A',
                  }}
                >
                  {current?.quote ?? ''}
                </blockquote>
              </div>

              {/* Author info — clean horizontal layout */}
              <div
                className="flex items-center gap-4 pt-4"
                style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  animation: 'testimonialFadeUp 0.5s ease-out 0.15s both',
                }}
              >
                {/* Name initial avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
                  style={{
                    backgroundColor: '#e5b765',
                    color: '#fff',
                  }}
                >
                  {(current?.authorName ?? 'A').charAt(0)}
                </div>
                <div className="flex flex-col">
                  <p className="font-display font-bold text-sm" style={{ color: '#1A1A1A' }}>
                    {current?.authorName ?? ''}
                  </p>
                  <div className="mt-0.5">
                    <StarRating rating={current?.rating ?? 5} />
                  </div>
                  {current?.authorRole && (
                    <span
                      className="text-xs uppercase tracking-wider mt-2.5"
                      style={{ color: '#1A1A1A', opacity: 0.45 }}
                    >
                      {current.authorRole}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Navigation panel */}
            <div
              className="flex flex-row lg:flex-col items-center justify-center gap-3 px-6 py-4 lg:py-0 lg:px-8"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <button
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5"
                style={{ color: '#1A1A1A' }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Counter */}
              <div className="flex items-center gap-1">
                <span className="font-display font-bold text-sm" style={{ color: '#1A1A1A' }}>
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-xs" style={{ color: '#1A1A1A', opacity: 0.3 }}>
                  /
                </span>
                <span className="text-xs" style={{ color: '#1A1A1A', opacity: 0.3 }}>
                  {String(total).padStart(2, '0')}
                </span>
              </div>

              <button
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5"
                style={{ color: '#1A1A1A' }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 w-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }}>
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${((activeIndex + 1) / total) * 100}%`,
                backgroundColor: STAR_COLOR,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
