import { ContentSection } from '@/components/ui/ContentSection'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * "About fermentation" intro section.
 * Tag + "A complete guide to fermentation" heading + paragraph.
 */
export function GuideIntro() {
  return (
    <ContentSection bg="ivory" padding="lg">
      <SectionHeading
        align="center"
        description="Explore the ancient art of fermentation — from science to flavor — and discover why it's becoming a modern essential."
        tag="About fermentation"
        title="A complete guide to fermentation"
        titleClassName="text-ff-near-black"
      />
    </ContentSection>
  )
}
