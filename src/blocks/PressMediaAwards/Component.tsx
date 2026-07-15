'use client'

import { Media } from '@/components/Media'
import { FadeIn } from '@/components/FadeIn'
import type { Media as MediaType, PressMediaAwardsBlock as PressMediaAwardsBlockType } from '@/payload-types'
import { useLocale, type Locale } from '@/providers/Locale'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type ItemType = 'press' | 'tv' | 'award' | 'expert' | 'origin'

type TitleHighlightColor = 'gold' | 'near-black' | 'olive'

const TITLE_HIGHLIGHT_COLORS: Record<TitleHighlightColor, string> = {
  gold: 'text-ff-gold-accent-dark',
  'near-black': 'text-ff-near-black',
  olive: 'text-ff-olive',
}

function PressCardTitle({
  title,
  titleHighlight,
  titleHighlightColor,
  featured,
}: {
  title?: string | null
  titleHighlight?: string | null
  titleHighlightColor?: string | null
  featured: boolean
}) {
  const highlight = titleHighlight?.trim()
  const heading = title?.trim()
  if (!heading && !highlight) return null

  const colorKey = (titleHighlightColor ?? 'gold') as TitleHighlightColor
  const highlightClass = TITLE_HIGHLIGHT_COLORS[colorKey] ?? TITLE_HIGHLIGHT_COLORS.gold
  const headingClass = `break-words font-display font-bold text-ff-near-black ${
    featured ? 'text-subheading line-clamp-3' : 'text-section-heading'
  }`

  if (!highlight) {
    return <h2 className={`mt-3 ${headingClass}`}>{heading}</h2>
  }

  return (
    <h2 className={`mt-3 ${headingClass}`}>
      <span className={`block ${highlightClass}`}>{highlight}</span>
      {heading ? <span className="mt-1 block text-ff-near-black">{heading}</span> : null}
    </h2>
  )
}

const DEFAULTS: Record<
  Locale,
  {
    moreCoverageHeading: string
    secondaryLinksPrefix: string
    typeLabels: Record<ItemType, string>
    ctaByType: Record<ItemType, string>
    ctaFallback: string
    footer: {
      eyebrow: string
      heading: string
      description: string
      primary: { label: string; href: string }
      secondary: { label: string; href: string }
    }
  }
> = {
  de: {
    moreCoverageHeading: 'Weitere Erwähnungen',
    secondaryLinksPrefix: 'Weitere Berichte:',
    typeLabels: {
      press: 'Presse',
      tv: 'TV',
      award: 'Auszeichnung',
      expert: 'Fachauftritt',
      origin: 'Unsere Anfänge',
    },
    ctaByType: {
      press: 'Originalartikel lesen',
      tv: 'TV-Beitrag ansehen',
      award: 'Bericht lesen',
      expert: 'Rückblick ansehen',
      origin: 'Originalartikel lesen',
    },
    ctaFallback: 'Mehr erfahren',
    footer: {
      eyebrow: 'Mehr entdecken',
      heading: 'Fermentation erleben und auf die Speisekarte bringen',
      description:
        'In unseren Workshops und Fermentationsevents vermitteln wir fundiertes Wissen praxisnah und genussvoll.\n\nFür die Gastronomie entwickeln und produzieren wir Käferbohnen-Tempeh und weitere fermentierte Lebensmittel aus regionalen Rohstoffen.',
      primary: { label: 'Workshops entdecken', href: '/workshops' },
      secondary: { label: 'B2B & Kooperationen', href: '/gastronomy' },
    },
  },
  en: {
    moreCoverageHeading: 'More coverage',
    secondaryLinksPrefix: 'More coverage:',
    typeLabels: {
      press: 'Press',
      tv: 'TV',
      award: 'Award',
      expert: 'Expert appearance',
      origin: 'Our beginnings',
    },
    ctaByType: {
      press: 'Read the article',
      tv: 'Watch the feature',
      award: 'Read the report',
      expert: 'View recap',
      origin: 'Read the article',
    },
    ctaFallback: 'Learn more',
    footer: {
      eyebrow: 'Discover more',
      heading: 'Experience fermentation and bring it to the menu',
      description:
        'Join our workshops and fermentation events for hands-on learning.\n\nFor gastronomy we develop and produce field-bean tempeh and other fermented foods from regional ingredients.',
      primary: { label: 'Explore workshops', href: '/workshops' },
      secondary: { label: 'B2B & partnerships', href: '/gastronomy' },
    },
  },
}

