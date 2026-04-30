'use client'

import type { Media as MediaType, Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { RichText } from '@/components/RichText'
import { gtmViewItem } from '@/lib/gtm'
import { useLocale } from '@/providers/Locale'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import {
  CheckIcon,
  ChevronLeftIcon,
  FlameIcon,
  LeafIcon,
  PackageIcon,
  ShieldCheckIcon,
  SnowflakeIcon,
  SparklesIcon,
  SproutIcon,
  WheatOffIcon,
} from 'lucide-react'
import Link from 'next/link'
import React, { Suspense, useEffect, useState } from 'react'
import { StockIndicator } from './StockIndicator'
import { VariantSelector } from './VariantSelector'

/* ── Helpers ── */
function hasRichTextContent(field: { root: { children: unknown[] } } | null | undefined): boolean {
  if (!field?.root?.children) return false
  if (field.root.children.length === 0) return false
  const first = field.root.children[0] as Record<string, unknown>
  if (
    field.root.children.length === 1 &&
    first?.type === 'paragraph' &&
    Array.isArray(first?.children) &&
    first.children.length === 0
  )
    return false
  return true
}

const BADGE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  vegan: { label: 'Vegan', icon: SproutIcon, color: '#5a8a3c' },
  vegetarian: { label: 'Vegetarian', icon: LeafIcon, color: '#6b9e4a' },
  handmade: { label: 'Handmade', icon: CheckIcon, color: '#c47a5a' },
  organic: { label: 'Organic', icon: SparklesIcon, color: '#7bab5e' },
  'gluten-free': { label: 'Gluten-Free', icon: WheatOffIcon, color: '#b08d57' },
  probiotic: { label: 'Probiotic', icon: ShieldCheckIcon, color: '#5a8a8a' },
  fermented: { label: 'Fermented', icon: FlameIcon, color: '#a0785a' },
  'no-additives': { label: 'No Additives', icon: ShieldCheckIcon, color: '#6b8e6b' },
  refrigerated: { label: 'Refrigerated', icon: SnowflakeIcon, color: '#6a9ec2' },
}

/* Translations */
const TRANSLATIONS: Record<string, Record<string, string>> = {
  de: {
    'All products': 'Alle Produkte',
    Description: 'Beschreibung',
    'Health Benefits': 'Gesundheitliche Vorteile',
    'Size/Weight': 'Größe/Gewicht',
    Ingredients: 'Zutaten',
    Allergens: 'Allergene',
    'Storage & Shelf Life': 'Lagerung & Haltbarkeit',
    'Shelf life': 'Haltbarkeit',
    'How to Use': 'Anwendung',
    'Instructions Before Use': 'Hinweise vor der Verwendung',
    'Delivery notice':
      'Lieferung ist derzeit nicht verfuegbar. Wir arbeiten daran, die beste Lieferung fuer unsere frischen Produkte sicherzustellen. Aktuell ist nur lokale Abholung moeglich.',
  },
  en: {
    'All products': 'All products',
    Description: 'Description',
    'Health Benefits': 'Health Benefits',
    'Size/Weight': 'Size/Weight',
    Ingredients: 'Ingredients',
    Allergens: 'Allergens',
    'Storage & Shelf Life': 'Storage & Shelf Life',
    'Shelf life': 'Shelf life',
    'How to Use': 'How to Use',
    'Instructions Before Use': 'Instructions Before Use',
    'Delivery notice':
      'Delivery is not available at the moment. We are working to ensure the best delivery of our fresh products. Only local pickup is possible for now.',
  },
}

function t(key: string, locale: string): string {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  jarred: 'Jarred',
  fresh: 'Fresh',
  bottled: 'Bottled',
  workshop: 'Workshop',
  'digital-course': 'Digital Course',
}

type ProductDetailLabels = {
  ingredientsLabel?: string | null
  allergensLabel?: string | null
  storageShelfLifeLabel?: string | null
  shelfLifeLabel?: string | null
  howToUseLabel?: string | null
  instructionsBeforeUseLabel?: string | null
  deliveryNotice?: string | null
}

/* ═══════════════════════════════════════════════════════════
 *  Product Detail Page
 * ═══════════════════════════════════════════════════════════ */
