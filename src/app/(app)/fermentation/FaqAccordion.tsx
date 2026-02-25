'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface FaqItem {
  id?: string | null
  question: string
  answer: string
}

interface FaqAccordionProps {
  items: FaqItem[]
  /** Allow multiple items open at once */
  type?: 'single' | 'multiple'
}

export function FaqAccordion({ items, type = 'single' }: FaqAccordionProps) {
  if (items.length === 0) return null

  return (
    <Accordion
      type={type}
      collapsible
      className="w-full"
    >
      {items.map((item, i) => (
        <AccordionItem
          key={item.id ?? i}
          value={`item-${i}`}
          className="border-b border-ff-black/10 last:border-b-0 transition-colors duration-200"
        >
          <AccordionTrigger className="py-5 text-left font-display text-title font-bold text-ff-black hover:no-underline hover:text-[#555954] rounded-lg px-2 -mx-2 hover:bg-white/50 transition-colors duration-200 [&[data-state=open]>svg]:rotate-180">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pl-2 text-body leading-relaxed text-ff-gray-text">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
