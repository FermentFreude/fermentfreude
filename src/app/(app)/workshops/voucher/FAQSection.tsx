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
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="flex flex-col gap-8 md:gap-12">
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[#E5B765] text-center">
            {heading}
          </h2>

          <div className="flex flex-col gap-3 md:gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-2 border-[#E8E4D9] rounded-2xl overflow-hidden bg-white hover:border-[#E5B765] transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-5 md:px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-[#FAF2E0] transition-colors"
                >
                  <span className="font-display text-base md:text-lg font-bold text-[#1D1D1D] pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 md:w-6 md:h-6 text-[#1D1D1D] flex-shrink-0 transition-transform duration-300 ${
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
                    <p className="font-sans text-sm md:text-base text-[#4B4F4A] leading-relaxed">
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
