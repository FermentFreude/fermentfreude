import { FadeIn } from '@/components/FadeIn'
import { LazyVideo } from '@/components/LazyVideo'
import { Media } from '@/components/Media'
import { PointsRow } from '@/components/PointsRow'
import type { HeroBannerBlock as HeroBannerBlockType, Media as MediaType } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
 *  HERO BANNER — two layouts (admin: "Picture / video position"):
 *   side        black section: text on the left (gold label, big ivory
 *               heading, short text, brand pill button), the photo (or
 *               video) on the right with rounded corners. Phone/tablet:
 *               text first (centred), then the photo.
 *   background  cinematic: the video (or photo) fills the whole section,
 *               the text sits bottom left on a dark shade.
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
  mediaLayout,
  points,
  id,
}) => {
  if (visible === false) return null
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink
  const image =
    backgroundImage && typeof backgroundImage === 'object' ? (backgroundImage as MediaType) : null

  const text = (
    <>
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
    </>
  )

  // What we offer: the site's points row (icon, title, one quiet line)
  const offer = points?.length ? (
    <div className="mt-12 lg:mt-16">
      <PointsRow items={points} tone="light" align="center" alignLg="center" phone="list" />
    </div>
  ) : null

  const media = backgroundVideoUrl ? (
    <LazyVideo
      src={backgroundVideoUrl}
      poster={image?.url ?? undefined}
      className="absolute inset-0 h-full w-full object-cover"
    />
  ) : image ? (
    <div className="absolute inset-0">
      <Media
        resource={image}
        fill
        size={mediaLayout === 'background' ? '100vw' : '(min-width: 1024px) 50vw, 100vw'}
        imgClassName="object-cover object-[60%_40%]"
      />
    </div>
  ) : null

  if (mediaLayout === 'background') {
    return (
      <section
        id={id ?? undefined}
        className="relative isolate flex min-h-svh w-full items-end overflow-hidden bg-ff-near-black"
      >
        <div aria-hidden className="absolute inset-0 -z-10">
          {media}
          {/* Cinematic shade: dark at the bottom where the text sits, light at the top */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/10" />
          <div className="absolute inset-0 hidden bg-linear-to-r from-black/55 via-black/10 to-transparent lg:block" />
          {/* Phone/tablet: the text sits higher up, so the whole picture is a bit darker */}
          <div className="absolute inset-0 bg-black/40 lg:hidden" />
        </div>
        <div className="container mx-auto container-padding w-full pb-16 pt-32 md:pb-20 lg:pb-24">
          <FadeIn className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
            {text}
          </FadeIn>
          {offer ? <FadeIn className="lg:max-w-5xl">{offer}</FadeIn> : null}
        </div>
      </section>
    )
  }

  return (
    <section id={id ?? undefined} className="w-full bg-ff-near-black py-16 md:py-20 lg:py-24">
      <div className="container mx-auto container-padding grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        {/* Text — left on desktop, first on phone/tablet (centred there) */}
        <FadeIn className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          {text}
          {offer}
        </FadeIn>

        {/* Photo (or video) — right on desktop, below the text on phone/tablet */}
        <FadeIn // Desktop: as tall as fits the screen (never cut), phone/tablet: fixed ratio
          className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-ff-charcoal sm:aspect-4/3 md:rounded-3xl lg:aspect-auto lg:h-[min(calc(100svh-12rem),44rem)]"
        >
          {media}
        </FadeIn>
      </div>
    </section>
  )
}