const BTN_PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-ff-near-black px-6 py-2.5 font-display text-base font-bold leading-none text-white transition-all hover:scale-[1.03] hover:bg-transparent hover:text-ff-near-black hover:shadow-[inset_0_0_0_2px_var(--ff-near-black)] active:scale-[0.97] whitespace-nowrap'

function PressCtaLink({
  href,
  label,
  className = '',
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BTN_PRIMARY} w-fit ${className}`}
    >
      <span className="inline-flex -translate-y-px items-center gap-1.5">
        {label}
        <ExternalLink className="block size-4 shrink-0" aria-hidden />
      </span>
    </a>
  )
}

const BTN_SECONDARY =
  'inline-flex items-center justify-center rounded-full border-2 border-ff-near-black bg-transparent px-6 py-2.5 font-display text-base font-bold leading-none text-ff-near-black transition-all hover:scale-[1.03] hover:bg-ff-near-black hover:text-white active:scale-[0.97] whitespace-nowrap w-fit'

type PressItem = NonNullable<PressMediaAwardsBlockType['items']>[number]

type MarqueeOutlet = {
  outlet: string
  logo?: MediaType
}

function isResolvedMedia(value: unknown): value is MediaType {
  return typeof value === 'object' && value !== null && 'url' in value
}

function buildMarqueeOutlets(items: PressItem[]): MarqueeOutlet[] {
  const map = new Map<string, MarqueeOutlet>()

  for (const item of items) {
    const outlet = item.outlet?.trim()
    if (!outlet) continue

    const logo = isResolvedMedia(item.logo) ? item.logo : undefined
    const existing = map.get(outlet)

    if (!existing || (!existing.logo && logo)) {
      map.set(outlet, { outlet, logo })
    }
  }

  return [...map.values()]
}

type Props = PressMediaAwardsBlockType & { id?: string; locale?: Locale }

function resolveTypeLabel(
  itemType: ItemType,
  typeLabels: PressMediaAwardsBlockType['typeLabels'],
  locale: Locale,
): string {
  const fromCms = typeLabels?.[itemType]?.trim()
  if (fromCms) return fromCms
  return DEFAULTS[locale].typeLabels[itemType] ?? itemType
}

export const PressMediaAwardsBlock: React.FC<Props> = ({
  visible,
  items,
  moreCoverageHeading,
  secondaryLinksPrefix,
  typeLabels,
  footerCta,
  id,
  locale: localeProp,
}) => {
  const { locale: clientLocale } = useLocale()
  const locale = localeProp ?? clientLocale
  const defaults = DEFAULTS[locale]

  if (visible === false) return null

  const resolvedItems = items ?? []
  const resolvedMoreCoverageHeading =
    moreCoverageHeading?.trim() || defaults.moreCoverageHeading
  const resolvedSecondaryLinksPrefix =
    secondaryLinksPrefix?.trim() || defaults.secondaryLinksPrefix
  const marqueeOutlets = buildMarqueeOutlets(resolvedItems)
  const featuredItems = resolvedItems.filter((item) => item.featured)
  const regularItems = resolvedItems.filter((item) => !item.featured)

  return (
    <>
      <PressOutletMarquee outlets={marqueeOutlets} />

      {resolvedItems.length > 0 ? (
        <section id={id ?? undefined} className="block-press-media-awards section-padding-md bg-[#F8F8F8]">
          <div className="container mx-auto container-padding">
            {featuredItems.length > 0 ? (
              <div className="content-wide mx-auto">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
                  {featuredItems.map((item, index) => (
                    <PressCard
                      key={item.id ?? `featured-${index}`}
                      item={item}
                      index={index}
                      locale={locale}
                      layout="featured"
                      typeLabels={typeLabels}
                      secondaryLinksPrefix={resolvedSecondaryLinksPrefix}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {regularItems.length > 0 ? (
              <div
                className={`content-medium mx-auto ${
                  featuredItems.length > 0
                    ? 'mt-10 border-t border-ff-border-light pt-10 md:mt-12 md:pt-12'
                    : ''
                }`}
              >
                {featuredItems.length > 0 ? (
                  <FadeIn delay={80} duration={0.95}>
                    <h2 className="text-subheading mb-8 font-display font-bold text-ff-near-black md:mb-10">
                      {resolvedMoreCoverageHeading}
                    </h2>
                  </FadeIn>
                ) : null}

                <div className="flex flex-col gap-20 md:gap-24">
                  {regularItems.map((item, index) => (
                    <PressCard
                      key={item.id ?? index}
                      item={item}
                      index={featuredItems.length + index}
                      locale={locale}
                      layout="full"
                      typeLabels={typeLabels}
                      secondaryLinksPrefix={resolvedSecondaryLinksPrefix}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {footerCta?.enabled !== false ? (
        <PressFooterCta footerCta={footerCta} locale={locale} />
      ) : null}
    </>
  )
}

function PressOutletMarquee({ outlets }: { outlets: MarqueeOutlet[] }) {
  const marqueeOutlets = outlets.length > 1 ? [...outlets, ...outlets] : outlets
  if (marqueeOutlets.length === 0) return null

  return (
    <FadeIn delay={0} duration={0.9}>
      <div className="border-y border-white/10 bg-ff-charcoal">
        <div className="overflow-hidden py-4">
          <div
            className={`flex w-max items-center gap-12 ${
              marqueeOutlets.length > 2 ? 'press-outlet-marquee' : 'mx-auto justify-center px-6'
            }`}
          >
            {marqueeOutlets.map((entry, index) => (
              <MarqueeItem key={`${entry.outlet}-${index}`} entry={entry} />
            ))}
          </div>
        </div>

        <style jsx>{`
          .press-outlet-marquee {
            animation: press-outlet-marquee 32s linear infinite;
          }

          @keyframes press-outlet-marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .press-outlet-marquee {
              animation: none;
            }
          }
        `}</style>
      </div>
    </FadeIn>
  )
}

function MarqueeItem({ entry }: { entry: MarqueeOutlet }) {
  const label = entry.outlet?.trim()
  if (!label) return null

  return (
    <span className="inline-flex shrink-0 items-center gap-3">
      <span className="h-1 w-1 rounded-full bg-ff-gold-accent" aria-hidden />
      <span className="font-display text-body-sm font-semibold uppercase tracking-[0.22em] text-white/45 transition-colors duration-300 hover:text-white/80">
        {label}
      </span>
    </span>
  )
}

function PressOutletMark({
  outlet,
  logo,
  variant = 'masthead',
}: {
  outlet?: string | null
  logo?: unknown
  variant?: 'masthead' | 'marquee'
}) {
  const [logoFailed, setLogoFailed] = useState(false)
  const label = outlet?.trim()
  const resolvedLogo = isResolvedMedia(logo) ? logo : null
  const logoUrl = typeof resolvedLogo?.url === 'string' ? resolvedLogo.url : null
  const showLogo = Boolean(logoUrl) && !logoFailed

  if (showLogo && logoUrl) {
    const imgClassName =
      variant === 'marquee'
        ? 'h-6 w-auto max-w-[9rem] object-contain object-left brightness-0 invert opacity-45 transition-opacity duration-300 hover:opacity-75'
        : 'h-8 w-auto max-w-[12rem] object-contain object-left sm:h-9 sm:max-w-[13rem]'

    return (
      // Native img — SVG mastheads load reliably; fall back to outlet text on error.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        width={variant === 'marquee' ? 144 : 200}
        height={variant === 'marquee' ? 28 : 40}
        onError={() => setLogoFailed(true)}
        onLoad={(event) => {
          const img = event.currentTarget
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            setLogoFailed(true)
          }
        }}
        className={imgClassName}
      />
    )
  }

  if (!label) return null

  if (variant === 'marquee') {
    return (
      <span className="font-display text-body-sm font-semibold uppercase tracking-[0.22em] text-white/45 transition-colors duration-300 hover:text-white/80">
        {label}
      </span>
    )
  }

  return (
    <span className="font-display text-body-sm font-bold tracking-tight text-ff-near-black sm:text-body">
      {label}
    </span>
  )
}

function getImageCrop(
  type?: string | null,
  crop?: string | null,
): { wrapperScale: string; position: string } {
  switch (crop) {
    case 'top':
      return { wrapperScale: 'scale-[1.34] origin-top', position: 'object-top' }
    case 'center':
      return { wrapperScale: 'scale-[1.38] origin-center', position: 'object-[50%_32%]' }
    case 'upper-center':
      return { wrapperScale: 'scale-[1.32] origin-top', position: 'object-[50%_22%]' }
    default:
      break
  }

  switch (type) {
    case 'tv':
      return { wrapperScale: 'scale-[1.38] origin-center', position: 'object-[50%_32%]' }
    case 'press':
    case 'origin':
      return { wrapperScale: 'scale-[1.34] origin-top', position: 'object-top' }
    default:
      return { wrapperScale: 'scale-[1.3] origin-top', position: 'object-top' }
  }
}

function PressMediaFrame({
  image,
  logo,
  outlet,
  type,
  imageCrop,
}: {
  image?: unknown
  logo?: unknown
  outlet?: string | null
  type?: string | null
  imageCrop?: string | null
}) {
  const hasImage = isResolvedMedia(image)
  const crop = getImageCrop(type, imageCrop)
  const showMasthead = Boolean(isResolvedMedia(logo) || outlet?.trim())

  return (
    <div className="shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-ff-border-light/80">
      {showMasthead ? (
        <div className="flex h-14 items-center border-b border-ff-border-light/70 bg-[#FAFAFA] px-4 sm:px-5">
          <PressOutletMark outlet={outlet} logo={logo} variant="masthead" />
        </div>
      ) : null}

      <div className="relative aspect-[16/10] overflow-hidden bg-[#ECE5DE]">
        {hasImage ? (
          <div className="absolute inset-0 overflow-hidden transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <div className={`absolute inset-0 ${crop.wrapperScale}`}>
              <Media
                resource={image as MediaType}
                fill
                imgClassName={`object-cover ${crop.position}`}
                className="absolute inset-0"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function PressCard({
  item,
  index,
  locale,
  layout = 'full',
  typeLabels,
  secondaryLinksPrefix,
}: {
  item: PressItem
  index: number
  locale: Locale
  layout?: 'featured' | 'full'
  typeLabels?: PressMediaAwardsBlockType['typeLabels']
  secondaryLinksPrefix: string
}) {
  const defaults = DEFAULTS[locale]
  const itemType = (item.type ?? 'press') as ItemType
  const typeLabel = resolveTypeLabel(itemType, typeLabels, locale)
  const hasUrl = Boolean(item.url?.trim())
  const ctaLabel =
    item.ctaLabel?.trim() || defaults.ctaByType[itemType] || defaults.ctaFallback
  const secondaryLinks = item.secondaryLinks ?? []
  const isFeatured = layout === 'featured'

  return (
    <FadeIn delay={120 + index * 90} duration={1.05} from="bottom">
      <article className={`group relative ${isFeatured ? '' : 'md:pl-2.5'}`}>
        {!isFeatured ? (
          <div
            className="absolute left-0 top-8 hidden h-14 w-1 rounded-full bg-ff-gold-accent transition-all duration-500 group-hover:h-[4.5rem] md:block"
            aria-hidden
          />
        ) : null}

        <div
          className={`rounded-2xl border border-ff-border-light bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${
            isFeatured ? 'flex h-full flex-col p-5 md:p-6' : 'p-6 md:p-8'
          }`}
        >
          <PressMediaFrame
            image={item.image}
            logo={item.logo}
            outlet={item.outlet}
            type={item.type}
            imageCrop={item.imageCrop}
          />

          {!isFeatured && item.imageCredit ? (
            <p className="mt-2 font-sans text-caption text-ff-gray-15">{item.imageCredit}</p>
          ) : null}

          <p className={`font-sans text-body-sm text-ff-gray-15 ${isFeatured ? 'mt-4' : 'mt-5'}`}>
            {[typeLabel, item.dateLabel].filter(Boolean).join(' · ')}
          </p>

          <PressCardTitle
            title={item.title}
            titleHighlight={item.titleHighlight}
            titleHighlightColor={item.titleHighlightColor}
            featured={isFeatured}
          />

          {item.description ? (
            <p
              className={`mt-4 break-words font-sans leading-relaxed whitespace-pre-line text-ff-gray-15 ${
                isFeatured ? 'text-body' : 'text-body-lg'
              }`}
            >
              {item.description}
            </p>
          ) : null}

          {hasUrl ? (
            <PressCtaLink
              href={item.url!}
              label={ctaLabel}
              className={isFeatured ? 'mt-auto shrink-0 pt-5' : 'mt-6 shrink-0'}
            />
          ) : null}

          {!isFeatured && secondaryLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 font-sans text-body-sm text-ff-gray-15">
              <span className="font-medium text-ff-near-black">{secondaryLinksPrefix}</span>
              {secondaryLinks.map((link, linkIndex) =>
                link.url ? (
                  <span key={link.id ?? linkIndex} className="inline-flex items-center gap-1">
                    {linkIndex > 0 ? <span aria-hidden>·</span> : null}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-ff-gold-accent-dark transition-colors hover:text-ff-near-black hover:underline"
                    >
                      {link.label}
                    </a>
                  </span>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
      </article>
    </FadeIn>
  )
}

function PressFooterCta({
  footerCta,
  locale,
}: {
  footerCta: PressMediaAwardsBlockType['footerCta']
  locale: Locale
}) {
  const defaults = DEFAULTS[locale].footer
  const heading = footerCta?.heading ?? defaults.heading
  const description = footerCta?.description ?? defaults.description
  const eyebrow = footerCta?.eyebrow?.trim() || defaults.eyebrow
  const primary = {
    label: footerCta?.primaryButton?.label ?? defaults.primary.label,
    href: footerCta?.primaryButton?.href ?? defaults.primary.href,
  }
  const secondary = {
    label: footerCta?.secondaryButton?.label ?? defaults.secondary.label,
    href: footerCta?.secondaryButton?.href ?? defaults.secondary.href,
  }

  return (
    <section className="section-padding-md bg-[#F8F8F8] pt-0">
      <div className="container mx-auto container-padding">
        <FadeIn delay={80} duration={1.05} from="bottom">
          <div className="content-medium relative mx-auto md:pl-2.5">
            <div
              className="absolute left-0 top-8 hidden h-14 w-1 rounded-full bg-ff-gold-accent md:block"
              aria-hidden
            />

            <div className="rounded-2xl border border-ff-border-light bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-8 lg:p-10">
              <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center md:gap-10 lg:gap-12">
                <div>
                  <span className="text-eyebrow font-display font-semibold tracking-[0.2em] text-ff-gold-accent-dark">
                    {eyebrow}
                  </span>
                  <h2 className="text-subheading mt-3 font-display font-bold leading-snug text-ff-near-black">
                    {heading}
                  </h2>
                  <div className="mt-4 h-1 w-12 rounded-full bg-ff-gold-accent" aria-hidden />
                  <p className="mt-5 whitespace-pre-line font-sans text-body-lg leading-relaxed text-ff-gray-15">
                    {description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                  <Link href={primary.href ?? '/workshops'} className={`${BTN_PRIMARY} w-fit`}>
                    {primary.label}
                  </Link>
                  <Link href={secondary.href ?? '/gastronomy'} className={BTN_SECONDARY}>
                    {secondary.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
