import { ContentSection } from '@/components/ui/ContentSection'

/**
 * "What is fermentation?" content section.
 * Rounded card on warm-gray background explaining fermentation.
 */
export function WhatIsSection() {
  return (
    <ContentSection bg="warm-gray" padding="lg">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-ff-near-black md:text-4xl lg:text-5xl">
          What is fermentation?
        </h2>
        <div className="space-y-6 text-base leading-relaxed text-ff-charcoal md:text-lg">
          <p>
            Fermentation is a natural metabolic process where microorganisms — like bacteria, yeast,
            and molds — convert sugars and starches into acids, gases, or alcohol. It&apos;s one of
            the oldest methods of food preservation, used by cultures around the world for thousands
            of years.
          </p>
          <p>
            From sauerkraut and kimchi to kombucha and tempeh, fermented foods are rich in
            probiotics, enzymes, and bioavailable nutrients. They support digestive health, boost
            immunity, and add complex layers of flavor to everyday ingredients.
          </p>
        </div>
      </div>
    </ContentSection>
  )
}
