import { FeatureCard } from '@/components/ui/FeatureCard'

const benefits = [
  {
    title: 'Probiotics',
    description: 'Good Bacteria supports health and boost immunity',
    variant: 'default' as const,
  },
  {
    title: 'Enzymes',
    description: 'Live enzymes help digest food',
    variant: 'gold' as const,
  },
  {
    title: 'Nutrition',
    description: 'Good bacteria help manufacture and synthesise vitamins',
    variant: 'dark' as const,
  },
  {
    title: 'Preservation',
    description: 'Fermentation process prolongs life of foods',
    variant: 'gold-light' as const,
  },
]

/**
 * Horizontal bar of 4 fermentation benefit cards.
 * Probiotics, Enzymes, Nutrition, Preservation.
 */
export function BenefitsBar() {
  return (
    <section className="bg-ff-ivory px-6 pb-16 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <FeatureCard
            className="min-h-50 justify-center rounded-[28px] lg:rounded-[34px]"
            description={benefit.description}
            key={benefit.title}
            title={benefit.title}
            variant={benefit.variant}
          />
        ))}
      </div>
    </section>
  )
}
