'use client'

import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  LaktoFAQ — Booking-specific FAQ accordion
 *
 *  CMS-driven via `cms` prop (workshopDetail tab in admin).
 *  Falls back to hardcoded BOOKING_FAQ when CMS is empty.
 * ═══════════════════════════════════════════════════════════════ */

// ─── CMS Props Type ─────────────────────────────────────────

export type LaktoFAQCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  items?: Array<{ question?: string | null; answer?: string | null }> | null
  contactEmail?: string | null
}

type FAQItem = {
  question: string
  answer: string
}

const BOOKING_FAQ: FAQItem[] = [
  {
    question: 'Wie kann ich stornieren oder umbuchen?',
    answer:
      'Du kannst bis 48 Stunden vor dem Workshop kostenlos stornieren oder auf einen anderen Termin umbuchen. Schreib uns einfach eine E-Mail an info@fermentfreude.de. Bei späterer Absage behalten wir 50% der Gebühr.',
  },
  {
    question: 'Was muss ich zum Workshop mitbringen?',
    answer:
      'Nur gute Laune! Wir stellen alle Zutaten, Werkzeuge, Schürzen und Gläser zum Mitnehmen bereit. Bequeme Kleidung wird empfohlen. Wenn du Allergien hast, gib uns bitte vorher Bescheid.',
  },
  {
    question: 'Wie groß sind die Gruppen?',
    answer:
      'Unsere Workshops haben maximal 12 Teilnehmer, damit jeder genug persönliche Betreuung bekommt. Ab 8 Personen bieten wir auch private Gruppen-Workshops an — schreib uns für ein individuelles Angebot.',
  },
  {
    question: 'Wie lange dauert der Workshop und wann fängt er an?',
    answer:
      'Der Lakto-Workshop dauert ca. 3 Stunden. Bitte sei 10 Minuten vor Beginn da, damit wir pünktlich starten können. Genaue Uhrzeiten findest du bei den einzelnen Terminen oben.',
  },
  {
    question: 'Ist der Workshop für Anfänger geeignet?',
    answer:
      'Absolut! Unsere Workshops sind speziell für Einsteiger konzipiert. Du brauchst keinerlei Vorkenntnisse. Wir erklären alles Schritt für Schritt — von der Wissenschaft bis zur Praxis.',
  },
  {
    question: 'Gibt es vegetarische/vegane Optionen?',
    answer:
      'Ja! Alle unsere Lakto-Gemüse-Rezepte sind von Natur aus vegan. Auch die Verkostung bietet vegane Optionen. Bitte teile uns eventuelle Allergien vorab mit.',
  },
]

// ─── Accordion Item ─────────────────────────────────────────

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
            isOpen ? 'bg-[#555954] rotate-0' : 'bg-ff-warm-gray rotate-0'
          }`}
        >
          <svg
            className={`size-4 transition-all duration-300 ${
              isOpen ? 'rotate-45 text-white' : 'text-ff-near-black'
            }`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-400 ease-out"
        style={{ maxHeight: height }}
      >
        <div ref={contentRef} className="pb-6 pr-16">
          <p className="text-body leading-relaxed text-ff-gray-text">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────

export function LaktoFAQ({ cms }: { cms?: LaktoFAQCMS }) {
  // ── CMS values → fallback to hardcoded defaults ──
  const eyebrow = cms?.eyebrow ?? 'HÄUFIGE FRAGEN'
  const title = cms?.title ?? 'Gut zu wissen'
  const description = cms?.description ?? 'Alles was du vor deiner Buchung wissen solltest — von Stornierung bis Verpflegung.'
  const contactEmail = cms?.contactEmail ?? 'info@fermentfreude.de'
  const faqItems: FAQItem[] = (cms?.items?.length ?? 0) > 0
    ? cms!.items!.map((item) => ({ question: item.question ?? '', answer: item.answer ?? '' }))
    : BOOKING_FAQ

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() } },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section-padding-lg"
      style={{ backgroundColor: '#F6F0E8' }}
    >
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div
            className={`mb-12 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <p className="mb-3 font-display text-caption font-bold uppercase tracking-[0.2em] text-[#555954]/60">
              {eyebrow}
            </p>
            <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-near-black">
              {title}
            </h2>
            <p className="mt-4 max-w-lg text-body-lg leading-relaxed text-ff-gray-text">
              {description}
            </p>
          </div>

          {/* Accordion */}
          <div className="border-t border-ff-border-light">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* Contact hint */}
          <div
            className={`mt-10 flex items-center justify-center gap-2 text-center transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <p className="text-body text-ff-gray-text-light">
              Noch Fragen?{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-[#555954] underline decoration-[#555954]/30 underline-offset-4 transition-colors hover:text-ff-near-black hover:decoration-ff-near-black"
              >
                Schreib uns
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
