import { cmsLocaleQuery, cmsTextLocalized } from '@/utilities/cmsLocale'
import { getLocale } from '@/utilities/getLocale'
import { isProductSoldOut } from '@/utilities/productStock'
import configPromise from '@payload-config'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Product, ShopHeroBlock } from '@/payload-types'

import { ShopHeroActions } from './ShopHeroActions'
import './shop-hero.css'

/** Fallback plated Käfer hero — used when CMS heroImage is empty */
const HERO_BG_FALLBACK = '/shop/hero-kaefer.webp'

const DEFAULTS = {
  en: {
    ctaLabel: 'Order now',
    pickup: 'Pickup in Graz, fresh every week',
    title: 'Runner Bean Tempeh',
    unit: '185g fresh pack',
    blurb: 'Our signature tempeh from Austrian runner beans, handmade in Graz.',
    soldOut: 'Sold out',
    signatureBrand: 'FermentFreude',
    signature: 'Signature',
    signatureSubtitle: 'Handmade in Graz',
    signatureAria: 'Signature product',
    priceLabel: 'Price',
    addToCart: 'Add to cart',
    details: 'Product details',
    viewDetails: 'View details',
  },
  de: {
    ctaLabel: 'Jetzt bestellen',
    pickup: 'Abholung in Graz, jede Woche frisch',
    title: 'Käferbohnen-Tempeh',
    unit: '185g Frischpackung',
    blurb: 'Unser Signature-Tempeh aus österreichischen Käferbohnen, handgemacht in Graz.',
    soldOut: 'Ausverkauft',
    signatureBrand: 'FermentFreude',
    signature: 'Signature',
    signatureSubtitle: 'Handgemacht in Graz',
    signatureAria: 'Signature-Produkt',
    priceLabel: 'Preis',
    addToCart: 'In den Warenkorb',
    details: 'Produktdetails',
    viewDetails: 'Details ansehen',
  },
} as const

function isMedia(val: unknown): val is Media {
  return typeof val === 'object' && val !== null && 'url' in val
}

async function loadKafer(
  payload: Awaited<ReturnType<typeof getPayload>>,
  locale: 'de' | 'en',
  heroRef?: ShopHeroBlock['heroProduct'],
): Promise<Product | null> {
  const bySlug = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'kaeferbohnen-tempeh' } },
    ...cmsLocaleQuery(locale),
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  if (bySlug.docs[0]) return bySlug.docs[0] as Product

  if (heroRef) {
    const id = typeof heroRef === 'object' && heroRef !== null ? heroRef.id : heroRef
    try {
      return (await payload.findByID({
        collection: 'products',
        id: String(id),
        ...cmsLocaleQuery(locale),
        depth: 1,
        overrideAccess: true,
      })) as Product
    } catch {
      return null
    }
  }
  return null
}

/**
 * Shop hero — photo as full background, copy left.
 * Product fields + heroImage + pickup lines come from CMS.
 */
