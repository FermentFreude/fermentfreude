'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

type FAQItem = { question: string; answer: string }

type Props = {
  heading: string
  subtitle: string
  faqs: FAQItem[]
}

export function FAQSliderSection({ heading, subtitle, faqs }: Props) {
  if (faqs.length === 0) return null

  return (
    <section className="section-padding-md container-padding bg-[#E6E0D8]">
      <div className="mx-auto max-w-7xl">
        <Carousel opts={{ align: 'start', loop: false }} className="w-full">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">
                {heading}
              </h2>
              <p className="mt-3 text-body-lg text-[#333]">{subtitle}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <CarouselPrevious
                className="static size-12 translate-y-0 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] hover:bg-[#d4a654] hover:text-[#1a1a1a]"
                variant="default"
              />
              <CarouselNext
                className="static size-12 translate-y-0 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] hover:bg-[#d4a654] hover:text-[#1a1a1a]"
                variant="default"
              />
            </div>
          </div>
          <CarouselContent className="-ml-2 md:-ml-4">
            {faqs.map((faq, i) => (
              <CarouselItem key={i} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="flex h-full min-h-[16rem] flex-col rounded-2xl border border-[#1a1a1a]/10 bg-white p-6">
                  <div className="mb-4 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E6E0D8]">
                    <svg
                      className="size-5 text-[#1a1a1a]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1a1a1a]">{faq.question}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#333]">{faq.answer}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
