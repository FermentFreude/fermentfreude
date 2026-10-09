import type {
  HomeTempehStoryBlock as HomeTempehStoryBlockType,
  Media,
  Product,
} from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import { strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { HomeTempehStoryCarousel, type HomeTempehStorySlide } from './Carousel'

/** English fallbacks — CMS data always wins. */
const DEFAULTS = {
  heading: 'Runner Bean Tempeh',
  productLinkLabel: 'View product',
} as const

/** Used when no product is picked in the admin. */
const DEFAULT_PRODUCT_SLUG = 'kaeferbohnen-tempeh'

type Props = HomeTempehStoryBlockType & {
  locale?: 'de' | 'en'
}

const isMedia = (image: unknown): image is Media =>
  typeof image === 'object' && image !== null && 'url' in image && Boolean(image.url)

/** Product photos, gallery first — also used for story slides that have no photo of their own. */
function getProductImages(product: Product): Media[] {
  const gallery = (product.gallery ?? []).map((g) => g.image).filter(isMedia)
  if (gallery.length) return gallery
  return isMedia(product.meta?.image) ? [product.meta.image] : []
}

export async function HomeTempehStoryBlockComponent(props: Props) {
  if (props.visible === false) return null

  const locale = props.locale ?? (await getLocale())
  const resolvedLocale = locale === 'de' ? 'de' : 'en'
  const payload = await getPayload({ config: configPromise })

  const pickedId =
    typeof props.product === 'object' && props.product !== null ? props.product.id : props.product
  const productWhere: Where = pickedId
    ? { id: { equals: pickedId } }
    : { slug: { equals: DEFAULT_PRODUCT_SLUG } }

  const result = await payload.find({
    collection: 'products',
    depth: 2,
    limit: 1,
    ...strictLocaleQuery(resolvedLocale),
    overrideAccess: true,
    pagination: false,
    where: { and: [productWhere, { _status: { equals: 'published' } }] },
  })
  const product = result.docs[0]

  if (!product) {
    payload.logger.warn(
      'Homepage tempeh section is hidden because its shop product was not found or is not published.',
    )
    return null
  }

  const productImages = getProductImages(product)
  const slides: HomeTempehStorySlide[] = (props.slides ?? [])
    .filter((slide) => slide.title?.trim() && slide.description?.trim())
    .map((slide, i) => ({
      id: slide.id ?? `slide-${i}`,
      title: slide.title,
      description: slide.description,
      // No photo yet → borrow a product photo (cycling) rather than an empty box
      image: isMedia(slide.image)
        ? slide.image
        : (productImages[(i + 1) % Math.max(productImages.length, 1)] ?? null),
    }))

  return (
    <HomeTempehStoryCarousel
      heading={props.heading?.trim() || DEFAULTS.heading}
      productLinkLabel={props.productLinkLabel?.trim() || DEFAULTS.productLinkLabel}
      product={{
        title: product.title,
        description: product.shortDescription,
        href: `/products/${product.slug}`,
        image: productImages[0] ?? null,
      }}
      slides={slides}
      locale={resolvedLocale}
    />
  )
}
