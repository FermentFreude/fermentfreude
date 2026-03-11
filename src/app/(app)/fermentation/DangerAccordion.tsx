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
        className="overflow-hidden rounded-2xl border border-[#333333]/10 bg-[#EDE8E0] shadow-sm transition-shadow hover:shadow-md [&[data-state=open]]:shadow-lg"
      >
        <AccordionTrigger className="rounded-2xl px-6 py-5 text-left font-display text-section-heading font-bold text-ff-black hover:no-underline hover:bg-white/30 md:px-8 md:py-6 [&[data-state=open]>svg]:rotate-180">
          {title}
        </AccordionTrigger>
        <AccordionContent className="rounded-b-2xl px-6 pb-6 pt-0 md:px-8 md:pb-8">
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
              <ul className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
                {concerns.map((concern, i) => (
                  <li
                    key={concern.id ?? i}
                    className="border-l-2 border-[#d1ccc6] pl-4 sm:pl-5"
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
            <p className="mt-6 text-body leading-relaxed text-ff-black sm:mt-8 sm:text-body-lg">
              {closing}
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