export const ShopHeroComponent: React.FC<ShopHeroBlock> = async (props) => {
  if (props.visible === false) return null

  const locale = (await getLocale()) as 'de' | 'en'
  const d = DEFAULTS[locale === 'de' ? 'de' : 'en']
  const payload = await getPayload({ config: configPromise })
  const product = await loadKafer(payload, locale, props.heroProduct)

  const ctaLabel = cmsTextLocalized(props.ctaPrimaryLabel, locale, DEFAULTS.en.ctaLabel, DEFAULTS.de.ctaLabel)
  const pickup = cmsTextLocalized(props.bottomSubtitle, locale, DEFAULTS.en.pickup, DEFAULTS.de.pickup)
  const badge = props.signatureBadge
  const showSignatureBadge =
    (badge?.show ?? props.showSignatureBadge) !== false
  const soldOutLabel = cmsTextLocalized(props.soldOutLabel, locale, DEFAULTS.en.soldOut, DEFAULTS.de.soldOut)
  const signatureBrand = cmsTextLocalized(
    badge?.brand ?? props.signatureBrand,
    locale,
    DEFAULTS.en.signatureBrand,
    DEFAULTS.de.signatureBrand,
  )
  const signatureLabel = cmsTextLocalized(
    badge?.title ?? props.signatureLabel,
    locale,
    DEFAULTS.en.signature,
    DEFAULTS.de.signature,
  )
  const signatureSubtitle = cmsTextLocalized(
    badge?.subtitle ?? props.signatureSubtitle,
    locale,
    DEFAULTS.en.signatureSubtitle,
    DEFAULTS.de.signatureSubtitle,
  )
  const priceLabel = cmsTextLocalized(props.priceLabel, locale, DEFAULTS.en.priceLabel, DEFAULTS.de.priceLabel)
  const addToCartLabel = cmsTextLocalized(
    props.addToCartLabel,
    locale,
    DEFAULTS.en.addToCart,
    DEFAULTS.de.addToCart,
  )
  const detailsLabel = cmsTextLocalized(props.detailsLabel, locale, DEFAULTS.en.details, DEFAULTS.de.details)
  const viewDetailsLabel = cmsTextLocalized(
    props.viewDetailsLabel,
    locale,
    DEFAULTS.en.viewDetails,
    DEFAULTS.de.viewDetails,
  )

  const title = product?.title?.trim() || d.title
  const unit = product?.unitSize?.trim() || d.unit
  const blurb = product?.shortDescription?.trim() || d.blurb
  const price = product?.priceInEUR
  const href =
    props.ctaPrimaryUrl?.trim() ||
    (product?.slug ? `/products/${product.slug}` : '/products/kaeferbohnen-tempeh')
  const soldOut = product ? isProductSoldOut(product) : false

  const cmsHero = isMedia(props.heroImage) ? props.heroImage : null
  const heroSrc = cmsHero?.url?.trim() || HERO_BG_FALLBACK
  const heroAlt = cmsHero?.alt?.trim() || title

  return (
    <section id="shop-hero" className="shop-hero relative w-full overflow-hidden bg-ff-near-black">
      <div className="relative min-h-[78vh] md:min-h-[85vh]">
        <div className="absolute inset-0">
          <Image
            src={heroSrc}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_75%] md:object-[48%_70%]"
            unoptimized={heroSrc.startsWith('http')}
          />
        </div>

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(18,16,15,0.7) 0%, rgba(18,16,15,0.35) 42%, rgba(18,16,15,0.2) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[28%] md:h-[24%]"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(18,16,15,0.25) 45%, rgba(18,16,15,0.78) 100%)',
          }}
        />

        <div className="absolute top-[calc(var(--header-height,5rem)+1rem)] right-[var(--space-container-x)] z-10 flex items-start gap-2">
          {soldOut && (
            <span className="rounded-full border border-white/35 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              {soldOutLabel}
            </span>
          )}
          {showSignatureBadge && (
          <div
            className="flex items-center gap-3 rounded-2xl border border-ff-gold/45 bg-ff-near-black/75 py-3 pl-4 pr-3 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-md"
            aria-label={d.signatureAria}
          >
            <div className="flex flex-col items-end leading-none text-right">
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.24em] text-ff-gold/90">
                {signatureBrand}
              </span>
              <span className="mt-1.5 font-display text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                {signatureLabel}
              </span>
              <span className="mt-1.5 text-[10px] font-medium text-white/65">{signatureSubtitle}</span>
            </div>
            <div
              className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-ff-gold/15"
              aria-hidden
            >
              <span className="absolute inset-[2px] rounded-full border border-ff-gold/75" />
              <span className="relative flex flex-col items-center leading-none">
                <span className="font-display text-[7px] font-bold uppercase tracking-wider text-ff-gold">
                  No
                </span>
                <span className="font-display text-sm font-extrabold tabular-nums text-ff-gold">
                  01
                </span>
              </span>
            </div>
          </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 pb-10 md:pb-14">
          <div className="container mx-auto container-padding">
            <div className="flex w-full max-w-xl flex-col items-start text-left">
              <p className="shop-hero-copy mb-2.5 text-caption font-medium text-white/85">{unit}</p>
              <h1 className="shop-hero-copy mb-4 font-display font-bold text-hero text-white tracking-tight leading-[1.08]">
                {title}
              </h1>
              <p className="shop-hero-copy mb-8 max-w-md text-body-lg text-white/90 leading-relaxed">
                {blurb}
              </p>

              <ShopHeroActions
                product={product}
                price={price}
                href={href}
                soldOut={soldOut}
                ctaLabel={ctaLabel}
                pickup={pickup}
                priceLabel={priceLabel}
                addToCartLabel={addToCartLabel}
                detailsLabel={detailsLabel}
                viewDetailsLabel={viewDetailsLabel}
                align="left"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
