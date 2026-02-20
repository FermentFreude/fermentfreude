import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { HeroBannerBlock as HeroBannerBlockType, Media as MediaType } from '@/payload-types'
import Link from 'next/link'

const DEFAULTS = {
  heading: 'For Chefs and Food Professionals',
  description:
    'Looking for fermented, plant-based options that work in professional kitchens?\nWe supply products and knowledge for modern menus.',
  buttonLabel: 'Get to know more here',
  buttonLink: '/about',
}

type Props = HeroBannerBlockType & { id?: string }

export const HeroBannerBlock: React.FC<Props> = ({
  heading,
  description,
  buttonLabel,
  buttonLink,
  backgroundImage,
  id,
}) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink

  return (
    <section
      id={id ?? undefined}
      className="relative w-full min-h-[50vh] lg:min-h-[60vh] flex items-center justify-center overflow-hidden rounded-2xl"
    >
      {/* Background image */}
      {backgroundImage && typeof backgroundImage === 'object' ? (
        <Media
          resource={backgroundImage as MediaType}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-ff-charcoal" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <FadeIn className="relative z-10 container mx-auto px-6 section-padding-md flex flex-col items-center text-center gap-(--space-content-lg) content-medium">
        <h2 className="text-white drop-shadow-md">{resolvedHeading}</h2>
        <p className="text-body-lg text-white/90 content-narrow whitespace-pre-line">
          {resolvedDescription}
        </p>
        <Link
          href={resolvedButtonLink}
          className="inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white hover:scale-[1.03] active:scale-[0.97] backdrop-blur-sm transition-all text-ff-black font-display font-bold text-base px-6 py-2.5"
        >
          {resolvedButtonLabel}
        </Link>
      </FadeIn>
    </section>
  )
}
