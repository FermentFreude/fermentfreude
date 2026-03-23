import { ProductSliderBlock } from '@/blocks/ProductSlider/Component'
import { getLocale } from '@/utilities/getLocale'
import { getProductSliderGlobal } from '@/utilities/getProductSliderGlobal'

interface ProductSliderGlobalWrapperProps {
  id?: string
}

/**
 * Server component that fetches global product slider data and renders it.
 * Edit once in /admin → Website → Product Slider, appears everywhere.
 */
export async function ProductSliderGlobalWrapper({ id }: ProductSliderGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getProductSliderGlobal(locale)

  return (
    <ProductSliderBlock
      id={id}
      blockType="productSlider"
      heading={data.heading}
      headingAccent={data.headingAccent}
      description={data.description}
      buttonLabel={data.buttonLabel}
      buttonLink={data.buttonLink}
      products={data.products ?? []}
    />
  )
}
