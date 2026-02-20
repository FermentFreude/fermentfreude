import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type {
  FeatureCardsBlock as FeatureCardsBlockType,
  Media as MediaType,
} from '@/payload-types'
import Link from 'next/link'

const DEFAULTS = {
  eyebrow: 'FERMENTATION',
  heading: 'Why Fermentation?',
  description:
    "When you learn it, you're not just preserving food. You're changing how you relate to eating, time, and care.",
  cards: [
    {
      title: 'Probiotics',
      description: 'Good Bacteria supports health and boost immunity',
    },
    {
      title: 'Preservation',
      description: 'Fermentation process prolongs life of foods',
    },
    {
      title: 'Nutrition',
      description: 'Good bacteria help manufacture and synthesise vitamins',
    },
  ],
  buttonLabel: 'Read more about it',
  buttonLink: '/about',
}

type Props = FeatureCardsBlockType & { id?: string }

export const FeatureCardsBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  description,
  cards,
  buttonLabel,
  buttonLink,
  id,
}) => {
  const resolvedEyebrow = eyebrow ?? DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedCards = cards && cards.length > 0 ? cards : DEFAULTS.cards
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink

  return (
    <section id={id ?? undefined} className="bg-white section-padding-md">
      <div className="container mx-auto px-6 flex flex-col items-center gap-(--space-content-xl)">
        {/* Header */}
        <FadeIn className="flex flex-col items-center text-center gap-(--space-content-sm) content-medium">
          {resolvedEyebrow && (
            <span className="text-eyebrow text-ff-gold-accent">{resolvedEyebrow}</span>
          )}
          <h2 className="text-ff-black">{resolvedHeading}</h2>
          {resolvedDescription && (
            <p className="text-body text-ff-black/80">{resolvedDescription}</p>
          )}
        </FadeIn>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-(--space-content-lg) w-full content-wide mx-auto">
          {resolvedCards.map((card, index) => (
            <FadeIn key={index} delay={index * 120}>
              <div className="flex flex-col items-center text-center gap-(--space-content-sm) p-6 rounded-2xl border-2 border-ff-gold-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {/* Icon */}
                {'icon' in card && card.icon && typeof card.icon === 'object' ? (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Media
                      resource={card.icon as MediaType}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-ff-warm-gray" />
                )}

                {/* Title */}
                <h3 className="text-ff-gold">{card.title}</h3>

                {/* Description */}
                <p className="text-body-sm text-ff-charcoal">{card.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* CTA Button */}
        {resolvedButtonLabel && (
          <FadeIn>
            <Link
              href={resolvedButtonLink}
              className="inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover hover:scale-[1.03] active:scale-[0.97] transition-all text-ff-ivory font-display font-bold text-base px-6 py-2.5"
            >
              {resolvedButtonLabel}
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
