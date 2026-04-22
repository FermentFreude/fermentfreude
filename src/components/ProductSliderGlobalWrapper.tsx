import { ProductSliderBlock } from '@/blocks/ProductSlider/Component'
import { getLocale } from '@/utilities/getLocale'
import { getProductSliderGlobal } from '@/utilities/getProductSliderGlobal'

interface ProductSliderGlobalWrapperProps {
  id?: string
  fallbackData?: Record<string, unknown>
}

/**
 * Server component that fetches global product slider data and renders it.
 * Falls back to block-level data when the global is empty.
 */
export async function ProductSliderGlobalWrapper({
  id,
  fallbackData,
}: ProductSliderGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getProductSliderGlobal(locale)

  // Use global data if it has content, otherwise fall back to block-level data
  const hasGlobalContent = Boolean(data.heading)
  const fb = fallbackData ?? {}

  const accentFromGlobal =
    typeof data.headingAccent === 'string' && data.headingAccent.trim() !== ''
      ? data.headingAccent.trim()
      : undefined
  const accentFromFallback =
    typeof fb.headingAccent === 'string' && fb.headingAccent.trim() !== ''
      ? fb.headingAccent.trim()
      : undefined

  return (
    <ProductSliderBlock
      id={id}
      blockType="productSlider"
      heading={hasGlobalContent ? data.heading : ((fb.heading as string) ?? undefined)}
      headingAccent={hasGlobalContent ? accentFromGlobal : accentFromFallback}
      description={hasGlobalContent ? data.description : ((fb.description as string) ?? undefined)}
      buttonLabel={hasGlobalContent ? data.buttonLabel : ((fb.buttonLabel as string) ?? undefined)}
      buttonLink={hasGlobalContent ? data.buttonLink : ((fb.buttonLink as string) ?? undefined)}
      products={
        hasGlobalContent && (data.products?.length ?? 0) > 0
          ? data.products!
          : ((fb.products as [] | undefined) ?? [])
      }
    />
  )
}
