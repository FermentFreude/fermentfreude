'use client'

import type { Media as MediaType, Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { FadeIn } from '@/components/FadeIn'
import { SHOP_GALLERY_FALLBACKS } from '@/data/shop-product-images'
import { gtmViewItem } from '@/lib/gtm'
import { ShopProductCardImage } from '@/components/product/ShopProductCardImage'
import { useLocale } from '@/providers/Locale'
import {
  formatEurPrice,
  getCategoryTitles,
  getProductTypeLabel,
  getSeasonalIngredientsNotice,
  getSeasonalNotice,
  type AppLocale,
} from '@/utilities/productDetailDisplay'
import {
  getFoodPdpContent,
} from '@/utilities/foodPdpContent'
import { cn } from '@/utilities/cn'
import { ChevronLeftIcon, Minus, Package, Plus, Scale, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense, useEffect, useMemo, useState } from 'react'

import {
  FoodPdpMobileBuyBar,
  FoodPdpRelatedStrip,
  FoodPdpSectionNav,
  FoodPdpShopFooter,
} from './food-pdp/FoodPdpExtras'
import { scrollToSection } from './food-pdp/scrollToSection'
import { FoodPdpSectionGroup } from './food-pdp/FoodPdpSectionGroup'
import {
  FoodPdpCategoryRow,
  FoodPdpGlanceGrid,
  FoodPdpHeroBadges,
  FoodPdpIngredientsPanel,
  FoodPdpStoragePanel,
  FoodPdpTasteStory,
  FoodPdpTrustPoints,
  FoodPdpUsageSteps,
} from './food-pdp/FoodPdpSections'
import { ShopProductHeroImage } from './ShopProductHeroImage'
import { StockIndicator } from './StockIndicator'
import { VariantSelector } from './VariantSelector'

const COPY: Record<AppLocale, Record<string, string>> = {
  de: {
    back: 'Zurück zum Shop',
    addToCart: 'In den Warenkorb',
    soldOut: 'Ausverkauft',
    seasonal: 'Saisonal',
    pickup: 'Abholung in Graz, jede Woche frisch.',
    glanceTitle: 'Auf einen Blick',
    weight: 'Gewicht',
    portion: 'Portion',
    origin: 'Herkunft',
    madeIn: 'Hergestellt',
    shelfLife: 'Haltbarkeit',
    bestBefore: 'Mindesthaltbarkeit',
    storage: 'Lagerung',
    afterOpening: 'Nach dem Öffnen',
    ingredients: 'Zutaten',
    allergens: 'Allergene',
    tasteSectionLabel: 'So schmeckt er',
    relatedTitle: 'Das könnte dir auch schmecken',
    shopFooterTitle: 'Mehr entdecken',
    shopFooterDesc:
      'Von Hand in Graz hergestellt: frische Fermente, voller Geschmack und voller Leben. Tempeh, Kimchi und weitere Spezialitäten aus unserer Manufaktur, jede Woche frisch zur Abholung.',
    shopFooterCta: 'Zum Shop',
    navDetails: 'Produktdetails',
    navTastePrep: 'Geschmack & Zubereitung',
    navStorage: 'Lagerung',
    groupDetails: 'Produktdetails',
    groupDetailsDesc: 'Alles Wichtige auf einen Blick, inklusive Zutaten und Allergene.',
    groupTaste: 'Geschmack & Zubereitung',
    groupTasteDesc: 'So schmeckt es und wie du es am besten genießt.',
    groupStorage: 'Lagerung & Haltbarkeit',
    groupStorageDesc: 'Damit es frisch und lecker bleibt.',
    ingredientsDisclaimer:
      'Die Zutatenliste kann sich ändern. Bitte entnehmen Sie die aktuellsten Angaben der Produktverpackung.',
  },
  en: {
    back: 'Back to shop',
    addToCart: 'Add to bag',
    soldOut: 'Sold out',
    seasonal: 'Seasonal',
    pickup: 'Pickup in Graz, fresh every week.',
    glanceTitle: 'At a glance',
    weight: 'Weight',
    portion: 'Portion',
    origin: 'Origin',
    madeIn: 'Made in',
    shelfLife: 'Shelf life',
    bestBefore: 'Best before',
    storage: 'Storage',
    afterOpening: 'After opening',
    ingredients: 'Ingredients',
    allergens: 'Allergens',
    tasteSectionLabel: 'How it tastes',
    relatedTitle: 'You might also like',
    shopFooterTitle: 'Discover more',
    shopFooterDesc:
      'Made by hand in Graz: fresh ferments, full of flavour and full of life. Tempeh, kimchi and more from our workshop, ready for pickup every week.',
    shopFooterCta: 'Visit the shop',
    navDetails: 'Product details',
    navTastePrep: 'Taste & preparation',
    navStorage: 'Storage',
    groupDetails: 'Product details',
    groupDetailsDesc: 'Everything at a glance, including ingredients and allergens.',
    groupTaste: 'Taste & preparation',
    groupTasteDesc: 'How it tastes and the best way to enjoy it.',
    groupStorage: 'Storage & shelf life',
    groupStorageDesc: 'Keep it fresh and delicious.',
    ingredientsDisclaimer:
      'This ingredient list is subject to change. Please refer to the product label for the most accurate information.',
  },
}

function hasRichTextContent(field: { root: { children: unknown[] } } | null | undefined): boolean {
  if (!field?.root?.children?.length) return false
  const first = field.root.children[0] as Record<string, unknown>
  if (
    field.root.children.length === 1 &&
    first?.type === 'paragraph' &&
    Array.isArray(first?.children) &&
    first.children.length === 0
  ) {
    return false
  }
  return true
}

type ProductDetailLabels = {
  backToShopLabel?: string | null
  addToCartLabel?: string | null
  soldOutLabel?: string | null
  seasonalBadgeLabel?: string | null
  deliveryNotice?: string | null
  navDetailsLabel?: string | null
  navTastePrepLabel?: string | null
  navStorageLabel?: string | null
  groupDetailsTitle?: string | null
  groupDetailsDescription?: string | null
  glanceTitle?: string | null
  weightLabel?: string | null
  portionLabel?: string | null
  originLabel?: string | null
  madeInLabel?: string | null
  ingredientsLabel?: string | null
  allergensLabel?: string | null
  ingredientsDisclaimer?: string | null
  groupTasteTitle?: string | null
  groupTasteDescription?: string | null
  tasteSectionLabel?: string | null
  tasteSectionLabelNeutral?: string | null
  groupStorageTitle?: string | null
  groupStorageDescription?: string | null
  storageShelfLifeLabel?: string | null
  shelfLifeLabel?: string | null
  bestBeforeLabel?: string | null
  instructionsBeforeUseLabel?: string | null
  relatedTitle?: string | null
  shopFooterTitle?: string | null
  shopFooterDescription?: string | null
  shopFooterCta?: string | null
}

function pickLabel(
  cms: string | null | undefined,
  fallback: string,
): string {
  const trimmed = cms?.trim()
  return trimmed || fallback
}

/**
 * Premium food PDP — editorial layout with icons, scroll animations, David's CMS data.
 */
export function ShopStyleProductDetail({
  product,
  productDetailLabels,
  relatedProducts = [],
}: {
  product: Product
  productDetailLabels?: ProductDetailLabels
  relatedProducts?: Product[]
}) {
  const { locale: rawLocale } = useLocale()
  const locale = (rawLocale === 'de' ? 'de' : 'en') as AppLocale
  const defaults = COPY[locale]
  const labels = productDetailLabels ?? {}
  const copy = {
    back: pickLabel(labels.backToShopLabel, defaults.back),
    addToCart: pickLabel(labels.addToCartLabel, defaults.addToCart),
    soldOut: pickLabel(labels.soldOutLabel, defaults.soldOut),
    seasonal: pickLabel(labels.seasonalBadgeLabel, defaults.seasonal),
    pickup: pickLabel(labels.deliveryNotice, defaults.pickup),
    glanceTitle: pickLabel(labels.glanceTitle, defaults.glanceTitle),
    weight: pickLabel(labels.weightLabel, defaults.weight),
    portion: pickLabel(labels.portionLabel, defaults.portion),
    origin: pickLabel(labels.originLabel, defaults.origin),
    madeIn: pickLabel(labels.madeInLabel, defaults.madeIn),
    shelfLife: pickLabel(labels.shelfLifeLabel, defaults.shelfLife),
    bestBefore: pickLabel(labels.bestBeforeLabel, defaults.bestBefore),
    storage: pickLabel(labels.storageShelfLifeLabel, defaults.storage),
    afterOpening: pickLabel(labels.instructionsBeforeUseLabel, defaults.afterOpening),
    ingredients: pickLabel(labels.ingredientsLabel, defaults.ingredients),
    allergens: pickLabel(labels.allergensLabel, defaults.allergens),
    tasteSectionLabel: pickLabel(labels.tasteSectionLabel, defaults.tasteSectionLabel),
    tasteSectionLabelNeutral: pickLabel(
      labels.tasteSectionLabelNeutral,
      locale === 'de' ? 'So schmeckt es' : defaults.tasteSectionLabel,
    ),
    relatedTitle: pickLabel(labels.relatedTitle, defaults.relatedTitle),
    shopFooterTitle: pickLabel(labels.shopFooterTitle, defaults.shopFooterTitle),
    shopFooterDesc: pickLabel(labels.shopFooterDescription, defaults.shopFooterDesc),
    shopFooterCta: pickLabel(labels.shopFooterCta, defaults.shopFooterCta),
    navDetails: pickLabel(labels.navDetailsLabel, defaults.navDetails),
    navTastePrep: pickLabel(labels.navTastePrepLabel, defaults.navTastePrep),
    navStorage: pickLabel(labels.navStorageLabel, defaults.navStorage),
    groupDetails: pickLabel(labels.groupDetailsTitle, defaults.groupDetails),
    groupDetailsDesc: pickLabel(labels.groupDetailsDescription, defaults.groupDetailsDesc),
    groupTaste: pickLabel(labels.groupTasteTitle, defaults.groupTaste),
    groupTasteDesc: pickLabel(labels.groupTasteDescription, defaults.groupTasteDesc),
    groupStorage: pickLabel(labels.groupStorageTitle, defaults.groupStorage),
    groupStorageDesc: pickLabel(labels.groupStorageDescription, defaults.groupStorageDesc),
    ingredientsDisclaimer: pickLabel(
      labels.ingredientsDisclaimer,
      defaults.ingredientsDisclaimer,
    ),
  }
  const pdp = getFoodPdpContent(product, locale)
  const categories = getCategoryTitles(product)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const gallery =
    product.gallery?.filter(
      (item): item is typeof item & { image: MediaType } =>
        typeof item.image === 'object' && item.image !== null,
    ) || []

  const galleryFallbacks = product.slug ? SHOP_GALLERY_FALLBACKS[product.slug] : undefined

  let amount = 0
  let lowestAmount = 0
  let highestAmount = 0
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const sorted = (product.variants?.docs || [])
      .filter((v): v is Variant => typeof v === 'object')
      .sort((a, b) => {
        const pa = a.priceInEUR
        const pb = b.priceInEUR
        return typeof pa === 'number' && typeof pb === 'number' ? pa - pb : 0
      })
    if (sorted.length) {
      const low = sorted[0].priceInEUR
      const high = sorted[sorted.length - 1].priceInEUR
      if (typeof low === 'number') lowestAmount = low
      if (typeof high === 'number') highestAmount = high
    }
  } else if (typeof product.priceInEUR === 'number') {
    amount = product.priceInEUR
  }

  const priceLabel =
    hasVariants && highestAmount !== lowestAmount
      ? `${formatEurPrice(lowestAmount, locale)} - ${formatEurPrice(highestAmount, locale)}`
      : formatEurPrice(amount || lowestAmount, locale)

  useEffect(() => {
    gtmViewItem({
      item_id: String(product.id),
      item_name: product.title ?? '',
      item_category: product.productType ?? undefined,
      price: amount || lowestAmount || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '').replace(/^tab=/, '').toLowerCase()
    if (!hash) return

    let targetId: string | null = null
    if (hash === 'inhaltsstoffe' || hash === 'ingredients' || hash === 'zutaten') {
      targetId = 'zutaten'
    } else if (hash === 'glance' || hash === 'produktdetails') {
      targetId = 'produktdetails'
    } else if (hash === 'geschmack' || hash === 'zubereitung') {
      targetId = hash === 'zubereitung' ? 'zubereitung' : 'geschmack'
    } else if (hash === 'lagerung') {
      targetId = 'lagerung'
    }

    if (!targetId) return

    const timer = window.setTimeout(() => scrollToSection(targetId), 150)
    return () => window.clearTimeout(timer)
  }, [])

  const isOutOfStock = !product.inventory || product.inventory === 0
  const pickupNotice = copy.pickup
  const categoryLabel = product.productType
    ? getProductTypeLabel(product.productType, locale)
    : null

  const glanceItems = useMemo(() => {
    const items: { key: string; label: string; value: string }[] = []
    if (product.weightGrams) {
      items.push({ key: 'weight', label: copy.weight, value: `${product.weightGrams} g` })
    }
    if (product.unitSize) {
      items.push({ key: 'portion', label: copy.portion, value: product.unitSize })
    }
    if (pdp.origin) {
      items.push({ key: 'origin', label: copy.origin, value: pdp.origin })
    }
    if (pdp.madeIn) {
      items.push({ key: 'madeIn', label: copy.madeIn, value: pdp.madeIn })
    }
    return items
  }, [copy, pdp.madeIn, pdp.origin, product.unitSize, product.weightGrams])

  const tasteSectionLabel =
    product.productType === 'jarred' ? copy.tasteSectionLabelNeutral : copy.tasteSectionLabel

  const sectionNav = useMemo(() => {
    const links: { id: string; label: string }[] = []
    const hasDetails =
      glanceItems.length > 0 || Boolean(product.ingredients) || Boolean(product.allergens)
    const hasTaste =
      Boolean(pdp.tasteHeadline) ||
      Boolean(pdp.storyIntro) ||
      pdp.flavorNotes.length > 0 ||
      Boolean(pdp.storyDetail) ||
      pdp.usageSteps.length > 0
    const hasStorage =
      Boolean(product.storageInstructions) ||
      Boolean(product.shelfLife) ||
      Boolean(product.bestBefore?.trim()) ||
      hasRichTextContent(product.userInstructions)

    if (hasDetails) links.push({ id: 'produktdetails', label: copy.navDetails })
    if (hasTaste) links.push({ id: 'geschmack', label: copy.navTastePrep })
    if (hasStorage) links.push({ id: 'lagerung', label: copy.navStorage })
    return links
  }, [copy, glanceItems.length, pdp, product])

  const hasDetailsSection =
    glanceItems.length > 0 || Boolean(product.ingredients) || Boolean(product.allergens)
  const hasTasteSection =
    Boolean(pdp.tasteHeadline) ||
    Boolean(pdp.storyIntro) ||
    pdp.flavorNotes.length > 0 ||
    Boolean(pdp.storyDetail) ||
    pdp.usageSteps.length > 0
  const hasStorageSection =
    Boolean(product.storageInstructions) ||
    Boolean(product.shelfLife) ||
    Boolean(product.bestBefore?.trim()) ||
    hasRichTextContent(product.userInstructions)

  return (
    <div className="min-h-screen bg-white font-sans pb-24 lg:pb-20">
      <div className="container mx-auto container-padding pb-20 pt-6 md:pt-8">
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center gap-1.5 text-body-sm text-ff-gray-text transition-colors hover:text-ff-near-black md:mb-12"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          {copy.back}
        </Link>

        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:items-start lg:gap-14">
          <FadeIn immediate delay={0} className="relative lg:sticky lg:top-24 lg:self-start">
              <div
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-ff-warm-gray/25 opacity-60 blur-2xl lg:-inset-6"
                aria-hidden
              />
              <div className="relative mx-auto aspect-square w-full max-w-[min(100%,22rem)] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ff-near-black/6 sm:max-w-sm lg:mx-0">
                {(isOutOfStock || product.isSeasonal) && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-caption font-medium uppercase tracking-wider text-ff-gray-text backdrop-blur-sm">
                    {isOutOfStock ? copy.soldOut : copy.seasonal}
                  </span>
                )}
                <ShopProductHeroImage
                  product={product}
                  image={gallery[selectedImageIndex]?.image as MediaType | undefined}
                  fallbackSrc={galleryFallbacks?.[selectedImageIndex]}
                />
              </div>

              {gallery.length > 1 && (
                <div className="mt-4 flex gap-2">
                  {gallery.map((item, i) => (
                    <button
                      key={item.image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      aria-label={`${locale === 'de' ? 'Bild' : 'Image'} ${i + 1}`}
                      className={cn(
                        'size-14 shrink-0 overflow-hidden rounded-lg border-2 bg-ff-warm-gray transition-all',
                        i === selectedImageIndex
                          ? 'border-ff-near-black opacity-100 ring-2 ring-ff-near-black/10'
                          : 'border-transparent opacity-50 hover:opacity-90',
                      )}
                    >
                      <ShopProductCardImage
                        product={product}
                        resource={item.image}
                        fallbackSrc={galleryFallbacks?.[i]}
                        className="size-full"
                        sizes="56px"
                        imgClassName="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </FadeIn>

            <div className="min-w-0 flex flex-col">
            <FadeIn immediate delay={120} className="relative flex flex-col lg:pt-2">
              <FoodPdpCategoryRow
                categoryLabel={categoryLabel}
                categories={categories}
                locale={locale}
              />

              <h1 className="font-display text-section-heading font-bold tracking-tight text-ff-near-black">
                {product.title}
              </h1>

              {pdp.tagline && (
                <p className="mt-3 font-display text-body-lg font-medium leading-snug text-ff-charcoal">
                  {pdp.tagline}
                </p>
              )}

              <FoodPdpHeroBadges product={product} locale={locale} />

              {pdp.heroNote && (
                <p className="mt-5 text-body leading-[1.8] text-ff-gray-text">{pdp.heroNote}</p>
              )}

              {product.isSeasonal && (
                <p className="mt-4 rounded-lg bg-ff-gold-accent/10 px-4 py-3 text-body-sm leading-[1.75] text-ff-gray-text ring-1 ring-ff-gold-accent/25">
                  {getSeasonalNotice(locale)}
                </p>
              )}

              {(priceLabel || product.weightGrams || product.unitSize) && (
                <div className="mt-6">
                  {priceLabel && (
                    <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-ff-gold-accent-dark md:text-4xl">
                      {priceLabel}
                    </p>
                  )}
                  {(typeof product.weightGrams === 'number' && product.weightGrams > 0) ||
                  product.unitSize?.trim() ? (
                    <div className="mt-3 inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full bg-ff-warm-gray/30 px-4 py-2.5 ring-1 ring-ff-near-black/8">
                      {typeof product.weightGrams === 'number' && product.weightGrams > 0 && (
                        <span className="inline-flex items-center gap-2 text-body-sm font-medium text-ff-near-black">
                          <span className="flex size-7 items-center justify-center rounded-full bg-ff-warm-gray/60 text-ff-near-black">
                            <Scale className="size-3.5" strokeWidth={2} aria-hidden />
                          </span>
                          <span className="tabular-nums">{product.weightGrams} g</span>
                        </span>
                      )}
                      {typeof product.weightGrams === 'number' &&
                        product.weightGrams > 0 &&
                        product.unitSize?.trim() && (
                          <span
                            className="hidden size-1 rounded-full bg-ff-near-black/15 sm:block"
                            aria-hidden
                          />
                        )}
                      {product.unitSize?.trim() && (
                        <span className="inline-flex items-center gap-2 text-body-sm font-medium text-ff-near-black">
                          <span className="flex size-7 items-center justify-center rounded-full bg-ff-warm-gray/60 text-ff-near-black">
                            <Package className="size-3.5" strokeWidth={2} aria-hidden />
                          </span>
                          {product.unitSize.trim()}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {!isOutOfStock ? (
                <div id="pdp-hero-purchase" className="mt-7 space-y-5">
                  {hasVariants && (
                    <Suspense fallback={null}>
                      <VariantSelector product={product} />
                    </Suspense>
                  )}

                  <div className="flex items-stretch gap-3">
                    <div className="flex shrink-0 items-center gap-3 rounded-full border border-ff-near-black/15 bg-white px-1 py-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="flex size-9 items-center justify-center rounded-full text-ff-near-black transition-colors hover:bg-ff-warm-gray/80"
                        aria-label={locale === 'de' ? 'Menge verringern' : 'Decrease quantity'}
                      >
                        <Minus className="size-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="min-w-8 text-center text-body font-semibold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="flex size-9 items-center justify-center rounded-full text-ff-near-black transition-colors hover:bg-ff-warm-gray/80"
                        aria-label={locale === 'de' ? 'Menge erhöhen' : 'Increase quantity'}
                      >
                        <Plus className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <Suspense fallback={null}>
                      <AddToCart
                        product={product}
                        quantity={quantity}
                        className="!m-0 inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-ff-near-black bg-ff-near-black font-display text-body-sm font-medium tracking-wide text-white transition-all hover:bg-ff-charcoal-hover hover:shadow-md active:scale-[0.98]"
                      >
                        <ShoppingBag className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        {copy.addToCart}
                      </AddToCart>
                    </Suspense>
                  </div>

                  <Suspense fallback={null}>
                    <StockIndicator product={product} />
                  </Suspense>
                </div>
              ) : (
                <p className="mt-8 text-body-sm text-ff-gray-text">{copy.soldOut}</p>
              )}

              <FoodPdpTrustPoints points={pdp.trustPoints} />

              <p className="mt-6 flex items-start gap-2 text-caption leading-relaxed text-ff-gray-text">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ff-gold-accent"
                  aria-hidden
                />
                {pickupNotice}
              </p>
            </FadeIn>
            </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-4xl flex-col lg:mt-16">
          <FoodPdpSectionNav sections={sectionNav} />

          {hasDetailsSection && (
            <FoodPdpSectionGroup
              id="produktdetails"
              title={copy.groupDetails}
              description={copy.groupDetailsDesc}
              isFirst
            >
              <FoodPdpGlanceGrid
                title={copy.glanceTitle}
                items={glanceItems}
                showTitle={Boolean(glanceItems.length)}
              />
              <FoodPdpIngredientsPanel
                ingredients={product.ingredients}
                allergens={product.allergens}
                ingredientsHeading={copy.ingredients}
                allergensLabel={copy.allergens}
                disclaimer={copy.ingredientsDisclaimer}
                isSeasonal={product.isSeasonal}
                seasonalNotice={
                  product.isSeasonal ? getSeasonalIngredientsNotice(locale) : undefined
                }
              />
            </FoodPdpSectionGroup>
          )}

          {hasTasteSection && (
            <FoodPdpSectionGroup
              id="geschmack"
              title={copy.groupTaste}
              description={copy.groupTasteDesc}
              isFirst={!hasDetailsSection}
            >
              <FoodPdpTasteStory pdp={pdp} sectionLabel={tasteSectionLabel} />
              <FoodPdpUsageSteps
                title={pdp.usageSectionTitle}
                steps={pdp.usageSteps}
                embedded
                showDivider={
                  Boolean(pdp.tasteHeadline) ||
                  Boolean(pdp.storyIntro) ||
                  pdp.flavorNotes.length > 0 ||
                  Boolean(pdp.storyDetail)
                }
              />
            </FoodPdpSectionGroup>
          )}

          {hasStorageSection && (
            <FoodPdpSectionGroup
              id="lagerung"
              title={copy.groupStorage}
              description={copy.groupStorageDesc}
              isFirst={!hasDetailsSection && !hasTasteSection}
            >
              <FoodPdpStoragePanel
                storageLabel={copy.storage}
                shelfLifeLabel={copy.shelfLife}
                bestBeforeLabel={copy.bestBefore}
                afterOpeningLabel={copy.afterOpening}
                storageInstructions={product.storageInstructions}
                shelfLife={product.shelfLife}
                bestBefore={product.bestBefore}
                userInstructions={product.userInstructions}
                hasUserInstructions={hasRichTextContent(product.userInstructions)}
                embedded
              />
            </FoodPdpSectionGroup>
          )}
        </div>

        <div className="relative left-1/2 mt-16 w-screen max-w-[100vw] -translate-x-1/2 lg:mt-20">
          <FoodPdpShopFooter
            shopLabel={copy.shopFooterTitle}
            shopDescription={copy.shopFooterDesc}
            shopCta={copy.shopFooterCta}
          />
        </div>

        <div className="mx-auto mt-16 max-w-6xl lg:mt-20">
          <FoodPdpRelatedStrip
            products={relatedProducts}
            locale={locale}
            currentSlug={product.slug}
            title={copy.relatedTitle}
          />
        </div>
      </div>

      <FoodPdpMobileBuyBar
        product={product}
        quantity={quantity}
        priceLabel={priceLabel}
        addToCartLabel={copy.addToCart}
        locale={locale}
        isOutOfStock={isOutOfStock}
      />
    </div>
  )
}
