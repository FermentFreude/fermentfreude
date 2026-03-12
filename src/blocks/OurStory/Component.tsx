'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType, OurStoryBlock as OurStoryBlockType } from '@/payload-types'
import { useEffect, useRef, useState } from 'react'

const DEFAULTS = {
  label: 'Our Story',
  heading: 'Bringing Joy to Fermentation',
  subheading:
    'Making fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods',
  paragraphs: [
    {
      text: 'FermentFreude is an Austrian food-tech company on a mission to bring joy to fermentation. Through hands-on workshops and premium fermented products, we help people discover how gut health meets delight—turning age-old craft into everyday pleasure.',
      image: null as MediaType | null,
    },
    {
      text: 'We blend traditional fermentation practices with modern science and regional sourcing, empowering home cooks and professionals to approach food with confidence, curiosity, and genuine joy.',
      image: null as MediaType | null,
    },
  ],
}

type Props = OurStoryBlockType & { id?: string }

export const OurStoryBlock: React.FC<Props> = ({ label, heading, subheading, paragraphs, id }) => {
  const resolvedLabel = label ?? DEFAULTS.label
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedSubheading = subheading ?? DEFAULTS.subheading
  const resolvedParagraphs =
    paragraphs && paragraphs.length > 0
      ? paragraphs.map((p) => ({
          text: p.text ?? '',
          image: p.image && typeof p.image === 'object' && 'url' in p.image ? p.image : null,
        }))
      : DEFAULTS.paragraphs

  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className={`our-story-block section-padding-md bg-white transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-eyebrow text-ff-gold-accent font-display font-semibold tracking-[0.2em]">
              {resolvedLabel}
            </span>
            <h2 className="mt-2 text-section-heading font-display font-bold tracking-tight text-ff-near-black">
              {resolvedHeading}
            </h2>
            <blockquote className="mt-8 text-body-lg leading-relaxed italic text-ff-gray-text">
              &ldquo;{resolvedSubheading}&rdquo;
            </blockquote>
          </div>

          <div className="mt-20 flex flex-col gap-16">
            {resolvedParagraphs.map((item, idx) => {
              const isEven = idx % 2 === 0
              const textContent = (
                <div className="flex flex-1 flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full bg-ff-gold-accent"
                      aria-hidden
                    />
                    <span className="text-5xl font-display font-bold tabular-nums leading-none text-ff-gray-text/30">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-4 text-body-lg leading-[1.8] text-ff-gray-15">{item.text}</p>
                </div>
              )
              const imageContent = item.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Media resource={item.image} fill imgClassName="object-cover" />
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-xl bg-ff-warm-gray" />
              )

              return (
                <div
                  key={idx}
                  className={`grid gap-8 md:grid-cols-2 md:gap-12 md:items-center transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: isVisible ? `${idx * 100}ms` : '0ms' }}
                >
                  {isEven ? (
                    <>
                      {imageContent}
                      {textContent}
                    </>
                  ) : (
                    <>
                      {textContent}
                      {imageContent}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
