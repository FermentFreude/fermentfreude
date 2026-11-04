import type { Media, Product, ProductShowcaseBlock } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { formatEurPrice } from '@/utilities/productDetailDisplay'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'

import { SHOWCASE_LAYERS, SHOWCASE_PRODUCT_SCALE } from './layers'
import { ProductShowcaseStack, type LayerImage, type ShowcaseSlide } from './Stack'

type Props = ProductShowcaseBlock & { locale?: 'de' | 'en' }

const isMedia = (m: unknown): m is Media =>
  typeof m === 'object' && m !== null && 'url' in m && Boolean((m as Media).url)

const fromMedia = (m: Media, alt: string): LayerImage => ({
  src: m.url as string,
  width: m.width ?? 1200,
  height: m.height ?? 900,
  alt: m.alt || alt,
})

/** English fallback — CMS data always wins. */
const DEFAULT_BUTTON = 'View product'
const DEFAULT_WORKSHOPS_NAME = 'Workshops'
const DEFAULT_WORKSHOPS_BUTTON = 'All workshops'
const DEFAULT_SEASONAL = 'Seasonal'
/** Home order of the workshops; any others follow alphabetically */
const WORKSHOP_ORDER = ['tempeh', 'lakto', 'kombucha', 'vom-feld-ins-glas']
const WORKSHOP_HREF: Record<string, string> = { lakto: '/workshops/lakto-gemuese' }

