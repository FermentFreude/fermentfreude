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
    <section id={id ?? undefined} className="bg-white py-16 md:py-24 lg:py-30">
      <div className="container mx-auto px-6 flex flex-col items-center gap-12 md:gap-16 lg:gap-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 md:gap-5 max-w-175">
          {resolvedEyebrow && (
            <span className="font-display font-medium text-sm md:text-base text-[#e5b765] tracking-[3px] uppercase">
              {resolvedEyebrow}
            </span>
          )}
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-[49px] leading-[1.2] text-[#1d1d1d]">
            {resolvedHeading}
          </h2>
          {resolvedDescription && (
            <p className="font-display font-medium text-sm md:text-base leading-relaxed text-[#1d1d1d] tracking-wide">
              {resolvedDescription}
            </p>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-300">
          {resolvedCards.map((card, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-4 p-8 md:p-10 rounded-[60px] md:rounded-[75px] border-[3px] border-[#e5b765]"
            >
              {/* Icon */}
              {'icon' in card && card.icon && typeof card.icon === 'object' ? (
                <div className="w-16 h-16 flex items-center justify-center">
                  <Media
                    resource={card.icon as MediaType}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#ECE5DE]" />
              )}

              {/* Title */}
              <h3 className="font-display font-black text-xl md:text-2xl lg:text-[28px] text-[#e6be68]">
                {card.title}
              </h3>

              {/* Description */}
              <p className="font-display font-bold text-sm md:text-base leading-relaxed text-[#4b4b4b]">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        {resolvedButtonLabel && (
          <Link
            href={resolvedButtonLink}
            className="inline-flex items-center justify-center rounded-full bg-[#4b4b4b] hover:bg-[#3a3a3a] transition-colors text-[#f9f0dc] font-display font-bold text-base md:text-lg lg:text-xl px-8 py-4 lg:px-10 lg:py-5"
          >
            {resolvedButtonLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
