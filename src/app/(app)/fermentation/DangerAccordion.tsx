'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface DangerConcern {
  id?: string | null
  title: string
  description: string
}

interface DangerAccordionProps {
  title: string
  intro: string
  concernsHeading: string
  concerns: DangerConcern[]
  closing: string
}

export function DangerAccordion({
  title,
  intro,
  concernsHeading,
  concerns,
  closing,
}: DangerAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value="danger"
        className="relative overflow-hidden rounded-2xl border-2 border-[#555954]/20 bg-[#ECE5DE] shadow-sm transition-shadow hover:shadow-md [&[data-state=open]]:border-[#555954]/30 [&[data-state=open]]:shadow-lg"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[#555954]/10 blur-2xl" aria-hidden />
        <AccordionTrigger className="rounded-2xl px-6 py-5 text-left font-display text-section-heading font-bold text-ff-black hover:no-underline hover:bg-white/20 hover:text-[#555954] md:px-8 md:py-6 [&[data-state=open]>svg]:rotate-180">
          {title}
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-4 md:px-8 md:pb-8">
          {intro && (
            <p className="text-body leading-relaxed text-ff-black sm:text-body-lg">
              {intro}
            </p>
          )}
          {concerns.length > 0 && concernsHeading && (
            <div className="mt-6 sm:mt-8">
              <h3 className="font-display text-title font-bold text-ff-black md:text-subheading">
                {concernsHeading}
              </h3>
              <ul className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                {concerns.map((concern, i) => (
                  <li
                    key={concern.id ?? i}
                    className="border-l-4 border-[#555954]/30 pl-4 sm:pl-5 transition-colors hover:border-[#555954]/50"
                  >
                    <span className="font-display font-bold text-ff-black">
                      {concern.title}:
                    </span>{' '}
                    <span className="text-body leading-relaxed text-ff-black sm:text-body-lg">
                      {concern.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {closing && (
            <p className="mt-5 text-body leading-relaxed text-ff-black sm:mt-6 sm:text-body-lg">
              {closing}
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
