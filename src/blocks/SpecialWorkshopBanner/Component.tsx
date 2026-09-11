import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, SpecialWorkshopBannerBlock as BlockType } from '@/payload-types'

import '../ShopHero/shop-hero.css'

type Props = BlockType & { id?: string }

function isMedia(val: unknown): val is Media {
  return typeof val === 'object' && val !== null && 'url' in val
}

/** Falls back to an already-uploaded Vom Feld ins Glas photo when no image is set on the block. */
async function findFallbackImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Media | null> {
  const result = await payload.find({
    collection: 'media',
    where: { alt: { contains: 'feld-ins-glas-hero' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return (result.docs[0] as Media | undefined) ?? null
}

/**
 * Special Workshop Banner — home-page promo for partner/seasonal workshops
 * (e.g. Vom Feld ins Glas), in the same full-bleed visual language as the
 * Shop Hero / Product Hero Slider.
 */
export const SpecialWorkshopBannerBlock: React.FC<Props> = async (props) => {
  if (props.visible === false) return null

  const locale = (await getLocale()) as 'de' | 'en'
  const payload = await getPayload({ config: configPromise })

  const eyebrow = props.eyebrow?.trim()
  const title = props.title?.trim()
  const subtitle = props.subtitle?.trim()
  const priceLabel = props.priceLabel?.trim()
  const ctaLabel = props.ctaLabel?.trim() || (locale === 'de' ? 'Mehr erfahren' : 'Learn more')
  const ctaLink = props.ctaLink?.trim() || '/workshops'

  if (!title) return null

  const cmsImage = isMedia(props.image) ? props.image : null
  const fallbackImage = cmsImage ? null : await findFallbackImage(payload)
  const resolvedImage = cmsImage ?? fallbackImage
  const imageSrc = resolvedImage?.url?.trim()
  const imageAlt = resolvedImage?.alt?.trim() || title

  const partnerLogo = isMedia(props.partnerLogo) ? props.partnerLogo : null
  const partnerLogoSrc = partnerLogo?.url?.trim()
  const partnerLogoAlt = partnerLogo?.alt?.trim() || 'Partner logo'

  return (
    <section className="special-workshop-banner relative w-full overflow-hidden bg-ff-near-black">
      <div className="relative min-h-[60vh] md:min-h-[70vh]">
        <div className="absolute inset-0">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover object-[50%_60%]"
              unoptimized={imageSrc.startsWith('http')}
            />
          ) : (
            <div className="absolute inset-0 bg-[#ECE5DE]" />
          )}
        </div>

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(18,16,15,0.72) 0%, rgba(18,16,15,0.38) 45%, rgba(18,16,15,0.18) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(18,16,15,0.25) 45%, rgba(18,16,15,0.78) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-10 pb-10 md:pb-14">
          <div className="container mx-auto container-padding">
            <div className="flex w-full max-w-xl flex-col items-start text-left">
              {eyebrow && (
                <p className="shop-hero-copy mb-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-ff-gold">
                  {eyebrow}
                </p>
              )}
              <h2 className="shop-hero-copy mb-4 font-display font-bold text-hero text-white tracking-tight leading-[1.08]">
                {title}
              </h2>
              {subtitle && (
                <p className="shop-hero-copy mb-4 max-w-md text-body-lg text-white/90 leading-relaxed">
                  {subtitle}
                </p>
              )}
              {partnerLogoSrc && (
                <Image
                  src={partnerLogoSrc}
                  alt={partnerLogoAlt}
                  width={160}
                  height={104}
                  className="mb-4 h-12 w-auto object-contain md:h-14"
                  unoptimized={partnerLogoSrc.startsWith('http')}
                />
              )}

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={ctaLink}
                  className="inline-flex w-fit items-center justify-center rounded-full bg-ff-charcoal px-7 py-3 font-display text-base font-bold text-ff-ivory transition-colors hover:bg-ff-charcoal-hover"
                >
                  {ctaLabel}
                </Link>
                {priceLabel && (
                  <span className="shop-hero-copy font-display text-lg font-bold text-white">
                    {priceLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
