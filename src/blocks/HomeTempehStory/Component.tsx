import type { HomeTempehStoryBlock as HomeTempehStoryBlockType, Media } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'

import { HomeTempehStoryCarousel, type TempehSlide } from './Carousel'

/** English fallbacks — CMS data always wins. */
const DEFAULTS = {
  heading: 'Runner Bean Tempeh',
  buttonLabel: 'View product',
} as const

type Props = HomeTempehStoryBlockType & {
  locale?: 'de' | 'en'
}

const isMedia = (image: unknown): image is Media =>
  typeof image === 'object' && image !== null && 'url' in image && Boolean(image.url)

export async function HomeTempehStoryBlockComponent(props: Props) {
  if (props.visible === false) return null

  const locale = props.locale ?? (await getLocale())

  // Every slide comes straight from the CMS, in the editor's order
  const slides: TempehSlide[] = (props.slides ?? [])
    .filter((slide) => slide.title?.trim())
    .map((slide, i) => {
      const product = typeof slide.product === 'object' ? slide.product : null
      // Only link to products that are live in the shop
      const href =
        product?.slug && product._status !== 'draft' ? `/products/${product.slug}` : undefined
      return {
        key: slide.id ?? `slide-${i}`,
        label: slide.label?.trim() || null,
        title: slide.title,
        description: slide.description,
        image: isMedia(slide.image) ? slide.image : null,
        href,
        buttonLabel: href ? slide.buttonLabel?.trim() || DEFAULTS.buttonLabel : undefined,
      }
    })

  if (!slides.length) return null

  return (
    <HomeTempehStoryCarousel
      heading={props.heading?.trim() || DEFAULTS.heading}
      slides={slides}
      locale={locale === 'de' ? 'de' : 'en'}
    />
  )
}
