'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Media } from '@/components/Media'

function isResolvedMedia(img: unknown): img is { url: string } {
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
        className="relative overflow-hidden rounded-2xl border-2 border-[#E6BE68]/30 bg-gradient-to-br from-[#FAF2E0] to-[#F5F0E8] shadow-sm transition-shadow hover:shadow-md [&[data-state=open]]:border-[#E6BE68]/50 [&[data-state=open]]:shadow-lg"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[#E6BE68]/10 blur-2xl" />
        <AccordionTrigger className="rounded-2xl px-6 py-5 text-left font-display text-section-heading font-bold text-ff-black hover:no-underline hover:bg-white/30 hover:text-[#555954] md:px-8 md:py-6 [&[data-state=open]>svg]:rotate-180">
          {title}
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 md:px-8 md:pb-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-10 lg:items-start">
            <div className="space-y-5 lg:col-span-3">
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-body leading-relaxed text-ff-black/90 sm:text-body-lg"
                >
                  {para}
                </p>
              ))}
            </div>
            {isResolvedMedia(image) && (
              <div className="lg:col-span-2">
                <div className="aspect-4/3 overflow-hidden rounded-2xl shadow-md">
                  <Media resource={image.url} fill imgClassName="object-cover object-center" />
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
