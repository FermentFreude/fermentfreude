'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const DEFAULT_ITEMS = [
  { title: "What's new?", content: 'Discover our latest workshops and seasonal fermentation courses.' },
  { title: 'What is fermentation?', content: 'An ancient preservation technique where microorganisms transform food—creating flavour, nutrition, and gut-friendly probiotics.' },
]

interface PreCtaAccordionProps {
  items?: Array<{ title: string; content: string }>
}

export function PreCtaAccordion({ items = DEFAULT_ITEMS }: PreCtaAccordionProps) {
  if (items.length === 0) return null

  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="overflow-hidden rounded-2xl border border-[#333333]/10 bg-[#F5F0E8] px-6"
        >
          <AccordionTrigger className="py-5 text-left font-display text-title font-bold text-ff-black hover:no-underline hover:bg-white/30 [&[data-state=open]>svg]:rotate-180">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0 text-body leading-relaxed text-ff-gray-text">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