export async function ProductShowcaseBlockComponent(props: Props) {
  if (props.visible === false) return null
  const locale = (props.locale ?? (await getLocale())) === 'de' ? 'de' : 'en'

  // Pages only populate a few product fields (title, slug, price…) — load the
  // full products so weight and unit size are available too
  const ids = (props.slides ?? [])
    .map((s) => (typeof s.product === 'object' && s.product ? s.product.id : s.product))
    .filter((id): id is string => typeof id === 'string')
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { id: { in: ids } },
    depth: 0,
    limit: ids.length || 1,
    locale,
    overrideAccess: true,
    pagination: false,
  })
  const byId = new Map(docs.map((p) => [p.id, p as Product]))

  // Background pictures arrive as plain IDs from the page query — load them here
  const bgIds = (props.slides ?? [])
    .map((s) => (typeof s.backgroundImage === 'string' ? s.backgroundImage : null))
    .filter((id): id is string => Boolean(id))
  const bgDocs = bgIds.length
    ? (
        await payload.find({
          collection: 'media',
          where: { id: { in: bgIds } },
          depth: 0,
          limit: bgIds.length,
          locale,
          overrideAccess: true,
          pagination: false,
        })
      ).docs
    : []
  const bgById = new Map(bgDocs.map((m) => [m.id, m as Media]))
  const veilOf = (v: number | null | undefined) => Math.min(80, Math.max(0, v ?? 30))
  const backgroundOf = (v: unknown): LayerImage | null => {
    const m = typeof v === 'string' ? bgById.get(v) : v
    return isMedia(m) ? fromMedia(m, '') : null
  }

  // Workshops slide: the active workshops with their next bookable date
  const hasWorkshops = (props.slides ?? []).some((s) => s.slideType === 'workshops')
  let workshopRows: ShowcaseSlide['workshops'] = null
  if (hasWorkshops) {
    const { docs: ws } = await payload.find({
      collection: 'workshops',
      where: { isActive: { equals: true } },
      depth: 0,
      limit: 20,
      locale,
      overrideAccess: true,
      pagination: false,
    })
    const sorted = [...ws].sort((a, b) => {
      const ia = WORKSHOP_ORDER.indexOf(a.slug ?? '')
      const ib = WORKSHOP_ORDER.indexOf(b.slug ?? '')
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || (a.title ?? '').localeCompare(b.title ?? '')
    })
    const hrefOf = (slug: string) => WORKSHOP_HREF[slug] ?? `/workshops/${slug}`
    const dates = await getNextWorkshopDatesByHref(locale)
    workshopRows = sorted
      .filter((w) => w.slug && w.title)
      .map((w) => {
        const href = hrefOf(w.slug as string)
        return { title: w.title as string, href, date: dates[href]?.date ?? null }
      })
  }

  const slides: ShowcaseSlide[] = (props.slides ?? []).flatMap((s, i): ShowcaseSlide[] => {
    // Workshops slide: no shop product, just a text and a button to the booking page
    if (s.slideType === 'workshops') {
      const picture = isMedia(s.productImage) ? fromMedia(s.productImage, '') : null
      return [
        {
          key: s.id ?? `slide-${i}`,
          bigWord: (s.bigWord ?? '').trim(),
          eyebrow: s.eyebrow?.trim() || null,
          accent: s.accentColor?.trim() || null,
          scale: 1,
          image: picture,
          background: backgroundOf(s.backgroundImage),
          backgroundVeil: veilOf(s.backgroundVeil),
          ingredients: isMedia(s.ingredientsImage) ? fromMedia(s.ingredientsImage, '') : null,
          textTone: s.textTone === 'dark' ? 'dark' : 'light',
          workshops: workshopRows,
          seasonalLabel: s.seasonalLabel?.trim() || DEFAULT_SEASONAL,
          name: s.label?.trim() || DEFAULT_WORKSHOPS_NAME,
          text: s.text?.trim() || null,
          price: null,
          meta: null,
          href: s.linkUrl?.trim() || '/workshops',
          buttonLabel: s.buttonLabel?.trim() || DEFAULT_WORKSHOPS_BUTTON,
        },
      ]
    }
    const id = typeof s.product === 'object' && s.product ? s.product.id : s.product
    const product = typeof id === 'string' ? byId.get(id) : undefined
    if (!product) return []
    // Images: the layered files in public/showcase/<slug>/ first, CMS cut-out as fallback
    const layers = product.slug ? SHOWCASE_LAYERS[product.slug] : undefined
    const image: LayerImage | null = layers
      ? { ...layers.product, alt: product.title }
      : isMedia(s.productImage)
        ? fromMedia(s.productImage, product.title)
        : null
    // "Show the product picture" unticked → background only (the layers stay in code)
    const showImages = s.showProductImages !== false
    if (!image && showImages) return []
    const ingredientsImage: LayerImage | null = layers
      ? layers.ingredients
        ? { ...layers.ingredients, alt: '' }
        : null
      : isMedia(s.ingredientsImage)
        ? fromMedia(s.ingredientsImage, '')
        : null
    const live = product._status !== 'draft'
    const weight = product.weightGrams ? `${product.weightGrams} g` : null
    return [
      {
        key: s.id ?? `slide-${i}`,
        bigWord: (s.bigWord ?? '').trim(),
        eyebrow: s.eyebrow?.trim() || null,
        accent: s.accentColor?.trim() || null,
        scale: (product.slug && SHOWCASE_PRODUCT_SCALE[product.slug]) || 1,
        image: showImages ? image : null,
        ingredients: showImages ? ingredientsImage : null,
        background: backgroundOf(s.backgroundImage),
        backgroundVeil: veilOf(s.backgroundVeil),
        textTone: s.textTone === 'dark' ? 'dark' : 'light',
        workshops: null,
        seasonalLabel: DEFAULT_SEASONAL,
        name: s.label?.trim() || product.title,
        text: s.text?.trim() || product.shortDescription || null,
        price: product.priceInEUR ? formatEurPrice(product.priceInEUR, locale) : null,
        meta: [weight, product.unitSize].filter(Boolean).join('  |  ') || null,
        href: live && product.slug ? `/products/${product.slug}` : undefined,
        buttonLabel: s.buttonLabel?.trim() || DEFAULT_BUTTON,
      },
    ]
  })
  if (!slides.length) return null

  return (
    <ProductShowcaseStack
      tagline={props.tagline?.trim() || null}
      slides={slides}
      trustPoints={(props.trustPoints ?? []).map((t) => t.text).filter(Boolean)}
      locale={locale}
    />
  )
}
