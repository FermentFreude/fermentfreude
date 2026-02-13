import { BenefitItem } from '@/components/ui/BenefitItem'
import { ContentSection } from '@/components/ui/ContentSection'

const benefits = [
  {
    title: 'Improves digestion',
    description:
      'Fermented foods contain probiotics and enzymes that support a healthy gut microbiome and improve nutrient absorption.',
  },
  {
    title: 'Supports gut health',
    description:
      'The beneficial bacteria in fermented foods help maintain a balanced gut flora, which is essential for overall well-being.',
  },
  {
    title: 'Reduces food waste',
    description:
      'Fermentation extends the shelf life of perishable foods, turning surplus produce into long-lasting, flavorful creations.',
  },
  {
    title: 'Builds confidence',
    description:
      'Learning to ferment builds kitchen confidence and connects you with a centuries-old tradition of self-sufficiency.',
  },
  {
    title: 'Encourages mindful eating',
    description:
      'The slow process of fermentation teaches patience and attention — qualities that carry over into how we eat and live.',
  },
  {
    title: 'Connects to tradition',
    description:
      'Every culture has its fermented foods. By fermenting, you join a global lineage of food makers and storytellers.',
  },
]

/**
 * "Why is it so special?" section with 6 benefit items in a 2-column grid.
 */
export function WhySpecialSection() {
  return (
    <ContentSection bg="ivory" padding="lg">
      <h2 className="mb-12 text-center text-3xl font-bold text-ff-near-black md:text-4xl lg:text-5xl">
        Why is it so special?
      </h2>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        {benefits.map((benefit) => (
          <BenefitItem
            description={benefit.description}
            key={benefit.title}
            title={benefit.title}
          />
        ))}
      </div>
    </ContentSection>
  )
}
