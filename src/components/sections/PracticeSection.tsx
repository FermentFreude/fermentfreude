import { ContentSection } from '@/components/ui/ContentSection'

/**
 * "A practice, not a trend" section.
 * Philosophical statement about fermentation as mindful practice.
 */
export function PracticeSection() {
  return (
    <ContentSection bg="ivory" padding="lg">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-ff-near-black md:text-4xl lg:text-5xl">
          A practice, not a trend
        </h2>
        <p className="text-center text-lg leading-relaxed text-ff-near-black md:text-xl lg:text-2xl">
          This is food made slowly, with attention. It asks you to observe, taste, and adjust. In
          return, it offers nourishment, flavor, and a deeper relationship with what you eat.
        </p>
      </div>
    </ContentSection>
  )
}
