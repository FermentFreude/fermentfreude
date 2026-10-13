import type { Media, Product, ProductShowcaseBlock } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { formatEurPrice } from '@/utilities/productDetailDisplay'

import { SHOWCASE_LAYERS } from './layers'
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

  const slides: ShowcaseSlide[] = (props.slides ?? []).flatMap((s, i) => {
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
    if (!image) return []
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
        image,
        ingredients: ingredientsImage,
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
