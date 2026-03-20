'use client'

import { useState } from 'react'

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  heading: string
  faqs: FAQ[]
}

export function FAQSection({ heading, faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="w-full py-12 md:py-14 bg-white">
      <div className="mx-auto max-w-[var(--content-medium)] px-[var(--space-container-x)]">
        <div className="flex flex-col gap-8 md:gap-12">
          <h2 className="font-display text-[length:var(--text-heading)] font-bold text-ff-gold-accent text-center tracking-tight">
            {heading}
          </h2>

          <div className="flex flex-col gap-3 md:gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`overflow-hidden rounded-[var(--radius-xl)] border-2 border-ff-border-light bg-white transition-colors hover:border-ff-gold-accent/50 ${
                openIndex === idx ? 'border-l-4 border-l-ff-gold-accent' : ''
              }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-5 md:px-6 py-4 md:py-5 text-left flex items-center justify-between transition-colors hover:bg-ff-ivory-mist/50"
                >
                  <span className="font-display text-[length:var(--text-body-lg)] font-bold text-ff-near-black pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 md:w-6 md:h-6 text-ff-near-black flex-shrink-0 transition-transform duration-300 ${
                      openIndex === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === idx && (
                  <div className="px-5 md:px-6 pb-4 md:pb-5 pt-2">
                    <p className="font-sans text-[length:var(--text-body-sm)] md:text-[length:var(--text-body)] text-ff-gray-text leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
