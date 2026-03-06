'use client'

import { useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  KombuchaFAQ — Accordion with gold styling
 *
 *  CMS-driven via `cms` prop (workshopDetail tab in admin).
 *  Falls back to hardcoded Kombucha FAQ defaults.
 * ═══════════════════════════════════════════════════════════════ */

// ─── CMS Props Type ─────────────────────────────────────────

export type KombuchaFAQCMS = {
  faqEyebrow?: string | null
  faqTitle?: string | null
  faqDescription?: string | null
  faqItems?: Array<{
    question?: string | null
    answer?: string | null
  }> | null
  faqContactLabel?: string | null
  faqContactText?: string | null
  faqContactEmail?: string | null
}

// ─── FAQ Items Data ─────────────────────────────────────────

const BOOKING_FAQ = [
  {
    question: `How do I store and care for my SCOBY after the workshop?`,
    answer: `Keep your SCOBY in a "starter culture jar" at room temperature (65–75°F/18–24°C) with about 1 cup of kombucha liquid. Cover loosely with a cloth. Check it monthly—it should look opaque and pale. After 1–2 months, you can brew your next batch or maintain it indefinitely with minimal care.`,
  },
  {
    question: `What should I bring to the workshop?`,
    answer: `Just yourself! We provide all materials: tea, water, bottles, SCOBY, and equipment. Wear comfortable clothing you don't mind getting splashed in, and avoid heavy perfumes if you're sensitive to fermentation aromas.`,
  },
  {
    question: `Can I book a private session for my group?`,
    answer: `Absolutely. Private groups of 8–12 are welcome. Email us with your preferred date, and we'll arrange an exclusive session tailored to your team, family, or friends.`,
  },
  {
    question: `How long is the workshop, and what time does it start?`,
    answer: `Our workshops are 3 hours long. Morning sessions start at 10 AM, afternoon sessions at 2 PM. You'll receive confirmation with exact times 48 hours before your date.`,
  },
  {
    question: `Is this workshop beginner-friendly?`,
    answer: `Yes! We design the entire workshop for complete beginners. No prior fermentation experience is required. Our instructors guide you through every step with encouragement and practical tips.`,
  },
  {
    question: `Is kombucha vegan?`,
    answer: `Yes, kombucha is vegan. It's made from tea, sugar, and water fermented with SCOBY (a living bacterial and yeast culture). No animal products are involved in the fermentation process.`,
  },
]

// ─── Plus Icon Component ────────────────────────────────────

function RotatingPlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-6 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// ─── Accordion Item ─────────────────────────────────────────

function FAQAccordion({
  question,
  answer,
  _index,
}: {
  question: string
  answer: string
  _index: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-ff-border-light last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-4 px-8 py-6 sm:px-10 hover:bg-ff-cream/40">
          <h3 className="flex-1 font-display text-body-lg font-bold leading-relaxed text-ff-near-black">
            {question}
          </h3>
          <div className="mt-0.5 shrink-0" style={{ color: 'var(--ff-gold, #e6be68)' }}>
            <RotatingPlusIcon open={open} />
          </div>
        </div>
      </button>

      {/* Expandable answer */}
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-8 pb-6 sm:px-10">
          <p className="text-body leading-relaxed text-ff-gray-text">{answer}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────

export function KombuchaFAQ({ cms }: { cms?: KombuchaFAQCMS }) {
  const faqEyebrow = cms?.faqEyebrow ?? 'HÄUFIG GESTELLT'
  const faqTitle = cms?.faqTitle ?? 'Deine Fragen beantwortet'
  const _faqDescription =
    cms?.faqDescription ??
    'Sie haben mehr Fragen? Senden Sie uns gerne eine E-Mail. Wir freuen uns auf Sie.'
  const faqItems =
    (cms?.faqItems?.length ?? 0) > 0
      ? cms!.faqItems!.map((item) => ({
          question: item.question ?? '',
          answer: item.answer ?? '',
        }))
      : BOOKING_FAQ

  return (
    <section id="faq" className="section-padding-lg bg-white">
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <p
              className="mb-3 font-display text-caption font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--ff-gold, #e6be68)' }}
            >
              {faqEyebrow}
            </p>
            <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-near-black">
              {faqTitle}
            </h2>
          </div>

          {/* Accordion */}
          <div className="mb-12 overflow-hidden rounded-2xl border border-ff-border-light bg-white">
            {faqItems.map((item, i) => (
              <FAQAccordion key={i} question={item.question} answer={item.answer} _index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
