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
      className="relative w-full min-h-125 md:min-h-150 lg:min-h-175 flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      {backgroundImage && typeof backgroundImage === 'object' ? (
        <Media
          resource={backgroundImage as MediaType}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#4b4b4b]" />
      )}

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center gap-8 md:gap-10 max-w-225">
        <h2 className="font-display font-black text-3xl md:text-5xl lg:text-[72px] leading-[1.1] text-white">
          {resolvedHeading}
        </h2>
        <p className="font-display font-bold text-base md:text-xl lg:text-[28px] leading-[1.4] text-[#1d1d1d] max-w-200 whitespace-pre-line">
          {resolvedDescription}
        </p>
        <Link
          href={resolvedButtonLink}
          className="inline-flex items-center justify-center rounded-full bg-[#1d1d1d] hover:bg-black transition-colors text-[#f9f0dc] font-display font-bold text-base md:text-lg lg:text-xl px-8 py-4 lg:px-10 lg:py-5"
        >
          {resolvedButtonLabel}
        </Link>
      </div>
    </section>
  )
}
