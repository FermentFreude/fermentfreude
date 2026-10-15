import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { HeroBannerBlock as HeroBannerBlockType, Media as MediaType } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
 *  HERO BANNER — black section: text on the left (gold label, big ivory
 *  heading, short text, brand pill button), the photo (or video) on the
 *  right with rounded corners. Phone/tablet: text first (centred), then
 *  the photo.
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
    <section id={id ?? undefined} className="w-full bg-ff-near-black py-16 md:py-20 lg:py-24">
      <div className="container mx-auto container-padding grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        {/* Text — left on desktop, first on phone/tablet (centred there) */}
        <FadeIn className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          {eyebrow ? (
            <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.08em] text-ff-gold md:text-sm">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="whitespace-pre-line font-display text-[clamp(1.75rem,8.4vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ff-ivory lg:text-[clamp(2.25rem,4.2vw,4rem)]">
            {resolvedHeading}
          </h2>
          <p className="mx-auto mb-0 mt-5 max-w-lg whitespace-pre-line text-base leading-relaxed text-ff-ivory/80 md:text-lg lg:mx-0">
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
        </FadeIn>

        {/* Photo (or video) — right on desktop, below the text on phone/tablet */}
        <FadeIn // Desktop: as tall as fits the screen (never cut), phone/tablet: fixed ratio
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ff-charcoal sm:aspect-[4/3] md:rounded-3xl lg:aspect-auto lg:h-[min(calc(100svh-12rem),44rem)]"
        >
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
            <div className="absolute inset-0">
              <Media
                resource={image}
                fill
                size="(min-width: 1024px) 50vw, 100vw"
                imgClassName="object-cover object-[60%_40%]"
              />
            </div>
          ) : null}
        </FadeIn>
      </div>
    </section>
  )
}