export function ProductDetailPage({
  product,
  productDetailLabels,
}: {
  product: Product
  productDetailLabels?: ProductDetailLabels
}) {
  const { currency } = useCurrency()
  const { locale } = useLocale()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'about'>('description')
  const [quantity, setQuantity] = useState(1)

  /* ── Gallery ── */
  const gallery =
    product.gallery?.filter(
      (item): item is typeof item & { image: MediaType } =>
        typeof item.image === 'object' &&
        item.image !== null &&
        Boolean((item.image as MediaType).url),
    ) || []

  /* ── Price ── */
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const varPriceField = `priceIn${currency.code}` as keyof Variant
    const sorted = (product.variants?.docs || [])
      .filter((v): v is Variant => typeof v === 'object')
      .sort((a, b) => {
        const pa = a[varPriceField]
        const pb = b[varPriceField]
        return typeof pa === 'number' && typeof pb === 'number' ? pa - pb : 0
      })
    if (sorted.length) {
      const low = sorted[0][varPriceField]
      const high = sorted[sorted.length - 1][varPriceField]
      if (typeof low === 'number') lowestAmount = low
      if (typeof high === 'number') highestAmount = high
    }
  } else if (typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  // GA4: view_item — fires once when product detail page renders
  useEffect(() => {
    gtmViewItem({
      item_id: String(product.id),
      item_name: product.title ?? '',
      item_category: product.productType ?? undefined,
      price: amount || lowestAmount || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — fire only on mount

  const isFood = ['jarred', 'fresh', 'bottled'].includes(product.productType || '')
  const isOutOfStock = !product.inventory || product.inventory === 0
  const labels = {
    ingredients: productDetailLabels?.ingredientsLabel?.trim() || t('Ingredients', locale),
    allergens: productDetailLabels?.allergensLabel?.trim() || t('Allergens', locale),
    storageShelfLife:
      productDetailLabels?.storageShelfLifeLabel?.trim() || t('Storage & Shelf Life', locale),
    shelfLife: productDetailLabels?.shelfLifeLabel?.trim() || t('Shelf life', locale),
    howToUse: productDetailLabels?.howToUseLabel?.trim() || t('How to Use', locale),
    instructionsBeforeUse:
      productDetailLabels?.instructionsBeforeUseLabel?.trim() ||
      t('Instructions Before Use', locale),
    deliveryNotice: productDetailLabels?.deliveryNotice?.trim() || t('Delivery notice', locale),
  }

  /* ── Specs — built from REAL existing data ── */
  const specs: { label: string; value: string }[] = []

  // Brand — use field if set, otherwise always show FermentFreude
  specs.push({ label: 'Brand', value: product.brand || 'FermentFreude' })

  // Flavour — use field if set
  if (product.flavour) {
    specs.push({ label: 'Flavour', value: product.flavour })
  }

  // Product type
  if (product.productType) {
    specs.push({
      label: 'Type',
      value: PRODUCT_TYPE_LABELS[product.productType] || product.productType,
    })
  }

  // Weight / Unit size
  if (product.unitSize) {
    specs.push({ label: 'Weight', value: product.unitSize })
  }

  /* ── Tab content availability ── */
  const hasDescription =
    hasRichTextContent(product.description) ||
    (isFood && (product.ingredients || product.storageInstructions || product.shelfLife)) ||
    hasRichTextContent(product.howToUse) ||
    hasRichTextContent(product.userInstructions)
  const hasAbout = hasRichTextContent(product.aboutProduct)

  // Build tabs array — always at least one
  const tabs: { key: 'description' | 'about'; label: string }[] = []
  if (hasDescription) tabs.push({ key: 'description', label: t('Description', locale) })
  if (hasAbout) tabs.push({ key: 'about', label: t('Health Benefits', locale) })

  // Fallback active tab to first available
  const validActiveTab = tabs.find((t) => t.key === activeTab) ? activeTab : tabs[0]?.key

  return (
    <div className="min-h-screen bg-white">
      {/* ── Back link ── */}
      <div
        className="pt-6 pb-2"
        style={{ paddingInline: 'var(--space-container-x, clamp(1.5rem, 4vw, 6rem))' }}
      >
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7a7a7a] hover:text-[#2b2b2d] transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          {t('All products', locale)}
        </Link>
      </div>

      <div
        className="pb-20 pt-4"
        style={{ paddingInline: 'var(--space-container-x, clamp(1.5rem, 4vw, 6rem))' }}
      >
        <div className="max-w-344 mx-auto">
          {/* ═══════════════════════════════════════════
           *  SECTION 1 — Image gallery (left) + Info (right)
           * ═══════════════════════════════════════════ */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* ── LEFT: Image Gallery ── */}
            <div className="w-full lg:w-1/2">
              {/* Main image */}
              <div className="relative rounded-lg overflow-hidden border border-[#e9e9e9] bg-[#f7f7f8] aspect-4/3 max-h-110">
                {gallery[selectedImageIndex] ? (
                  <Media
                    resource={gallery[selectedImageIndex].image}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-[#f7f7f8]" />
                )}
                {/* Sold Out Badge */}
                {isOutOfStock && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-block bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {gallery.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {gallery.map((item, i) => (
                    <button
                      key={item.image.id}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative rounded-lg overflow-hidden shrink-0 w-20 h-20 border transition-all duration-200 ${
                        i === selectedImageIndex
                          ? 'border-[#2b2b2d] ring-1 ring-[#2b2b2d]'
                          : 'border-[#e9e9e9] hover:border-[#999]'
                      }`}
                    >
                      <Media
                        resource={item.image}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product Info ── */}
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* Title + Price row */}
              <div className="border-b border-[#e9e9e9] pb-5">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-[#2b2b2d] leading-tight">
                    {product.title}
                  </h1>
                  <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
                    <div className="text-2xl md:text-3xl font-bold text-[#4b4f4a] font-display whitespace-nowrap">
                      {hasVariants ? (
                        <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
                      ) : (
                        <Price amount={amount} />
                      )}
                    </div>
                    <Suspense fallback={null}>
                      <StockIndicator product={product} />
                    </Suspense>
                  </div>
                </div>
                {product.shortDescription && (
                  <p className="mt-3 text-base leading-relaxed text-[#7a7a7a]">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Specs table */}
              <div className="py-4 space-y-0">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-baseline py-2">
                    <span className="text-sm font-semibold text-[#2b2b2d] w-28 shrink-0">
                      {spec.label}
                    </span>
                    <span className="text-sm text-[#2b2b2d] mr-3">:</span>
                    <span className="text-sm text-[#777]">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Badges + Benefits — combined visual section */}
              {(product.badges?.length || (product.benefits && product.benefits.length > 0)) && (
                <div className="py-5 border-t border-[#e9e9e9]">
                  {/* Badge icons — single line, responsive */}
                  {product.badges && product.badges.length > 0 && (
                    <div className="flex flex-row gap-3 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
                      {product.badges.map((badge) => {
                        const config = BADGE_CONFIG[badge]
                        if (!config) return null
                        const Icon = config.icon
                        return (
                          <div
                            key={badge}
                            className="group flex flex-col items-center gap-1.5 shrink-0 transition-transform duration-200 hover:scale-105"
                          >
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-shadow duration-200 group-hover:shadow-md"
                              style={{
                                backgroundColor: `${config.color}14`,
                                border: `1.5px solid ${config.color}40`,
                              }}
                            >
                              <span style={{ color: config.color }}>
                                <Icon className="w-5 h-5" />
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-[#555] text-center leading-tight whitespace-nowrap">
                              {config.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════
           *  SECTION 1.5 — Add to Cart
           * ═══════════════════════════════════════════ */}
          {!isOutOfStock && (
            <div className="mt-8 flex flex-col gap-6">
              {/* Size/Weight */}
              {hasVariants && (
                <div className="flex items-center gap-4">
                  <p className="text-base font-display font-bold text-[#2b2b2d] whitespace-nowrap">
                    {t('Size/Weight', locale)}:
                  </p>
                  <Suspense fallback={null}>
                    <VariantSelector product={product} />
                  </Suspense>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-white rounded-xl border-2 border-[#e9e9e9] p-4 inline-flex items-center gap-4 shrink-0">
                  <span className="text-xs font-display font-bold text-[#999]">QTY:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg border-2 border-[#e9e9e9] flex items-center justify-center font-display font-bold text-lg text-[#2b2b2d] hover:bg-[#f0f0f0] hover:border-[#4b4f4a] transition-all"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-display font-bold text-lg text-[#2b2b2d]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg border-2 border-[#e9e9e9] flex items-center justify-center font-display font-bold text-lg text-[#2b2b2d] hover:bg-[#f0f0f0] hover:border-[#4b4f4a] transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Suspense fallback={null}>
                  <AddToCart
                    product={product}
                    quantity={quantity}
                    className="flex-1 h-16 rounded-full text-base font-display font-bold bg-[#4b4f4a] text-white border-[#4b4f4a] hover:bg-[#3a3e39] shadow-lg transition-all"
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* Delivery disclaimer */}
          <p className="mt-6 text-xs text-[#999] leading-relaxed flex items-start gap-2 bg-[#fafafa] rounded-lg p-3">
            <PackageIcon className="w-4 h-4 mt-0.5 shrink-0" />
            {labels.deliveryNotice}
          </p>

          {/* ═══════════════════════════════════════════
           *  SECTION 2 — Tabs (Description / Health Benefits / Packaging)
           * ═══════════════════════════════════════════ */}
          {tabs.length > 0 && (
            <div className="mt-14 rounded-lg border border-[#e9e9e9] bg-white overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-[#e9e9e9] px-8 gap-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative py-4 text-base font-display font-bold whitespace-nowrap transition-colors ${
                      validActiveTab === tab.key
                        ? 'text-[#1d1d1d]'
                        : 'text-[#98989a] hover:text-[#555]'
                    }`}
                  >
                    {tab.label}
                    {validActiveTab === tab.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4b4b4b]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-8 py-8">
                {/* Description — includes all product details */}
                {validActiveTab === 'description' && hasDescription && (
                  <div className="space-y-6">
                    {/* Main description */}
                    {hasRichTextContent(product.description) && (
                      <div className="prose prose-sm max-w-none text-[#1d1d1d] leading-relaxed">
                        <RichText data={product.description!} enableGutter={false} />
                      </div>
                    )}

                    {/* Ingredients */}
                    {isFood && product.ingredients && (
                      <div className="border-t border-[#e9e9e9] pt-5">
                        <h3 className="text-base font-display font-bold text-[#2b2b2d] mb-2">
                          {labels.ingredients}
                        </h3>
                        <p className="text-sm text-[#777] whitespace-pre-line leading-relaxed">
                          {product.ingredients}
                        </p>
                        {product.allergens && (
                          <p className="mt-2 text-xs text-[#999]">
                            <span className="font-semibold">{labels.allergens}:</span> {product.allergens}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Storage + Shelf Life */}
                    {isFood && (product.storageInstructions || product.shelfLife) && (
                      <div className="border-t border-[#e9e9e9] pt-5">
                        <h3 className="text-base font-display font-bold text-[#2b2b2d] mb-2">
                          {labels.storageShelfLife}
                        </h3>
                        {product.storageInstructions && (
                          <p className="text-sm text-[#777] whitespace-pre-line leading-relaxed">
                            {product.storageInstructions}
                          </p>
                        )}
                        {product.shelfLife && (
                          <p className="mt-2 text-sm text-[#777]">
                            <span className="font-semibold">{labels.shelfLife}:</span> {product.shelfLife}
                          </p>
                        )}
                      </div>
                    )}

                    {/* How to Use */}
                    {hasRichTextContent(product.howToUse) && (
                      <div className="border-t border-[#e9e9e9] pt-5">
                        <h3 className="text-base font-display font-bold text-[#2b2b2d] mb-2">
                          {labels.howToUse}
                        </h3>
                        <div className="prose prose-sm max-w-none text-[#777]">
                          <RichText data={product.howToUse!} enableGutter={false} />
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    {hasRichTextContent(product.userInstructions) && (
                      <div className="border-t border-[#e9e9e9] pt-5">
                        <h3 className="text-base font-display font-bold text-[#2b2b2d] mb-2">
                          {labels.instructionsBeforeUse}
                        </h3>
                        <div className="prose prose-sm max-w-none text-[#777]">
                          <RichText data={product.userInstructions!} enableGutter={false} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Health Benefits / About */}
                {validActiveTab === 'about' && hasAbout && (
                  <div className="prose prose-sm max-w-none text-[#1d1d1d] leading-relaxed">
                    <RichText data={product.aboutProduct!} enableGutter={false} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
