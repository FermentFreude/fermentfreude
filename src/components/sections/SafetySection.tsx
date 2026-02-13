import { ContentSection } from '@/components/ui/ContentSection'
import React from 'react'

const concerns = [
  {
    title: 'Mold',
    description:
      "Surface mold on fermented vegetables is common and usually harmless. If it's white or gray, simply skim it off. Pink, black, or fuzzy mold means it's time to start over.",
  },
  {
    title: 'Smell',
    description:
      'Fermented foods have strong aromas — tangy, sour, earthy. A bad smell (rotting, putrid) is different from a strong ferment smell. Trust your instincts.',
  },
  {
    title: 'Botulism',
    description:
      'Botulism is extremely rare in lacto-fermentation because the acidic environment prevents the bacteria from thriving. Proper salt ratios (2-3%) are your best safeguard.',
  },
  {
    title: 'Trust your senses',
    description:
      'If it looks right, smells right, and tastes right — it probably is. Fermentation has been practiced safely for millennia. When in doubt, start with simple recipes and build from there.',
  },
]

/**
 * "Is it dangerous?" safety section addressing common concerns.
 */
export function SafetySection() {
  return (
    <ContentSection bg="warm-gray" padding="lg">
      <h2 className="mb-12 text-center text-3xl font-bold text-ff-near-black md:text-4xl lg:text-5xl">
        Is it dangerous?
      </h2>
      <div className="mx-auto max-w-3xl space-y-8">
        {concerns.map((concern) => (
          <div className="flex gap-4" key={concern.title}>
            <div className="mt-2.5 size-2 shrink-0 rounded-full bg-ff-charcoal" />
            <div>
              <h3 className="text-lg font-bold text-ff-near-black">{concern.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ff-gray-text">
                {concern.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ContentSection>
  )
}
