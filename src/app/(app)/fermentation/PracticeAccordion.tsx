'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Media } from '@/components/Media'

import type { Media as MediaType } from '@/payload-types'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

interface PracticeAccordionProps {
  title: string
  paragraphs: string[]
  image?: unknown
}

export function PracticeAccordion({
  title,
  paragraphs,
  image,
}: PracticeAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value="practice"
        className="overflow-hidden rounded-2xl border border-[#333333]/10 bg-[#F5F0E8] shadow-sm transition-shadow hover:shadow-md [&[data-state=open]]:shadow-lg"
      >
        <AccordionTrigger className="rounded-2xl px-6 py-5 text-left font-display text-section-heading font-bold text-ff-black hover:no-underline hover:bg-white/30 md:px-8 md:py-6 [&[data-state=open]>svg]:rotate-180">
          {title}
        </AccordionTrigger>
        <AccordionContent className="rounded-b-2xl px-6 pb-6 pt-0 md:px-8 md:pb-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-10 lg:items-start">
            <div className="space-y-8 lg:col-span-3">
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="border-l-2 border-[#d1ccc6] pl-4 text-body leading-relaxed text-ff-black sm:pl-6 sm:text-body-lg"
                >
                  {para}
                </p>
              ))}
            </div>
            {isResolvedMedia(image) && (
              <div className="lg:col-span-2">
                <div className="aspect-4/3 overflow-hidden rounded-2xl shadow-md">
                  <Media resource={image as MediaType} fill imgClassName="object-cover object-center" />
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
