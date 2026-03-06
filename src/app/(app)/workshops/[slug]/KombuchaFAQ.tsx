'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export type KombuchaFAQCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  items?: Array<{ question?: string | null; answer?: string | null }> | null
}

type FAQItem = {
  question: string
  answer: string
}

const BOOKING_FAQ: FAQItem[] = [
  {
    question: 'Do I need to keep my SCOBY in the fridge after the workshop?',
    answer:
      'No! Your fresh SCOBY and starter liquid should stay at room temperature (20-25°C) to stay active. Store it in a glass jar covered with a cloth. Check it once a week and refresh with sweet tea if resting for more than a month.',
  },
  {
    question: 'What do I need to bring to the workshop?',
    answer:
      "Nothing! We provide everything: organic tea, spring water, SCOBY starter culture, glass jars, bottles, and brewing equipment to take home. Wear comfortable clothes and let us know about any allergies in advance.",
  },
  {
    question: 'How large are the workshop groups?',
    answer:
      'Our workshops have a maximum of 12 participants to ensure everyone gets personal attention. For groups of 8 or more, we also offer private workshop bookings — email us at info@fermentfreude.de for a custom quote.',
  },
  {
    question: 'How long is the workshop and when does it start?',
    answer:
      "The Kombucha workshop lasts about 3 hours. Please arrive 10 minutes early so we can start on time. You'll find exact times listed with each date above.",
  },
  {
    question: 'Is this workshop suitable for beginners?',
    answer:
      'Absolutely! Our workshops are designed specifically for beginners. You need zero prior experience. We explain everything step by step — from the science to the brewing, fermentation, and flavoring.',
  },
  {
    question: 'Is kombucha vegan?',
    answer:
      "Yes, kombucha is naturally vegan — it's made from black or green tea, sugar, and a SCOBY (symbiotic culture of bacteria and yeast). Our entire workshop and tasting use plant-based ingredients.",
  },
]

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
  isVisible,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
  index: number
  isVisible: boolean
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div
      className={`border-b border-ff-border-light transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left transition-colors group"
        aria-expanded={isOpen}
      >
        <h3 className="pr-8 font-display text-body-lg font-bold text-ff-near-black transition-colors group-hover:text-[#555954]">
          {item.question}
        </h3>
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen ? 'bg-[#9fc9d9]' : 'bg-[#9fc9d9] hover:bg-[#7fb8cf]'
          }`}
        >
          <svg
            className={`size-4 transition-all duration-300 ${
              isOpen ? 'rotate-45 text-[#555954]' : 'text-[#555954]'
            }`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </div>
      </button>

      {/* Animated content */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: `${height}px` }}
      >
        <div ref={contentRef} className="pb-6 text-body leading-relaxed text-[#555954]">
          {item.answer}
        </div>
      </div>
    </div>
  )
}

export type KombuchaFAQProps = {
  cms?: KombuchaFAQCMS
}

export function KombuchaFAQ({ cms }: KombuchaFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const eyebrow = cms?.eyebrow ?? 'QUESTIONS?'
  const title = cms?.title ?? 'Workshop FAQ'
  const description =
    cms?.description ??
    'Everything you need to know to brew amazing kombucha and get the most out of your workshop experience.'

  const items: FAQItem[] =
    cms?.items && cms.items.length > 0
      ? cms.items.map((item) => ({
          question: item.question ?? '',
          answer: item.answer ?? '',
        }))
      : BOOKING_FAQ

  return (
    <section className="section-padding-lg bg-white">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div
          className={`mb-12 transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <p className="mb-3 font-display text-caption font-bold uppercase tracking-[0.25em] text-[#9fc9d9]">
            {eyebrow}
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-ff-near-black lg:text-4xl">
            {title}
          </h2>
          <p className="text-body-lg leading-relaxed text-[#555954]">{description}</p>
        </div>

        {/* Accordion */}
        <div className="space-y-0 border-t border-ff-border-light">
          {items.map((item, i) => (
            <AccordionItem
              key={`faq-${i}`}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              index={i}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Support footer */}
        <div
          className={`mt-12 rounded-lg bg-[#E8F3F8] px-6 py-8 text-center transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <p className="mb-2 font-display text-sm font-semibold uppercase tracking-widest text-[#555954]">
            Still have questions?
          </p>
          <p className="text-body leading-relaxed text-[#555954]">
            Write us at{' '}
            <Link href="mailto:info@fermentfreude.de" className="font-bold underline hover:no-underline">
              info@fermentfreude.de
            </Link>{' '}
            — we usually reply within 24 hours.
          </p>
        </div>
      </div>
    </section>
  )
}
