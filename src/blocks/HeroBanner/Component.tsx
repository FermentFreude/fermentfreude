import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { HeroBannerBlock as HeroBannerBlockType, Media as MediaType } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
 *  HERO BANNER — full-screen photo (or video) with an editorial text
 *  block bottom left: gold label, big ivory heading, short text and
 *  the brand pill button. A dark gradient keeps the text readable.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULTS = {
  heading: 'We bring fermentation to you.',
  description:
    'For restaurants, hotels, caterers and events. From Graz to you: fermented products for your kitchen, training for your team and tastings at your stand.',
  buttonLabel: 'Get in touch',
  buttonLink: '/gastronomy',
}

type Props = HeroBannerBlockType & { id?: string }

export const HeroBannerBlock: React.FC<Props> = ({
  visible,
  eyebrow,
  heading,
  description,
  buttonLabel,
  buttonLink,
  backgroundImage,
  backgroundVideoUrl,
  id,
}) => {
  if (visible === false) return null
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink
  const image =
    backgroundImage && typeof backgroundImage === 'object' ? (backgroundImage as MediaType) : null

  return (
    <section
      id={id ?? undefined}
      className="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-ff-near-black"
    >
      {/* Background: video when set, otherwise the photo */}
      {backgroundVideoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster={image?.url ?? undefined}
        >
          <source src={backgroundVideoUrl} type="video/mp4" />
        </video>
      ) : image ? (
        // Own positioned layer — Media's wrapper is always `relative`
        <div className="absolute inset-0">
          <Media
            resource={image}
            fill
            size="100vw"
            imgClassName="object-cover object-[50%_40%]"
          />
        </div>
      ) : null}

      {/* Readability: dark from the bottom left, the photo stays visible top right */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/10 lg:from-black/85 lg:via-black/35"
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-linear-to-r from-black/55 via-black/10 to-transparent lg:block"
      />

      {/* Content */}
      <FadeIn className="container relative z-10 mx-auto w-full container-padding pb-16 pt-32 md:pb-20 lg:pb-24">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.08em] text-ff-gold md:text-sm">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="whitespace-pre-line font-display text-[clamp(2.25rem,5.5vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ff-ivory">
            {resolvedHeading}
          </h2>
          <p className="mb-0 mt-5 max-w-xl whitespace-pre-line text-base leading-relaxed text-ff-ivory/85 md:text-lg">
            {resolvedDescription}
          </p>
          <Link
            href={resolvedButtonLink}
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ff-ivory py-2.5 pl-5 pr-2.5 font-display text-sm font-bold text-ff-near-black transition-colors hover:bg-white md:text-base"
          >
            {resolvedButtonLabel}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ff-near-black text-ff-ivory transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>
        </div>
      </FadeIn>
    </section>
  )
}
