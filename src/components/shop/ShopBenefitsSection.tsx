import React from 'react'
import { Heart, Sparkles, Shield } from 'lucide-react'

const BENEFIT_ICONS = [Heart, Sparkles, Shield] as const

const DEFAULTS = {
  heading: 'Why fermented products?',
  items: [
    {
      title: 'Gut health',
      description:
        'Probiotics in fermented foods support digestive health and a balanced microbiome.',
    },
    {
      title: 'Nutrient boost',
      description:
        'Fermentation enhances bioavailability of vitamins, minerals, and enzymes.',
    },
    {
      title: 'Natural preservation',
      description:
        'No additives needed—fermentation preserves food naturally with live cultures.',
    },
  ],
}

type BenefitItemData = {
  id?: string | null
  title?: string | null
  description?: string | null
}

type ShopBenefitsSectionData = {
  benefitsHeading?: string | null
  benefitsItems?: BenefitItemData[] | null
}

type Props = {
  data?: ShopBenefitsSectionData | null
}

export const ShopBenefitsSection: React.FC<Props> = ({ data }) => {
  const heading = data?.benefitsHeading ?? DEFAULTS.heading
  const rawItems = data?.benefitsItems ?? []
  const validItems = rawItems.filter((i) => i?.title && i?.description)
  const items = validItems.length >= 3 ? validItems.slice(0, 3) : DEFAULTS.items

  const delayClasses = ['animate-fade-in-up', 'animate-fade-in-up animate-delay-200', 'animate-fade-in-up animate-delay-400']

  return (
    <section className="section-padding-md bg-white">
      <div className="container mx-auto container-padding content-wide text-center">
        <p className="label-uppercase text-ff-olive mb-2 animate-fade-in-up">{'BENEFITS'}</p>
        <h2 className="text-section-heading font-display font-bold text-ff-charcoal mb-10 md:mb-12 animate-fade-in-up animate-delay-200">
          {heading}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {items.map((item, i) => {
            const Icon = BENEFIT_ICONS[i] ?? Heart
            return (
            <div
              key={i}
              className={`flex flex-col items-center rounded-2xl border border-ff-charcoal/10 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md md:p-8 ${delayClasses[i] ?? delayClasses[0]}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ff-gold/15 text-ff-gold animate-[gentle-float_3s_ease-in-out_infinite]">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-subheading font-bold leading-tight text-ff-charcoal">
                {item.title ?? ''}
              </h3>
              <p className="mt-3 text-body leading-relaxed text-ff-gray-text">
                {item.description ?? ''}
              </p>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
